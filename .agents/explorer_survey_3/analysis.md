# Comprehensive Technical Survey: Requirement R5 (Sent Email Follow-up Tracking & Automation Goal)

**Explorer Agent:** Explorer Survey 3  
**Target Project:** Elitze Sentinel Sovereign AI OS (`elitze.ca`) Sales Package  
**Requirement Focus:** R5 — Sent Email Follow-up Tracking & Automation Goal  
**Working Directory:** `c:\Elitze Sentinel Frontier Oos\.agents\explorer_survey_3`  
**Timestamp:** 2026-08-19T19:20:00Z  

---

## 1. Executive Summary

Requirement **R5 (Sent Email Follow-up Tracking & Automation Goal)** establishes an automated, auditable, and CASL-compliant outbound email tracking and follow-up campaign engine for the sale and acquisition of `elitze.ca` across Victoria BC, Vancouver BC, and global marketplaces.

The three primary deliverables under R5 are:
1. **Sent Email Database & Audit Ledger (`.frontier-data/emails.json` & `.frontier-data/suppression.json`)**: Persistent storage of outreach metadata, timestamps, lead references, campaign stages, and CASL compliance audit trails.
2. **Automated Follow-Up Scheduler Engine (`sales_package/03_email_campaigns/follow_up_scheduler.py`)**: Python engine executing timing window checks (Day 1 Initial Pitch → Day 4 Email 2 Technical Deep Dive → Day 9 Email 3 Closing Offer), CASL suppression scrubbing, template selection, and follow-up queue management.
3. **Follow-Up Campaign Manager Documentation (`sales_package/03_email_campaigns/follow_up_automation_manager.md`)**: Comprehensive operational runbook, JSON schema specifications, systemd/crontab scheduling architectures, CLI documentation, and CASL SLA compliance procedures.

This survey provides an exhaustive line-by-line inspection of current implementations, identifies critical architectural and timing logic deficiencies, and details the exact specifications, proposed code enhancements, and test suite required to achieve 100% reliability and compliance.

---

## 2. Deep Dive: Sent Email Tracking Database (`.frontier-data/emails.json`)

### 2.1 Current State Analysis
Direct inspection of `c:\Elitze Sentinel Frontier Oos\.frontier-data\emails.json` reveals a 63-line JSON array containing 3 initial seed records:

```json
[
  {
    "_id": "emails-vic-001",
    "recipient_email": "tech@wbm.ca",
    "recipient_name": "VP of Technology",
    "company_name": "WBM Technologies",
    "region": "victoria_bc",
    "stage": 2,
    "current_status": "email_2_due",
    "sent_timestamp": "2026-08-15T19:16:31.899738+00:00",
    "casl_exemption_basis": "CASL § 6(6) Conspicuously Published B2B Email",
    "subject": "Sovereign AI platform acquisition opportunity for WBM Technologies (elitze.ca)",
    "history": [
      {
        "stage": 1,
        "sent_at": "2026-08-15T19:16:31.899738+00:00",
        "subject": "Sovereign AI platform acquisition opportunity for WBM Technologies (elitze.ca)"
      }
    ],
    "email_2_ready_subject": "Re: Technical Deep Dive & Architecture for WBM Technologies (elitze.ca)",
    "email_2_template": "outreach_sequence_local_bc.md"
  },
  {
    "_id": "emails-van-002",
    "recipient_email": "bd@d3security.com",
    "recipient_name": "VP of Business Development",
    "company_name": "D3 Security",
    "region": "vancouver_bc",
    "stage": 2,
    "current_status": "email_2_due",
    "sent_timestamp": "2026-08-15T19:16:31.899738+00:00",
    "casl_exemption_basis": "CASL § 6(6) Conspicuously Published B2B Email",
    "subject": "Sovereign AI platform acquisition opportunity for D3 Security (elitze.ca)",
    "history": [
      {
        "stage": 1,
        "sent_at": "2026-08-15T19:16:31.899738+00:00",
        "subject": "Sovereign AI platform acquisition opportunity for D3 Security (elitze.ca)"
      }
    ],
    "email_2_ready_subject": "Re: Technical Deep Dive & Architecture for D3 Security (elitze.ca)",
    "email_2_template": "outreach_sequence_local_bc.md"
  },
  {
    "_id": "emails-glob-003",
    "recipient_email": "acquisitions@tiny.com",
    "recipient_name": "Corporate Development Director",
    "company_name": "Tiny Capital",
    "region": "global",
    "stage": 1,
    "current_status": "email_1_sent",
    "sent_timestamp": "2026-08-18T19:16:31.899738+00:00",
    "casl_exemption_basis": "B2B Investment Inquiry",
    "subject": "Acquisition Opportunity: Sovereign AI OS (elitze.ca) + 30 Hubs & Stripe Billing ($10k - $35k)",
    "history": [
      {
        "stage": 1,
        "sent_at": "2026-08-18T19:16:31.899738+00:00",
        "subject": "Acquisition Opportunity: Sovereign AI OS (elitze.ca) + 30 Hubs & Stripe Billing ($10k - $35k)"
      }
    ]
  }
]
```

