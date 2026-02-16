#!/bin/bash
API_KEY=$(cat ~/.config/hunter/api_key)
INPUT="leads-complete-100.csv"
OUTPUT="leads-enriched.csv"

# Header for output
echo "company_name,website,contact_name,contact_email,position,confidence" > $OUTPUT

# Process first 50 leads (skip header)
tail -n +2 $INPUT | head -50 | while IFS=, read -r company website email source; do
    # Extract domain from website
    domain=$(echo "$website" | sed 's/www\.//' | sed 's/https\?:\/\///')
    
    echo "Enriching: $company ($domain)..."
    
    # Call Hunter API
    result=$(curl -s "https://api.hunter.io/v2/domain-search?domain=$domain&api_key=$API_KEY&limit=1")
    
    # Extract best email
    contact_email=$(echo "$result" | jq -r '.data.emails[0].value // empty')
    contact_name=$(echo "$result" | jq -r '(.data.emails[0].first_name // "") + " " + (.data.emails[0].last_name // "")' | xargs)
    position=$(echo "$result" | jq -r '.data.emails[0].position // empty')
    confidence=$(echo "$result" | jq -r '.data.emails[0].confidence // empty')
    
    if [ -n "$contact_email" ]; then
        echo "$company,$website,$contact_name,$contact_email,$position,$confidence" >> $OUTPUT
        echo "  ✓ Found: $contact_name <$contact_email>"
    else
        echo "$company,$website,,,," >> $OUTPUT
        echo "  ✗ No emails found"
    fi
    
    # Rate limit (be nice to API)
    sleep 1
done

echo ""
echo "Done! Results in $OUTPUT"
wc -l $OUTPUT
