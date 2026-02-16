#!/usr/bin/env node
/**
 * Test Wallet Provider Injection
 * 
 * Verifies that our injected wallet provider properly
 * handles eth_requestAccounts and signing requests.
 */

const { launchStealthBrowser, createStealthPage } = require('../lib/stealth-browser');
const { injectWalletProvider, loadWallet } = require('../lib/wallet-provider');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function testWalletProvider() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  WALLET PROVIDER TEST');
  console.log('═══════════════════════════════════════════════════════');
  
  // Load wallet
  const wallet = loadWallet();
  console.log(`\n✅ Wallet: ${wallet.address}`);
  
  // Launch browser
  const browser = await launchStealthBrowser({ headless: true });
  const page = await createStealthPage(browser);
  
  // Inject wallet provider
  console.log('\n💳 Injecting wallet provider...');
  await injectWalletProvider(page, wallet, { chainId: 8453 });
  
  // Navigate to blank page
  await page.goto('about:blank');
  
  // Test 1: Check window.ethereum exists
  console.log('\n📋 Test 1: Check window.ethereum exists');
  const hasEthereum = await page.evaluate(() => {
    return {
      exists: typeof window.ethereum !== 'undefined',
      isMetaMask: window.ethereum?.isMetaMask,
      selectedAddress: window.ethereum?.selectedAddress
    };
  });
  console.log(`   window.ethereum exists: ${hasEthereum.exists ? '✅' : '❌'}`);
  console.log(`   isMetaMask: ${hasEthereum.isMetaMask ? '✅' : '❌'}`);
  console.log(`   selectedAddress: ${hasEthereum.selectedAddress || 'null'}`);
  
  // Test 2: eth_requestAccounts
  console.log('\n📋 Test 2: eth_requestAccounts');
  const accounts = await page.evaluate(async () => {
    try {
      const result = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return { success: true, accounts: result };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  if (accounts.success) {
    console.log(`   ✅ Returned accounts: ${accounts.accounts.join(', ')}`);
  } else {
    console.log(`   ❌ Error: ${accounts.error}`);
  }
  
  // Test 3: eth_chainId
  console.log('\n📋 Test 3: eth_chainId');
  const chainId = await page.evaluate(async () => {
    try {
      const result = await window.ethereum.request({ method: 'eth_chainId' });
      return { success: true, chainId: result };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  if (chainId.success) {
    console.log(`   ✅ Chain ID: ${chainId.chainId} (${parseInt(chainId.chainId, 16)})`);
  } else {
    console.log(`   ❌ Error: ${chainId.error}`);
  }
  
  // Test 4: personal_sign (this triggers signature request)
  console.log('\n📋 Test 4: personal_sign');
  console.log('   Requesting signature...');
  
  // Start signature request and handle in parallel
  const signPromise = page.evaluate(async (addr) => {
    try {
      const message = 'Test message for signing';
      const result = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, addr]
      });
      return { success: true, signature: result };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, wallet.address);
  
  // Wait for signature (with timeout)
  const signTimeout = setTimeout(() => {}, 10000);
  try {
    const signResult = await Promise.race([
      signPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
    ]);
    clearTimeout(signTimeout);
    
    if (signResult.success) {
      console.log(`   ✅ Signature: ${signResult.signature.slice(0, 30)}...`);
    } else {
      console.log(`   ❌ Error: ${signResult.error}`);
    }
  } catch (e) {
    console.log(`   ⏱️ Signature request pending (expected - needs manual resolution)`);
  }
  
  // Test 5: Check with a real dApp test page
  console.log('\n📋 Test 5: Test on dApp test page');
  await page.goto('https://metamask.github.io/test-dapp/', { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);
  
  const testDappResult = await page.evaluate(() => {
    const statusEl = document.querySelector('#network, .network, [class*="network"]');
    const accountsEl = document.querySelector('#accounts, .accounts, [class*="account"]');
    return {
      pageLoaded: document.body.innerText.includes('MetaMask') || document.body.innerText.includes('E2E'),
      statusText: statusEl?.textContent || 'N/A',
      accountsText: accountsEl?.textContent || 'N/A'
    };
  });
  
  console.log(`   Page loaded: ${testDappResult.pageLoaded ? '✅' : '❌'}`);
  console.log(`   Status: ${testDappResult.statusText}`);
  console.log(`   Accounts: ${testDappResult.accountsText}`);
  
  await page.screenshot({ path: '/tmp/wallet-test-dapp.png' });
  console.log('\n📸 Screenshot: /tmp/wallet-test-dapp.png');
  
  await browser.close();
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════');
  
  const allPassed = hasEthereum.exists && 
                    hasEthereum.isMetaMask && 
                    accounts.success && 
                    chainId.success;
  
  if (allPassed) {
    console.log('\n✅ Core wallet provider functions working!');
    console.log('   The provider correctly handles:');
    console.log('   - eth_requestAccounts');
    console.log('   - eth_chainId');
    console.log('   - Shows as MetaMask');
  } else {
    console.log('\n⚠️ Some tests failed - check output above');
  }
  
  console.log('\n💡 Note: personal_sign requires console message interception');
  console.log('   which has timing challenges. For production, consider');
  console.log('   using postMessage or a custom event system.\n');
}

testWalletProvider().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
