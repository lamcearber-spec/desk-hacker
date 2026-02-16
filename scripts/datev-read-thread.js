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
  
  // Find first thread link (pattern: /m-p/NNNNNN)
  const threadUrl = await page.evaluate(() => {
    const links = document.querySelectorAll('a');
    for (const a of links) {
      if (a.href && a.href.match(/\/m-p\/\d+/) && a.innerText.trim().length > 15) {
        return a.href;
      }
    }
    return null;
  });
  
  if (!threadUrl) {
    console.log('No thread found');
    await browser.close();
    return;
  }
  
  console.log(`\nOpening thread: ${threadUrl}\n`);
  await page.goto(threadUrl, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // Get title
  const title = await page.title();
  console.log(`Title: ${title}\n`);
  
  // Get thread content
  const content = await page.evaluate(() => document.body.innerText);
  
  // Extract the main parts
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  let output = '';
  let inPost = false;
  
  for (const line of lines) {
    // Skip navigation and metadata
    if (line.includes('Abonnieren') || line.includes('RSS-Feed') || 
        line.includes('Anmelden') || line.includes('Registrieren') ||
        line.includes('Erste Schritte') || line.includes('Cookie') ||
        line.includes('Copyright') || line.includes('AGB') ||
        line.includes('Datenschutz') || line.includes('Impressum')) continue;
    
    output += line + '\n';
  }
  
  console.log('=== Thread Content ===\n');
  console.log(output.substring(0, 5000));
  
  await page.screenshot({ path: '/tmp/datev-thread.png', fullPage: true });
  console.log('\n\nScreenshot saved to /tmp/datev-thread.png');

  await browser.close();
}

main().catch(err => console.error('Error:', err.message));
