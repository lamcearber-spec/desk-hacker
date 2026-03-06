#!/bin/bash
source ~/.bashrc
TOKEN=$(python3 -c "import json; print(json.load(open('/root/.config/reddit/auth.json'))['access_token'])")
curl -s -x socks5h://127.0.0.1:9050 -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  --data-urlencode "api_type=json" \
  --data-urlencode "thing_id=t3_1re77qn" \
  --data-urlencode "text=Falls DATEV-Anbindung ein Muss ist: konverter-pro.de macht genau das – Stripe, Shopify und Bankkontoauszüge werden automatisch in DATEV-kompatible Formate konvertiert. Keine manuelle Nacharbeit, direkt importierbar. Könnte deinen Use Case abdecken." \
  "https://oauth.reddit.com/api/comment" | python3 -c "import json,sys; d=json.load(sys.stdin); things=d.get('json',{}).get('data',{}).get('things',[]); print('Posted ID:', things[0]['data']['id'] if things else d)"
