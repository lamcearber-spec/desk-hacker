#!/usr/bin/env node
/**
 * Galxe Debug - Find the actual login elements
 */

const { launchStealthBrowser, createStealthPage } = require('../lib/stealth-browser');
const { loadWallet } = require('../lib/wallet-provider');

const GALXE_URL = 'https://app.galxe.com/quest';
const CHAIN_ID = 1; // Ethereum mainnet - Galxe default

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Enhanced provider script with better logging
function createProviderScript(address, chainId) {
  return `
    (function() {
      const WALLET_ADDRESS = '${address.toLowerCase()}';
      const CHAIN_ID = ${chainId};
      
      window.__walletPendingSignatures = [];
      window.__walletLogs = [];
      
      const log = (msg) => {
        console.log('[Wallet] ' + msg);
        window.__walletLogs.push({ time: Date.now(), msg });
      };
      
      const provider = {
        isMetaMask: true,
        _metamask: { 
          isUnlocked: () => Promise.resolve(true),
          requestBatch: async () => [],
        },
        isConnected: () => true,
        chainId: '0x' + CHAIN_ID.toString(16),
        networkVersion: String(CHAIN_ID),
        selectedAddress: WALLET_ADDRESS,
        _events: {},
        _state: { isConnected: true, accounts: [WALLET_ADDRESS] },
        
        on: function(e, cb) { 
          log('on(' + e + ')');
          if (!this._events[e]) this._events[e] = []; 
          this._events[e].push(cb); 
          return this; 
        },
        once: function(e, cb) { return this.on(e, cb); },
        removeListener: function(e, cb) { return this; },
        removeAllListeners: function(e) { return this; },
        emit: function(e, ...args) { 
          log('emit(' + e + ')');
          if (this._events[e]) this._events[e].forEach(cb => cb(...args)); 
        },
        
        enable: async function() { 
          log('enable() called');
          return [WALLET_ADDRESS]; 
        },
        
        request: async function({ method, params = [] }) {
          log('request: ' + method + ' ' + JSON.stringify(params).slice(0,100));
          
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
              const newChainId = parseInt(params[0].chainId, 16);
              this.chainId = params[0].chainId;
              this.networkVersion = String(newChainId);
              this.emit('chainChanged', params[0].chainId);
              return null;
              
            case 'personal_sign':
            case 'eth_sign':
            case 'eth_signTypedData':
            case 'eth_signTypedData_v3':
            case 'eth_signTypedData_v4':
              log('>>> SIGNATURE REQUEST: ' + method);
              return new Promise((resolve, reject) => {
                window.__walletPendingSignatures.push({ method, params, resolve, reject });
              });
              
            case 'eth_getBalance':
              return '0x0';
              
            case 'eth_blockNumber':
              return '0x1234567';
              
            default:
              log('Unhandled method: ' + method);
              throw new Error('Method not supported: ' + method);
          }
        }
      };
      
      // CRITICAL: Delete any existing provider first
      try { delete window.ethereum; } catch(e) {}
      
      Object.defineProperty(window, 'ethereum', { 
        value: provider, 
        writable: false, 
        configurable: false,
        enumerable: true
      });
      
      // EIP-6963 for modern wallets
      const providerInfo = {
        uuid: 'c0a67e51-7a39-4c8d-8b2a-1f4e2c5d6e7f',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMTIiIGhlaWdodD0iMTg5IiB2aWV3Qm94PSIwIDAgMjEyIDE4OSI+PC9zdmc+',
        rdns: 'io.metamask'
      };
      
      const announceProvider = () => {
        window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
          detail: Object.freeze({ info: providerInfo, provider })
        }));
      };
      
      announceProvider();
      window.addEventListener('eip6963:requestProvider', announceProvider);
      window.dispatchEvent(new Event('ethereum#initialized'));
      
      log('Provider installed for ' + WALLET_ADDRESS);
    })();
  `;
}

