# lex-bereit.de — Implementation Spec

## What We're Building
Bank statement → Lexware import format converter (mirrors DatevBereit)

---

## Lexware Format (Target Output)

```csv
"Betrag";"Soll-Konto";"Haben-Konto";"Belegdatum";"Buchungstext";"Belegnummer"
"1200,00";"8400";"1800";"15.05.2023";"Warenverkauf";"RE-2023-123"
```

| Property | Value |
|----------|-------|
| Separator | Semicolon `;` |
| Decimal | Comma `,` |
| Date | DD.MM.YYYY |
| Encoding | ANSI (Windows-1252) |
| Amounts | Always positive |

**Only 6 core fields** (vs DATEV's 125!)

---

## Market Opportunity

Lexware's built-in DATEV import **only works with DATEV v7.0** (ancient).
→ Users with modern bank exports are stuck
→ lex-bereit solves this

---

## Architecture Decision ✅ DECIDED

**DECISION: Option A — Same codebase, different deployments**

- One repo (DatevBereit-Claude)
- Two deployments on Hetzner:
  - datevbereit.de → DATEV output only
  - lex-bereit.de → Lexware output only
- Separate branding, landing pages, SEO
- Shared: upload flow, extraction logic, backend
- Config flag determines output format per deployment

---

## Implementation Plan

### New Files to Create
```
apps/api/celery_app/lexware/
├── __init__.py
├── constants.py      # 6-field spec
├── converter.py      # Transaction → Lexware row
├── generator.py      # Build CSV file
├── export_service.py # Orchestration
└── options.py        # Config model
```

### Files to Modify
- `apps/api/app/api/v1/endpoints/` → Add `lexware.py`
- Frontend → Add export format selector

### Converter Logic (core)
```python
def convert_transaction(tx) -> LexwareRow:
    return {
        "Betrag": format_german_decimal(abs(tx.amount)),
        "Soll-Konto": tx.account if tx.amount > 0 else tx.contra_account,
        "Haben-Konto": tx.contra_account if tx.amount > 0 else tx.account,
        "Belegdatum": tx.date.strftime("%d.%m.%Y"),
        "Buchungstext": tx.description[:60],
        "Belegnummer": tx.reference or ""
    }
```

---

## Effort Estimate

| Task | Time |
|------|------|
| Lexware module (backend) | 4-6 hours |
| API endpoint | 1-2 hours |
| Frontend toggle | 2-3 hours |
| Testing | 2-3 hours |
| Landing page (lex-bereit.de) | 2-4 hours |
| **Total** | **~2 days** |

---

## Deployment Plan

1. Same Hetzner server as DatevBereit
2. Nginx routes:
   - datevbereit.de → main app
   - lex-bereit.de → same app, different landing
3. Shared database, shared users

---

## Next Steps

1. ✅ Domain registered (lex-bereit.de)
2. ⏳ Spawn implementation agent
3. ⏳ Test with real Lexware import
4. ⏳ Create landing page
5. ⏳ Deploy

---

*Ready to spawn implementation agent on your go.*
