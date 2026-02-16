#!/usr/bin/env node
/**
 * Galxe Wallet Connection v2
 * 
 * Fixed version that properly locates login button and handles signatures.
 */

const { launchStealthBrowser, createStealthPage } = require('../lib/stealth-browser');
const { loadWallet } = require('../lib/wallet-provider');
const { ethers } = require('ethers');

const GALXE_URL = 'https://app.galxe.com/quest';
const CHAIN_ID = 1; // Ethereum mainnet

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Enhanced provider with signature queue
function createProviderScript(address, chainId) {
  return `
    (function() {
      const WALLET_ADDRESS = '${address.toLowerCase()}';
      const CHAIN_ID = ${chainId};
      
      // Signature queue - processed by Node.js
      window.__walletSignatureQueue = [];
      window.__walletLogs = [];
      
      const log = (msg) => {
        const entry = '[Wallet] ' + msg;
        console.log(entry);
        window.__walletLogs.push(entry);
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
          if (!this._events[e]) this._events[e] = []; 
          this._events[e].push(cb); 
          return this; 
        },
        once: function(e, cb) { 
          const wrapper = (...args) => {
            this.removeListener(e, wrapper);
            cb(...args);
          };
          return this.on(e, wrapper);
        },
        addListener: function(e, cb) { return this.on(e, cb); },
        removeListener: function(e, cb) { 
          if (this._events[e]) {
            this._events[e] = this._events[e].filter(c => c !== cb);
          }
          return this; 
        },
        removeAllListeners: function(e) { 
          if (e) this._events[e] = [];
          else this._events = {};
          return this; 
        },
        emit: function(e, ...args) { 
          if (this._events[e]) this._events[e].forEach(cb => cb(...args)); 
        },
        listenerCount: function(e) {
          return (this._events[e] || []).length;
        },
        
        enable: async function() { 
          log('enable() called');
          return [WALLET_ADDRESS]; 
        },
        
        send: function(methodOrPayload, paramsOrCallback) {
          if (typeof methodOrPayload === 'string') {
            return this.request({ method: methodOrPayload, params: paramsOrCallback || [] });
          }
          if (typeof paramsOrCallback === 'function') {
            this.request(methodOrPayload)
              .then(result => paramsOrCallback(null, { result }))
              .catch(error => paramsOrCallback(error));
            return;
          }
          return this.request(methodOrPayload);
        },
        
        sendAsync: function(payload, callback) {
          this.request(payload)
            .then(result => callback(null, { id: payload.id, jsonrpc: '2.0', result }))
            .catch(error => callback(error));
        },
        
        request: async function({ method, params = [] }) {
          log('request: ' + method);
          
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
              log('Chain switched to ' + newChainId);
              return null;
              
            case 'personal_sign':
            case 'eth_sign':
            case 'eth_signTypedData':
            case 'eth_signTypedData_v3':
            case 'eth_signTypedData_v4':
              log('=== SIGNATURE REQUESTED: ' + method + ' ===');
              log('Params: ' + JSON.stringify(params).slice(0, 200));
              
              return new Promise((resolve, reject) => {
                const id = Date.now() + Math.random();
                window.__walletSignatureQueue.push({ 
                  id, method, params, resolve, reject,
                  timestamp: Date.now()
                });
                log('Signature queued with id: ' + id);
              });
              
            case 'eth_getBalance':
              return '0x0';
              
            case 'eth_blockNumber':
              return '0x1234567';
              
            case 'eth_estimateGas':
              return '0x5208';
              
            case 'eth_gasPrice':
              return '0x3b9aca00';
              
            case 'wallet_getPermissions':
              return [{ parentCapability: 'eth_accounts' }];
              
            case 'wallet_requestPermissions':
              return [{ parentCapability: 'eth_accounts' }];
              
            default:
              log('Unhandled: ' + method);
              throw new Error('Method not supported: ' + method);
          }
        }
      };
      
      // Delete existing ethereum object if any
      try { delete window.ethereum; } catch(e) {}
      
      // Install our provider
      Object.defineProperty(window, 'ethereum', { 
        value: provider, 
        writable: false, 
        configurable: false,
        enumerable: true
      });
      
      // EIP-6963 Multi-wallet support
      const providerInfo = {
        uuid: 'c0a67e51-7a39-4c8d-8b2a-1f4e2c5d6e7f',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMTIiIGhlaWdodD0iMTg5IiB2aWV3Qm94PSIwIDAgMjEyIDE4OSI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cG9seWdvbiBmaWxsPSIjQ0RCNTI4IiBwb2ludHM9IjYwLjc1IDE3My4yNSA4OC4zMTMgMTgwLjU2MyA4OC4zMTMgMTcxIDkwLjU2MyAxNjguNzUgMTA2LjMxMyAxNjguNzUgMTA2LjMxMyAxODAgMTA2LjMxMyAxODcuODc1IDg5LjQzOCAxODcuODc1IDY4LjYyNSAxNzguODc1Ii8+PHBvbHlnb24gZmlsbD0iI0NEQjUyOCIgcG9pbnRzPSIxMDUuNzUgMTczLjI1IDEzMi43NSAxODAuNTYzIDEzMi43NSAxNzEgMTM1IDE2OC43NSAxNTAuNzUgMTY4Ljc1IDE1MC43NSAxODAgMTUwLjc1IDE4Ny44NzUgMTMzLjg3NSAxODcuODc1IDExMy4wNjMgMTc4Ljg3NSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjU2LjUgMCkiLz48cG9seWdvbiBmaWxsPSIjMzkzOTM5IiBwb2ludHM9IjkwLjU2MyAxNTIuNDM4IDg4LjMxMyAxNzEgOTEuMTI1IDE2OC43NSAxMjAuMzc1IDE2OC43NSAxMjMuNzUgMTcxIDEyMS41IDE1Mi40MzggMTE3IDE0OS42MjUgOTQuNSAxNTAuMTg4Ii8+PHBvbHlnb24gZmlsbD0iI0Y4OUMzNSIgcG9pbnRzPSI3NS4zNzUgMjcgODguODc1IDU4LjUgOTUuMDYzIDE1MC4xODggMTE3IDE1MC4xODggMTIzLjc1IDU4LjUgMTM2LjEyNSAyNyIvPjxwb2x5Z29uIGZpbGw9IiNGODlEMzUiIHBvaW50cz0iMTYuMzEzIDk2LjE4OCAuNTYzIDE0MS43NSAzOS45MzggMTM5LjUgNjUuMjUgMTM5LjUgNjUuMjUgMTE5LjgxMyA2NC4xMjUgNzkuMzEzIDU4LjUgODMuODEzIi8+PHBvbHlnb24gZmlsbD0iI0Q4N0MzMCIgcG9pbnRzPSI0Ni4xMjUgMTAxLjI1IDkyLjI1IDEwMi4zNzUgODcuMTg4IDEyNiA2NS4yNSAxMjAuMzc1Ii8+PHBvbHlnb24gZmlsbD0iI0VBOEQzQSIgcG9pbnRzPSI0Ni4xMjUgMTAxLjgxMyA2NS4yNSAxMTkuODEzIDY1LjI1IDEzNy44MTMiLz48cG9seWdvbiBmaWxsPSIjRjg5RDM1IiBwb2ludHM9IjY1LjI1IDEyMC4zNzUgODcuNzUgMTI2IDk1LjA2MyAxNTAuMTg4IDkwIDE1MyA2NS4yNSAxMzguMzc1Ii8+PHBvbHlnb24gZmlsbD0iI0VCOEYzNSIgcG9pbnRzPSI2NS4yNSAxMzguMzc1IDYwLjc1IDE3My4yNSA5MC41NjMgMTUyLjQzOCIvPjxwb2x5Z29uIGZpbGw9IiNFQThFM0EiIHBvaW50cz0iOTIuMjUgMTAyLjM3NSA5NS4wNjMgMTUwLjE4OCA4Ni42MjUgMTI1LjcxOSIvPjxwb2x5Z29uIGZpbGw9IiNEODdDMzAiIHBvaW50cz0iMzkuMzc1IDEzOC45MzggNjUuMjUgMTM4LjM3NSA2MC43NSAxNzMuMjUiLz48cG9seWdvbiBmaWxsPSIjRUI4RjM1IiBwb2ludHM9IjEyLjkzOCAxODguNDM4IDYwLjc1IDE3My4yNSAzOS4zNzUgMTM4LjkzOCAuNTYzIDE0MS43NSIvPjxwb2x5Z29uIGZpbGw9IiNFODgyMUUiIHBvaW50cz0iODguODc1IDU4LjUgNjQuNjg4IDc4Ljc1IDQ2LjEyNSAxMDEuMjUgOTIuMjUgMTAyLjkzOCIvPjxwb2x5Z29uIGZpbGw9IiNERkNFQzMiIHBvaW50cz0iNjAuNzUgMTczLjI1IDkwLjU2MyAxNTIuNDM4IDg4LjMxMyAxNzAuNDM4IDg4LjMxMyAxODAuNTYzIDY4LjA2MyAxNzYuNjI1Ii8+PHBvbHlnb24gZmlsbD0iI0RGQ0VDMyIgcG9pbnRzPSIxMjEuNSAxNzMuMjUgMTUwLjc1IDE1Mi40MzggMTQ4LjUgMTcwLjQzOCAxNDguNSAxODAuNTYzIDEyOC4yNSAxNzYuNjI1IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyNzIuMjUgMCkiLz48cG9seWdvbiBmaWxsPSIjMzkzOTM5IiBwb2ludHM9IjcwLjMxMyAxMTIuNSA2NC4xMjUgMTI1LjQzOCA4Ni4wNjMgMTE5LjgxMyIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMTUwLjE4OCAwKSIvPjxwb2x5Z29uIGZpbGw9IiNFODhGMzUiIHBvaW50cz0iMTIuMzc1IC41NjMgODguODc1IDU4LjUgNzUuOTM4IDI3Ii8+PHBvbHlnb24gZmlsbD0iIzhFNUEzMCIgcG9pbnRzPSIxMi4zNzUgLjU2MyAyLjI1IDMxLjUgNy44NzUgNjUuMjUgMy43NSA2Ny41IDkuMzc1IDcyLjU2MyA0LjY4OCA3Ni41IDExLjI1IDgzLjgxMyA3LjMxMyA4Ny4xODggMTYuMzEzIDk2LjE4OCA1OC41IDgzLjgxMyA2NS4yNSA3MC41IDQwLjY4OCA0LjEyNSA0MC42ODggNC4xMjUgMTIuMzc1IC41NjMiLz48cG9seWdvbiBmaWxsPSIjRjg5RDM1IiBwb2ludHM9IjE5NS41NjMgOTYuMTg4IDIxMS4zMTMgMTQxLjc1IDE3MS45MzggMTM5LjUgMTQ2LjYyNSAxMzkuNSAxNDYuNjI1IDExOS44MTMgMTQ3Ljc1IDc5LjMxMyAxNTMuMzc1IDgzLjgxMyIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjExLjg3NSAwKSIvPjxwb2x5Z29uIGZpbGw9IiNEODdDMzAiIHBvaW50cz0iMTY1Ljc1IDEwMS4yNSAxMTkuNjI1IDEwMi4zNzUgMTI0LjY4OCAxMjYgMTQ2LjYyNSAxMjAuMzc1IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyODUuMzc1IDApIi8+PHBvbHlnb24gZmlsbD0iI0VBOEQzQSIgcG9pbnRzPSIxNjUuNzUgMTAxLjgxMyAxNDYuNjI1IDExOS44MTMgMTQ2LjYyNSAxMzcuODEzIiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAzMTIuMzc1IDApIi8+PHBvbHlnb24gZmlsbD0iI0Y4OUQzNSIgcG9pbnRzPSIxNDYuNjI1IDEyMC4zNzUgMTI0LjEyNSAxMjYgMTE2LjgxMyAxNTAuMTg4IDEyMS44NzUgMTUzIDE0Ni42MjUgMTM4LjM3NSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjYzLjQzOCAwKSIvPjxwb2x5Z29uIGZpbGw9IiNFQjhGMzUiIHBvaW50cz0iMTQ2LjYyNSAxMzguMzc1IDE1MS4xMjUgMTczLjI1IDEyMC4zNzUgMTUyLjQzOCIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjcxLjUgMCkiLz48cG9seWdvbiBmaWxsPSIjRUE4RTNBIiBwb2ludHM9IjExOS42MjUgMTAyLjM3NSAxMTYuODEzIDE1MC4xODggMTI1LjI1IDEyNS43MTkiIHRyYW5zZm9ybT0ibWF0cml4KC0xIDAgMCAxIDI0Mi40MzggMCkiLz48cG9seWdvbiBmaWxsPSIjRDg3QzMwIiBwb2ludHM9IjE3Mi41IDEzOC45MzggMTQ2LjYyNSAxMzguMzc1IDE1MS4xMjUgMTczLjI1IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAzMTguNzUgMCkiLz48cG9seWdvbiBmaWxsPSIjRUI4RjM1IiBwb2ludHM9IjE5OC45MzggMTg4LjQzOCAxNTEuMTI1IDE3My4yNSAxNzIuNSAxMzguOTM4IDIxMS4zMTMgMTQxLjc1IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyMTEuODc1IDApIi8+PHBvbHlnb24gZmlsbD0iI0U4ODIxRSIgcG9pbnRzPSIxMjMuMTI1IDU4LjUgMTQ3LjE4OCA3OC43NSAxNjUuNzUgMTAxLjI1IDExOS42MjUgMTAyLjkzOCIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjg1LjM3NSAwKSIvPjxwb2x5Z29uIGZpbGw9IiM4RTVBMzAiIHBvaW50cz0iMTk5LjUgLjU2MyAxMjMuMTI1IDU4LjUgMTM2LjA2MyAyNyIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMzIyLjYyNSAwKSIvPjxwb2x5Z29uIGZpbGw9IiM4RTVBMzAiIHBvaW50cz0iMTk5LjUgLjU2MyAyMDkuNjI1IDMxLjUgMjA0IDY1LjI1IDIwOC4xMjUgNjcuNSAyMDIuNSA3Mi41NjMgMjA3LjE4OCA3Ni41IDIwMC42MjUgODMuODEzIDIwNC41NjMgODcuMTg4IDE5NS41NjMgOTYuMTg4IDE1My4zNzUgODMuODEzIDE0Ni42MjUgNzAuNSAxNzEuMTg4IDQuMTI1IDE3MS4xODggNC4xMjUgMTk5LjUgLjU2MyIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjExLjg3NSAwKSIvPjxwb2x5Z29uIGZpbGw9IiMzOTM5MzkiIHBvaW50cz0iMTQxLjY4OCAxMTIuNSAxNDcuODc1IDEyNS40MzggMTI1LjkzOCAxMTkuODEzIi8+PC9nPjwvc3ZnPg==',
        rdns: 'io.metamask'
      };
      
      const announceProvider = () => {
        window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
          detail: Object.freeze({ info: providerInfo, provider })
        }));
      };
      
      // Announce immediately and on request
      announceProvider();
      window.addEventListener('eip6963:requestProvider', announceProvider);
      
      // Also dispatch legacy event
      window.dispatchEvent(new Event('ethereum#initialized'));
      
      log('Provider installed for ' + WALLET_ADDRESS);
    })();
  `;
}

