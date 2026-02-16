const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs').promises; // Use fs.promises for async file operations
const path = require('path');

const CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome';
const COOKIES_PATH = path.join(process.env.HOME, '.config', 'datev', 'cookies.json');
const LOGIN_URL = 'https://www.datev-community.de/t5/user/userloginpage'; // Assuming this is the login page

async function loadCookies() {
  try {
    const data = await fs.readFile(COOKIES_PATH, 'utf8');
    const cookiesJson = JSON.parse(data);
    // Convert cookies from the custom format to Puppeteer's expected format
    const puppeteerCookies = Object.keys(cookiesJson)
      .filter(key => key !== 'username' && key !== 'setup_date') // Exclude non-cookie keys
      .map(key => ({
        name: key,
        value: cookiesJson[key],
        domain: '.datev-community.de',
        // You might need to add other properties like 'path', 'expires', 'secure', 'httpOnly'
        // For simplicity, we're assuming the domain is sufficient for now.
      }));
    console.log('Cookies loaded from file.');
    return puppeteerCookies;
  } catch (error) {
    console.error('Error loading cookies from file:', error.message);
    return [];
  }
}

async function saveCookies(page) {
    const clientCookies = await page.cookies();
    const formattedCookies = {};
    clientCookies.forEach(cookie => {
        formattedCookies[cookie.name] = cookie.value;
    });
    // Add known static details back
    formattedCookies.username = 'maddie';
    formattedCookies.setup_date = new Date().toISOString().split('T')[0];

    await fs.writeFile(COOKIES_PATH, JSON.stringify(formattedCookies, null, 2), 'utf8');
    console.log('Cookies saved to file.');
}


async function login(page) {
    console.log('Attempting login by filling form...');
    // Assume we are already on the login page
    // await page.goto(LOGIN_URL, { waitUntil: 'networkidle2', timeout: 45000 }); // REMOVED
    await page.screenshot({ path: '/tmp/datev-login-page-before-fill.png', fullPage: true });
    console.log('Login page screenshot before filling form saved to /tmp/datev-login-page-before-fill.png');
    // ... (rest of the login function remains the same for now, but selectors need to be updated after snapshot inspection)
    // await page.type('#username', 'maddie'); // Placeholder, replace with actual selector
    // await page.type('#password', 'Madmax2026!'); // Placeholder, replace with actual selector
    // await Promise.all([
    //     page.waitForNavigation({ waitUntil: 'networkidle2' }),
    //     page.click('button[type="submit"]') // Placeholder, replace with actual selector
    // ]);
    const loginLinkSelector = 'a[title="Anmelden"]'; // Selector for the login link
    const loginLink = await page.$(loginLinkSelector);

    if (loginLink) {
        console.log('Login link found, clicking it to go to the login page...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            loginLink.click()
        ]);
        await page.screenshot({ path: '/tmp/datev-login-page.png', fullPage: true });
        console.log('Login page screenshot saved to /tmp/datev-login-page.png');
        console.log('Taking snapshot of login page to identify selectors...');
        const htmlContent = await page.content();
        await fs.writeFile('/tmp/datev-login-snapshot.html', htmlContent, 'utf8');
        console.log('Login page snapshot saved to /tmp/datev-login-snapshot.html');
        return false; // Indicate login failed for now to trigger manual inspection
    } else {
        console.log('Login link not found. Assuming already on a login page or login is not required for this view.');
        console.log('Taking snapshot of current page to identify selectors...');
        await page.screenshot({ path: '/tmp/datev-current-page.png', fullPage: true });
        const htmlContent = await page.content();
        await fs.writeFile('/tmp/datev-current-page-snapshot.html', htmlContent, 'utf8');
        return false;
    }

    await page.type('#password', 'Madmax2026!');
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"]') // Assuming the login button is a submit button
    ]);

    const currentUrl = page.url();
    if (currentUrl.includes('datev-community.de/t5/user/profilepage')) { // Or some other indication of successful login
        console.log('Login successful.');
        await saveCookies(page); // Save new cookies after successful login
        return true;
    } else {
        // This part needs to be removed as we are now intentionally failing login to inspect
        // console.log('Login failed or redirected unexpectedly. Current URL:', currentUrl);
        console.log('Login process paused for selector identification.');
        return false;
    }
}

