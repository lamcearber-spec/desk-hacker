const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome';
const fs = require('fs');

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('Going to login page...');
  await page.goto('https://www.datev-community.de/t5/user/myprofilepage', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // Should be redirected to login page
  const url = page.url();
  console.log(`Current URL: ${url}`);
  
  if (!url.includes('login')) {
    console.log('Already logged in or wrong page');
    await browser.close();
    return;
  }
  
  // Fill in login form
  console.log('Filling login form...');
  
  // Find and fill email field
  await page.waitForSelector('input[type="email"], input[name="Email"], input[id*="email"]', { timeout: 10000 });
  await page.type('input[type="email"], input[name="Email"], input[id*="email"]', 'madmax@agentmail.to');
  await new Promise(r => setTimeout(r, 500));
  
  // Find and fill password field
  await page.type('input[type="password"]', 'Madmax2026!');
  await new Promise(r => setTimeout(r, 500));
  
  await page.screenshot({ path: '/tmp/datev-login-filled.png' });
  console.log('Form filled, screenshot saved');
  
  // Click login button
  console.log('Clicking login...');
  await page.evaluate(() => {
    // Try various ways to find and click the login button
    const buttons = document.querySelectorAll('button, input[type="submit"]');
    for (const btn of buttons) {
      if (btn.innerText?.includes('Login') || btn.value?.includes('Login') || 
          btn.className?.includes('login') || btn.className?.includes('primary')) {
        btn.click();
        return;
      }
    }
    // Fallback: click first submit button
    const submit = document.querySelector('button[type="submit"], input[type="submit"]');
    if (submit) submit.click();
  });
  
  // Wait for redirect
  await new Promise(r => setTimeout(r, 5000));
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
  
  const newUrl = page.url();
  console.log(`After login URL: ${newUrl}`);
  
  if (!newUrl.includes('login')) {
    console.log('✅ Login successful!');
    
    // Get cookies
    const cookies = await page.cookies();
    const relevantCookies = {};
    
    for (const cookie of cookies) {
      if (cookie.domain.includes('datev-community')) {
        relevantCookies[cookie.name] = cookie.value;
      }
    }
    
    // Add metadata
    relevantCookies.username = 'maddie';
    relevantCookies.setup_date = new Date().toISOString().split('T')[0];
    
    // Save cookies
    fs.writeFileSync('/root/.config/datev/cookies.json', JSON.stringify(relevantCookies, null, 2));
    console.log('Cookies saved to ~/.config/datev/cookies.json');
    console.log(`Cookie count: ${Object.keys(relevantCookies).length}`);
  } else {
    console.log('❌ Login failed');
    await page.screenshot({ path: '/tmp/datev-login-error.png' });
    console.log('Error screenshot saved');
  }

  await browser.close();
}

main().catch(err => console.error('Error:', err.message));
