const puppeteer = require('puppeteer-core');

const BROWSERBASE_API_KEY = 'bb_live_0zksDW8MdkPq6Kfxe5x9nctqXSs';
const BROWSERBASE_PROJECT_ID = '551376c4-5125-4d43-bb12-f713de07f400';

const REDDIT_USER = 'MadMaxInDaHaus';
const REDDIT_PASS = 'Datevbereit2026!';

async function createSession() {
  const response = await fetch('https://api.browserbase.com/v1/sessions', {
    method: 'POST',
    headers: {
      'x-bb-api-key': BROWSERBASE_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectId: BROWSERBASE_PROJECT_ID,
      browserSettings: {
        fingerprint: {
          devices: ['desktop'],
          operatingSystems: ['windows']
        }
      },
      proxies: true  // Residential proxy
    })
  });
  
  const session = await response.json();
  console.log('Session created:', session.id);
  return session;
}

async function connectBrowser(sessionId) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://connect.browserbase.com?apiKey=${BROWSERBASE_API_KEY}&sessionId=${sessionId}`
  });
  return browser;
}

async function loginReddit(page) {
  console.log('Navigating to Reddit login...');
  await page.goto('https://www.reddit.com/login', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Check if already logged in
  const url = page.url();
  if (!url.includes('login')) {
    console.log('Already logged in!');
    return true;
  }
  
  // Fill login form
  console.log('Filling login form...');
  await page.type('input[name="username"]', REDDIT_USER, { delay: 50 });
  await page.type('input[name="password"]', REDDIT_PASS, { delay: 50 });
  
  await page.screenshot({ path: '/tmp/reddit-login-filled.png' });
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  await new Promise(r => setTimeout(r, 5000));
  
  const newUrl = page.url();
  console.log('After login URL:', newUrl);
  
  if (newUrl.includes('login') || newUrl.includes('captcha')) {
    console.log('Login may have failed or captcha triggered');
    await page.screenshot({ path: '/tmp/reddit-login-result.png' });
    return false;
  }
  
  console.log('Login successful!');
  return true;
}

async function postComment(page, subreddit, postUrl, comment) {
  console.log(`Navigating to: ${postUrl}`);
  await page.goto(postUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // Find comment box
  const commentBox = await page.$('div[contenteditable="true"], textarea[name="body"]');
  if (!commentBox) {
    console.log('Comment box not found');
    await page.screenshot({ path: '/tmp/reddit-no-comment-box.png' });
    return false;
  }
  
  // Type comment
  await commentBox.click();
  await commentBox.type(comment, { delay: 30 });
  
  await page.screenshot({ path: '/tmp/reddit-comment-typed.png' });
  
  // Submit - find the comment button
  const submitBtn = await page.$('button[type="submit"]:has-text("Comment"), button:has-text("Reply")');
  if (submitBtn) {
    await submitBtn.click();
    await new Promise(r => setTimeout(r, 3000));
    console.log('Comment submitted!');
    return true;
  }
  
  console.log('Submit button not found');
  return false;
}

async function browseSubreddit(page, subreddit) {
  console.log(`Browsing r/${subreddit}...`);
  await page.goto(`https://www.reddit.com/r/${subreddit}/new/`, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Get post titles and links
  const posts = await page.evaluate(() => {
    const items = [];
    const links = document.querySelectorAll('a[href*="/comments/"]');
    const seen = new Set();
    
    links.forEach(link => {
      const href = link.href;
      const text = link.innerText?.trim();
      if (href && text && text.length > 10 && !seen.has(href)) {
        seen.add(href);
        items.push({ title: text.substring(0, 100), url: href });
      }
    });
    
    return items.slice(0, 10);
  });
  
  console.log(`Found ${posts.length} posts in r/${subreddit}`);
  posts.forEach((p, i) => console.log(`${i+1}. ${p.title}`));
  
  await page.screenshot({ path: `/tmp/reddit-${subreddit}.png` });
  return posts;
}

async function main() {
  const action = process.argv[2] || 'browse';
  const subreddit = process.argv[3] || 'Finanzen';
  
  console.log(`Action: ${action}, Subreddit: ${subreddit}`);
  
  // Create Browserbase session
  const session = await createSession();
  const browser = await connectBrowser(session.id);
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    if (action === 'login') {
      const success = await loginReddit(page);
      console.log('Login result:', success);
    } else if (action === 'browse') {
      await loginReddit(page);
      await browseSubreddit(page, subreddit);
    } else if (action === 'comment') {
      const postUrl = process.argv[4];
      const comment = process.argv[5];
      await loginReddit(page);
      await postComment(page, subreddit, postUrl, comment);
    }
  } catch (err) {
    console.error('Error:', err.message);
    await page.screenshot({ path: '/tmp/reddit-error.png' });
  }
  
  await browser.close();
  console.log('Done.');
}

main().catch(console.error);
