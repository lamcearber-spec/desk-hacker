const puppeteer = require('puppeteer-core');

const BROWSERBASE_API_KEY = 'bb_live_0zksDW8MdkPq6Kfxe5x9nctqXSs';
const BROWSERBASE_PROJECT_ID = '551376c4-5125-4d43-bb12-f713de07f400';

async function main() {
  // Create session
  const response = await fetch('https://api.browserbase.com/v1/sessions', {
    method: 'POST',
    headers: {
      'x-bb-api-key': BROWSERBASE_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectId: BROWSERBASE_PROJECT_ID,
      browserSettings: { fingerprint: { devices: ['desktop'], operatingSystems: ['windows'] } },
      proxies: true
    })
  });
  
  const session = await response.json();
  console.log('Session:', session.id);
  
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://connect.browserbase.com?apiKey=${BROWSERBASE_API_KEY}&sessionId=${session.id}`
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('Going to Reddit login...');
  await page.goto('https://www.reddit.com/login', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 5000));
  
  // Get page HTML to find the right selectors
  const inputs = await page.evaluate(() => {
    const allInputs = document.querySelectorAll('input');
    return Array.from(allInputs).map(i => ({
      type: i.type,
      name: i.name,
      id: i.id,
      placeholder: i.placeholder,
      className: i.className
    }));
  });
  
  console.log('Found inputs:', JSON.stringify(inputs, null, 2));
  
  // Get page content
  const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log('\nPage text preview:', text.substring(0, 1000));
  
  await page.screenshot({ path: '/tmp/reddit-login-debug.png', fullPage: true });
  console.log('\nScreenshot saved to /tmp/reddit-login-debug.png');
  
  await browser.close();
}

main().catch(console.error);
