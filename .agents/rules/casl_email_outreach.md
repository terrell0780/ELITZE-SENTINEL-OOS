# Rule: CASL & Global B2B Email Outreach Invariants

**Scope:** All B2B outbound email communications, campaign logging, and follow-up sequence automation.

---

## 1. Canadian Anti-Spam Legislation (CASL § 6(6))
- All cold B2B outreach targeting Canadian prospects (Victoria, Vancouver, BC) must rely on conspicuously published business email addresses where the message directly relates to the recipient's corporate role.
- Mandatory disclosures in every transmission:
  1. Sender Full Name & Business Identity (`[Your Name]`, `Elitze Sentinel`).
  2. Physical Postal Address (`[Your Physical Business Address, Victoria/Vancouver BC]`).
  3. Direct Contact Information (`acquire@elitze.ca`, phone, website URL).
  4. Functional 1-Click / Reply Unsubscribe Mechanism.

---

## 2. 24-Hour Opt-Out SLA & Suppression
- Any reply containing "STOP", "UNSUBSCRIBE", or "OPT-OUT" must be processed within 24 hours.
- Add unsubscribed emails immediately to `.frontier-data/suppression.json`. Never send a confirmation or follow-up email after an opt-out.

---

## 3. Sent Email Telemetry & Follow-Up Schedule
- Log all sent emails in `.frontier-data/emails.json` with timestamp, stage, and next follow-up due date.
- Run `python sales_package/03_email_campaigns/follow_up_scheduler.py` to trigger Email 2 (Technical Deep Dive at Day 4) and Email 3 (Closing Exclusivity Offer at Day 9).
