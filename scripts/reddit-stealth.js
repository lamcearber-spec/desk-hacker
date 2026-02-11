const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome';
const USER_DATA_DIR = '/root/.clawdbot/browser/reddit/user-data';

const randomDelay = (min, max) => new Promise(r => setTimeout(r, Math.random() * (max - min) + min));

async function main() {
  const action = process.argv[2] || 'test';
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    userDataDir: USER_DATA_DIR,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();
  
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  if (action === 'test') {
    console.log('Testing Reddit access...');
    await page.goto('https://www.reddit.com/', { waitUntil: 'networkidle2', timeout: 30000 });
    const title = await page.title();
    console.log('Page title:', title);
    const content = await page.content();
    if (content.includes("You've been blocked") && !content.includes("Let us know your cookie preferences")) {
      console.log('STATUS: BLOCKED');
    } else {
      console.log('STATUS: SUCCESS');
    }
  } 
  else if (action === 'magic-link') {
    const email = process.argv[3];
    
    if (!email) {
      console.log('Usage: node reddit-stealth.js magic-link <email>');
      await browser.close();
      return;
    }

    console.log('Navigating to login page...');
    await page.goto('https://www.reddit.com/login/', { waitUntil: 'networkidle2', timeout: 30000 });
    await randomDelay(2000, 3000);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/reddit-login-page.png' });
    
    // Click "Email me a one-time link"
    console.log('Looking for magic link button...');
    
    const buttons = await page.$$('button');
    let clicked = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('one-time link') || text.includes('Email me')) {
        console.log('Found magic link button, clicking...');
        await btn.click();
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      // Try by class/attribute
      await page.evaluate(() => {
        const links = document.querySelectorAll('a, button, [role="button"]');
        for (const el of links) {
          if (el.textContent.includes('one-time link') || el.textContent.includes('Email me')) {
            el.click();
            return true;
          }
        }
        return false;
      });
    }
    
    await randomDelay(2000, 3000);
    await page.screenshot({ path: '/tmp/reddit-magic-link-form.png' });
    
    // Look for email input field
    console.log('Looking for email input...');
    const emailInput = await page.$('input[type="email"], input[name="email"], input[autocomplete="email"]');
    
    if (emailInput) {
      console.log('Found email input, entering email...');
      await emailInput.click();
      await emailInput.type(email, { delay: 50 });
      await randomDelay(1000, 2000);
      
      // Submit
      await page.keyboard.press('Enter');
      await randomDelay(3000, 5000);
      
      await page.screenshot({ path: '/tmp/reddit-magic-link-sent.png' });
      console.log('Magic link requested! Check email: ' + email);
      console.log('STATUS: MAGIC_LINK_SENT');
    } else {
      console.log('Could not find email input');
      console.log('STATUS: FAILED');
    }
  }
  else if (action === 'open-link') {
    const link = process.argv[3];
    
    if (!link) {
      console.log('Usage: node reddit-stealth.js open-link <url>');
      await browser.close();
      return;
    }

    console.log('Opening magic link...');
    await page.goto(link, { waitUntil: 'networkidle2', timeout: 30000 });
    await randomDelay(3000, 5000);
    
    await page.screenshot({ path: '/tmp/reddit-after-magic-link.png' });
    
    const url = page.url();
    console.log('Current URL:', url);
    
    if (url === 'https://www.reddit.com/' || !url.includes('/login')) {
      console.log('STATUS: LOGIN_SUCCESS');
    } else {
      console.log('STATUS: LOGIN_FAILED');
    }
  }
  else if (action === 'check') {
    console.log('Checking login status...');
    await page.goto('https://www.reddit.com/', { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page.screenshot({ path: '/tmp/reddit-check.png' });
    
    // Check for user menu (logged in indicator)
    const isLoggedIn = await page.evaluate(() => {
      const html = document.body.innerHTML;
      // If we see Log In button, we're not logged in
      const hasLoginBtn = html.includes('>Log In<') || html.includes('">Log In<');
      // If we see avatar/profile, we are logged in
      const hasProfile = html.includes('profile-menu') || html.includes('user-drawer');
      return hasProfile || !hasLoginBtn;
    });
    
    console.log('Logged in:', isLoggedIn);
  }
  else if (action === 'ip') {
    await page.goto('https://ifconfig.me/', { waitUntil: 'networkidle2' });
    const ip = await page.$eval('strong', el => el.textContent).catch(() => 'unknown');
    console.log('IP:', ip);
  }

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
