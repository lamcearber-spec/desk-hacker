/**
 * Injectable Wallet Provider
 * 
 * EIP-1193 compliant provider that can be injected into browser pages
 * to handle wallet connections and signing without MetaMask extension.
 * 
 * Usage:
 *   const { injectWalletProvider } = require('./wallet-provider');
 *   await injectWalletProvider(page, privateKey);
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Default wallet location
const WALLET_PATH = '/root/.config/max-wallet/wallet.json';

/**
 * Load wallet from file
 */
function loadWallet(walletPath = WALLET_PATH) {
  if (!fs.existsSync(walletPath)) {
    throw new Error(`Wallet file not found: ${walletPath}`);
  }
  const data = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
  return new ethers.Wallet(data.privateKey);
}

/**
 * Create the injectable provider script
 * This creates window.ethereum as an EIP-1193 compatible provider
 * 
 * @param {string} address - Wallet address
 * @param {number} chainId - Chain ID (default: 1 for mainnet, 8453 for Base)
 */
function createProviderScript(address, chainId = 1) {
  return `
    (function() {
      // Don't override if MetaMask is already present and we want to use it
      // if (window.ethereum && window.ethereum.isMetaMask) return;
      
      const WALLET_ADDRESS = '${address.toLowerCase()}';
      const CHAIN_ID = ${chainId};
      
      // Pending signature requests (will be resolved from Node.js side)
      window.__walletPendingRequests = {};
      window.__walletRequestId = 0;
      
      // Create EIP-1193 compliant provider
      const provider = {
        isMetaMask: true,  // Some dApps require this
        _metamask: {
          isUnlocked: () => Promise.resolve(true),
        },
        isConnected: () => true,
        chainId: '0x' + CHAIN_ID.toString(16),
        networkVersion: String(CHAIN_ID),
        selectedAddress: WALLET_ADDRESS,
        
        // Event handling
        _events: {},
        on: function(event, callback) {
          if (!this._events[event]) this._events[event] = [];
          this._events[event].push(callback);
          return this;
        },
        removeListener: function(event, callback) {
          if (!this._events[event]) return this;
          this._events[event] = this._events[event].filter(cb => cb !== callback);
          return this;
        },
        emit: function(event, ...args) {
          if (this._events[event]) {
            this._events[event].forEach(cb => cb(...args));
          }
        },
        
        // Enable for legacy dApps
        enable: async function() {
          return [WALLET_ADDRESS];
        },
        
        // Send for legacy dApps
        send: function(methodOrPayload, paramsOrCallback) {
          if (typeof methodOrPayload === 'string') {
            return this.request({ method: methodOrPayload, params: paramsOrCallback || [] });
          }
          // Legacy callback style
          if (typeof paramsOrCallback === 'function') {
            this.request(methodOrPayload)
              .then(result => paramsOrCallback(null, { result }))
              .catch(error => paramsOrCallback(error));
            return;
          }
          return this.request(methodOrPayload);
        },
        
        // SendAsync for legacy dApps
        sendAsync: function(payload, callback) {
          this.request(payload)
            .then(result => callback(null, { id: payload.id, jsonrpc: '2.0', result }))
            .catch(error => callback(error));
        },
        
        // Main request method (EIP-1193)
        request: async function({ method, params = [] }) {
          console.log('[Wallet] Request:', method, params);
          
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
              // Accept any chain switch for now
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
              // Queue signature request for Node.js to handle
              const requestId = ++window.__walletRequestId;
              return new Promise((resolve, reject) => {
                window.__walletPendingRequests[requestId] = { resolve, reject, method, params };
                // Signal to Node.js
                window.__walletSignatureNeeded = { id: requestId, method, params };
                console.log('[Wallet] Signature requested:', requestId, method);
              });
              
            case 'eth_sendTransaction':
              // Queue transaction for Node.js to handle
              const txRequestId = ++window.__walletRequestId;
              return new Promise((resolve, reject) => {
                window.__walletPendingRequests[txRequestId] = { resolve, reject, method, params };
                window.__walletTransactionNeeded = { id: txRequestId, method, params };
                console.log('[Wallet] Transaction requested:', txRequestId, params);
              });
              
            case 'eth_getTransactionReceipt':
            case 'eth_blockNumber':
            case 'eth_getBalance':
            case 'eth_call':
            case 'eth_estimateGas':
            case 'eth_gasPrice':
            case 'eth_getCode':
            case 'eth_getLogs':
              // Forward read-only calls to public RPC
              const rpcUrls = {
                1: 'https://eth.llamarpc.com',
                8453: 'https://mainnet.base.org',
                10: 'https://mainnet.optimism.io',
                42161: 'https://arb1.arbitrum.io/rpc'
              };
              const rpcUrl = rpcUrls[CHAIN_ID] || rpcUrls[1];
              
              const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  id: Date.now(),
                  method,
                  params
                })
              });
              const data = await response.json();
              if (data.error) throw new Error(data.error.message);
              return data.result;
              
            default:
              console.warn('[Wallet] Unsupported method:', method);
              throw new Error(\`Unsupported method: \${method}\`);
          }
        }
      };
      
      // Install as window.ethereum
      Object.defineProperty(window, 'ethereum', {
        value: provider,
        writable: false,
        configurable: true
      });
      
      // Announce provider (legacy)
      window.dispatchEvent(new Event('ethereum#initialized'));
      
      // EIP-6963: Multi-wallet discovery protocol
      // This is how modern dApps discover wallets
      const providerInfo = {
        uuid: 'c0a67e51-7a39-4c8d-8b2a-1f4e2c5d6e7f',
        name: 'MetaMask',
        icon: 'data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiBoZWlnaHQ9IjMzIiB2aWV3Qm94PSIwIDAgMzUgMzMiIHdpZHRoPSIzNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iLjI1Ij48cGF0aCBkPSJtMzIuOTU4MiAxLTEzLjEzNDEgOS43MTgzIDIuNDQyNC01Ljc1ODQeiIgZmlsbD0iI2UxNzcyNiIgc3Ryb2tlPSIjZTE3NzI2Ii8+PC9nPjwvc3ZnPg==',
        rdns: 'io.metamask'
      };
      
      const announceEvent = new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({
          info: providerInfo,
          provider: provider
        })
      });
      
      // Announce on load
      window.dispatchEvent(announceEvent);
      
      // Listen for requests and re-announce
      window.addEventListener('eip6963:requestProvider', () => {
        window.dispatchEvent(announceEvent);
      });
      
      console.log('[Wallet] Provider installed for', WALLET_ADDRESS, '(with EIP-6963)');
    })();
  `;
}

