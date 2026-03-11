# Google Business Profile Update Script
# Task: Update business name from "DatevBereit" to "Konverter Pro" + new logo

## Prerequisites
- Google account with GBP access (arberlamce@ or konverter-pro.de admin)
- New logo file for Konverter Pro

## Steps

### 1. Login
```
URL: https://business.google.com
Account: [Google account with GBP ownership]
Auth: Password + 2FA (phone prompt)
```

### 2. Navigate to Profile Editor
```
Dashboard → Edit profile (or "Edit" pencil icon)
→ Business name section
```

### 3. Change Business Name
```
Old: DatevBereit (or datev-bereit.de)
New: Konverter Pro
```
Note: Name changes may require Google review (24-48h).

### 4. Update Logo
```
Edit profile → Photos → Logo
Upload new Konverter Pro logo
Recommended: 720x720px, PNG or JPG
```

### 5. Update Website URL
```
Old: https://datev-bereit.de
New: https://konverter-pro.de
```

### 6. Verify Other Fields
- Description: Should reference Konverter Pro, not DatevBereit
- Category: Software company / Financial technology
- Address: Frankfurt am Main (Radom UG)
- Phone: If listed, verify correct
- Hours: If listed, verify correct

## Automation Notes
Google Business Profile does NOT have a public API for profile editing.
The only way to edit is through the web UI at business.google.com.
Google My Business API was deprecated in 2024, replaced by Business Profile API
which requires OAuth + approved project.

### Potential API Route (future)
1. Create Google Cloud project
2. Enable Business Profile API
3. OAuth2 with account that owns the listing
4. Use `accounts.locations.patch` endpoint
5. Docs: https://developers.google.com/my-business/reference/rest

## Status
- [ ] Login completed
- [ ] Business name updated to "Konverter Pro"
- [ ] Logo updated
- [ ] Website URL updated to konverter-pro.de
- [ ] Description updated
- [ ] Changes verified (may take 24-48h)
