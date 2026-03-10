const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome';
const fs = require('fs');

async function main() {
  const threadUrl = process.argv[2];
  if (!threadUrl) {
    console.log('Usage: node datev-read-thread.js <thread-url>');
    return;
  }
  
  let cookies = {};
  try {
    cookies = JSON.parse(fs.readFileSync('/root/.config/datev/cookies.json'));
  } catch (e) {
    console.log('No cookies file');
  }
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Set cookies
  const cookieList = [];
  const cookieNames = ['LiSESSIONID', 'LithiumUserSecure', 'LithiumVisitor', 'LithiumUserInfo', 'AWSALB', 'AWSALBCORS'];
  for (const name of cookieNames) {
    if (cookies[name]) {
      cookieList.push({ name, value: cookies[name], domain: '.datev-community.de' });
    }
  }
  if (cookieList.length > 0) {
    await page.setCookie(...cookieList);
  }
  
  console.log(`Opening: ${threadUrl}\n`);
  await page.goto(threadUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // Get title
  const title = await page.evaluate(() => {
    const h1 = document.querySelector('h1, .message-subject, .lia-message-subject');
    return h1 ? h1.innerText.trim() : document.title;
  });
  
  console.log(`=== ${title} ===\n`);
  
  // Get posts
  const posts = await page.evaluate(() => {
    const results = [];
    const postElements = document.querySelectorAll('.lia-message-body, .message-body, [class*="message-body"]');
    
    if (postElements.length > 0) {
      postElements.forEach((el, i) => {
        const parent = el.closest('.lia-message, .message, [class*="message"]');
        let author = 'Unknown';
        let date = '';
        
        if (parent) {
          const authorEl = parent.querySelector('.lia-user-name, .author, [class*="author"]');
          const dateEl = parent.querySelector('.DateTime, [class*="date"], [class*="time"]');
          if (authorEl) author = authorEl.innerText.trim();
          if (dateEl) date = dateEl.innerText.trim();
        }
        
        results.push({
          author,
          date,
          content: el.innerText.trim().substring(0, 2000)
        });
      });
    } else {
      // Fallback: get main content
      const main = document.querySelector('main, .lia-component-article, article');
      if (main) {
        results.push({ author: 'Thread', date: '', content: main.innerText.trim().substring(0, 3000) });
      }
    }
    
    return results.slice(0, 10);
  });
  
  if (posts.length === 0) {
    console.log('Could not extract posts. Getting page text...\n');
    const text = await page.evaluate(() => document.body.innerText);
    console.log(text.substring(0, 3000));
  } else {
    posts.forEach((post, i) => {
      console.log(`--- Post ${i+1} by ${post.author} ${post.date ? '(' + post.date + ')' : ''} ---`);
      console.log(post.content);
      console.log('');
    });
  }
  
  await page.screenshot({ path: '/tmp/datev-thread.png', fullPage: true });
  console.log('Screenshot saved to /tmp/datev-thread.png');

  await browser.close();
}

main().catch(err => console.error('Error:', err.message));