async function debugGalxe() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  GALXE DEBUG - Finding Login Elements');
  console.log('═══════════════════════════════════════════════════════');
  
  const wallet = loadWallet();
  console.log(`Wallet: ${wallet.address}`);
  
  const browser = await launchStealthBrowser({ headless: true });
  const page = await createStealthPage(browser);
  
  // Forward all console logs
  page.on('console', msg => console.log(`[Browser] ${msg.text()}`));
  
  // Inject provider
  await page.evaluateOnNewDocument(createProviderScript(wallet.address, CHAIN_ID));
  
  console.log('\n📍 Loading Galxe...');
  await page.goto(GALXE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3000);
  
  // Find all clickable elements in the header
  console.log('\n🔍 Analyzing header elements...');
  const headerInfo = await page.evaluate(() => {
    const results = [];
    
    // Find header/nav elements
    const header = document.querySelector('header') || document.querySelector('nav');
    const topArea = document.querySelector('[class*="header"]') || document.querySelector('[class*="nav"]');
    
    // Find all buttons and clickable elements
    const clickables = document.querySelectorAll('button, [role="button"], a, [class*="connect"], [class*="login"], [class*="wallet"]');
    
    clickables.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < 80) { // In header area
        results.push({
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 50),
          classes: el.className?.slice(0, 100),
          id: el.id,
          rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height }
        });
      }
    });
    
    // Also check for SVG icons that might be login buttons
    const svgs = document.querySelectorAll('svg');
    svgs.forEach((svg, i) => {
      const rect = svg.getBoundingClientRect();
      if (rect.top < 80 && rect.right > window.innerWidth - 200) {
        const parent = svg.parentElement;
        results.push({
          tag: 'SVG',
          parentTag: parent?.tagName,
          text: parent?.textContent?.trim().slice(0, 30),
          classes: parent?.className?.slice(0, 100),
          rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height }
        });
      }
    });
    
    return results;
  });
  
  console.log('Header elements found:');
  headerInfo.forEach((el, i) => {
    console.log(`  ${i}: ${el.tag} "${el.text}" @ (${Math.round(el.rect.x)}, ${Math.round(el.rect.y)})`);
  });
  
  // Try to find the actual connect button
  console.log('\n🔍 Looking for connect/login buttons...');
  const buttons = await page.evaluate(() => {
    const results = [];
    const all = document.querySelectorAll('*');
    
    for (const el of all) {
      const text = el.textContent?.toLowerCase().trim() || '';
      const classes = el.className?.toLowerCase() || '';
      const role = el.getAttribute('role') || '';
      
      const isCandidate = (
        text.includes('connect') ||
        text.includes('log in') ||
        text.includes('login') ||
        text.includes('sign in') ||
        classes.includes('connect') ||
        classes.includes('login') ||
        classes.includes('wallet')
      );
      
      if (isCandidate) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          results.push({
            tag: el.tagName,
            text: text.slice(0, 50),
            classes: classes.slice(0, 100),
            rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height }
          });
        }
      }
    }
    
    return results.slice(0, 20);
  });
  
  console.log('Connect-related elements:');
  buttons.forEach((el, i) => {
    console.log(`  ${i}: ${el.tag} "${el.text}" @ (${Math.round(el.rect.x)}, ${Math.round(el.rect.y)})`);
  });
  
  // Click the circular avatar/profile button in top right
  console.log('\n🖱️ Trying to click profile icon in top right...');
  
  // Find clickable elements in top-right corner
  const topRightClickable = await page.evaluate(() => {
    const clickables = [];
    const all = document.querySelectorAll('button, [role="button"], a, div[class*="cursor"]');
    
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      // Top right area (last 200px width, top 80px height)
      if (rect.right > window.innerWidth - 200 && rect.top < 80 && rect.width > 20 && rect.height > 20) {
        clickables.push({
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 30),
          classes: el.className?.slice(0, 80),
          x: rect.x + rect.width/2,
          y: rect.y + rect.height/2
        });
      }
    }
    return clickables;
  });
  
  console.log('Top-right clickable elements:');
  topRightClickable.forEach((el, i) => {
    console.log(`  ${i}: ${el.tag} "${el.text}" @ (${Math.round(el.x)}, ${Math.round(el.y)})`);
  });
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/galxe-debug-1.png' });
  console.log('\n📸 Screenshot: /tmp/galxe-debug-1.png');
  
  // Try clicking the last icon in top right (usually login/profile)
  if (topRightClickable.length > 0) {
    const lastIcon = topRightClickable[topRightClickable.length - 1];
    console.log(`\n🖱️ Clicking last top-right element: ${lastIcon.tag} @ (${Math.round(lastIcon.x)}, ${Math.round(lastIcon.y)})`);
    await page.mouse.click(lastIcon.x, lastIcon.y);
    await sleep(2000);
    await page.screenshot({ path: '/tmp/galxe-debug-2.png' });
    console.log('📸 Screenshot after click: /tmp/galxe-debug-2.png');
  }
  
  // Check for modal
  const modalInfo = await page.evaluate(() => {
    const modals = document.querySelectorAll('[role="dialog"], [class*="modal"], [class*="Modal"], [class*="popup"], [class*="overlay"]');
    const results = [];
    
    modals.forEach(modal => {
      results.push({
        classes: modal.className?.slice(0, 100),
        text: modal.textContent?.slice(0, 200)
      });
    });
    
    // Also look for MetaMask text anywhere
    const allText = document.body.innerText;
    const hasMetaMask = allText.includes('MetaMask');
    const hasConnect = allText.includes('Connect') || allText.includes('connect');
    const hasWallet = allText.includes('wallet') || allText.includes('Wallet');
    
    return { modals: results, hasMetaMask, hasConnect, hasWallet };
  });
  
  console.log('\nModal/Dialog found:', modalInfo.modals.length > 0);
  if (modalInfo.modals.length > 0) {
    console.log('Modal text preview:', modalInfo.modals[0].text?.slice(0, 100));
  }
  console.log('Has MetaMask text:', modalInfo.hasMetaMask);
  console.log('Has Connect text:', modalInfo.hasConnect);
  console.log('Has Wallet text:', modalInfo.hasWallet);
  
  // Check wallet logs
  const logs = await page.evaluate(() => window.__walletLogs || []);
  console.log('\n📝 Wallet provider logs:', logs.length);
  logs.forEach(l => console.log(`  ${l.msg}`));
  
  await browser.close();
  console.log('\n✅ Debug complete. Check screenshots in /tmp/');
}

debugGalxe().catch(console.error);
