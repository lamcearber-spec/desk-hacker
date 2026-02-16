/**
 * Stealth Browser Launcher
 * 
 * Enhanced Puppeteer setup with all stealth evasions
 * to bypass Cloudflare, Reddit, and other bot detection.
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Configure stealth with all evasions
const stealth = StealthPlugin();
stealth.enabledEvasions.add('chrome.app');
stealth.enabledEvasions.add('chrome.csi');
stealth.enabledEvasions.add('chrome.loadTimes');
stealth.enabledEvasions.add('chrome.runtime');
stealth.enabledEvasions.add('iframe.contentWindow');
stealth.enabledEvasions.add('media.codecs');
stealth.enabledEvasions.add('navigator.hardwareConcurrency');
stealth.enabledEvasions.add('navigator.languages');
stealth.enabledEvasions.add('navigator.permissions');
stealth.enabledEvasions.add('navigator.plugins');
stealth.enabledEvasions.add('navigator.vendor');
stealth.enabledEvasions.add('navigator.webdriver');
stealth.enabledEvasions.add('sourceurl');
stealth.enabledEvasions.add('user-agent-override');
stealth.enabledEvasions.add('webgl.vendor');
stealth.enabledEvasions.add('window.outerdimensions');

puppeteer.use(stealth);

const CHROME_PATH = '/root/.cache/puppeteer/chrome/linux-144.0.7559.96/chrome-linux64/chrome';
const USER_DATA_DIR = '/root/.clawdbot/browser/clawd/user-data';

/**
 * Chrome flags for stealth mode
 */
const STEALTH_ARGS = [
  // Basic sandbox flags for Linux
  '--no-sandbox',
  '--disable-setuid-sandbox',
  
  // Disable automation detection
  '--disable-blink-features=AutomationControlled',
  
  // Realistic window size
  '--window-size=1920,1080',
  
  // Disable infobars
  '--disable-infobars',
  
  // Disable extension install warnings
  '--disable-extensions-except=',
  
  // Performance flags that look like real browser
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding',
  
  // GPU and rendering (set these properly for fingerprint)
  '--disable-gpu-sandbox',
  '--enable-webgl',
  '--ignore-gpu-blocklist',
  
  // Network flags
  '--disable-features=NetworkService',
  '--disable-features=IsolateOrigins,site-per-process',
  
  // Remove test flags from headless
  '--disable-component-update',
  
  // Realistic screen metrics
  '--force-device-scale-factor=1',
  
  // Hide that we're running without a display
  '--disable-dev-shm-usage',
];

/**
 * Additional flags for headless mode
 */
const HEADLESS_ARGS = [
  '--headless=new',  // Use new headless mode (Chrome 109+)
];

/**
 * User agent for Windows Chrome (most common)
 */
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Platform spoofing script (injected before page load)
 */
