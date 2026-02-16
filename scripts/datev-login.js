const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Go directly to a URL that should show login form
  console.log('Going to sign-in URL...');
  await page.goto('https://www.datev-community.de/plugins/common/feature/oauth2sso/sso_login_redirect?referer=https%3A%2F%2Fwww.datev-community.de%2F', 
    { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  await sleep(5000);
  await page.screenshot({ path: '/tmp/datev-sso.png' });
  console.log('SSO URL:', page.url());
  
  // Check what we got
  const title = await page.title();
  console.log('Page title:', title);
  
  await browser.close();
})();