### 2.2 Key Findings & Gaps in Current Data Layer
1. **Lead Scope Discrepancy**: Only 3 sample leads exist in `.frontier-data/emails.json`, whereas the sales package defines **30 verified high-value leads** across three directory files:
   - `sales_package/02_lead_lists/victoria_bc_leads.md`: 10 leads (WBM Technologies, Tecnet, Smart Dolphins, GAM Tech, Nucleus Networks, Lighthouse Integrations, Daxtech, GGIT, Regroove Solutions, Westcom).
   - `sales_package/02_lead_lists/vancouver_bc_leads.md`: 10 leads (D3 Security, Cyber Unit, Absolute Software, DeepCove, MSP Corp, Fusion Computing, Ayvant, A-CX, iComply, Invisio Digital).
   - `sales_package/02_lead_lists/global_buyers_and_brokers.md`: 10 acquisition channels/buyers (Acquire.com, Flippa, Dan.com, Afternic, Sedo, Microns.io, TrustMRR, NamePros, Tiny Capital, XO Capital).
2. **Schema Inconsistencies**:
   - `next_followup_due` is documented in `follow_up_automation_manager.md:42` as a core field, but is missing from `.frontier-data/emails.json`.
   - `last_action_timestamp` / `updated_at` is absent.
   - `stage` vs `history` discrepancy: When an item transitions to `email_2_due`, the `stage` integer is incremented to `2`, but `history` only contains the stage 1 entry.
   - Separate timestamp anchors: To accurately calculate Day 9 (5 business days after Email 2), the system needs explicit stage send timestamps (`email_1_sent_at`, `email_2_sent_at`, `email_3_sent_at`).
3. **Suppression Database**: `.frontier-data/suppression.json` is currently an empty list `[]`. It needs full bidirectional support for CASL opt-outs with timestamp, reason, and origin.

