# Lexware Accounting Import Format Research

## Executive Summary

Lexware accounting software supports multiple import methods for bank transactions and bookings. The primary import methods are:

1. **DATEV Import** - Built-in interface for DATEV Kanzlei-Rechnungswesen (version 7.0 or older only)
2. **ASCII/CSV Import** - Flexible field-mapping import for custom CSV files
3. **Lexware Office API** - REST API for the cloud-based Lexware Office product

---

## 1. DATEV Import in Lexware Desktop Products

### Supported Versions
- **Lexware only supports DATEV format version 7.0 or older**
- The DATEV import interface was designed specifically for DATEV Kanzlei-Rechnungswesen
- Newer DATEV format versions (7.1+) are **NOT supported** by Lexware's built-in DATEV import

### Key Limitation
When attempting to import DATEV files with version > 7.0, Lexware displays an error message:
> "Eine DATEV Version 7.0 oder älter notwendig"

**Workaround:** If your source system cannot export DATEV 7.0, use the ASCII/CSV import instead with manual field mapping.

---

## 2. Lexware ASCII/CSV Import Format

### File Specifications

| Property | Value |
|----------|-------|
| **File Type** | CSV / ASCII text file |
| **Encoding** | ANSI (Windows-1252) or UTF-8 |
| **Field Separator** | Semicolon (`;`) recommended |
| **Decimal Separator** | Comma (`,`) for German format |
| **Text Delimiter** | Double quotes (`"`) |
| **Date Format** | DD.MM.YYYY or TTMM (day-month only) |

### Required Fields for Booking Import

For successful import into Lexware Buchhaltung, the following fields are essential:

| Field (German) | Field (English) | Format | Required |
|----------------|-----------------|--------|----------|
| Umsatz/Betrag | Amount | Decimal (e.g., 1234,56) | ✅ Yes |
| Soll-Konto | Debit Account | Account number | ✅ Yes |
| Haben-Konto | Credit Account | Account number | ✅ Yes |
| Belegdatum | Document Date | DD.MM.YYYY | ✅ Yes |
| Buchungstext | Posting Text | Text (max 60 chars) | ⚡ Recommended |
| Belegnummer | Document Number | Text | ⚡ Recommended |

### Important Notes on Account Handling

1. **Amounts are always POSITIVE** - The debit/credit direction is determined by which account column the number appears in
2. **Soll-Konto (Debit)** = Where the money goes TO
3. **Haben-Konto (Credit)** = Where the money comes FROM
4. **Both account fields must be populated** for each booking

### Example Lexware CSV Import File

```csv
"Betrag";"Soll-Konto";"Haben-Konto";"Belegdatum";"Buchungstext";"Belegnummer"
"1200,00";"8400";"1800";"15.05.2023";"Warenverkauf Rechnung 123";"RE-2023-123"
"250,50";"4400";"1200";"16.05.2023";"Büromaterial Einkauf";"EB-2023-456"
"89,90";"6815";"1200";"17.05.2023";"Porto Versandkosten";"KS-2023-789"
```

---

## 3. DATEV EXTF Format (Reference for Comparison)

The DATEV Export-Format (EXTF) is the standard format used by tax consultants and DATEV software. While Lexware doesn't fully support newer versions, understanding this format is useful for conversion.

### DATEV EXTF File Structure

A DATEV EXTF file consists of:
1. **Header Row 1** - Format metadata
2. **Header Row 2** - Column headers
3. **Data Rows** - Booking entries

### DATEV EXTF Header Fields (31 fields)

```
1.  Kennzeichen (EXTF)
2.  Versionsnummer (700)
3.  Formatkategorie (21 = Buchungsstapel)
4.  Formatname (Buchungsstapel)
5.  Formatversion (13)
6.  Erzeugt am (YYYYMMDDHHMMSSFFF)
7.  Importiert
8.  Herkunft
9.  Exportiert von
10. Importiert von
11. Beraternummer (1001-9999999)
12. Mandantennummer (1-99999)
13. WJ-Beginn (YYYYMMDD)
14. Sachkontenlänge (4-8)
15. Datum von (YYYYMMDD)
16. Datum bis (YYYYMMDD)
17. Bezeichnung (max 30 chars)
18. Diktatkürzel (max 2 chars)
19. Buchungstyp (1=FIBU, 2=Debitoren/Kreditoren)
20. Rechnungslegungszweck (0=unbestimmt, 50=HGB, etc.)
21. Festschreibung (0=nicht festgeschrieben, 1=festgeschrieben)
22. WKZ (EUR)
23-31. Reserved fields
```

### DATEV EXTF Booking Entry Fields (125 fields!)

Key fields for bookings:

| # | Field | German | Format |
|---|-------|--------|--------|
| 1 | Amount | Umsatz | Decimal with comma |
| 2 | Debit/Credit | Soll-/Haben-Kennzeichen | S or H |
| 3 | Currency | WKZ Umsatz | ISO code (EUR) |
| 7 | Account | Konto | Account number |
| 8 | Contra Account | Gegenkonto | Account number |
| 9 | BU-Key | BU-Schlüssel | Tax key code |
| 10 | Document Date | Belegdatum | DDMM |
| 11 | Document Field 1 | Belegfeld 1 | Document number |
| 14 | Posting Text | Buchungstext | Max 60 chars |
| 37 | Cost Center 1 | KOST1 | Cost center code |
| 38 | Cost Center 2 | KOST2 | Cost center code |
| 115 | Service Date | Leistungsdatum | DDMMYYYY |
| 117 | Due Date | Fälligkeit | DDMMYYYY |
| 119 | Tax Rate | Steuersatz | Decimal |

### DATEV Date Formats