async function signMessage(wallet, method, params) {
  console.log(`   Signing ${method}...`);
  
  switch (method) {
    case 'personal_sign': {
      // personal_sign: params[0] = message, params[1] = address
      const message = params[0];
      const signature = await wallet.signMessage(
        message.startsWith('0x') 
          ? ethers.getBytes(message)
          : message
      );
      return signature;
    }
    
    case 'eth_sign': {
      // eth_sign: params[0] = address, params[1] = message
      const message = params[1];
      const signature = await wallet.signMessage(ethers.getBytes(message));
      return signature;
    }
    
    case 'eth_signTypedData':
    case 'eth_signTypedData_v3':
    case 'eth_signTypedData_v4': {
      // params[0] = address, params[1] = typed data
      const typedData = typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1];
      const { domain, types, message, primaryType } = typedData;
      
      // Remove EIP712Domain from types
      const cleanTypes = { ...types };
      delete cleanTypes.EIP712Domain;
      
      const signature = await wallet.signTypedData(domain, cleanTypes, message);
      return signature;
    }
    
    default:
      throw new Error(`Unknown method: ${method}`);
  }
}

async function connectToGalxe() {
  const headed = process.argv.includes('--headed');
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('  GALXE WALLET CONNECTION v2');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Mode: ${headed ? 'Headed (visible)' : 'Headless'}`);
  
  // Load wallet
  let wallet;
  try {
    wallet = loadWallet();
    console.log(`✅ Wallet: ${wallet.address}`);
  } catch (error) {
    console.error('❌ Failed to load wallet:', error.message);
    process.exit(1);
  }
  
  // Launch browser
  console.log('\n🌐 Launching stealth browser...');
  const browser = await launchStealthBrowser({ headless: !headed });
  const page = await createStealthPage(browser);
  
  // Track console for debugging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[Wallet]')) {
      console.log(`📝 ${text}`);
    }
  });
  
  // Inject wallet provider BEFORE navigating
  console.log('💳 Injecting wallet provider...');
  await page.evaluateOnNewDocument(createProviderScript(wallet.address, CHAIN_ID));
  
  // Navigate to Galxe
  console.log(`\n📍 Navigating to ${GALXE_URL}...`);
  await page.goto(GALXE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(3000);
  
  await page.screenshot({ path: '/tmp/galxe-v2-1-initial.png' });
  console.log('📸 Screenshot: /tmp/galxe-v2-1-initial.png');
  
  // Find and click the profile/login button in top right
  // Based on debug: buttons at x=1694, 1752, 1848 - last one is likely profile
  console.log('\n🔍 Finding login button...');
  
  const clickResult = await page.evaluate(() => {
    // Find all buttons in top-right area (last 300px, top 80px)
    const buttons = [];
    const all = document.querySelectorAll('button, [role="button"]');
    
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth - 300 && rect.top < 80 && rect.width > 20) {
        buttons.push({
          x: rect.x + rect.width/2,
          y: rect.y + rect.height/2,
          width: rect.width,
          text: el.textContent?.trim().slice(0, 20) || '',
          ariaLabel: el.getAttribute('aria-label') || ''
        });
      }
    }
    
    // Sort by x position (rightmost first)
    buttons.sort((a, b) => b.x - a.x);
    
    return buttons;
  });
  
  console.log('Top-right buttons:', clickResult.length);
  clickResult.forEach((b, i) => console.log(`  ${i}: "${b.text || b.ariaLabel}" @ (${Math.round(b.x)}, ${Math.round(b.y)})`));
  
  if (clickResult.length === 0) {
    console.log('❌ No buttons found in top-right area!');
    await browser.close();
    process.exit(1);
  }
  
  // Click the rightmost button (likely profile/login)
  const loginBtn = clickResult[0];
  console.log(`\n🖱️ Clicking button @ (${Math.round(loginBtn.x)}, ${Math.round(loginBtn.y)})`);
  await page.mouse.click(loginBtn.x, loginBtn.y);
  await sleep(2000);
  
  await page.screenshot({ path: '/tmp/galxe-v2-2-afterclick.png' });
  console.log('📸 Screenshot: /tmp/galxe-v2-2-afterclick.png');
  
  // Check if login modal appeared
  const modalCheck = await page.evaluate(() => {
    const body = document.body.innerText.toLowerCase();
    return {
      hasMetaMask: body.includes('metamask'),
      hasWallet: body.includes('wallet'),
      hasConnect: body.includes('connect'),
      hasLogIn: body.includes('log in') || body.includes('login'),
      hasSignIn: body.includes('sign in'),
      text: body.slice(0, 500)
    };
  });
  
  console.log('\nModal status:', modalCheck.hasMetaMask ? '✅ MetaMask visible' : '❌ MetaMask not visible');
  console.log('Connect:', modalCheck.hasConnect, '| Login:', modalCheck.hasLogIn);
  
  if (modalCheck.hasMetaMask || modalCheck.hasConnect) {
    console.log('\n🔍 Looking for MetaMask option...');
    
    // Find and click MetaMask
    const mmClicked = await page.evaluate(() => {
      // Look for MetaMask text or icon
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        const text = (el.textContent || '').toLowerCase().trim();
        const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
        
        if ((text === 'metamask' || text.includes('metamask') || ariaLabel.includes('metamask')) && 
            !el.querySelector('*[class*="metamask"]')) { // Avoid double-clicking parent containers
          
          // Find the clickable element
          let target = el;
          for (let i = 0; i < 5; i++) {
            if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button' ||
                target.classList?.contains('cursor-pointer') || 
                window.getComputedStyle(target).cursor === 'pointer') {
              target.click();
              return { clicked: true, text: target.textContent?.slice(0, 30) };
            }
            target = target.parentElement;
            if (!target) break;
          }
          el.click();
          return { clicked: true, text: el.textContent?.slice(0, 30) };
        }
      }
      
      // Also try looking for wallet icons/buttons
      const walletBtns = document.querySelectorAll('[class*="wallet"], [class*="Wallet"]');
      for (const btn of walletBtns) {
        if (btn.textContent?.toLowerCase().includes('metamask')) {
          btn.click();
          return { clicked: true, text: 'wallet button' };
        }
      }
      
      return { clicked: false };
    });
    
    console.log(mmClicked.clicked ? `✅ Clicked: "${mmClicked.text}"` : '❌ MetaMask button not found');
    await sleep(3000);
    
    await page.screenshot({ path: '/tmp/galxe-v2-3-metamask.png' });
    console.log('📸 Screenshot: /tmp/galxe-v2-3-metamask.png');
  }
  
  // Now handle signature requests
  console.log('\n⏳ Waiting for signature request...');
  
  let signatureProcessed = false;
  for (let attempt = 0; attempt < 20; attempt++) {
    const pending = await page.evaluate(() => {
      if (window.__walletSignatureQueue && window.__walletSignatureQueue.length > 0) {
        const sig = window.__walletSignatureQueue[0];
        return { 
          id: sig.id, 
          method: sig.method, 
          params: sig.params 
        };
      }
      return null;
    });
    
    if (pending) {
      console.log(`\n🔐 Processing signature (${pending.method})...`);
      console.log(`   Params preview: ${JSON.stringify(pending.params).slice(0, 100)}...`);
      
      try {
        const signature = await signMessage(wallet, pending.method, pending.params);
        console.log(`   ✅ Signature: ${signature.slice(0, 40)}...`);
        
        // Resolve the promise in the browser
        await page.evaluate((id, sig) => {
          const queue = window.__walletSignatureQueue || [];
          const idx = queue.findIndex(s => s.id === id);
          if (idx >= 0) {
            queue[idx].resolve(sig);
            queue.splice(idx, 1);
          }
        }, pending.id, signature);
        
        signatureProcessed = true;
        console.log('   ✅ Signature submitted to dApp');
        break;
        
      } catch (error) {
        console.error(`   ❌ Signing error: ${error.message}`);
        await page.evaluate((id, err) => {
          const queue = window.__walletSignatureQueue || [];
          const idx = queue.findIndex(s => s.id === id);
          if (idx >= 0) {
            queue[idx].reject(new Error(err));
            queue.splice(idx, 1);
          }
        }, pending.id, error.message);
        break;
      }
    }
    
    await sleep(500);
    if (attempt % 5 === 4) {
      console.log(`   Still waiting... (${attempt + 1}/20)`);
    }
  }
  
  if (!signatureProcessed) {
    console.log('\n⚠️ No signature request received');
  }
  
  await sleep(3000);
  await page.screenshot({ path: '/tmp/galxe-v2-4-final.png', fullPage: true });
  console.log('📸 Screenshot: /tmp/galxe-v2-4-final.png');
  
  // Check final status
  const finalStatus = await page.evaluate((addr) => {
    const body = document.body.innerText;
    const addrShort = addr.toLowerCase().slice(2, 8);
    
    return {
      hasAddress: body.toLowerCase().includes(addrShort),
      hasSetup: body.includes('Set up') || body.includes('Sign up'),
      hasLoggedIn: body.includes('My Assets') && !body.includes('Log in'),
      hasProfile: body.includes('Profile') || body.includes('Dashboard')
    };
  }, wallet.address);
  
  console.log('\n═══════════════════════════════════════════════════════');
  if (finalStatus.hasLoggedIn || finalStatus.hasAddress || finalStatus.hasSetup) {
    console.log('  ✅ WALLET CONNECTED!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Address: ${wallet.address}`);
    if (finalStatus.hasSetup) {
      console.log('Status: Needs account setup (username)');
    } else {
      console.log('Status: Logged in');
    }
  } else {
    console.log('  ⚠️ Connection status unclear');
    console.log('═══════════════════════════════════════════════════════');
    console.log('Check /tmp/galxe-v2-*.png for details');
  }
  
  console.log('\n📸 All screenshots in /tmp/galxe-v2-*.png');
  
  // Get wallet logs
  const logs = await page.evaluate(() => window.__walletLogs || []);
  if (logs.length > 0) {
    console.log('\n📋 Wallet logs:');
    logs.slice(-10).forEach(l => console.log(`  ${l}`));
  }
  
  if (headed) {
    console.log('\n🖥️ Browser open. Press Ctrl+C to exit.');
    await new Promise(() => {});
  } else {
    await browser.close();
  }
}

connectToGalxe().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
