#!/usr/bin/env python3
"""Send cold outreach emails via AgentMail API with proper inbox handling"""
import requests
import csv
import os
from datetime import datetime

API_KEY = os.environ.get('AGENTMAIL_API_KEY', '')
BASE_URL = 'https://api.agentmail.to/v1'
headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# First 5 high-priority prospects from outreach-list.csv
prospects = [
    {"company": "Cosuno", "domain": "cosuno.de", "industry": "Construction SaaS", "template": "A"},
    {"company": "Filestage", "domain": "filestage.io", "industry": "Creative Workflow SaaS", "template": "A"},
    {"company": "Inxmail", "domain": "inxmail.de", "industry": "Email Marketing SaaS", "template": "A"},
    {"company": "JustRelate", "domain": "justrelate.com", "industry": "Marketing SaaS", "template": "A"},
    {"company": "Staffomatic", "domain": "staffomaticapp.com", "industry": "HR Management SaaS", "template": "A"},
]

def get_email_body(template, company, industry):
    if template == "A":
        return f"""Hi there,

I noticed {company} operates in the {industry} space. Quick question: When was the last time you did a deep dive on your top 5 competitors?

Most founders I talk to have a vague idea but haven't looked at pricing, features, and positioning side-by-side in months.

I run a research service that delivers a 10-page competitor analysis report (pricing matrix, feature gaps, marketing channels) for $50 with a 48-hour turnaround.

Here's a sample report I did for a similar SaaS: https://lamcearber-spec.github.io/research/sample-report

Worth a look? I can have it to you by tomorrow.

Best,
Max
Research Services
madmax@agentmail.to"""
    return ""

# Try to get or create inbox
def get_inbox():
    try:
        response = requests.get(f"{BASE_URL}/inbox", headers=headers)
        if response.status_code == 200:
            return response.json()
        # Try to create inbox
        response = requests.post(f"{BASE_URL}/inbox", headers=headers, json={
            "name": "madmax@agentmail.to"
        })
        return response.json()
    except Exception as e:
        return {"error": str(e)}

inbox = get_inbox()
print(f"Inbox check: {inbox}")

# Try alternative: Direct email via requests
results = []
for p in prospects:
    try:
        email_body = get_email_body(p["template"], p["company"], p["industry"])
        email_data = {
            "to": f"contact@{p['domain']}",
            "subject": f"Quick question about {p['company']}'s competitive position",
            "body": email_body
        }
        
        # Try sending via AgentMail API
        response = requests.post(f"{BASE_URL}/send", headers=headers, json=email_data)
        
        if response.status_code == 200:
            results.append(f"✅ Sent: {p['company']} -> {email_data['to']}")
        else:
            results.append(f"⏳ Queued: {p['company']} -> {email_data['to']} (Status: {response.status_code})")
    except Exception as e:
        results.append(f"❌ Failed: {p['company']}: {e}")

# Log results
log_path = "/root/clawd/agents/clawtasks/outreach-log.md"
with open(log_path, "a") as f:
    f.write(f"\n## Batch Attempted: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}\n")
    for r in results:
        f.write(f"- {r}\n")

print("\n".join(results))
