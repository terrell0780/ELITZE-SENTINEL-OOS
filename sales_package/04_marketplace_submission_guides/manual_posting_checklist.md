# Manual Submission Checklist & Marketplace Execution Guide (`elitze.ca`)

**Document Version:** 2.0 (Operations & Field Execution Protocol)  
**Target Asset:** `elitze.ca` (Sovereign AI Operating System & Premium Domain IP)  
**Target Valuation:** $10,000 – $35,000 USD *(CAD equivalent accepted)*  

This operational checklist provides step-by-step execution procedures for listing `elitze.ca` across digital asset marketplaces, configuring registrar DNS landers, executing Escrow.com security protocols, and managing live buyer inquiries.

---

## 📋 Phase 1: Domain Parking, Landers & Fast Transfer ($10,000 BIN)

### 1.1 Dan.com Nameserver & Lander Configuration
- [ ] Log into your domain registrar (Webnames.ca / Namecheap) for `elitze.ca`.
- [ ] Navigate to **Nameservers** and select **Custom DNS**:
  - Primary: `ns1.dan.com`
  - Secondary: `ns2.dan.com`
- [ ] Log into `dan.com` seller dashboard and add `elitze.ca`.
- [ ] Set **Buy-It-Now (BIN)** price: **$10,000 USD**.
- [ ] Set **Minimum Offer (Floor)**: **$7,500 USD**.
- [ ] Enable **12-Month Lease-to-Own** financing at **$833 USD/month**.
- [ ] Paste lander description from `sales_package/01_listing_copies/dan_afternic_sedo_listings.md`.
- [ ] Verify SSL certificate generation on `https://elitze.ca` (Dan handles automatically).

### 1.2 Afternic Fast Transfer & Network Reseller Setup
- [ ] Log into `afternic.com`.
- [ ] Add `elitze.ca` with Buy-It-Now: **$10,000 USD** and Floor: **$7,500 USD**.
- [ ] Enable **Fast Transfer** network distribution (GoDaddy, Network Solutions, 100+ partner registrars).
- [ ] Accept Fast Transfer verification email from registrar to activate instant network purchase.
- [ ] (If required by registrar) Add TXT verification record in DNS: Host `@`, Type `TXT`, Value `[afternic-code]`.

### 1.3 Sedo Global Domain Listing
- [ ] Log into `sedo.com`.
- [ ] Add `elitze.ca` to Sedo marketplace portfolio.
- [ ] Set Buy-It-Now price: **$10,000 USD**; Minimum bid: **$7,500 USD**.
- [ ] Assign Category: *Internet & Technology -> Artificial Intelligence & Cybersecurity*.

---

## 📋 Phase 2: SaaS M&A & Code Acquisition Listings ($25,000 – $35,000)

### 2.1 Acquire.com (MicroAcquire) Listing Creation
- [ ] Log into `acquire.com`.
- [ ] Click **"List a Startup"** -> Select Category: *Micro-SaaS / Pre-Revenue Tech Asset*.
- [ ] Set Asking Price: **$35,000 USD** (Turnkey Package).
- [ ] Paste public teaser copy from `sales_package/01_listing_copies/acquire_com_listing.md`.
- [ ] Under **Confidential Seller Notes (NDA View)**:
  - Document the 3-Tier Acquisition Structure ($10k / $25k / $35k).
  - Enumerate the 30 application hubs, 16-plane kernel, 281 passing tests, and Stripe integration.
  - Detail the 30-day developer onboarding SLA.
- [ ] Attach `executive_dossier_elitze_ca.md` and link private Loom video demo.
- [ ] Submit for Acquire.com curator review.

