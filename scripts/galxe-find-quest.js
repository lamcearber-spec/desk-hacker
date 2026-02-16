#!/usr/bin/env node
/**
 * Find a claimable Galxe quest and test the signature flow
 */

const { launchStealthBrowser, createStealthPage } = require('../lib/stealth-browser');
const { loadWallet } = require('../lib/wallet-provider');
const { ethers } = require('ethers');

const GALXE_URL = 'https://app.galxe.com/quest';
const CHAIN_ID = 1;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function createProviderScript(address, chainId) {
  return `
    (function() {
      const WALLET_ADDRESS = '${address.toLowerCase()}';
      const CHAIN_ID = ${chainId};
      
      window.__walletSignatureQueue = [];
      window.__walletLogs = [];
      
      const log = (msg) => {
        console.log('[Wallet] ' + msg);
        window.__walletLogs.push(msg);
      };
      
      const provider = {
        isMetaMask: true,
        _metamask: { isUnlocked: () => Promise.resolve(true) },
        isConnected: () => true,
        chainId: '0x' + CHAIN_ID.toString(16),
        networkVersion: String(CHAIN_ID),
        selectedAddress: WALLET_ADDRESS,
        _events: {},
        
        on: function(e, cb) { if (!this._events[e]) this._events[e] = []; this._events[e].push(cb); return this; },
        once: function(e, cb) { return this.on(e, cb); },
        addListener: function(e, cb) { return this.on(e, cb); },
        removeListener: function(e, cb) { return this; },
        removeAllListeners: function(e) { return this; },
        emit: function(e, ...args) { if (this._events[e]) this._events[e].forEach(cb => cb(...args)); },
        
        enable: async function() { return [WALLET_ADDRESS]; },
        send: function(m, p) { return this.request({ method: typeof m === 'string' ? m : m.method, params: p || [] }); },
        sendAsync: function(payload, cb) { 
          this.request(payload).then(r => cb(null, { id: payload.id, jsonrpc: '2.0', result: r })).catch(cb); 
        },
        
        request: async function({ method, params = [] }) {
          log('REQUEST: ' + method);
          
          switch (method) {
            case 'eth_requestAccounts':
            case 'eth_accounts':
              return [WALLET_ADDRESS];
            case 'eth_chainId':
              return '0x' + CHAIN_ID.toString(16);
            case 'net_version':
              return String(CHAIN_ID);
            case 'wallet_switchEthereumChain':
            case 'wallet_addEthereumChain':
              this.chainId = params[0].chainId;
              this.emit('chainChanged', params[0].chainId);
              return null;
            case 'personal_sign':
            case 'eth_sign':
            case 'eth_signTypedData':
            case 'eth_signTypedData_v3':
            case 'eth_signTypedData_v4':
              log('>>> SIGNATURE NEEDED: ' + method);
              return new Promise((resolve, reject) => {
                window.__walletSignatureQueue.push({ 
                  id: Date.now(), method, params, resolve, reject 
                });
              });
            case 'eth_getBalance':
              return '0x0';
            case 'wallet_getPermissions':
            case 'wallet_requestPermissions':
              return [{ parentCapability: 'eth_accounts' }];
            default:
              log('UNHANDLED: ' + method);
              throw new Error('Method not supported: ' + method);
          }
        }
      };
      
      try { delete window.ethereum; } catch(e) {}
      Object.defineProperty(window, 'ethereum', { value: provider, writable: false, configurable: false });
      
      const info = { uuid: 'c0a67e51-7a39-4c8d-8b2a-1f4e2c5d6e7f', name: 'MetaMask', icon: '', rdns: 'io.metamask' };
      const announce = () => window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail: Object.freeze({ info, provider }) }));
      announce();
      window.addEventListener('eip6963:requestProvider', announce);
      window.dispatchEvent(new Event('ethereum#initialized'));
      
      log('Provider ready: ' + WALLET_ADDRESS);
    })();
  `;
}

async function signMessage(wallet, method, params) {
  switch (method) {
    case 'personal_sign': {
      const message = params[0];
      return wallet.signMessage(message.startsWith('0x') ? ethers.getBytes(message) : message);
    }
    case 'eth_sign': {
      return wallet.signMessage(ethers.getBytes(params[1]));
    }
    case 'eth_signTypedData':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData_v4': {
      const typedData = typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1];
      const { domain, types, message } = typedData;
      const cleanTypes = { ...types };
      delete cleanTypes.EIP712Domain;
      return wallet.signTypedData(domain, cleanTypes, message);
    }
    default:
      throw new Error(`Unknown: ${method}`);
  }
}

