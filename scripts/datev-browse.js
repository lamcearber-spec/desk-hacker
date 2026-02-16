const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome';

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  console.log('Checking IP...');
  await page.goto('https://ifconfig.me/', { waitUntil: 'networkidle2', timeout: 15000 });
  const ip = await page.$eval('strong', el => el.textContent).catch(() => 'unknown');
  console.log('Browser IP:', ip);

  console.log('Navigating to DATEV Community...');
  await page.goto('https://www.datev-community.de/', { waitUntil: 'networkidle2', timeout: 30000 });
  
  const title = await page.title();
  console.log('Page title:', title);
  
  await page.screenshot({ path: '/tmp/datev-home2.png', fullPage: true });
  console.log('Screenshot saved');

  await browser.close();
}

main().catch(err => console.error('Error:', err.message));