/**
 * Sign a message using the wallet
 * 
 * @param {ethers.Wallet} wallet 
 * @param {string} method - Signing method
 * @param {any[]} params - Request params
 */
async function signRequest(wallet, method, params) {
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
      // params[0] = address, params[1] = typed data (JSON string or object)
      const typedData = typeof params[1] === 'string' ? JSON.parse(params[1]) : params[1];
      const { domain, types, message, primaryType } = typedData;
      
      // Remove EIP712Domain from types if present (ethers.js handles it)
      const cleanTypes = { ...types };
      delete cleanTypes.EIP712Domain;
      
      const signature = await wallet.signTypedData(domain, cleanTypes, message);
      return signature;
    }
    
    default:
      throw new Error(`Unknown signing method: ${method}`);
  }
}

/**
 * Inject wallet provider into a Puppeteer page
 * 
 * @param {Page} page - Puppeteer page
 * @param {string|ethers.Wallet} walletOrKey - Private key or ethers.Wallet
 * @param {Object} options
 * @param {number} options.chainId - Chain ID (default: 8453 for Base)
 */
async function injectWalletProvider(page, walletOrKey, options = {}) {
  const { chainId = 8453 } = options;
  
  // Create wallet instance
  const wallet = typeof walletOrKey === 'string' 
    ? new ethers.Wallet(walletOrKey)
    : walletOrKey;
  
  const address = wallet.address;
  console.log(`[Wallet] Injecting provider for ${address} (Chain: ${chainId})`);
  
  // Inject provider script before page loads
  await page.evaluateOnNewDocument(createProviderScript(address, chainId));
  
  // Set up signature request handler
  page.on('console', async (msg) => {
    const text = msg.text();
    
    if (text.includes('[Wallet] Signature requested:')) {
      // Check for pending signature requests
      const pendingRequest = await page.evaluate(() => window.__walletSignatureNeeded);
      
      if (pendingRequest) {
        console.log(`[Wallet] Processing signature request ${pendingRequest.id}: ${pendingRequest.method}`);
        
        try {
          const signature = await signRequest(wallet, pendingRequest.method, pendingRequest.params);
          
          // Resolve the promise in the page
          await page.evaluate((id, sig) => {
            const req = window.__walletPendingRequests[id];
            if (req) {
              req.resolve(sig);
              delete window.__walletPendingRequests[id];
            }
            window.__walletSignatureNeeded = null;
          }, pendingRequest.id, signature);
          
          console.log(`[Wallet] Signature ${pendingRequest.id} completed`);
        } catch (error) {
          console.error(`[Wallet] Signature error:`, error.message);
          await page.evaluate((id, err) => {
            const req = window.__walletPendingRequests[id];
            if (req) {
              req.reject(new Error(err));
              delete window.__walletPendingRequests[id];
            }
            window.__walletSignatureNeeded = null;
          }, pendingRequest.id, error.message);
        }
      }
    }
    
    if (text.includes('[Wallet] Transaction requested:')) {
      const pendingTx = await page.evaluate(() => window.__walletTransactionNeeded);
      
      if (pendingTx) {
        console.log(`[Wallet] Processing transaction ${pendingTx.id}`);
        
        try {
          // Get RPC provider for the chain
          const rpcUrls = {
            1: 'https://eth.llamarpc.com',
            8453: 'https://mainnet.base.org',
            10: 'https://mainnet.optimism.io',
            42161: 'https://arb1.arbitrum.io/rpc'
          };
          
          const provider = new ethers.JsonRpcProvider(rpcUrls[chainId] || rpcUrls[1]);
          const connectedWallet = wallet.connect(provider);
          
          const tx = pendingTx.params[0];
          const txResponse = await connectedWallet.sendTransaction({
            to: tx.to,
            value: tx.value ? BigInt(tx.value) : undefined,
            data: tx.data,
            gasLimit: tx.gas ? BigInt(tx.gas) : undefined,
          });
          
          await page.evaluate((id, hash) => {
            const req = window.__walletPendingRequests[id];
            if (req) {
              req.resolve(hash);
              delete window.__walletPendingRequests[id];
            }
            window.__walletTransactionNeeded = null;
          }, pendingTx.id, txResponse.hash);
          
          console.log(`[Wallet] Transaction sent: ${txResponse.hash}`);
        } catch (error) {
          console.error(`[Wallet] Transaction error:`, error.message);
          await page.evaluate((id, err) => {
            const req = window.__walletPendingRequests[id];
            if (req) {
              req.reject(new Error(err));
              delete window.__walletPendingRequests[id];
            }
            window.__walletTransactionNeeded = null;
          }, pendingTx.id, error.message);
        }
      }
    }
  });
  
  return wallet;
}