async function getReputation(page) {
    console.log('Attempting to get reputation...');
    await page.goto('https://www.datev-community.de/t5/user/profilepage', { waitUntil: 'networkidle2', timeout: 45000 });
    // This is a placeholder. You'll need to inspect the actual profile page
    // to find the selector for the reputation score.
    const reputationElement = await page.$('.lia-badge-rank'); // Example selector, needs verification
    if (reputationElement) {
        const reputationText = await page.evaluate(el => el.textContent, reputationElement);
        console.log('Reputation:', reputationText.trim());
        return reputationText.trim();
    } else {
        console.log('Reputation element not found.');
        return 'Unknown';
    }
}


async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  // Remove initial cookie loading
  // const cookies = await loadCookies();
  // if (cookies.length > 0) {
  //   await page.setCookie(...cookies);
  //   console.log('Loaded cookies set on page.');
  // }

  console.log('Navigating to DATEV Community...');
  await page.goto('https://www.datev-community.de/', { waitUntil: 'networkidle2', timeout: 45000 });
  
  // Wait for any redirects/challenges
  await new Promise(r => setTimeout(r, 5000));
  
  const title = await page.title();
  console.log('Page title:', title);
  
  await page.screenshot({ path: '/tmp/datev-initial.png', fullPage: true });
  console.log('Initial screenshot saved to /tmp/datev-initial.png');

  // Check if logged in (this is a simplified check, can be improved)
  const isLoggedIn = await page.$('a[title="Abmelden"]') !== null; // Check for logout link

  if (!isLoggedIn) {
      console.log('Not logged in, attempting to find login link...');
      const loginLinkSelector = 'a[title="Anmelden"]';
      const loginLink = await page.$(loginLinkSelector);

      if (loginLink) {
          console.log('Login link found, clicking it...');
          await Promise.all([
              page.waitForNavigation({ waitUntil: 'networkidle2' }),
              loginLink.click()
          ]);
          console.log('Now on the potential login page. Taking screenshot and HTML content...');
          await page.screenshot({ path: '/tmp/datev-login-form.png', fullPage: true });
          const htmlContent = await page.content();
          await fs.writeFile('/tmp/datev-login-form.html', htmlContent, 'utf8');
          console.log('Login form screenshot and HTML saved.');
          // At this point, we have the login form's HTML. We need to manually inspect it
          // and then re-run the script with the actual login logic.
          console.log(JSON.stringify({ status: 'needs_selectors', message: 'Login form HTML saved for inspection.' }));
          await browser.close();
          return;
      } else {
          console.log('Login link not found. Cannot proceed with login. Current page might be an error or unexpected.');
          await page.screenshot({ path: '/tmp/datev-error-no-login-link.png', fullPage: true });
          const htmlContent = await page.content();
          await fs.writeFile('/tmp/datev-error-no-login-link.html', htmlContent, 'utf8');
          console.log(JSON.stringify({ status: 'error', message: 'Login link not found. Check screenshots and HTML.' }));
          await browser.close();
          return;
      }
  } else {
      console.log('Already logged in based on initial check.');
  }

  // --- Command line argument parsing ---
  const action = process.argv[2]; // Get the action from command line arguments

  if (action === 'status') {
      const reputation = await getReputation(page);
      console.log(JSON.stringify({ status: 'success', reputation: reputation }));
  } else if (action === 'find-questions') {
      console.log('Searching for questions (not implemented yet)...');
      console.log(JSON.stringify({ status: 'success', message: 'find-questions not implemented yet' }));
  } else {
      console.log('No specific action provided or action not recognized. Defaulting to status check.');
      const reputation = await getReputation(page);
      console.log(JSON.stringify({ status: 'success', reputation: reputation }));
  }

  await browser.close();
}

main().catch(err => console.error('Error:', err.message));