const PLATFORM_SPOOF_SCRIPT = () => {
  // Spoof navigator.platform
  Object.defineProperty(navigator, 'platform', {
    get: () => 'Win32',
    configurable: true
  });

  // Spoof navigator.userAgentData (newer Chrome feature)
  if (navigator.userAgentData) {
    Object.defineProperty(navigator, 'userAgentData', {
      get: () => ({
        brands: [
          { brand: 'Not_A Brand', version: '8' },
          { brand: 'Chromium', version: '120' },
          { brand: 'Google Chrome', version: '120' }
        ],
        mobile: false,
        platform: 'Windows'
      }),
      configurable: true
    });
  }

  // Spoof screen properties
  Object.defineProperty(screen, 'availWidth', { get: () => 1920, configurable: true });
  Object.defineProperty(screen, 'availHeight', { get: () => 1040, configurable: true });
  Object.defineProperty(screen, 'width', { get: () => 1920, configurable: true });
  Object.defineProperty(screen, 'height', { get: () => 1080, configurable: true });
  Object.defineProperty(screen, 'colorDepth', { get: () => 24, configurable: true });
  Object.defineProperty(screen, 'pixelDepth', { get: () => 24, configurable: true });

  // Spoof timezone
  const originalDateTimeFormat = Intl.DateTimeFormat;
  Intl.DateTimeFormat = function(...args) {
    const format = new originalDateTimeFormat(...args);
    const originalResolvedOptions = format.resolvedOptions.bind(format);
    format.resolvedOptions = function() {
      const options = originalResolvedOptions();
      options.timeZone = 'Europe/Berlin';  // Match typical German user
      return options;
    };
    return format;
  };
  Object.setPrototypeOf(Intl.DateTimeFormat, originalDateTimeFormat);

  // Add Chrome runtime (some sites check for this)
  if (!window.chrome) {
    window.chrome = {};
  }
  if (!window.chrome.runtime) {
    window.chrome.runtime = {
      connect: () => {},
      sendMessage: () => {},
      onMessage: { addListener: () => {} }
    };
  }

  // Fix permissions API
  const originalQuery = navigator.permissions.query;
  navigator.permissions.query = (parameters) => (
    parameters.name === 'notifications' ?
      Promise.resolve({ state: Notification.permission }) :
      originalQuery(parameters)
  );

  // Canvas fingerprint noise
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(type, quality) {
    if (this.width > 16 && this.height > 16) {
      const ctx = this.getContext('2d');
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, Math.min(10, this.width), Math.min(10, this.height));
        for (let i = 0; i < imageData.data.length; i += 4) {
          // Add minimal noise
          imageData.data[i] = imageData.data[i] ^ (Math.random() > 0.99 ? 1 : 0);
        }
        ctx.putImageData(imageData, 0, 0);
      }
    }
    return originalToDataURL.call(this, type, quality);
  };

  // WebGL fingerprint masking
  const getParameterProxyHandler = {
    apply: function(target, thisArg, args) {
      const param = args[0];
      const result = Reflect.apply(target, thisArg, args);
      
      // Mask renderer/vendor strings
      if (param === 37445) return 'Intel Inc.';  // UNMASKED_VENDOR_WEBGL
      if (param === 37446) return 'Intel Iris OpenGL Engine';  // UNMASKED_RENDERER_WEBGL
      
      return result;
    }
  };

  const getContextProxyHandler = {
    apply: function(target, thisArg, args) {
      const context = Reflect.apply(target, thisArg, args);
      if (context && (args[0] === 'webgl' || args[0] === 'webgl2' || args[0] === 'experimental-webgl')) {
        context.getParameter = new Proxy(context.getParameter.bind(context), getParameterProxyHandler);
      }
      return context;
    }
  };

  HTMLCanvasElement.prototype.getContext = new Proxy(HTMLCanvasElement.prototype.getContext, getContextProxyHandler);

  // Remove webdriver property properly
  Object.defineProperty(navigator, 'webdriver', {
    get: () => undefined,
    configurable: true
  });

  // Mock plugins array
  Object.defineProperty(navigator, 'plugins', {
    get: () => {
      const plugins = [
        { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
        { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
        { name: 'Native Client', filename: 'internal-nacl-plugin' }
      ];
      plugins.item = (i) => plugins[i] || null;
      plugins.namedItem = (name) => plugins.find(p => p.name === name) || null;
      plugins.refresh = () => {};
      return plugins;
    },
    configurable: true
  });

  // Fix languages
  Object.defineProperty(navigator, 'languages', {
    get: () => ['en-US', 'en', 'de'],
    configurable: true
  });

  // Connection API
  Object.defineProperty(navigator, 'connection', {
    get: () => ({
      effectiveType: '4g',
      rtt: 50,
      downlink: 10,
      saveData: false
    }),
    configurable: true
  });
};

/**
 * Launch a stealth browser instance
 * 
 * @param {Object} options
 * @param {boolean} options.headless - Run headless (default: true for new headless)
 * @param {string} options.userDataDir - User data directory (enables persistence)
 * @param {string[]} options.extraArgs - Additional Chrome args
 * @param {number} options.width - Viewport width (default: 1920)
 * @param {number} options.height - Viewport height (default: 1080)
 * @returns {Promise<Browser>}
 */
async function launchStealthBrowser(options = {}) {
  const {
    headless = true,
    userDataDir = USER_DATA_DIR,
    extraArgs = [],
    width = 1920,
    height = 1080
  } = options;

  const args = [
    ...STEALTH_ARGS,
    ...(headless ? HEADLESS_ARGS : []),
    ...extraArgs
  ];

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: headless ? 'new' : false,
    args,
    userDataDir,
    defaultViewport: { width, height },
    ignoreDefaultArgs: ['--enable-automation', '--enable-blink-features=IdleDetection'],
  });

  return browser;
}

/**
 * Create a stealth page with all protections enabled
 * 
 * @param {Browser} browser 
 * @param {string} userAgent - Custom user agent (optional)
 * @returns {Promise<Page>}
 */
async function createStealthPage(browser, userAgent = USER_AGENT) {
  const page = await browser.newPage();
  
  // Set user agent
  await page.setUserAgent(userAgent);
  
  // Inject platform spoofing before any page load
  await page.evaluateOnNewDocument(PLATFORM_SPOOF_SCRIPT);
  
  // Set extra HTTP headers
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9,de;q=0.8',
    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
  });

  // Mask CDP detection
  await page.evaluateOnNewDocument(() => {
    // Some sites check for CDP by looking at Error stack traces
    const originalError = Error;
    Error = function(...args) {
      const error = new originalError(...args);
      const stack = error.stack;
      if (stack && stack.includes('pptr:') || stack.includes('puppeteer')) {
        error.stack = stack.replace(/pptr:[^\n]+\n/g, '').replace(/puppeteer[^\n]+\n/g, '');
      }
      return error;
    };
    Error.prototype = originalError.prototype;
    Error.captureStackTrace = originalError.captureStackTrace;
  });

  return page;
}

/**
 * Quick test to verify stealth is working
 * @param {Page} page 
 */
async function testStealth(page) {
  const results = await page.evaluate(() => {
    return {
      webdriver: navigator.webdriver,
      platform: navigator.platform,
      plugins: navigator.plugins.length,
      languages: navigator.languages,
      userAgent: navigator.userAgent,
      hasChrome: !!window.chrome,
      hasChromeRuntime: !!(window.chrome && window.chrome.runtime),
      permissions: typeof navigator.permissions?.query === 'function',
    };
  });
  
  return results;
}

module.exports = {
  launchStealthBrowser,
  createStealthPage,
  testStealth,
  CHROME_PATH,
  USER_DATA_DIR,
  USER_AGENT,
  STEALTH_ARGS,
  PLATFORM_SPOOF_SCRIPT
};
