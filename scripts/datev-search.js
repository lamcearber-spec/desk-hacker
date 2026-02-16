const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome';
const fs = require('fs');

async function main() {
  const searchTerm = process.argv[2] || 'Kontoauszug';
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

  // Search for topics
  const searchUrl = `https://www.datev-community.de/t5/forums/searchpage/tab/message?q=${encodeURIComponent(searchTerm)}&filter=labels&sort_by=-topicPostDate`;
  console.log(`Searching for: ${searchTerm}`);
  
  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Get the full page text and parse results
  const pageText = await page.evaluate(() => document.body.innerText);
  
  // Extract search results - they appear as lines with forum-like content
  const lines = pageText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  console.log(`\n=== Search Results for "${searchTerm}" ===\n`);
  
  // Find result count
  const countMatch = pageText.match(/(\d+(?:\.\d+)?)\s*Ergebnisse/);
  if (countMatch) {
    console.log(`Found ${countMatch[1]} results\n`);
  }
  
  // Find post titles - they typically precede timestamps like "vor X Stunden" or dates
  let currentResult = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // If line looks like a title (decent length, no timestamp markers)
    if (line.length > 20 && line.length < 200 && 
        !line.match(/^\d{2}\.\d{2}\.\d{4}/) &&
        !line.includes('Ergebnis') &&
        !line.includes('Filter') &&
        !line.includes('Anmelden') &&
        !line.includes('DATEV-Community') &&
        (line.includes('?') || line.includes('!') || /[A-ZÄÖÜ]/.test(line[0]))) {
      // Check if next line is a timestamp
      const nextLine = lines[i+1] || '';
      if (nextLine.includes('vor') || nextLine.match(/^\d{2}\.\d{2}\.\d{4}/)) {
        console.log(`- ${line}`);
        console.log(`  (${nextLine})\n`);
      }
    }
  }
  
  // Also get clickable links for later
  const links = await page.evaluate(() => {
    const anchors = document.querySelectorAll('a');
    const results = [];
    for (const a of anchors) {
      if (a.href && a.href.includes('/td-p/') && a.innerText.trim().length > 10) {
        results.push({ title: a.innerText.trim().substring(0,80), url: a.href });
      }
    }
    return results.slice(0, 10);
  });
  
  if (links.length > 0) {
    console.log('\n=== Clickable Links ===\n');
    links.forEach((l, i) => console.log(`${i+1}. ${l.title}\n   ${l.url}\n`));
  }
  
  await page.screenshot({ path: '/tmp/datev-search.png', fullPage: true });
  console.log('Screenshot saved to /tmp/datev-search.png');

  await browser.close();
}

main().catch(err => console.error('Error:', err.message));