### 2.2 Flippa Auction & Buy-It-Now Listing
- [ ] Log into `flippa.com`.
- [ ] Create Listing under **SaaS Business / Software Asset / Digital IP**.
- [ ] Set **Listing Type**: Reserve Auction / Classified.
- [ ] Set **Starting Bid / Reserve**: **$10,000 USD**.
- [ ] Set **Buy-It-Now (BIN)**: **$35,000 USD**.
- [ ] Paste executive pitch, 3-tier pricing, asset breakdown, and post-sale timeline from `sales_package/01_listing_copies/flippa_listing.md`.
- [ ] Enable Flippa Escrow / Escrow.com secure settlement.

### 2.3 Secondary SaaS Directories (Microns.io / TrustMRR / Vaulto)
- [ ] Submit to **Microns.io** via founder submission form ($10k–$25k software IP).
- [ ] Create verified tech asset profile on **TrustMRR** with staging link.
- [ ] Publish pre-revenue asset listing on **Vaulto.com**.

---

## 📋 Phase 3: Developer Communities & Social Showcases

### 3.1 Indie Hackers Community Pitch
- [ ] Navigate to `indiehackers.com/products` and `indiehackers.com/marketplace`.
- [ ] Publish post using blueprint from `sales_package/01_listing_copies/indie_hackers_pitch.md`.
- [ ] Monitor comments and engage with community inquiries within 1 hour of posting.

### 3.2 Reddit Strategic Distribution
- [ ] **`r/domains`**: Post Blueprint 1 from `sales_package/01_listing_copies/reddit_post_blueprints.md` (Check strict `[FS]` title formatting).
- [ ] **`r/SideProject`**: Post Blueprint 2 (Focus on technical architecture, 16 planes, and builder feedback).
- [ ] **`r/SaaS` & `r/Entrepreneur`**: Post Blueprint 3 (Focus on turnkey monetization and operational launch).

---

## 📋 Phase 4: Outbound B2B Email Campaigns & Direct Buyer Inquiries

- [ ] **Victoria, BC Regional Campaign:** Follow `sales_package/03_email_campaigns/outreach_sequence_local_bc.md` for prospects in `sales_package/02_lead_lists/victoria_bc_leads.md`.
- [ ] **Vancouver, BC Enterprise Campaign:** Follow `sales_package/03_email_campaigns/outreach_sequence_local_bc.md` for prospects in `sales_package/02_lead_lists/vancouver_bc_leads.md`.
- [ ] **Global Buyer & Broker Campaign:** Follow `sales_package/03_email_campaigns/outreach_sequence_global.md` for aggregators in `sales_package/02_lead_lists/global_buyers_and_brokers.md`.
- [ ] Verify 100% compliance with Canadian Anti-Spam Legislation (CASL Section 6(6)) and international guidelines using `sales_package/03_email_campaigns/casl_compliance_guide.md`.

---

## 🛡️ Escrow.com Inspection Protocol & Asset Release Sequence

When executing an acquisition via Escrow.com or Flippa Escrow, adhere to this strict security and milestone protocol:

```
[Buyer Funds Escrow] ──► [Escrow Verified] ──► [Milestone 1: Domain Push]
                                                       │
[Buyer Approves & Funds Released] ◄── [Milestone 3: Docker & API Keys] ◄── [Milestone 2: Code Repo]
```

### Security & NDA Rules Prior to Funding:
1. **No Raw Code Access Before Escrow:** Never share uncompiled source code files, Git write permissions, or private encryption keys prior to Escrow.com fund verification.
2. **Demo Access via Staging Only:** Provide live demonstrations exclusively on password-protected staging (`https://app.elitze.ca`) with sandboxed test credentials.
3. **Formal NDA for Private Diligence:** Require signed mutual NDA before sharing the full Executive Technical Dossier or private Loom walkthroughs.

### Structured Milestone Release Sequence:
- **Milestone 1 (Domain Authorization Push):**
  - Once Escrow confirms fund receipt, seller provides domain EPP / authorization code or initiates internal registrar push to buyer's account.
  - Inspection Window: 24 hours.
