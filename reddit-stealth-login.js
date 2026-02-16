const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log('Navigating to Reddit login...');
  await page.goto('https://www.reddit.com/login/', { waitUntil: 'networkidle2', timeout: 30000 });
  
  const content = await page.content();
  if (content.includes('blocked')) {
    console.log('BLOCKED - trying old reddit...');
    await page.goto('https://old.reddit.com/login', { waitUntil: 'networkidle2' });
    const oldContent = await page.content();
    if (oldContent.includes('blocked')) {
      console.log('STILL BLOCKED');
      await browser.close();
      process.exit(1);
    }
  }
  
  // Try to find login form
  const title = await page.title();
  console.log('Page title:', title);
  
  // Fill credentials
  try {
    await page.type('input[name="username"], #loginUsername', 'MadMaxInDaHaus', { delay: 50 });
    await page.type('input[name="password"], #loginPassword', 'Datevbereit2026!', { delay: 50 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    
    // Get cookies
    const cookies = await page.cookies();
    console.log('COOKIES:', JSON.stringify(cookies, null, 2));
    
    // Save cookies
    const fs = require('fs');
    fs.writeFileSync('/root/.config/reddit/cookies.json', JSON.stringify(cookies, null, 2));
    console.log('SUCCESS - Cookies saved!');
  } catch (e) {
    console.log('Login error:', e.message);
    await page.screenshot({ path: '/tmp/reddit-error.png' });
    console.log('Screenshot saved to /tmp/reddit-error.png');
  }
  
  await browser.close();
})();
