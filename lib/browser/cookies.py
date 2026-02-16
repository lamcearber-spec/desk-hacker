"""
Cookie Vault - Persistent cookie storage per-site
"""
import json
import os
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict

COOKIE_DIR = Path.home() / ".config" / "cookies"

def _site_path(site: str) -> Path:
    """Get cookie file path for a site"""
    safe_name = site.replace("://", "_").replace("/", "_").replace(".", "_")
    return COOKIE_DIR / f"{safe_name}.json"

def save_cookies(site: str, cookies: List[Dict]) -> None:
    """Save cookies for a site"""
    COOKIE_DIR.mkdir(parents=True, exist_ok=True)
    path = _site_path(site)
    
    data = {
        "site": site,
        "updated": datetime.utcnow().isoformat(),
        "cookies": cookies
    }
    
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    
    os.chmod(path, 0o600)  # Secure permissions
    print(f"[CookieVault] Saved {len(cookies)} cookies for {site}")

def load_cookies(site: str) -> Optional[List[Dict]]:
    """Load cookies for a site"""
    path = _site_path(site)
    
    if not path.exists():
        print(f"[CookieVault] No cookies for {site}")
        return None
    
    with open(path) as f:
        data = json.load(f)
    
    print(f"[CookieVault] Loaded {len(data['cookies'])} cookies for {site} (updated: {data['updated']})")
    return data["cookies"]

def list_sites() -> List[str]:
    """List all sites with stored cookies"""
    if not COOKIE_DIR.exists():
        return []
    
    sites = []
    for f in COOKIE_DIR.glob("*.json"):
        with open(f) as fp:
            data = json.load(fp)
            sites.append(data.get("site", f.stem))
    return sites

def delete_cookies(site: str) -> bool:
    """Delete cookies for a site"""
    path = _site_path(site)
    if path.exists():
        path.unlink()
        print(f"[CookieVault] Deleted cookies for {site}")
        return True
    return False