### 2.3 Proposed Canonical Data Schema (`.frontier-data/emails.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "_id",
      "recipient_email",
      "recipient_name",
      "company_name",
      "region",
      "stage",
      "current_status",
      "sent_timestamp",
      "casl_exemption_basis",
      "history"
    ],
    "properties": {
      "_id": { "type": "string", "pattern": "^emails-(vic|van|glob)-[0-9]{3}$" },
      "recipient_email": { "type": "string", "format": "email" },
      "recipient_name": { "type": "string" },
      "company_name": { "type": "string" },
      "region": { "type": "string", "enum": ["victoria_bc", "vancouver_bc", "global"] },
      "stage": { "type": "integer", "enum": [1, 2, 3] },
      "current_status": {
        "type": "string",
        "enum": [
          "email_1_sent",
          "email_2_due",
          "email_2_sent",
          "email_3_due",
          "email_3_sent",
          "completed",
          "replied",
          "in_negotiation",
          "suppressed",
          "opt_out"
        ]
      },
      "sent_timestamp": { "type": "string", "format": "date-time" },
      "next_followup_due": { "type": ["string", "null"], "format": "date-time" },
      "last_updated": { "type": "string", "format": "date-time" },
      "casl_exemption_basis": { "type": "string" },
      "source_url": { "type": "string" },
      "template_selected": { "type": "string" },
      "subject": { "type": "string" },
      "email_2_ready_subject": { "type": "string" },
      "email_3_ready_subject": { "type": "string" },
      "history": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["stage", "sent_at", "subject"],
          "properties": {
            "stage": { "type": "integer" },
            "sent_at": { "type": "string", "format": "date-time" },
            "subject": { "type": "string" },
            "status": { "type": "string" }
          }
        }
      }
    }
  }
}
```

---

## 3. Deep Dive: Follow-Up Scheduler Engine (`sales_package/03_email_campaigns/follow_up_scheduler.py`)

### 3.1 Current Implementation Breakdown
The existing script consists of 166 lines. Let's analyze each function:

1. **`ensure_data_files()` (lines 17–26)**:
   - Creates `.frontier-data` directory if missing.
   - Initializes `emails.json` and `suppression.json` to `[]` if not present.
   - *Assessment*: Sound, but does not validate if existing files are valid JSON.

2. **`load_json(filepath)` & `save_json(filepath, data)` (lines 27–37)**:
   - Reads/writes UTF-8 JSON.
   - *Assessment*: Catches general `Exception` on load and returns `[]`. Should log a warning when corrupted JSON is encountered.

3. **`seed_sample_campaigns()` (lines 38–108)**:
   - If `emails.json` is empty, seeds 3 records with `day_minus_4` and `day_minus_1` timestamps.
   - *Assessment*: Good for initial bootstrapping, but only seeds 3 sample records and lacks the capability to seed the full 30-lead directory.

4. **`process_followups()` (lines 109–156)**:
   - Implements stage checking and elapsed day calculations:
     ```python
     elapsed_days = (now - sent_at).days
     stage = item.get("stage", 1)

     # Stage 1 -> Stage 2 (Due after 3 days)
     if stage == 1 and elapsed_days >= 3:
         item["stage"] = 2
         item["current_status"] = "email_2_due"
         item["email_2_ready_subject"] = f"Re: Technical Deep Dive & Architecture for {item.get('company_name')} (elitze.ca)"
         item["email_2_template"] = "outreach_sequence_local_bc.md" if item.get("region") != "global" else "outreach_sequence_global.md"
         actions_taken.append(f"Ready for Email 2: {recipient} ({item.get('company_name')}) — {elapsed_days} days elapsed")

     # Stage 2 -> Stage 3 (Due after 5 additional days = 8 days total)
     elif stage == 2 and elapsed_days >= 8:
         item["stage"] = 3
         item["current_status"] = "email_3_due"
         item["email_3_ready_subject"] = f"Final Notice: elitze.ca Sovereign AI OS Private Acquisition Window Closing for {item.get('company_name')}"
         item["email_3_template"] = "outreach_sequence_local_bc.md" if item.get("region") != "global" else "outreach_sequence_global.md"
         actions_taken.append(f"Ready for Email 3 (Closing Offer): {recipient} ({item.get('company_name')}) — {elapsed_days} days elapsed")
     ```

### 3.2 Critical Defects & Logic Issues in Current Engine

| Issue # | Area | Description & Root Cause | Impact | Recommended Solution |
|---|---|---|---|---|
| **D1** | **State Stagnation & Mutation Loop** | Once `stage` is mutated from `1` to `2` and `current_status` becomes `"email_2_due"`, subsequent runs will see `stage == 2`. If elapsed days is between 3 and 7, neither `if stage == 1` nor `elif stage == 2 and elapsed_days >= 8` matches. The scheduler reports 0 actions on all subsequent runs until day 8. | Scheduler becomes non-actionable; cannot distinguish between "Email 2 is due today" and "Email 2 was already sent". | Separate `stage` progression from `status` (`email_1_sent` → `email_2_due` → `email_2_sent` → `email_3_due` → `email_3_sent` → `completed`). |
| **D2** | **Timestamp Reference Anchor** | Stage 2 to Stage 3 checks `elapsed_days >= 8` against `sent_timestamp` (which is Email 1's send time). If Email 2 was sent late (e.g. Day 6), Email 3 triggers 2 days later instead of waiting 5 business days after Email 2. | Violates cadence rule (5 business days after Email 2). | Anchor Email 3 trigger to `email_2_sent_timestamp` in `history` (or `last_sent_at + 5 business days`). |
| **D3** | **Business Days vs Calendar Days** | `(now - sent_at).days` counts calendar days. If Email 1 is sent on Friday at 5 PM, calendar delta hits 3 on Monday (only 1 business day elapsed). | Contacts are emailed too soon on weekends/Mondays, causing outreach fatigue. | Add `calculate_business_days(start_date, end_date)` function that skips Saturdays and Sundays. |
| **D4** | **Case Sensitivity in Suppression** | `recipient in suppression_list` uses exact string match (`set(load_json(...))`). If `Suppression.json` has `Tech@wbm.ca` and record has `tech@wbm.ca`, check fails. | Potential CASL violation if email casing differs. | Normalize all emails via `.lower().strip()` when checking suppression. |
| **D5** | **No CLI Interface** | Direct execution runs `process_followups()` without CLI arguments or flags. | Operators cannot run `--dry-run`, `--status`, `--suppress <email>`, `--dispatch`, or `--json`. | Implement `argparse` with full CLI subcommand and flag suite. |
| **D6** | **No Dispatch / Execution Action** | The scheduler marks items as `"email_2_due"`, but provides no function to record the actual dispatch of Email 2 (updating `history`, stamping `sent_at`, advancing status to `email_2_sent`). | State cannot transition naturally from `due` to `sent`. | Add `--dispatch` / `dispatch_due_emails()` function to mark due emails as sent and append to `history`. |
| **D7** | **Template Rendering & Variable Interpolation** | The engine outputs template file names, but cannot render the markdown body with lead-specific values (`[First Name]`, `[Company Name]`, `[Your Name]`, etc.). | Manual rendering overhead for sales reps. | Add template reader and preview renderer for local BC and Global templates. |

---

## 4. Deep Dive: Documentation (`sales_package/03_email_campaigns/follow_up_automation_manager.md`)

### 4.1 Current Documentation Assessment
The existing document is concise (67 lines) and provides:
- High-level sequence schedule (Day 1 -> Day 4 -> Day 9).
- Sample JSON snippet.
- 3 basic operational rules.

### 4.2 Required Expansions for Complete Operational Readiness
To serve as an institutional-grade campaign manager and operations runbook, the document must be expanded with:
1. **Architecture & Component Diagram**: Clear ASCII architecture showing Ledger, Engine, Suppression Scrub, Template Renderer, and Cron Daemon.
2. **Exhaustive Schema Reference**: All properties, constraints, regex patterns, and status lifecycle state machines.
3. **Cron & Daemon Operational Guides**:
   - Linux `crontab` entry (`0 9 * * 1-5 /usr/bin/python3 ...`).
   - Linux `systemd` service (`elitze-scheduler.service`) and timer (`elitze-scheduler.timer`).
   - Windows Task Scheduler XML and PowerShell scheduled job syntax.
   - Docker container execution (`docker run -v ...`).
4. **CLI Manual**: Detailed documentation of all commands, options, exit codes, and output formats.
5. **Operational Runbook**:
   - Handling inbound replies: triage into `replied` or `in_negotiation`.
   - CASL Opt-Out SLA: 24-hour internal processing, 10-day statutory limit under CASL § 11(3).
   - Suppression logging and audit trail preservation (3-year retention under BC PIPA / PIPEDA).

---

## 5. Comprehensive Specification for Enhanced Engine (`follow_up_scheduler.py`)

Below is the design and architecture for the enhanced follow-up engine:

### 5.1 Core Modules & Functions
```
follow_up_scheduler.py
├── Configuration & Constants (DATA_DIR, EMAILS_FILE, SUPPRESSION_FILE, TEMPLATE_DIR)
├── Business Calendar Utilities
│   ├── is_business_day(date)
│   ├── calculate_business_days(start_date, end_date)
│   └── add_business_days(start_date, num_days)
├── Persistence Layer
│   ├── ensure_data_files()
│   ├── load_json(filepath) -> list
│   └── save_json(filepath, data) -> bool
├── Suppression & CASL Management
│   ├── normalize_email(email) -> str
│   ├── is_suppressed(email, suppression_list) -> bool
│   ├── add_suppression(email, reason, source) -> dict
│   └── scrub_campaigns(emails, suppression_list) -> list
├── Lead Seeding & Directory Ingestion
│   ├── seed_default_leads() -> list (30 leads from markdown directories)
│   └── add_lead(lead_dict) -> dict
├── Sequence Progression & Cadence Engine
│   ├── evaluate_campaign_status(item, now, suppression_set) -> tuple(dict, str)
│   ├── process_followups(dry_run=False, send_simulated=False) -> dict
│   └── dispatch_due_emails(lead_id=None) -> dict
├── Template Rendering & Preview
│   ├── get_template_path(region) -> str
│   ├── render_email_content(stage, item, sender_info) -> dict (subject, body, footer)
│   └── preview_email(lead_id, stage) -> str
└── CLI Interface (argparse)
    ├── --status / -s: View formatted status table
    ├── --check / --dry-run: Check due emails without modifying disk
    ├── --run / --dispatch: Process and transition due emails
    ├── --suppress <email>: Suppress an email immediately
    ├── --seed-all: Seed all 30 qualified leads
    ├── --preview <lead_id>: Preview rendered follow-up email
    ├── --json: Return output in machine-readable JSON
    └── --daemon [--interval-hours N]: Run periodic scheduler loop
