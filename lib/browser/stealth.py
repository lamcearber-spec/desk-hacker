"""
Stealth Browser - nodriver-based undetected browsing
"""
import asyncio
import nodriver as uc
from pathlib import Path
from typing import Optional, List, Dict
from .cookies import save_cookies, load_cookies

USER_DATA_BASE = Path.home() / ".clawdbot" / "browser" / "profiles"

# Standard Windows Chrome UA
CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

# CAPTCHA detection patterns
CAPTCHA_PATTERNS = [
    "prove your humanity",
    "i'm not a robot",
    "recaptcha",
    "hcaptcha",
    "captcha",
    "verify you are human",
    "security check",
    "cloudflare",
    "checking your browser",
    "please wait while we verify",
]


class StealthBrowser:
    """Undetected Chrome browser with cookie management"""
    
    def __init__(self, profile: str = "default"):
        self.profile = profile
        self.user_data_dir = USER_DATA_BASE / profile
        self.browser = None
        self.page = None
    
    async def start(self, headless: bool = True) -> "StealthBrowser":
        """Start the browser"""
        # Note: user_data_dir disabled due to nodriver bug with sandbox=False
        # Using manual cookie persistence instead
        
        self.browser = await uc.start(
            headless=headless,
            sandbox=False,  # Required for root
            browser_args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                f"--user-agent={CHROME_UA}",
            ]
        )
        
        self.page = await self.browser.get("about:blank")
        print(f"[StealthBrowser] Started (profile: {self.profile}, headless: {headless})")
        return self
    
    async def goto(self, url: str, load_cookies_for: str = None) -> dict:
        """
        Navigate to URL
        Returns: {"ok": bool, "captcha": bool, "title": str}
        """
        from urllib.parse import urlparse
        
        domain = load_cookies_for or urlparse(url).netloc
        
        # Load cookies for this domain
        cookies = load_cookies(domain)
        if cookies:
            for cookie in cookies:
                try:
                    await self.browser.cookies.set(**cookie)
                except:
                    pass
        
        await self.page.get(url)
        await asyncio.sleep(2)  # Let page settle
        
        # Check for CAPTCHA
        content = await self.get_html()
        title = await self.get_title()
        content_lower = content.lower()
        
        captcha_detected = any(pattern in content_lower for pattern in CAPTCHA_PATTERNS)
        
        result = {
            "ok": not captcha_detected,
            "captcha": captcha_detected,
            "title": title,
            "url": await self.page.evaluate("window.location.href"),
        }
        
        if captcha_detected:
            print(f"[StealthBrowser] ⚠️ CAPTCHA detected on {url}")
        else:
            print(f"[StealthBrowser] ✓ Navigated to {url}")
        
        return result
    
    async def save_current_cookies(self, site: str) -> int:
        """Save current browser cookies, returns count"""
        cookies = await self.browser.cookies.get_all()
        cookie_list = []
        for c in cookies:
            cookie_list.append({
                "name": c.name,
                "value": c.value,
                "domain": c.domain,
                "path": c.path,
                "secure": c.secure,
                "httpOnly": c.http_only,
            })
        save_cookies(site, cookie_list)
        return len(cookie_list)
    
    async def screenshot(self, path: str = None) -> str:
        """Take screenshot"""
        if not path:
            path = f"/tmp/screenshot-{self.profile}.png"
        await self.page.save_screenshot(path)
        print(f"[StealthBrowser] Screenshot: {path}")
        return path
    
    async def get_html(self) -> str:
        """Get page HTML"""
        return await self.page.get_content()
    
    async def get_title(self) -> str:
        """Get page title"""
        return await self.page.evaluate("document.title")
    
    async def evaluate(self, js: str):
        """Execute JavaScript"""
        return await self.page.evaluate(js)
    
    async def find_and_click(self, text: str) -> bool:
        """Find element by text and click it"""
        try:
            elements = await self.page.find_all(text)
            if elements:
                await elements[0].click()
                return True
        except Exception as e:
            print(f"[StealthBrowser] Click '{text}' failed: {e}")
        return False
    
    async def find_and_type(self, selector: str, text: str) -> bool:
        """Find input and type text"""
        try:
            element = await self.page.select(selector)
            if element:
                await element.send_keys(text)
                return True
        except Exception as e:
            print(f"[StealthBrowser] Type into '{selector}' failed: {e}")
        return False
    
    async def wait(self, seconds: float):
        """Wait for specified seconds"""
        await asyncio.sleep(seconds)
    
    def stop(self):
        """Stop the browser"""
        if self.browser:
            self.browser.stop()
            print("[StealthBrowser] Stopped")


async def browse(url: str, profile: str = "default", headless: bool = True, 
                screenshot: str = None) -> dict:
    """
    Quick browse helper - opens URL, checks for CAPTCHA, returns result
    
    Returns:
        {"ok": bool, "captcha": bool, "title": str, "screenshot": str}
    """
    browser = StealthBrowser(profile)
    await browser.start(headless=headless)
    
    result = await browser.goto(url)
    
    if screenshot:
        result["screenshot"] = await browser.screenshot(screenshot)
    
    browser.stop()
    return result


# CLI entry point
if __name__ == "__main__":
    import sys
    import json
    
    async def main():
        url = sys.argv[1] if len(sys.argv) > 1 else "https://bot.sannysoft.com/"
        profile = sys.argv[2] if len(sys.argv) > 2 else "default"
        screenshot = sys.argv[3] if len(sys.argv) > 3 else f"/tmp/browse-{profile}.png"
        
        result = await browse(url, profile=profile, screenshot=screenshot)
        print(json.dumps(result, indent=2))

    asyncio.run(main())
