#!/usr/bin/env node
/**
 * Galxe Quest Claim Test
 * 
 * Tests the signature flow by attempting to claim a quest.
 */

const { launchStealthBrowser, createStealthPage } = require('../lib/stealth-browser');
const { loadWallet } = require('../lib/wallet-provider');
const { ethers } = require('ethers');

// A simple daily quest for testing
const TEST_QUEST_URL = 'https://app.galxe.com/quest/Haven/GCLsWtvcUo';
const CHAIN_ID = 1;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Same provider script from v2
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
        
        on: function(e, cb) { 
          if (!this._events[e]) this._events[e] = []; 
          this._events[e].push(cb); 
          return this; 
        },
        once: function(e, cb) { return this.on(e, cb); },
        addListener: function(e, cb) { return this.on(e, cb); },
        removeListener: function(e, cb) { return this; },
        removeAllListeners: function(e) { return this; },
        emit: function(e, ...args) { 
          if (this._events[e]) this._events[e].forEach(cb => cb(...args)); 
        },
        
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
              log('>>> Params: ' + JSON.stringify(params).slice(0, 300));
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

async function testQuestClaim() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  GALXE QUEST CLAIM TEST');
  console.log('═══════════════════════════════════════════════════════');
  
  const wallet = loadWallet();
  console.log(`Wallet: ${wallet.address}`);
  console.log(`Quest: ${TEST_QUEST_URL}\n`);
  
  const browser = await launchStealthBrowser({ headless: true });
  const page = await createStealthPage(browser);
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Wallet]')) console.log(`📝 ${text}`);
  });
  
  await page.evaluateOnNewDocument(createProviderScript(wallet.address, CHAIN_ID));
  
  console.log('📍 Loading quest page...');
  await page.goto(TEST_QUEST_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3000);
  
  await page.screenshot({ path: '/tmp/galxe-quest-1.png' });
  console.log('📸 Screenshot: /tmp/galxe-quest-1.png');
  
  // Check connection status
  const status = await page.evaluate(() => {
    const body = document.body.innerText;
    return {
      hasConnect: body.includes('Connect') && !body.includes('Disconnect'),
      hasLogin: body.includes('Log in'),
      hasClaim: body.includes('Claim'),
      hasCompleted: body.includes('Completed') || body.includes('claimed'),
      bodyPreview: body.slice(0, 500)
    };
  });
  
  console.log('\nPage status:');
  console.log(`  Connect button: ${status.hasConnect}`);
  console.log(`  Login needed: ${status.hasLogin}`);
  console.log(`  Claim available: ${status.hasClaim}`);
  console.log(`  Already completed: ${status.hasCompleted}`);
  
  // If we need to connect first
  if (status.hasLogin) {
    console.log('\n🔗 Need to connect wallet first...');
    
    // Click login button
    await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent?.toLowerCase().includes('log in')) {
          btn.click();
          return true;
        }
      }
      return false;
    });
    await sleep(2000);
    
    // Click MetaMask option if modal appears
    await page.evaluate(() => {
      const all = document.querySelectorAll('*');
      for (const el of all) {
        if (el.textContent?.trim() === 'MetaMask') {
          el.click();
          return;
        }
      }
    });
    await sleep(3000);
  }
  
  // Now try to click claim button
  console.log('\n🎯 Looking for claim button...');
  const claimResult = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const text = btn.textContent?.toLowerCase().trim() || '';
      if (text.includes('claim') && !text.includes('claimed')) {
        const rect = btn.getBoundingClientRect();
        if (rect.width > 0) {
          btn.click();
          return { found: true, text: btn.textContent?.trim() };
        }
      }
    }
    return { found: false };
  });
  
  console.log(claimResult.found ? `✅ Clicked: "${claimResult.text}"` : '❌ No claim button found');
  
  await page.screenshot({ path: '/tmp/galxe-quest-2.png' });
  console.log('📸 Screenshot: /tmp/galxe-quest-2.png');
  
  // Wait for and handle signature requests
  console.log('\n⏳ Waiting for signature requests...');
  
  let sigCount = 0;
  for (let i = 0; i < 30; i++) {
    const pending = await page.evaluate(() => {
      if (window.__walletSignatureQueue?.length > 0) {
        const sig = window.__walletSignatureQueue[0];
        return { id: sig.id, method: sig.method, params: sig.params };
      }
      return null;
    });
    
    if (pending) {
      sigCount++;
      console.log(`\n🔐 Signature #${sigCount}: ${pending.method}`);
      console.log(`   Data: ${JSON.stringify(pending.params).slice(0, 150)}...`);
      
      try {
        const signature = await signMessage(wallet, pending.method, pending.params);
        console.log(`   ✅ Signed: ${signature.slice(0, 40)}...`);
        
        await page.evaluate((id, sig) => {
          const idx = window.__walletSignatureQueue.findIndex(s => s.id === id);
          if (idx >= 0) {
            window.__walletSignatureQueue[idx].resolve(sig);
            window.__walletSignatureQueue.splice(idx, 1);
          }
        }, pending.id, signature);
        
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        await page.evaluate((id, err) => {
          const idx = window.__walletSignatureQueue.findIndex(s => s.id === id);
          if (idx >= 0) {
            window.__walletSignatureQueue[idx].reject(new Error(err));
            window.__walletSignatureQueue.splice(idx, 1);
          }
        }, pending.id, error.message);
      }
      
      await sleep(1000);
    } else {
      await sleep(500);
    }
    
    if (i % 10 === 9) {
      console.log(`   Still waiting... (${i + 1}/30)`);
    }
  }
  
  await sleep(2000);
  await page.screenshot({ path: '/tmp/galxe-quest-3.png', fullPage: true });
  console.log('📸 Screenshot: /tmp/galxe-quest-3.png');
  
  // Check final status
  const finalStatus = await page.evaluate(() => {
    const body = document.body.innerText;
    return {
      hasClaimed: body.includes('Claimed') || body.includes('claimed') || body.includes('Completed'),
      hasError: body.includes('error') || body.includes('Error'),
      bodyPreview: body.slice(0, 300)
    };
  });
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`Signatures processed: ${sigCount}`);
  console.log(`Claimed status: ${finalStatus.hasClaimed ? '✅' : '❌'}`);
  console.log(`Errors: ${finalStatus.hasError ? '⚠️' : 'None'}`);
  console.log('═══════════════════════════════════════════════════════');
  
  // Get all wallet logs
  const logs = await page.evaluate(() => window.__walletLogs || []);
  if (logs.length > 0) {
    console.log('\n📋 Wallet activity:');
    logs.forEach(l => console.log(`  ${l}`));
  }
  
  await browser.close();
}

testQuestClaim().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
