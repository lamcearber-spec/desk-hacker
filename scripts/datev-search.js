const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome';
const fs = require('fs');

async function main() {
  const searchTerm = process.argv[2] || 'Kontoauszug';
  let cookies = {};
  try {
    cookies = JSON.parse(fs.readFileSync('/root/.config/datev/cookies.json'));
  } catch (e) {
    console.log('No cookies file, proceeding without login');
  }
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Build cookie array from available cookies
  const cookieList = [];
  const cookieNames = ['LiSESSIONID', 'LithiumUserSecure', 'LithiumVisitor', 'LithiumUserInfo', 'AWSALB', 'AWSALBCORS', 'VISITOR_BEACON'];
  for (const name of cookieNames) {
    if (cookies[name]) {
      cookieList.push({ name, value: cookies[name], domain: '.datev-community.de' });
    }
  }
  
  if (cookieList.length > 0) {
    await page.setCookie(...cookieList);
    console.log(`Loaded ${cookieList.length} cookies`);
  }

  // Search for topics - sort by recent
  const searchUrl = `https://www.datev-community.de/t5/forums/searchpage/tab/message?q=${encodeURIComponent(searchTerm)}&filter=labels&sort_by=-topicPostDate`;
  console.log(`Searching for: ${searchTerm}`);
  
  await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Get result count
  const resultCount = await page.evaluate(() => {
    const countEl = document.querySelector('.search-result-count, .result-count, [class*="count"]');
    const text = document.body.innerText;
    const match = text.match(/(\d+(?:\.\d+)?)\s*Ergebnis/);
    return match ? match[1] : '0';
  });
  
  console.log(`\n=== Search Results for "${searchTerm}" (${resultCount} total) ===\n`);
  
  // Get threads from search results - parse the visible text
  const threads = await page.evaluate(() => {
    const results = [];
    
    // Try to find search result items
    const searchItems = document.querySelectorAll('.lia-search-result-message, .search-result, [class*="search-result"]');
    
    if (searchItems.length > 0) {
      searchItems.forEach(item => {
        const link = item.querySelector('a[href*="/td-p/"], a[href*="/m-p/"]');
        if (link) {
          const title = link.innerText.trim();
          const url = link.href;
          
          // Find timestamp
          const timeEl = item.querySelector('.DateTime, .post-date, [class*="date"], [class*="time"]');
          const time = timeEl ? timeEl.innerText.trim() : '';
          
          // Find author
          const authorEl = item.querySelector('.lia-user-name, .author, [class*="author"]');
          const author = authorEl ? authorEl.innerText.trim() : '';
          
          // Find forum/category
          const forumEl = item.querySelector('.lia-message-board-name, [class*="board"]');
          const forum = forumEl ? forumEl.innerText.trim() : '';
          
          if (title.length > 5) {
            results.push({ title: title.substring(0, 100), url, time, author, forum });
          }
        }
      });
    }
    
    // Fallback: find all links that look like threads
    if (results.length === 0) {
      const allLinks = document.querySelectorAll('a');
      allLinks.forEach(a => {
        if (a.href && (a.href.includes('/td-p/') || a.href.includes('/m-p/')) && a.innerText.trim().length > 15) {
          const title = a.innerText.trim();
          if (!results.some(r => r.title === title)) {
            results.push({ title: title.substring(0, 100), url: a.href, time: '', author: '', forum: '' });
          }
        }
      });
    }
    
    return results.slice(0, 15);
  });
  
  if (threads.length === 0) {
    console.log('No threads found');
  } else {
    threads.forEach((t, i) => {
      console.log(`${i+1}. ${t.title}`);
      if (t.forum) console.log(`   Forum: ${t.forum}`);
      if (t.author) console.log(`   Author: ${t.author}`);
      if (t.time) console.log(`   Time: ${t.time}`);
      console.log(`   ${t.url}\n`);
    });
  }
  
  await page.screenshot({ path: '/tmp/datev-search.png', fullPage: true });
  console.log('Screenshot saved to /tmp/datev-search.png');

  // Output JSON for programmatic use
  console.log('\n--- JSON ---');
  console.log(JSON.stringify({ searchTerm, resultCount, threads }, null, 2));

  await browser.close();
}

main().catch(err => console.error('Error:', err.message));