```

### 5.2 Business Day Calculation Model
```python
def calculate_business_days(start_dt: datetime.datetime, end_dt: datetime.datetime) -> int:
    """Calculates full business days elapsed between two UTC datetimes (Monday=0 ... Friday=4)."""
    if start_dt > end_dt:
        return 0
    current = start_dt.date() + datetime.timedelta(days=1)
    end_date = end_dt.date()
    biz_days = 0
    while current <= end_date:
        if current.weekday() < 5:  # Monday to Friday
            biz_days += 1
        current += datetime.timedelta(days=1)
    return biz_days
```

### 5.3 State Transition Machine
```
[ Lead Ingested / Initial Pitch ]
               │
               ▼
       `email_1_sent` (Day 1)
               │
               │ (Elapsed >= 3 Business Days)
               ▼
       `email_2_due` (Day 4)
               │
               │ [Dispatch / Send Execution]
               ▼
       `email_2_sent`
               │
               │ (Elapsed >= 5 Business Days after Email 2)
               ▼
       `email_3_due` (Day 9)
               │
               │ [Dispatch / Send Execution]
               ▼
       `email_3_sent` / `completed`
```

*At any stage:*
- Inbound Opt-Out / Unsubscribe → `suppressed` / `opt_out` (Permanently halted)
- Inbound Reply / Interest → `replied` / `in_negotiation` (Halted from automated sequence)

---

## 6. Verification and Testing Strategy

To guarantee 100% test coverage, schema validity, and execution reliability, a dedicated pytest test suite (`sales_package/tests/test_follow_up_scheduler.py` or `elitze_sentinel/backend/tests/test_follow_up_scheduler.py`) must be implemented.

### 6.1 Test Matrix

| Test ID | Test Function | Target Behavior & Assertions |
|---|---|---|
| **T-01** | `test_ensure_data_files` | Verifies `.frontier-data` directory, `emails.json`, and `suppression.json` are initialized properly. |
| **T-02** | `test_business_day_math` | Tests weekend skipping: Friday to Monday = 1 biz day, Friday to Wednesday = 3 biz days. |
| **T-03** | `test_stage_1_to_2_trigger` | Leads with `stage=1` and `biz_days >= 3` trigger `email_2_due` and assign correct regional templates. |
| **T-04** | `test_stage_2_to_3_trigger` | Leads with `stage=2`, `email_2_sent`, and `biz_days >= 5` trigger `email_3_due`. |
| **T-05** | `test_suppression_enforcement` | Leads in `suppression.json` are transitioned to `suppressed` and never trigger Email 2 or 3. |
| **T-06** | `test_case_insensitive_suppress` | Verifies `JOHN@WBM.CA` suppresses `john@wbm.ca`. |
| **T-07** | `test_template_routing` | Verifies `victoria_bc` & `vancouver_bc` leads select `outreach_sequence_local_bc.md` and `global` selects `outreach_sequence_global.md`. |
| **T-08** | `test_template_rendering` | Verifies placeholders `[First Name]`, `[Company Name]`, and CASL mandatory notices are properly formatted. |
| **T-09** | `test_idempotence` | Multiple consecutive runs on the same date produce zero duplicate actions or corrupt states. |
| **T-10** | `test_corrupt_json_recovery` | Corrupt JSON in `emails.json` is handled gracefully without crashing. |
| **T-11** | `test_cli_dry_run` | Running with `--dry-run` calculates due actions without mutating `emails.json`. |
| **T-12** | `test_cli_dispatch` | Running with `--dispatch` records sent timestamps into `history` and updates `current_status`. |
| **T-13** | `test_seed_all_leads` | Verifies all 30 leads from the markdown directories can be seeded with valid schemas. |

---

## 7. Synthesis & Comparative Audit Table

| Component / Requirement | Initial State (Observed) | Requirement R5 Standard | Gap / Defect Identified | Actionable Recommendation |
|---|---|---|---|---|
| **`.frontier-data/emails.json`** | 3 sample leads with partial tracking fields | Complete tracking database for active campaigns with full audit fields | Missing 27 leads, `next_followup_due`, `last_updated`, separate stage timestamps | Update schema with complete tracking fields and support seeding full 30-lead directory |
| **`.frontier-data/suppression.json`** | Empty list `[]` | Active suppression database with normalized emails and audit timestamps | No CLI to add suppressions; no normalization | Implement normalization and `--suppress` command |
| **`follow_up_scheduler.py` Timing Logic** | Simple calendar day delta `(now - sent_at).days >= 3` and `>= 8` | Precise business day elapsed time windows (Day 4 = +3 biz days; Day 9 = +5 biz days after Email 2) | Ignores weekends; anchors Stage 3 to Email 1 instead of Email 2; stalls after 1 run | Implement business day calculator and stage-specific timestamp anchoring |
| **`follow_up_scheduler.py` Lifecycle** | Mutates `stage=2` immediately on first trigger | Clean multi-stage state machine (`sent` → `due` → `sent` → `completed`) | Cannot distinguish due from sent; stops triggering | Implement discrete status transitions with history appending |
| **`follow_up_scheduler.py` CLI Options** | None (runs single hardcoded routine) | CLI interface with `--dry-run`, `--status`, `--dispatch`, `--suppress`, `--seed-all`, `--daemon`, `--json` | No CLI flags or programmatic output | Implement full `argparse` CLI with rich ASCII formatting and JSON mode |
| **`follow_up_automation_manager.md`** | 67 lines basic overview | Complete operations manual, systemd/cron setup, schema spec, and CLI reference | Lacks systemd/cron guides, complete schema, and operational runbook | Expand to comprehensive manual with full deployment guides and runbooks |
| **Automated Testing** | 0 tests for `sales_package` follow-up automation | 100% test coverage with pytest across all timing, CASL, and CLI logic | No test coverage for R5 | Implement comprehensive pytest test suite (`test_follow_up_scheduler.py`) |

---

## 8. Conclusion & Implementation Roadmap

The survey confirms that the foundation for Requirement R5 exists, but requires targeted engineering enhancements to become fully robust, production-ready, and legally CASL-compliant.

### Concrete Implementation Steps for Downstream Implementer:
1. **Enhance `sales_package/03_email_campaigns/follow_up_scheduler.py`**:
   - Add business day elapsed time calculation.
   - Implement discrete state machine lifecycle (`email_1_sent` → `email_2_due` → `email_2_sent` → `email_3_due` → `email_3_sent` → `completed`).
   - Add stage-specific timestamp anchoring for Day 9 calculations.
   - Implement normalized suppression management.
   - Add template rendering and variable substitution.
   - Implement comprehensive CLI (`--status`, `--dry-run`, `--dispatch`, `--seed-all`, `--suppress`, `--preview`, `--json`, `--daemon`).
2. **Expand `sales_package/03_email_campaigns/follow_up_automation_manager.md`**:
   - Add system architecture diagrams.
   - Add full JSON schema definition.
   - Add Linux `crontab`, `systemd` service/timer, Windows Task Scheduler, and Docker deployment guides.
   - Add CLI reference and operational runbook for reply handling and CASL 24h SLA.
3. **Upgrade `.frontier-data/emails.json` & `.frontier-data/suppression.json`**:
   - Ensure clean initial schema validity and support seeding of all 30 leads.
4. **Create Test Suite**:
   - Write `elitze_sentinel/backend/tests/test_follow_up_scheduler.py` covering all 13 test scenarios in Section 6.
   - Verify 100% green pass via `pytest`.