/**
 * Create a provider script that auto-signs everything
 * (Use with caution - bypasses all confirmation!)
 */
function createAutoSignProvider(wallet, chainId = 8453) {
  const address = wallet.address;
  const privateKey = wallet.privateKey;
  
  // This version includes ethers.js bundled and auto-signs
  // For production, you'd want to be more careful about this
  return `
    // WARNING: This auto-signs all requests - use only for trusted sites
    // The private key is exposed to the page context
    (function() {
      const WALLET_ADDRESS = '${address.toLowerCase()}';
      const CHAIN_ID = ${chainId};
      const PRIVATE_KEY = '${privateKey}';
      
      // Minimal signing implementation
      // In practice, you'd want to use a proper library
      
      const provider = {
        isMetaMask: true,
        isConnected: () => true,
        chainId: '0x' + CHAIN_ID.toString(16),
        selectedAddress: WALLET_ADDRESS,
        _events: {},
        on: function(e, cb) { if (!this._events[e]) this._events[e] = []; this._events[e].push(cb); return this; },
        removeListener: function(e, cb) { if (this._events[e]) this._events[e] = this._events[e].filter(c => c !== cb); return this; },
        emit: function(e, ...args) { if (this._events[e]) this._events[e].forEach(cb => cb(...args)); },
        enable: async function() { return [WALLET_ADDRESS]; },
        request: async function({ method, params = [] }) {
          switch (method) {
            case 'eth_requestAccounts':
            case 'eth_accounts':
              return [WALLET_ADDRESS];
            case 'eth_chainId':
              return '0x' + CHAIN_ID.toString(16);
            case 'net_version':
              return String(CHAIN_ID);
            case 'wallet_switchEthereumChain':
              return null;
            default:
              throw new Error('Method not supported: ' + method);
          }
        }
      };
      
      Object.defineProperty(window, 'ethereum', { value: provider, writable: false });
      console.log('[AutoWallet] Installed for', WALLET_ADDRESS);
    })();
  `;
}

module.exports = {
  loadWallet,
  createProviderScript,
  signRequest,
  injectWalletProvider,
  createAutoSignProvider,
  WALLET_PATH
};
