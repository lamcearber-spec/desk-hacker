#!/usr/bin/env python3
"""
Cold email sender for Research Services
Uses AgentMail API to send personalized emails
"""

import requests
import csv
import os
from datetime import datetime

AGENTMAIL_API_KEY = os.environ.get("AGENTMAIL_API_KEY", "am_8ed640daf2a88f89877126211f20cdd531468ca4fa784fde1a11ad25fb87fc72")
AGENTMAIL_BASE_URL = "https://api.agentmail.to/v1"
FROM_EMAIL = "zec-scout@agentmail.to"

def send_email(to_email, subject, body):
    """Send email via AgentMail API"""
    headers = {
        "Authorization": f"Bearer {AGENTMAIL_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Try AgentMail API
    try:
        response = requests.post(
            f"{AGENTMAIL_BASE_URL}/messages",
            headers=headers,
            json={
                "from": FROM_EMAIL,
                "to": to_email,
                "subject": subject,
                "text": body
            },
            timeout=30
        )
        if response.status_code == 200:
            return True, response.json()
        else:
            return False, f"Error: {response.status_code} - {response.text}"
    except Exception as e:
        return False, str(e)

def get_first_name(company_name):
    """Extract likely contact name from company context"""
    # If we had actual names, we'd use them. For now, use generic.
    return "there"

def personalize_template(template, company_name, industry):
    """Replace template variables with actual values"""
    first_name = get_first_name(company_name)
    return template.replace("{{first_name}}", first_name) \
                   .replace("{{company}}", company_name) \
                   .replace("{{industry}}", industry)

def main():
    # Email templates
    template_a = """Hi {{first_name}},

I noticed {{company}} operates in the {{industry}} space. Quick question: When was the last time you did a deep dive on your top 5 competitors?

Most founders I talk to have a vague idea but haven't looked at pricing, features, and positioning side-by-side in months.

I run a research service that delivers a 10-page competitor analysis report (pricing matrix, feature gaps, marketing channels) for $50 with a 48-hour turnaround.

Here's a sample report I did for a similar SaaS: [Available on request]

Worth a look? I can have it to you by tomorrow.

Best,
Max
Research Services
zec-scout@agentmail.to"""

    template_b = """Hi {{first_name}},

Quick value prop: I pull together market research briefs covering industry size, top 15 players, customer pain points, and market entry opportunities.

5-8 pages. $30. 24-hour delivery.

Useful for pitch decks, strategic planning, or new verticals.

Want one for {{industry}}?

Best,
Max"""

    # Read prospects
    prospects = []
    with open('/root/clawd/agents/clawtasks/outreach-list.csv', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            prospects.append(row)
    
    # Filter high priority first
    high_priority = [p for p in prospects if p['priority'] == 'High']
    medium_priority = [p for p in prospects if p['priority'] == 'Medium']
    
    # Sort to get best 10 (prioritize high, then medium)
    selected = (high_priority + medium_priority)[:10]
    
    # Results tracking
    results = []
    
    print(f"Sending {len(selected)} cold emails...\n")
    
    for i, prospect in enumerate(selected):
        company = prospect['company_name']
        industry = prospect['industry']
        notes = prospect.get('notes', '')
        
        # Determine email (we don't have direct emails, but we can guess common patterns)
        website = prospect['website']
        domain = website.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
        
        # Skip if no valid domain
        if not domain or '.' not in domain:
            print(f"{i+1}. SKIP {company} - invalid domain")
            results.append({
                'timestamp': datetime.utcnow().isoformat(),
                'company': company,
                'email': 'N/A',
                'template': 'N/A',
                'status': 'SKIPPED - invalid domain'
            })
            continue
        
        # Try common patterns (info@ is safest for cold outreach)
        to_email = f"info@{domain}"
        
        # Use Template A for first 6, Template B for next 4
        if i < 6:
            subject = f"Quick question about {company}'s competitive position"
            body = personalize_template(template_a, company, industry)
            template_used = "A"
        else:
            subject = f"{industry} market snapshot - $30"
            body = personalize_template(template_b, company, industry)
            template_used = "B"
        
        print(f"{i+1}. Sending to {company} ({to_email})...")
        
        # Send email
        success, result = send_email(to_email, subject, body)
        
        status = "SENT" if success else f"FAILED: {result}"
        print(f"   -> {status}")
        
        results.append({
            'timestamp': datetime.utcnow().isoformat(),
            'company': company,
            'email': to_email,
            'template': template_used,
            'status': status
        })
    
    # Save results
    with open('/root/clawd/agents/clawtasks/sent-emails.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['timestamp', 'company', 'email', 'template', 'status'])
        writer.writeheader()
        writer.writerows(results)
    
    # Summary
    sent = sum(1 for r in results if r['status'] == 'SENT')
    failed = len(results) - sent
    print(f"\n{'='*50}")
    print(f"Summary: {sent} sent, {failed} failed/skipped")
    print(f"Log saved to sent-emails.csv")

if __name__ == "__main__":
    main()
