const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome';
const fs = require('fs');

async function main() {
  const searchTerm = process.argv[2] || 'Bank';
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

  const searchUrl = `https://www.datev-community.de/t5/forums/searchpage/tab/message?q=${encodeURIComponent(searchTerm)}&filter=labels&sort_by=-topicPostDate`;
  console.log(`URL: ${searchUrl}\n`);
  
  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Get all links and their text
  const allLinks = await page.evaluate(() => {
    const links = document.querySelectorAll('a');
    return Array.from(links)
      .filter(a => a.href && a.innerText.trim().length > 5)
      .map(a => ({ text: a.innerText.trim().substring(0,80), href: a.href }))
      .filter(l => l.href.includes('datev-community'));
  });
  
  console.log('=== All Links Found ===\n');
  allLinks.slice(0, 30).forEach((l, i) => {
    console.log(`${i+1}. ${l.text}`);
    console.log(`   ${l.href}\n`);
  });

  await browser.close();
}

main().catch(err => console.error('Error:', err.message));
