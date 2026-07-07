# API Reference — VirtuOS Migration Onboarding

Every onboarding step needs to pull data from existing platforms and serve it through VirtuOS replacement APIs. This document maps out all 11 steps.

---

## Step 1: Import Emails

**Import APIs (pull from old platforms):**

| API | Type | Pricing | Docs |
|-----|------|---------|------|
| Gmail API | REST | Free (500MB/day) | developers.google.com/gmail/api |
| Microsoft Graph API | REST (OData v4) | Free | learn.microsoft.com/en-us/graph |
| IMAP Protocol (RFC 3501) | Open Protocol | Free | tools.ietf.org/html/rfc3501 |
| Yahoo Mail API | REST (limited) | Free | developer.yahoo.com/docs/mail |

**VirtuOS Replacement Endpoints:**

```
POST   /api/v1/emails/import/{provider}
GET    /api/v1/emails/inbox
GET    /api/v1/emails/{id}
POST   /api/v1/emails/send
DELETE /api/v1/emails/{id}
```

**Dev Steps:** OAuth 2.0 for Gmail, OAuth 2.0 for Microsoft Graph, IMAP library integration, email parsing/normalization, local search index, VirtuOS send API via provider SMTP relay.

---

## Step 2: Import Contacts

**Import APIs:**

| API | Type | Pricing | Docs |
|-----|------|---------|------|
| Google People API | REST | Free | developers.google.com/people |
| Microsoft Graph Contacts | REST | Free | learn.microsoft.com/en-us/graph |
| CardDAV Protocol (RFC 6352) | Open Protocol | Free | tools.ietf.org/html/rfc6352 |
| vCard Standard (RFC 6350) | File Format | Free | tools.ietf.org/html/rfc6350 |

**VirtuOS Replacement Endpoints:**

```
POST   /api/v1/contacts/import/{provider}
GET    /api/v1/contacts
GET    /api/v1/contacts/{id}
PUT    /api/v1/contacts/{id}
DELETE /api/v1/contacts/{id}
POST   /api/v1/contacts/merge-duplicates
```

**Dev Steps:** OAuth for Google/Microsoft, CardDAV sync, vCard parsing, duplicate detection (fuzzy name + phone + email matching), contact merge UI, bi-directional sync option.

---

## Step 3: Import Files

**Import APIs:**

| API | Type | Pricing | Docs |
|-----|------|---------|------|
| Google Drive API v3 | REST | Free (10B queries/day) | developers.google.com/drive |
| Microsoft OneDrive (Graph) | REST | Free | learn.microsoft.com/en-us/graph |
| Dropbox API v2 | REST | Free (basic) | dropbox.github.io/dropbox-api-v2-explorer |
| Box API | REST | Free tier | developer.box.com |
| iCloud Drive (CloudKit) | REST/JS | Free | developer.apple.com/icloud/cloudkit |

**VirtuOS Replacement Endpoints:**

```
POST   /api/v1/files/import/{provider}
GET    /api/v1/files
GET    /api/v1/files/{id}
PUT    /api/v1/files/{id}
DELETE /api/v1/files/{id}
POST   /api/v1/files/upload
GET    /api/v1/files/{id}/download
POST   /api/v1/files/search
```

**Dev Steps:** OAuth per provider, recursive folder traversal, chunked download/upload for large files, file type detection, preview generation (thumbnails, PDF previews), search indexing, conflict resolution for duplicate filenames.

---

## Step 4: Import Photos

**Import APIs:**

| API | Type | Pricing | Docs |
|-----|------|---------|------|
| Google Photos Library API | REST | Free | developers.google.com/photos |
| iCloud Photos (CloudKit) | REST/JS | Free | developer.apple.com/documentation/photokit |
| Flickr API | REST | Free | flickr.com/services/api |
| Instagram Basic Display API | REST (OAuth) | Free | developers.facebook.com/docs/instagram-basic-display-api |

**VirtuOS Replacement Endpoints:**

```
POST   /api/v1/photos/import/{provider}
GET    /api/v1/photos
GET    /api/v1/photos/{id}
POST   /api/v1/photos/upload
GET    /api/v1/photos/albums
POST   /api/v1/photos/albums
```