async function findAndClaimQuest() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  GALXE QUEST FINDER & CLAIMER');
  console.log('═══════════════════════════════════════════════════════');
  
  const wallet = loadWallet();
  console.log(`Wallet: ${wallet.address}\n`);
  
  const browser = await launchStealthBrowser({ headless: true });
  const page = await createStealthPage(browser);
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Wallet]')) console.log(`📝 ${text}`);
  });
  
  await page.evaluateOnNewDocument(createProviderScript(wallet.address, CHAIN_ID));
  
  console.log('📍 Loading Galxe homepage...');
  await page.goto(GALXE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3000);
  
  await page.screenshot({ path: '/tmp/galxe-find-1.png' });
  console.log('📸 /tmp/galxe-find-1.png');
  
  // Look for quest links in "Daily Quests" section
  console.log('\n🔍 Finding quest links...');
  const questLinks = await page.evaluate(() => {
    const links = [];
    const anchors = document.querySelectorAll('a[href*="/quest/"]');
    
    for (const a of anchors) {
      const href = a.href;
      const text = a.textContent?.trim().slice(0, 50) || '';
      const rect = a.getBoundingClientRect();
      
      // Filter for visible quest links
      if (href.includes('/quest/') && !href.endsWith('/quest') && rect.width > 0) {
        links.push({ href, text, y: rect.y });
      }
    }
    
    // Sort by position and dedupe
    const seen = new Set();
    return links
      .sort((a, b) => a.y - b.y)
      .filter(l => {
        if (seen.has(l.href)) return false;
        seen.add(l.href);
        return true;
      })
      .slice(0, 10);
  });
  
  console.log(`Found ${questLinks.length} quests:`);
  questLinks.forEach((q, i) => console.log(`  ${i}: ${q.text.slice(0, 40)} - ${q.href}`));
  
  if (questLinks.length === 0) {
    console.log('❌ No quests found!');
    await browser.close();
    return;
  }
  
  // Try the first quest
  const targetQuest = questLinks[0];
  console.log(`\n📍 Going to: ${targetQuest.href}`);
  await page.goto(targetQuest.href, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3000);
  
  await page.screenshot({ path: '/tmp/galxe-find-2.png' });
  console.log('📸 /tmp/galxe-find-2.png');
  
  // Check page status
  const questStatus = await page.evaluate(() => {
    const body = document.body.innerText;
    const buttons = Array.from(document.querySelectorAll('button'));
    const claimBtn = buttons.find(b => b.textContent?.toLowerCase().includes('claim') && !b.textContent?.toLowerCase().includes('claimed'));
    
    return {
      hasClaimButton: !!claimBtn,
      claimBtnText: claimBtn?.textContent?.trim(),
      hasVerify: body.includes('Verify') || body.includes('verify'),
      hasTasks: body.includes('Task') || body.includes('task'),
      isCompleted: body.includes('Completed') || body.includes('Claimed'),
      pageTitle: document.title
    };
  });
  
  console.log('\nQuest status:');
  console.log(`  Title: ${questStatus.pageTitle}`);
  console.log(`  Claim button: ${questStatus.hasClaimButton ? `✅ "${questStatus.claimBtnText}"` : '❌'}`);
  console.log(`  Has tasks: ${questStatus.hasTasks}`);
  console.log(`  Needs verify: ${questStatus.hasVerify}`);
  console.log(`  Completed: ${questStatus.isCompleted}`);
  
  // If there's a claim button, click it
  if (questStatus.hasClaimButton) {
    console.log('\n🎯 Clicking claim button...');
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.toLowerCase().includes('claim') && !btn.textContent?.toLowerCase().includes('claimed')) {
          btn.click();
          return;
        }
      }
    });
    await sleep(2000);
    
    await page.screenshot({ path: '/tmp/galxe-find-3.png' });
    console.log('📸 /tmp/galxe-find-3.png');
  }
  
  // Handle signature requests
  console.log('\n⏳ Watching for signatures (10s)...');
  
  let sigCount = 0;
  for (let i = 0; i < 20; i++) {
    const pending = await page.evaluate(() => {
      if (window.__walletSignatureQueue?.length > 0) {
        const sig = window.__walletSignatureQueue[0];
        return { id: sig.id, method: sig.method, params: sig.params };
      }
      return null;
    });
    
    if (pending) {
      sigCount++;
      console.log(`\n🔐 Signature request #${sigCount}: ${pending.method}`);
      
      try {
        const signature = await signMessage(wallet, pending.method, pending.params);
        console.log(`   ✅ Signed: ${signature.slice(0, 50)}...`);
        
        await page.evaluate((id, sig) => {
          const idx = window.__walletSignatureQueue.findIndex(s => s.id === id);
          if (idx >= 0) {
            window.__walletSignatureQueue[idx].resolve(sig);
            window.__walletSignatureQueue.splice(idx, 1);
          }
        }, pending.id, signature);
        
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
    }
    
    await sleep(500);
  }
  
  await page.screenshot({ path: '/tmp/galxe-find-4.png' });
  console.log('📸 /tmp/galxe-find-4.png');
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`Total signatures processed: ${sigCount}`);
  console.log('═══════════════════════════════════════════════════════');
  
  const logs = await page.evaluate(() => window.__walletLogs || []);
  if (logs.length > 0) {
    console.log('\n📋 Wallet activity:');
    logs.forEach(l => console.log(`  ${l}`));
  }
  
  await browser.close();
}

findAndClaimQuest().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
