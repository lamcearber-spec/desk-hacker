"""
Magic Link Authentication - Autonomous login via email links
Uses AgentMail to receive login links
"""
import asyncio
import re
import os
import json
import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from .stealth import StealthBrowser
from .cookies import save_cookies

AGENTMAIL_API_KEY = os.environ.get("AGENTMAIL_API_KEY")
AGENTMAIL_API = "https://api.agentmail.to/v0"

# Default email for magic links
DEFAULT_AUTH_EMAIL = "madmax@agentmail.to"

class MagicLinkAuth:
    """Autonomous authentication via magic links"""
    
    def __init__(self, browser: StealthBrowser, email: str = DEFAULT_AUTH_EMAIL):
        self.browser = browser
        self.email = email
    
    async def get_recent_emails(self, minutes: int = 5) -> List[Dict]:
        """Get recent emails from AgentMail"""
        if not AGENTMAIL_API_KEY:
            raise ValueError("AGENTMAIL_API_KEY not set")
        
        headers = {"Authorization": f"Bearer {AGENTMAIL_API_KEY}"}
        
        # Get inbox name from email
        inbox = self.email.split("@")[0]
        
        resp = requests.get(
            f"{AGENTMAIL_API}/inboxes/{inbox}/threads",
            headers=headers,
            params={"limit": 10}
        )
        resp.raise_for_status()
        
        threads = resp.json().get("threads", [])
        recent = []
        cutoff = datetime.utcnow() - timedelta(minutes=minutes)
        
        for thread in threads:
            # Get thread messages
            thread_id = thread.get("id")
            msg_resp = requests.get(
                f"{AGENTMAIL_API}/inboxes/{inbox}/threads/{thread_id}/messages",
                headers=headers
            )
            if msg_resp.ok:
                messages = msg_resp.json().get("messages", [])
                for msg in messages:
                    recent.append(msg)
        
        return recent
    
    def extract_magic_link(self, email_body: str, domain: str) -> Optional[str]:
        """Extract magic link from email body"""
        # Common patterns for magic/login links
        patterns = [
            rf'https?://[^\s<>"]*{re.escape(domain)}[^\s<>"]*(?:login|auth|verify|confirm|magic)[^\s<>"]*',
            r'https?://[^\s<>"]*(?:login|auth|verify|confirm|magic|token=)[^\s<>"]*',
            rf'href=["\']?(https?://[^\s<>"\']*{re.escape(domain)}[^\s<>"\']*)["\']?',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, email_body, re.IGNORECASE)
            if matches:
                link = matches[0]
                # Clean up the link
                link = link.rstrip(".,;:\"')")
                print(f"[MagicLink] Found link: {link}")
                return link
        
        return None
    
    async def wait_for_magic_link(self, domain: str, timeout: int = 120) -> Optional[str]:
        """Wait for magic link email to arrive"""
        print(f"[MagicLink] Waiting for email from {domain} (timeout: {timeout}s)")
        
        start = datetime.utcnow()
        checked_ids = set()
        
        while (datetime.utcnow() - start).seconds < timeout:
            emails = await asyncio.to_thread(self.get_recent_emails, minutes=3)
            
            for email in emails:
                email_id = email.get("id")
                if email_id in checked_ids:
                    continue
                checked_ids.add(email_id)
                
                subject = email.get("subject", "").lower()
                body = email.get("text", "") or email.get("html", "")
                
                # Check if this looks like a login email
                if any(kw in subject for kw in ["login", "sign in", "verify", "confirm", "magic", "link"]):
                    link = self.extract_magic_link(body, domain)
                    if link:
                        return link
                
                # Also check body even if subject doesn't match
                link = self.extract_magic_link(body, domain)
                if link and domain in link:
                    return link
            
            await asyncio.sleep(5)
        
        print("[MagicLink] Timeout waiting for email")
        return None
    
    async def authenticate(self, login_url: str, domain: str, 
                          email_input_selector: str = 'input[type="email"]',
                          submit_selector: str = None) -> bool:
        """
        Full magic link authentication flow:
        1. Navigate to login page
        2. Enter email
        3. Submit
        4. Wait for magic link email
        5. Click the link
        6. Save cookies
        """
        print(f"[MagicLink] Starting auth flow for {domain}")
        
        # Navigate to login page
        await self.browser.goto(login_url)
        await asyncio.sleep(2)
        
        # Screenshot for debugging
        await self.browser.screenshot(f"/tmp/auth-{domain}-1-login.png")
        
        # Enter email
        success = await self.browser.type_text(email_input_selector, self.email)
        if not success:
            print(f"[MagicLink] Failed to find email input: {email_input_selector}")
            return False
        
        await asyncio.sleep(1)
        await self.browser.screenshot(f"/tmp/auth-{domain}-2-email.png")
        
        # Submit
        if submit_selector:
            await self.browser.click(submit_selector)
        else:
            # Try common submit buttons
            for selector in ['button[type="submit"]', 'button:contains("Continue")', 
                           'button:contains("Send")', 'input[type="submit"]']:
                if await self.browser.click(selector):
                    break
            else:
                # Press Enter as fallback
                await self.browser.evaluate("document.querySelector('input[type=\"email\"]')?.form?.submit()")
        
        await asyncio.sleep(3)
        await self.browser.screenshot(f"/tmp/auth-{domain}-3-submitted.png")
        
        # Wait for magic link email
        link = await self.wait_for_magic_link(domain)
        if not link:
            print("[MagicLink] No magic link received")
            return False
        
        # Open the magic link
        print(f"[MagicLink] Opening link: {link}")
        await self.browser.goto(link)
        await asyncio.sleep(5)
        
        await self.browser.screenshot(f"/tmp/auth-{domain}-4-authenticated.png")
        
        # Save cookies
        await self.browser.save_current_cookies(domain)
        
        print(f"[MagicLink] Authentication complete for {domain}")
        return True


# Site-specific auth configurations
AUTH_CONFIGS = {
    "reddit.com": {
        "login_url": "https://www.reddit.com/login",
        "email_input": 'input[name="username"], input[type="email"]',
        "magic_link_button": "Email me a one-time link",
    },
    "galxe.com": {
        "login_url": "https://app.galxe.com/",
        "email_input": 'input[type="email"]',
        # Galxe uses wallet connect primarily, magic link secondary
    },
}


async def auto_auth(domain: str, email: str = DEFAULT_AUTH_EMAIL) -> bool:
    """Auto-authenticate to a known site"""
    config = AUTH_CONFIGS.get(domain)
    if not config:
        print(f"[AutoAuth] No config for {domain}")
        return False
    
    browser = StealthBrowser(profile=domain.replace(".", "_"))
    await browser.start(headless=True)
    
    auth = MagicLinkAuth(browser, email)
    
    try:
        success = await auth.authenticate(
            login_url=config["login_url"],
            domain=domain,
            email_input_selector=config.get("email_input", 'input[type="email"]'),
        )
        return success
    finally:
        await browser.close()


if __name__ == "__main__":
    import sys
    domain = sys.argv[1] if len(sys.argv) > 1 else "reddit.com"
    asyncio.run(auto_auth(domain))