**Dev Steps:** OAuth per provider, batch download with rate limiting, EXIF metadata preservation, thumbnail generation (multiple sizes), album organization, face detection tagging (optional, via ML API), geolocation-based grouping.

---

## Step 5: Import Messages (SMS/Chat)

**Import APIs:**

| API | Type | Pricing | Docs |
|-----|------|---------|------|
| Android SMS Content Provider | Native SDK | Free | developer.android.com |
| Apple iMessage (no public API) | Device backup | Free | N/A — requires local backup parsing |
| WhatsApp Chat Export | File format | Free | faq.whatsapp.com |
| Telegram Bot API | REST | Free | core.telegram.org/bots/api |
| Signal (no export API) | Local DB | Free | signal.org |

**VirtuOS Replacement Endpoints:**

```
POST   /api/v1/messages/import/{provider}
GET    /api/v1/messages/conversations
GET    /api/v1/messages/conversations/{id}
POST   /api/v1/messages/send
```

**Dev Steps:** Android companion app for SMS export, iTunes/Finder backup parsing for iMessage, WhatsApp `.txt` export parser, Telegram Bot API with chat history, conversation threading algorithm, E2E encryption for stored messages.

---

## Step 6: Port Phone Number

**Import APIs:**

| API | Type | Pricing | Docs |
|-----|------|---------|------|
| Twilio Porting API | REST | ~$1/month/number | twilio.com/docs/phone-numbers/porting |
| Telnyx Number Porting | REST | ~$1/month/number | developers.telnyx.com |
| Vonage (Nexmo) Number API | REST | ~$0.50-1/month | developer.vonage.com |
| Bandwidth Number Porting | REST | Custom | dev.bandwidth.com |

**VirtuOS Replacement Endpoints:**

```
POST   /api/v1/phone/port-request
GET    /api/v1/phone/port-status/{id}
POST   /api/v1/phone/call
POST   /api/v1/phone/sms
GET    /api/v1/phone/voicemail
```

**Dev Steps:** LOA (Letter of Authorization) form, carrier verification, FCC porting compliance, Twilio/Telnyx provisioning, WebRTC for in-app calling, SMS gateway integration, voicemail transcription.

---

## Step 7: Import Music

**Import APIs:**

| API | Type | Pricing | Docs |
|-----|------|---------|------|
| Spotify Web API | REST | Free | developer.spotify.com/documentation/web-api |
| Apple Music API | REST | Free (MusicKit) | developer.apple.com/musickit |
| YouTube Music (no public API) | Scraping/OAuth | N/A | N/A |
| SoundCloud API | REST | Free | developers.soundcloud.com |
| Last.fm API | REST | Free | last.fm/api |

**VirtuOS Replacement Endpoints:**

```
POST   /api/v1/music/import/{provider}
GET    /api/v1/music/library
GET    /api/v1/music/playlists
POST   /api/v1/music/playlists
GET    /api/v1/music/stream/{track_id}
```

**Dev Steps:** OAuth for Spotify/Apple, playlist metadata export (not audio — licensing), local file upload (MP3/FLAC/AAC), metadata tagging (ID3), streaming server with adaptive bitrate, playlist sync/merge, recommendation engine (optional).

---

## Step 8: Import Passwords

**Import APIs:**

| API | Type | Pricing | Docs |
|-----|------|---------|------|
| 1Password Connect API | REST | Business tier | developer.1password.com/docs/connect |
| Bitwarden API | REST | Free/Self-hosted | bitwarden.com/help/vault-management-api |
| Chrome Passwords Export | CSV file | Free | N/A — manual export |
| LastPass Export | CSV file | Free | support.lastpass.com |
| KeePass Export | KDBX/CSV | Free | keepass.info |

**VirtuOS Replacement Endpoints:**

```
POST   /api/v1/vault/import/{format}
GET    /api/v1/vault/items
GET    /api/v1/vault/items/{id}
POST   /api/v1/vault/items
PUT    /api/v1/vault/items/{id}
DELETE /api/v1/vault/items/{id}
POST   /api/v1/vault/generate-password
```

