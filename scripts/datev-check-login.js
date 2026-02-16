const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome';
const fs = require('fs');

async function main() {
  const cookies = JSON.parse(fs.readFileSync('/root/.config/datev/cookies.json'));
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  await page.setCookie(
    { name: 'LiSESSIONID', value: cookies.LiSESSIONID, domain: '.datev-community.de' },
    { name: 'LithiumUserSecure', value: cookies.LithiumUserSecure, domain: '.datev-community.de' },
    { name: 'aws-waf-token', value: cookies['aws-waf-token'], domain: '.datev-community.de' }
  );

  // Check profile page to verify login
  console.log('Checking login status...');
  await page.goto('https://www.datev-community.de/t5/user/myprofilepage', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // Get page content
  const pageUrl = page.url();
  const pageTitle = await page.title();
  
  console.log(`URL: ${pageUrl}`);
  console.log(`Title: ${pageTitle}`);
  
  // Check if logged in or redirected to login
  const isLoggedIn = !pageUrl.includes('login') && !pageUrl.includes('sso');
  
  if (isLoggedIn) {
    // Get profile info
    const profileInfo = await page.evaluate(() => {
      const username = document.querySelector('.lia-user-name, .user-name, h1')?.innerText || 'Unknown';
      const stats = document.body.innerText.match(/(\d+)\s*(Beiträge|Kudos|Aufrufe)/gi) || [];
      return { username, stats: stats.join(', ') };
    });
    
    console.log(`\n✅ LOGGED IN as: ${profileInfo.username}`);
    console.log(`Stats: ${profileInfo.stats}`);
  } else {
    console.log('\n❌ NOT LOGGED IN - session expired');
  }
  
  await page.screenshot({ path: '/tmp/datev-profile.png', fullPage: false });
  console.log('\nScreenshot saved to /tmp/datev-profile.png');

  await browser.close();
}

main().catch(err => console.error('Error:', err.message));
