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

  console.log('Loading homepage...');
  await page.goto('https://www.datev-community.de/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // Scroll down to load more content
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 1000));
  
  // Get all text content from the page to analyze
  const pageText = await page.evaluate(() => document.body.innerText);
  
  // Extract lines that look like forum post titles
  const lines = pageText.split('\n').filter(line => {
    const l = line.trim();
    return l.length > 20 && l.length < 150 && 
           !l.includes('DATEV') && !l.includes('Mitglieder') && !l.includes('Beiträge') &&
           !l.includes('Suche') && !l.includes('Neueste') && !l.includes('Antwort');
  });
  
  console.log('\n=== Forum Topics (from page text) ===');
  lines.slice(0, 20).forEach((l, i) => console.log(`${i+1}. ${l}`));
  
  // Take full page screenshot
  await page.screenshot({ path: '/tmp/datev-full.png', fullPage: true });
  console.log('\nFull screenshot saved');

  await browser.close();
}

main().catch(err => console.error('Error:', err.message));