**Dev Steps:** CSV/JSON parser for exports, AES-256 encryption at rest, master password + PBKDF2 key derivation, zero-knowledge architecture, autofill browser extension API, TOTP/2FA token storage, secure sync protocol.

---

## Step 9: Import Subscriptions

**Import APIs:**

| API | Type | Pricing | Docs |
|-----|------|---------|------|
| Apple App Store Server API | REST | Free | developer.apple.com/documentation/appstoreserverapi |
| Google Play Developer API | REST | Free | developers.google.com/android-publisher |
| Stripe Billing API | REST | 0.5% of recurring revenue | docs.stripe.com/billing |
| Microsoft Graph Subscriptions | REST | Free | learn.microsoft.com/en-us/graph |

**VirtuOS Replacement Endpoints:**

```
POST   /api/v1/subscriptions/import/{provider}
GET    /api/v1/subscriptions
GET    /api/v1/subscriptions/{id}
PUT    /api/v1/subscriptions/{id}/cancel
GET    /api/v1/subscriptions/spending-summary
```

**Dev Steps:** App Store Server API JWT auth, Google Play OAuth Service Account, parse subscription status (active/expired/paused), display renewal dates and billing frequency, redirect to platform settings for cancellation, spending tracker dashboard.

---

## Step 10: Import Money / Banking

**Account Aggregation APIs (connect existing bank accounts):**

| API | Type | Pricing | Docs |
|-----|------|---------|------|
| Plaid | REST | Free sandbox, $0.30-1/link | plaid.com/docs |
| Teller.io | REST | Free sandbox, custom prod | teller.io/docs |
| MX Technologies | REST | Custom (16k+ institutions) | docs.mx.com |
| Finicity (Mastercard) | REST | Custom enterprise | developer.mastercard.com/open-banking-us/documentation |
| Yodlee / Envestnet | REST | Tiered per-business | developer.yodlee.com |
| Salt Edge | REST | Custom (PSD2-compliant) | docs.saltedge.com/general/v5 |

**Money Transfer APIs:**

| API | Type | Pricing | Docs |
|-----|------|---------|------|
| Stripe | REST | 2.9% + $0.30/txn | docs.stripe.com/api |
| Plaid Transfer (ACH) | REST | Per-transfer fee | plaid.com/docs/api/products/transfer |
| Dwolla (ACH/RTP) | REST | Usage-based volume | developers.dwolla.com |
| Modern Treasury | REST (JSON) | Usage-based scaling | docs.moderntreasury.com |

**Banking-as-a-Service (for building VirtuOS banking backend):**

| Provider | Key Feature | Docs |
|----------|-------------|------|
| Unit.co | FDIC-insured accounts + cards | unit.co/docs/api |
| Column | Nationally chartered bank APIs | column.com/docs/api |
| Treasury Prime | Bank-direct embedded banking | docs.treasuryprime.com |
| Synctera | Banking + payments infra | docs.synctera.com |
| Bond Financial | Enterprise embedded finance | docs.bond.tech |

**VirtuOS Replacement Endpoints:**

```
POST   /api/v1/banking/link
GET    /api/v1/banking/accounts
GET    /api/v1/banking/accounts/{id}
GET    /api/v1/banking/accounts/{id}/transactions
POST   /api/v1/banking/transfer
GET    /api/v1/banking/transfer/{id}
POST   /api/v1/banking/virtuos-account
POST   /api/v1/banking/payment
DELETE /api/v1/banking/accounts/{id}
```

**Dev Steps:** Choose aggregator (Plaid/Teller) + transfer provider (Stripe/Dwolla) + BaaS (Unit/Column). OAuth/API key management. Plaid Link or Teller Connect UI integration. BaaS account provisioning (FDIC-insured). ACH/wire/RTP transfers. Payment processing with idempotency. PCI-DSS + SOC 2 compliance, TLS 1.2+, tokenized storage, audit logs. Full testing: sandbox, transfer scenarios, pen testing, load testing.

---

## Step 11: Migration Complete

No APIs needed. This is the final confirmation screen that launches the VirtuOS dashboard.
