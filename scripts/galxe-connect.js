#!/usr/bin/env node
/**
 * Galxe Wallet Connection
 * 
 * Uses stealth browser + injected wallet to connect to Galxe
 * and sign messages for authentication.
 * 
 * Usage: node scripts/galxe-connect.js [--headed]
 */

const { launchStealthBrowser, createStealthPage } = require('../lib/stealth-browser');
const { loadWallet } = require('../lib/wallet-provider');
const { ethers } = require('ethers');

const GALXE_URL = 'https://app.galxe.com/quest';
const CHAIN_ID = 8453; // Base

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Provider script with signature handling
function createProviderScript(address, chainId) {
  return `
    (function() {
      const WALLET_ADDRESS = '${address.toLowerCase()}';
      const CHAIN_ID = ${chainId};
      
      window.__walletPendingSignatures = [];
      
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
        removeListener: function(e, cb) { return this; },
        emit: function(e, ...args) { 
          if (this._events[e]) this._events[e].forEach(cb => cb(...args)); 
        },
        
        enable: async function() { return [WALLET_ADDRESS]; },
        
        request: async function({ method, params = [] }) {
          console.log('[Wallet] request:', method);
          
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
              console.log('[Wallet] SIGNATURE REQUEST:', method);
              return new Promise((resolve, reject) => {
                window.__walletPendingSignatures.push({ method, params, resolve, reject });
              });
              
            default:
              throw new Error('Method not supported: ' + method);
          }
        }
      };
      
      Object.defineProperty(window, 'ethereum', { value: provider, writable: false, configurable: true });
      
      // EIP-6963 announcement
      const providerInfo = {
        uuid: 'c0a67e51-7a39-4c8d-8b2a-1f4e2c5d6e7f',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
        rdns: 'io.metamask'
      };
      
      const announceEvent = new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({ info: providerInfo, provider })
      });
      
      window.dispatchEvent(announceEvent);
      window.addEventListener('eip6963:requestProvider', () => window.dispatchEvent(announceEvent));
      
      console.log('[Wallet] Provider installed for', WALLET_ADDRESS);
    })();
  `;
}

async function connectToGalxe() {
  const headed = process.argv.includes('--headed');
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('  GALXE WALLET CONNECTION');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Mode: ${headed ? 'Headed (visible)' : 'Headless'}`);
  
  // Load wallet
  let wallet;
  try {
    wallet = loadWallet();
    console.log(`\n✅ Wallet loaded: ${wallet.address}`);
  } catch (error) {
    console.error('❌ Failed to load wallet:', error.message);
    process.exit(1);
  }
  
  // Launch browser
  console.log('\n🌐 Launching stealth browser...');
  const browser = await launchStealthBrowser({ headless: !headed });
  const page = await createStealthPage(browser);
  
  // Track console for signature requests
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Wallet]')) {
      console.log(`📝 ${text}`);
    }
  });
  
  // Inject wallet provider
  console.log('💳 Injecting wallet provider...');
  await page.evaluateOnNewDocument(createProviderScript(wallet.address, CHAIN_ID));
  
  // Navigate to Galxe
  console.log(`\n📍 Navigating to ${GALXE_URL}...`);
  await page.goto(GALXE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3000);
  
  await page.screenshot({ path: '/tmp/galxe-initial.png' });
  
  // Click Log In button
  console.log('\n🔍 Clicking Log In button...');
  await page.evaluate(() => {
    const buttons = document.querySelectorAll('button, a');
    for (const btn of buttons) {
      const text = btn.textContent?.toLowerCase().trim();
      if (text === 'log in' || text === 'login') {
        btn.click();
        return;
      }
    }
  });
  await sleep(2000);
  
  await page.screenshot({ path: '/tmp/galxe-modal.png' });
  
  // Click MetaMask option
  console.log('🔍 Selecting MetaMask...');
  await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    for (const el of elements) {
      const text = el.textContent?.trim() || '';
      if (text === 'MetaMask' || text === 'MetaMaskInstalled') {
        let target = el;
        for (let i = 0; i < 5; i++) {
          if (target.className?.includes('cursor-pointer') || target.tagName === 'BUTTON') {
            target.click();
            return;
          }
          target = target.parentElement;
          if (!target) break;
        }
        el.click();
        return;
      }
    }
  });
  
  await sleep(3000);
  
  // Handle signature request
  console.log('\n⏳ Waiting for signature request...');
  
  for (let i = 0; i < 10; i++) {
    const pending = await page.evaluate(() => {
      if (window.__walletPendingSignatures && window.__walletPendingSignatures.length > 0) {
        const sig = window.__walletPendingSignatures[0];
        return { method: sig.method, params: sig.params };
      }
      return null;
    });
    
    if (pending) {
      console.log(`\n🔐 Signature requested: ${pending.method}`);
      
      // Sign the message
      const message = pending.params[0];
      const signer = new ethers.Wallet(wallet.privateKey);
      const signature = await signer.signMessage(
        message.startsWith('0x') ? ethers.getBytes(message) : message
      );
      
      console.log(`   Signature: ${signature.slice(0, 40)}...`);
      
      // Resolve the promise
      await page.evaluate((sig) => {
        const pending = window.__walletPendingSignatures.shift();
        if (pending) pending.resolve(sig);
      }, signature);
      
      console.log('   ✅ Signature submitted');
      break;
    }
    
    await sleep(500);
  }
  
  await sleep(3000);
  await page.screenshot({ path: '/tmp/galxe-final.png', fullPage: true });
  
  // Check result
  const result = await page.evaluate((addr) => {
    const text = document.body.innerText;
    const hasSignup = text.includes('Sign up for Galxe') || text.includes('Set up your Username');
    const hasLogin = text.includes('Log in to Bind');
    const addrLower = addr.toLowerCase();
    const hasAddress = text.toLowerCase().includes(addrLower.slice(2, 8));
    return { hasSignup, hasLogin, hasAddress };
  }, wallet.address);
  
  console.log('\n═══════════════════════════════════════════════════════');
  if (result.hasSignup || result.hasLogin) {
    console.log('  ✅ SUCCESS - Wallet Connected!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Address: ${wallet.address}`);
    console.log(`Chain: Base (${CHAIN_ID})`);
    console.log('\nGalxe is now asking for account setup/binding.');
    console.log('To complete: enter username or click "Log in to Bind"');
  } else {
    console.log('  ⚠️  Connection status unclear');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Check /tmp/galxe-final.png for manual verification');
  }
  
  console.log('\n📸 Screenshots saved to /tmp/galxe-*.png');
  
  if (headed) {
    console.log('\n🖥️  Browser will remain open. Press Ctrl+C to exit.');
    await new Promise(() => {});
  } else {
    await browser.close();
  }
}

connectToGalxe().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