| Field Type | Format | Example |
|------------|--------|---------|
| Document Date | DDMM | 1505 (May 15) |
| Full Date | DDMMYYYY | 15052023 |
| Header Date | YYYYMMDD | 20230515 |
| Timestamp | YYYYMMDDHHMMSSFFF | 20230515143000000 |

---

## 4. Lexware Office (Cloud) API Import

For Lexware Office (the cloud product), data import is done via REST API:

### API Endpoint
```
https://api.lexware.io
```

### API Rate Limits
- 2 requests per second maximum
- Token bucket algorithm

### Voucher/Booking Import
The Lexware API uses JSON format, not CSV. Bookings are created through the vouchers/invoices endpoints.

Example voucher fields:
```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "createdDate": "2023-02-21T00:00:00.000+01:00",
  "title": "Invoice Title",
  "type": "PRODUCT",
  "price": {
    "netPrice": 61.90,
    "grossPrice": 73.66,
    "leadingPrice": "NET",
    "taxRate": 19
  }
}
```

---

## 5. Conversion: DATEV to Lexware Format

### Key Differences

| Aspect | DATEV EXTF | Lexware CSV |
|--------|------------|-------------|
| Date Format | DDMM or DDMMYYYY | DD.MM.YYYY |
| Decimal | Comma | Comma |
| S/H Indicator | Separate field | Account column determines |
| Header | 2-row header | Optional single header |
| Encoding | UTF-8 / ANSI | ANSI recommended |
| Field Count | 125+ fields | ~6-20 fields |
| Complexity | High | Low |

### Conversion Steps

1. **Extract essential fields** from DATEV file:
   - Amount (Umsatz)
   - Account (Konto)
   - Contra Account (Gegenkonto)
   - Document Date (Belegdatum)
   - Posting Text (Buchungstext)
   - Document Number (Belegfeld 1)

2. **Transform date format**: DDMM → DD.MM.YYYY (add year)

3. **Handle S/H indicator**:
   - If S (Soll/Debit): Amount goes to Soll-Konto
   - If H (Haben/Credit): Swap account columns

4. **Remove unnecessary fields** (most DATEV fields are optional/empty)

5. **Verify encoding** is Windows-1252 / ANSI

---

## 6. Gotchas and Special Requirements

### ⚠️ Common Issues

1. **DATEV Version Mismatch**: Lexware only reads DATEV v7.0 or older
2. **Date Format**: Wrong date format is the #1 import error
3. **Encoding Issues**: UTF-8 with BOM can cause problems; use ANSI
4. **Account Length**: Ensure account numbers match your SKR chart of accounts
5. **Decimal Separator**: Must be comma for German locale

### ⚠️ Lexware Product Versions

| Product | DATEV Import | ASCII Import | API |
|---------|-------------|--------------|-----|
| Lexware buchhaltung | ✅ (v7.0) | ✅ | ❌ |
| Lexware buchhaltung plus | ✅ (v7.0) | ✅ | ❌ |
| Lexware buchhaltung pro | ✅ (v7.0) | ✅ | ❌ |
| Lexware buchhaltung premium | ✅ (v7.0) | ✅ | ❌ |
| Lexware Financial Office | ✅ (v7.0) | ✅ | ❌ |
| Lexware Office (Cloud) | ❌ | ❌ | ✅ |

### ⚠️ SKR Account Frameworks

Lexware supports standard German account frameworks:
- **SKR 03** - Most common for small businesses
- **SKR 04** - Alternative framework

Ensure your import file uses account numbers matching your configured SKR.

---

## 7. Sample Valid Import Files

### Minimal Lexware CSV

```csv
"Betrag";"Soll";"Haben";"Datum";"Text"
"100,00";"8400";"1200";"01.01.2024";"Test Buchung"
```

### Full Lexware ASCII Export/Import Format

The fields when exporting from Lexware Buchhaltung typically include:

```csv
"Betrag";"Soll-Konto";"Haben-Konto";"Belegdatum";"Belegnummer";"Buchungstext";"USt-Betrag";"USt-Schlüssel";"Kostenstelle 1";"Kostenstelle 2"
"1190,00";"8400";"1200";"15.03.2024";"RE-2024-001";"Warenverkauf brutto";"190,00";"3";"KST1";"KST2"
```

### DATEV v7.0 Compatible Export

To create a DATEV file that Lexware can import:

```csv
"EXTF";700;21;"Buchungsstapel";7;20240315120000000;;;"Export";;12345;67890;20240101;4;20240301;20240331;"Buchungen März";;1;50;0;"EUR";;;;;;;;;;
"Umsatz";"S/H";"WKZ";"Kurs";"Basis";"WKZ2";"Konto";"Gegenkonto";"BU";"Datum";"Beleg1";"Beleg2";"Skonto";"Text"
1190,00;"S";"EUR";;;;"8400";"1200";"3";"1503";"RE-001";;"";""Warenverkauf""
```

---

## 8. Recommendations

### For Bank Transaction Import

1. **Use ASCII Import** - Most flexible option
2. **Map fields manually** - Lexware's import wizard allows field mapping
3. **Test with sample data** - Use Lexware's "Mustermandant" (sample client)
4. **Verify account numbers** - Match your SKR framework

### For Tax Consultant Exchange

1. **Request DATEV v7.0 export** from your tax consultant
2. **Or use ASCII format** with agreed-upon field structure
3. **Define date range** clearly in export parameters

### For Automation

1. **Lexware Office API** for cloud users
2. **Batch CSV files** for desktop users
3. **Consider middleware** like n8n or Zapier for format conversion

---

## Sources

- Lexware Support Forum (forum.lexware.de)
- DATEV EXTF PHP Library (github.com/ameax/datev-extf)
- Lexware API Documentation (developers.lexware.io)
- User reports and forum discussions

---

*Research completed: January 2026*
