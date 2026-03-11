#!/usr/bin/env python3
"""
Google Business Profile OAuth + Update Script

Usage:
  Step 1: python3 google-business-auth.py auth    → prints URL, paste code
  Step 2: python3 google-business-auth.py list     → list business locations
  Step 3: python3 google-business-auth.py update   → update name/website
"""
import sys, json, requests, os
from pathlib import Path

TOKEN_FILE = Path("/root/clawd/tools/google-ads/business-profile-token.json")
CLIENT_FILE = Path("/root/clawd/tools/google-ads/client_secret.json")

SCOPES = "https://www.googleapis.com/auth/business.manage"

def get_client():
    return json.load(open(CLIENT_FILE))["installed"]

def auth():
    """Generate OAuth URL and exchange code for token."""
    client = get_client()
    auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={client['client_id']}&"
        f"redirect_uri=http://localhost&"
        f"scope={SCOPES}&"
        f"response_type=code&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    print(f"\n🔗 Open this URL in your browser and authorize:\n")
    print(auth_url)
    print(f"\n📋 After authorizing, you'll be redirected to localhost with a code in the URL.")
    print(f"   Copy the 'code' parameter and paste it here.\n")
    
    code = input("Paste the code: ").strip()
    
    resp = requests.post("https://oauth2.googleapis.com/token", data={
        "client_id": client["client_id"],
        "client_secret": client["client_secret"],
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": "http://localhost"
    })
    
    if resp.ok:
        token_data = resp.json()
        TOKEN_FILE.write_text(json.dumps(token_data, indent=2))
        print(f"\n✅ Token saved to {TOKEN_FILE}")
    else:
        print(f"\n❌ Error: {resp.text}")

def get_access_token():
    """Get a valid access token, refreshing if needed."""
    if not TOKEN_FILE.exists():
        print("❌ No token file. Run 'auth' first.")
        sys.exit(1)
    
    token_data = json.loads(TOKEN_FILE.read_text())
    client = get_client()
    
    resp = requests.post("https://oauth2.googleapis.com/token", data={
        "client_id": client["client_id"],
        "client_secret": client["client_secret"],
        "refresh_token": token_data["refresh_token"],
        "grant_type": "refresh_token"
    })
    
    if resp.ok:
        return resp.json()["access_token"]
    else:
        print(f"❌ Token refresh failed: {resp.text}")
        sys.exit(1)

def list_locations():
    """List all business accounts and locations."""
    token = get_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # List accounts
    resp = requests.get(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        headers=headers
    )
    print(f"\n📋 Accounts ({resp.status_code}):")
    
    if not resp.ok:
        print(resp.text)
        return
    
    accounts = resp.json().get("accounts", [])
    for acc in accounts:
        name = acc.get("name", "")
        display = acc.get("accountName", "")
        print(f"  • {display} ({name})")
        
        # List locations for this account
        loc_resp = requests.get(
            f"https://mybusinessbusinessinformation.googleapis.com/v1/{name}/locations",
            headers=headers
        )
        if loc_resp.ok:
            locations = loc_resp.json().get("locations", [])
            for loc in locations:
                loc_name = loc.get("name", "")
                title = loc.get("title", "")
                website = loc.get("websiteUri", "")
                print(f"    📍 {title} — {website}")
                print(f"       ID: {loc_name}")
        else:
            print(f"    ⚠️ Locations: {loc_resp.status_code} {loc_resp.text[:200]}")

def update():
    """Update business name and website."""
    token = get_access_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # First list to find the location
    resp = requests.get(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        headers=headers
    )
    if not resp.ok:
        print(f"❌ {resp.text}")
        return
    
    accounts = resp.json().get("accounts", [])
    if not accounts:
        print("❌ No accounts found")
        return
    
    # Find locations
    for acc in accounts:
        acc_name = acc.get("name", "")
        loc_resp = requests.get(
            f"https://mybusinessbusinessinformation.googleapis.com/v1/{acc_name}/locations",
            headers=headers
        )
        if loc_resp.ok:
            locations = loc_resp.json().get("locations", [])
            for loc in locations:
                title = loc.get("title", "")
                loc_name = loc.get("name", "")
                
                if "datev" in title.lower() or "bereit" in title.lower():
                    print(f"🎯 Found: {title} ({loc_name})")
                    print(f"   Updating name to 'Konverter Pro' and website to 'https://konverter-pro.de'...")
                    
                    update_resp = requests.patch(
                        f"https://mybusinessbusinessinformation.googleapis.com/v1/{loc_name}?updateMask=title,websiteUri",
                        headers=headers,
                        json={
                            "title": "Konverter Pro",
                            "websiteUri": "https://konverter-pro.de"
                        }
                    )
                    
                    if update_resp.ok:
                        print(f"✅ Updated successfully!")
                        print(json.dumps(update_resp.json(), indent=2)[:500])
                    else:
                        print(f"❌ Update failed: {update_resp.status_code}")
                        print(update_resp.text[:500])
                    return
    
    print("❌ No DatevBereit location found")

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "help"
    if cmd == "auth":
        auth()
    elif cmd == "list":
        list_locations()
    elif cmd == "update":
        update()
    else:
        print(__doc__)
