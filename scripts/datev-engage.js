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

  // Visit a specific forum post to read and potentially engage
  console.log('Visiting a forum thread...');
  
  // First get the homepage to find actual links
  await page.goto('https://www.datev-community.de/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // Find a forum post link
  const postLink = await page.evaluate(() => {
    const links = document.querySelectorAll('a[href*="/t5/"][href*="/m-p/"]');
    for (const link of links) {
      if (link.href && link.href.includes('/m-p/')) {
        return link.href;
      }
    }
    return null;
  });
  
  if (postLink) {
    console.log('Found post:', postLink.substring(0, 80) + '...');
    await page.goto(postLink, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    const postTitle = await page.title();
    console.log('Post title:', postTitle);
    
    // Get the post content
    const content = await page.evaluate(() => {
      const body = document.querySelector('.lia-message-body, .message-body');
      return body ? body.innerText.substring(0, 500) : 'Content not found';
    });
    console.log('\nPost content preview:\n', content.substring(0, 300) + '...');
    
    await page.screenshot({ path: '/tmp/datev-post.png', fullPage: false });
    console.log('\nScreenshot saved');
  } else {
    console.log('No forum post links found');
  }

  await browser.close();
}

main().catch(err => console.error('Error:', err.message));