- **Milestone 2 (Proprietary Code Repository Transfer):**
  - Transfer GitHub repository ownership to buyer's GitHub organization; deliver full standalone ZIP archive of codebase and 281-test test suite.
  - Inspection Window: 48 hours (buyer validates local build and runs `pytest` test suite).
- **Milestone 3 (Docker Staging & API Handover):**
  - Provide Docker Compose manifests, reverse proxy templates, and assist with Stripe/OpenRouter key provisioning.
- **Milestone 4 (Escrow Acceptance & Fund Release):**
  - Buyer marks inspection complete on Escrow.com; funds disbursed to seller.
- **Milestone 5 (30-Day Support SLA Commences):**
  - Seller delivers up to 30 days of direct technical onboarding, cloud deployment assistance, and architecture consultation.

---

## 📊 Active Listing & Submission Tracking Table

| # | Marketplace / Channel | Listing URL / Direct Link | Date Posted | Target Price Tier | Current Status | Inquiries Received | Highest Offer (USD) | Net Payout Estimate | Next Action / Follow-up |
|---|---|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| 1 | **Dan.com** | `https://dan.com/buy-domain/elitze.ca` | 2026-08-19 | Tier 1 ($10,000) | Ready to Publish | 0 | - | $9,500 USD | Update Nameservers at Webnames |
| 2 | **Afternic** | `https://afternic.com/domain/elitze.ca` | 2026-08-19 | Tier 1 ($10,000) | Ready to Publish | 0 | - | $8,500 USD | Accept Fast Transfer email |
| 3 | **Sedo** | `https://sedo.com/search/details/?domain=elitze.ca` | 2026-08-19 | Tier 1 ($10,000) | Ready to Publish | 0 | - | $8,500 – $9,000 USD | Verify listing ownership |
| 4 | **Acquire.com** | `https://acquire.com/startups/elitze-sentinel` | 2026-08-19 | Tier 3 ($35,000) | Ready to Publish | 0 | - | $34,750 USD | Submit data room for curation |
| 5 | **Flippa** | `https://flippa.com/elitze-sentinel-os` | 2026-08-19 | Tier 1–3 ($10k–$35k) | Ready to Publish | 0 | - | $31,500 – $33,250 USD | Launch Reserve Auction |
| 6 | **Indie Hackers** | `https://indiehackers.com/product/elitze-sentinel` | 2026-08-19 | Tier 1–3 ($10k–$35k) | Ready to Publish | 0 | - | $34,700 USD | Publish /products showcase |
| 7 | **Reddit (`r/domains`)** | `https://reddit.com/r/domains` | 2026-08-19 | Tier 1 ($10,000) | Ready to Publish | 0 | - | $9,700 USD | Submit `[FS]` post |
| 8 | **Reddit (`r/SideProject`)**| `https://reddit.com/r/SideProject` | 2026-08-19 | Tier 1–3 ($10k–$35k) | Ready to Publish | 0 | - | $34,700 USD | Submit technical showcase |
| 9 | **Reddit (`r/SaaS`)** | `https://reddit.com/r/SaaS` | 2026-08-19 | Tier 2–3 ($25k–$35k) | Ready to Publish | 0 | - | $34,700 USD | Submit SaaS business pitch |
| 10 | **Microns.io** | `https://microns.io` | 2026-08-19 | Tier 2 ($25,000) | Ready to Publish | 0 | - | $24,750 USD | Submit founder newsletter form |
| 11 | **TrustMRR** | `https://trustmrr.com` | 2026-08-19 | Tier 3 ($35,000) | Ready to Publish | 0 | - | $33,250 USD | Connect staging URL verification |
| 12 | **Vaulto** | `https://vaulto.com` | 2026-08-19 | Tier 1–3 ($10k–$35k) | Ready to Publish | 0 | - | $32,200 USD | Create startup profile |
| 13 | **NamePros** | `https://namepros.com` | 2026-08-19 | Tier 1 ($10,000) | Ready to Publish | 0 | - | $9,700 USD | Post in .ca domain subforum |
