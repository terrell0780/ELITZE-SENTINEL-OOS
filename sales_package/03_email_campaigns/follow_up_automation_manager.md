# Email Follow-Up Automation & Campaign Manager (`elitze.ca`)

**System Overview:** Production-grade follow-up scheduler and automated sequence engine orchestrating multi-stage B2B outreach (Email 1 -> Email 2 -> Email 3) across Victoria BC, Vancouver BC, and Global SaaS Acquirers. Enforces strict CASL Section 6(6) statutory compliance, atomic state persistence, dynamic markdown template variable rendering, and comprehensive operational automation.

---

## 1. System Architecture & Lifecycle State Machine

```
+----------------------------------------------------------------------------------------------------+
|                                ELITZE SENTINEL AUTOMATION FLOW                                     |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +--------------------------+          +--------------------------+          +----------------+   |
|   | 02_lead_lists/*.md       |  Seed    | .frontier-data/          |          | CASL Master    |   |
|   | (Victoria/Vancouver/Glob)| -------> | emails.json              | <------- | Suppression    |   |
|   +--------------------------+          +--------------------------+          | (.json & DB)   |   |
|                                                      |                        +----------------+   |
|                                                      v                                             |
|                                         +--------------------------+                               |
|                                         | Follow-Up Evaluator      |                               |
|                                         | (Day 4 & Day 9 Windows)  |                               |
|                                         +--------------------------+                               |
|                                                      |                                             |
|                               +----------------------+----------------------+                      |
|                               |                                             |                      |
|                     [Suppressed / Opt-Out]                               [Active]                  |
|                               |                                             |                      |
|                               v                                             v                      |
|                  +--------------------------+                  +--------------------------+        |
|                  | Halt Outreach Sequences  |                  | State Machine Transition |        |
|                  | status: 'suppressed'     |                  | Email 1 -> Email 2 -> 3  |        |
|                  +--------------------------+                  +--------------------------+        |
|                                                                             |                      |
|                                                                             v                      |
|                                                                +--------------------------+        |
|                                                                | Template Engine & Parser |        |
|                                                                | (Markdown + Placeholders)|        |
|                                                                +--------------------------+        |
|                                                                             |                      |
|                                                                             v                      |
|                                                                +--------------------------+        |
|                                                                | Dispatch & Atomic Commit |        |
|                                                                | (os.replace Tempfile)    |        |
|                                                                +--------------------------+        |
|                                                                             |                      |
|                                                                             v                      |
|                                                                +--------------------------+        |
|                                                                | Telemetry & Audit Logs   |        |
|                                                                | execution_logs[] Array   |        |
|                                                                +--------------------------+        |
+----------------------------------------------------------------------------------------------------+
```

### Outreach Sequence Progression Schedule

```
  DAY 1: INITIAL VALUE PROPOSITION (EMAIL 1)
  |-- Direct introduction to verified executive persona (CTO, VP Tech, M&A Lead)
  |-- References specific regional fit (Victoria PIPA / Vancouver MSSP / Global Micro-PE)
  \-- State: `email_1_sent` | Stage: 1

  DAY 4 (+3 Days / 72h): TECHNICAL DEEP DIVE (EMAIL 2)
  |-- Auto-triggered if prospect has not replied or opted out
  |-- Next.js 15 (App Router), FastAPI async kernel, MITRE ATT&CK SIEM translation
  |-- Pre-wired Stripe monetization and zero-marginal-cost Ollama/vLLM inference
  \-- State: `email_2_due` -> `email_2_sent` | Stage: 2

  DAY 9 (+5 Days after Email 2 / 8-9 Days Total): CLOSING EXCLUSIVITY OFFER (EMAIL 3)
  |-- Pre-marketplace notice before public listing on Acquire.com, Flippa & Dan.com
  |-- Private exclusivity buyout window with transparent valuation tier floors ($10k - $35k)
  \-- State: `email_3_due` -> `email_3_sent` -> `completed` | Stage: 3
```

---

## 2. Database Schema Specification (`.frontier-data/emails.json`)

The primary persistence layer utilizes a structured JSON document with atomic write guarantees, housing monitored leads, a centralized CASL suppression registry, and execution audit telemetry.

### Document Structure

```json
{
  "version": "1.0.0",
  "last_updated": "2026-08-19T19:22:27.058631+00:00",
  "suppression_list": [
    {
      "email": "optout-sample@example.com",
      "suppressed_at": "2026-08-17T19:21:35.500099+00:00",
      "reason": "CASL 24-hour statutory opt-out test"
    }
  ],
  "execution_logs": [
    {
      "timestamp": "2026-08-19T19:22:27.058631+00:00",
      "action": "seed_all_leads",
      "total_leads_seeded": 30,
      "details": "Initialized 30 prospect leads (10 Victoria BC, 10 Vancouver BC, 10 Global)."
    }
  ],
  "leads": [
    {
      "lead_id": "lead-vic-001",
      "company_name": "WBM Technologies",
      "contact_persona": "VP of Technology / AI Practice Lead",
      "target_email": "tech@wbm.ca",
      "region": "victoria_bc",
      "campaign_tier": "Tier 2 ($25,000)",
      "source_url": "https://wbm.ca",
      "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
      "lifecycle_status": "email_2_due",
      "email_1_sent_at": "2026-08-15T19:22:27.058631+00:00",
      "email_2_sent_at": null,
      "email_3_sent_at": null,
      "next_followup_due": "2026-08-19T19:22:27.058631+00:00",
      "suppression_reason": null,
      "last_updated": "2026-08-19T19:22:27.058631+00:00",
      "history": [
        {
          "stage": 1,
          "sent_at": "2026-08-15T19:22:27.058631+00:00",
          "subject": "Sovereign AI platform acquisition opportunity for WBM Technologies (elitze.ca)"
        }
      ],
      "_id": "lead-vic-001",
      "recipient_email": "tech@wbm.ca",
      "recipient_name": "VP of Technology / AI Practice Lead",
      "stage": 2,
      "current_status": "email_2_due",
      "sent_timestamp": "2026-08-15T19:22:27.058631+00:00",
      "casl_exemption_basis": "CASL § 6(6) Conspicuously Published B2B Email",
      "subject": "Sovereign AI platform acquisition opportunity for WBM Technologies (elitze.ca)",
      "email_2_ready_subject": "Re: Sovereign AI platform acquisition opportunity for WBM Technologies (elitze.ca)",
      "email_3_ready_subject": "Final check-in: elitze.ca domain & sovereign AI software asset for WBM Technologies",
      "email_2_template": "outreach_sequence_local_bc.md",
      "email_3_template": "outreach_sequence_local_bc.md"
    }
  ]
}
```

### Lead Field Definitions

| Field Name | Type | Description | Allowed Values / Constraints |
|---|---|---|---|
| `lead_id` | String | Unique immutable prospect identifier | `lead-vic-XXX`, `lead-van-XXX`, `lead-glob-XXX` |
| `company_name` | String | Commercial entity or platform name | E.g. "WBM Technologies", "D3 Security" |
| `contact_persona` | String | Verified executive job title / intake role | E.g. "VP of Technology", "M&A Director" |
| `target_email` | String | Target corporate delivery address | Must be RFC 5322 valid format |
| `region` | String | Geographic market segment | `"victoria_bc"`, `"vancouver_bc"`, `"global"` |
| `campaign_tier` | String | Valuation tier recommendation | `"Tier 1 ($10,000)"`, `"Tier 2 ($25,000)"`, `"Tier 3 ($35,000)"` |
| `source_url` | String | Conspicuous publication source URL | E.g. `"https://wbm.ca"` |
| `casl_basis` | String | Statutory legal basis for B2B transmission | CASL § 6(6) conspicuous publication |
| `lifecycle_status` | String | Active sequence state | `pending`, `email_1_sent`, `email_2_due`, `email_2_sent`, `email_3_due`, `email_3_sent`, `completed`, `suppressed`, `replied` |
| `email_1_sent_at` | String (ISO) | Timestamp of Email 1 dispatch | E.g. `"2026-08-15T19:00:00+00:00"` |
| `email_2_sent_at` | String (ISO) / Null | Timestamp of Email 2 dispatch | Set upon Stage 2 dispatch |
| `email_3_sent_at` | String (ISO) / Null | Timestamp of Email 3 dispatch | Set upon Stage 3 dispatch |
| `next_followup_due`| String (ISO) / Null | Next eligible follow-up trigger time | Computed automatically by engine |
| `suppression_reason`| String / Null | Reason for suppression | Set when user opts out or is suppressed |
| `last_updated` | String (ISO) | Last modification timestamp | Updated on every state transition |
| `history` | Array[Object] | Full immutable dispatch audit trail | List of `{ stage, sent_at, subject }` |

---

## 3. CLI Command Reference Manual

The follow-up scheduler CLI provides full control over the campaign automation pipeline:

```bash
# Display colorized status overview table of active pipeline stages
python sales_package/03_email_campaigns/follow_up_scheduler.py --status

# Dry-run evaluation: preview eligible follow-ups and rendered text without mutating DB
python sales_package/03_email_campaigns/follow_up_scheduler.py --dry-run --verbose

# Process and dispatch all pending follow-up sequences (Day 4 & Day 9)
python sales_package/03_email_campaigns/follow_up_scheduler.py --dispatch

# Dispatch a specific lead by ID
python sales_package/03_email_campaigns/follow_up_scheduler.py --dispatch --lead-id lead-vic-001

# Re-seed/sync all 30 B2B prospect leads into .frontier-data/emails.json
python sales_package/03_email_campaigns/follow_up_scheduler.py --seed-all --force

# Immediately suppress an email or whole domain under CASL (case-insensitive)
python sales_package/03_email_campaigns/follow_up_scheduler.py --suppress "tech@wbm.ca" --reason "Requested opt-out via reply"
python sales_package/03_email_campaigns/follow_up_scheduler.py --suppress "@competitor.com" --reason "Domain blacklist"

# Mark a prospect as replied to halt all automated follow-ups
python sales_package/03_email_campaigns/follow_up_scheduler.py --mark-replied "cto@smartdolphins.com"

# Output machine-readable JSON for integration with monitoring dashboards / CI/CD
python sales_package/03_email_campaigns/follow_up_scheduler.py --json --status
python sales_package/03_email_campaigns/follow_up_scheduler.py --json --dispatch

# Run continuous background daemon polling every 5 minutes (300 seconds)
python sales_package/03_email_campaigns/follow_up_scheduler.py --daemon --poll-interval 300

# Calculate elapsed time using Monday-Friday business days instead of calendar days
python sales_package/03_email_campaigns/follow_up_scheduler.py --status --business-days
```

---

## 4. Production Operations Runbooks

### Runbook A: Linux / macOS Crontab Schedule

Execute automated checks every weekday morning at 9:00 AM (Monday – Friday) to dispatch eligible follow-ups during optimal B2B engagement hours (9:00 AM – 10:30 AM).

```cron
# Edit crontab with: crontab -e
# Elitze Sentinel Follow-Up Automation Engine
0 9 * * 1-5 /usr/bin/python3 "/var/www/elitze-sentinel/sales_package/03_email_campaigns/follow_up_scheduler.py" --dispatch >> "/var/log/elitze-followup.log" 2>&1
```

### Runbook B: Linux Systemd Service & Timer Units

#### Service Unit: `/etc/systemd/system/elitze-followup.service`
```ini
[Unit]
Description=Elitze Sentinel Sovereign AI Follow-Up Campaign Dispatcher
After=network.target

[Service]
Type=oneshot
User=www-data
WorkingDirectory=/var/www/elitze-sentinel
ExecStart=/usr/bin/python3 sales_package/03_email_campaigns/follow_up_scheduler.py --dispatch
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

#### Timer Unit: `/etc/systemd/system/elitze-followup.timer`
```ini
[Unit]
Description=Trigger Elitze Sentinel Follow-Up Dispatcher Weekdays at 9:00 AM
RefuseManualStart=no
RefuseManualStop=no

[Timer]
OnCalendar=Mon..Fri *-*-* 09:00:00
Persistent=true
Unit=elitze-followup.service

[Install]
WantedBy=timers.target
```

Enable and activate the timer:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now elitze-followup.timer
sudo systemctl list-timers elitze-followup.timer
```

---

### Runbook C: Windows Task Scheduler (PowerShell Automation)

Run the following script in Administrator PowerShell to register an automated daily task running at 9:00 AM on weekdays:

```powershell
# Register-ElitzeFollowupTask.ps1
$TaskName = "ElitzeSentinelFollowUpDispatcher"
$PythonPath = (Get-Command python).Source
$ScriptPath = "c:\Elitze Sentinel Frontier Oos\sales_package\03_email_campaigns\follow_up_scheduler.py"
$WorkingDir = "c:\Elitze Sentinel Frontier Oos"

$Action = New-ScheduledTaskAction -Execute $PythonPath -Argument "$ScriptPath --dispatch" -WorkingDirectory $WorkingDir
$Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday, Tuesday, Wednesday, Thursday, Friday -At 9:00AM
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Automated Follow-Up Campaign Dispatcher for Elitze Sentinel" -Force
Write-Host "[+] Successfully registered Scheduled Task: $TaskName"
```

---

### Runbook D: Docker & Container Deployment

#### Background Worker Service (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  elitze-followup-daemon:
    image: python:3.11-slim
    container_name: elitze_followup_daemon
    restart: unless-stopped
    working_dir: /app
    volumes:
      - ./:/app
      - /app/.frontier-data:/app/.frontier-data
    command: python sales_package/03_email_campaigns/follow_up_scheduler.py --daemon --poll-interval 300
    environment:
      - PYTHONUNBUFFERED=1
      - TZ=America/Vancouver
```

---

## 5. CASL Statutory 24-Hour Suppression Compliance SLA

Under **Canadian Anti-Spam Legislation (CASL § 6(6))** and the **CRTC Commercial Electronic Message Regulations**:

1. **24-Hour Statutory Unsubscribe SLA**:
   - All unsubscribe requests, reply opt-outs ("UNSUBSCRIBE", "STOP", "REMOVE"), or privacy inquiries must be permanently suppressed in `.frontier-data/emails.json` and `.frontier-data/suppression.json` within **24 hours** (CRTC maximum statutory limit is 10 business days; Elitze Sentinel operates on an accelerated 24-hour SLA).
2. **Case-Insensitive Wildcard Matching**:
   - Suppression checks are strictly case-insensitive (`tech@wbm.ca` matches `TECH@WBM.CA`).
   - Domain-level suppression (`@example.com` or `example.com`) suppresses all current and future leads under that corporate domain.
3. **Atomic Persistence & Lock Safety**:
   - The scheduler uses `tempfile` creation followed by atomic `os.replace` to prevent race conditions or database corruption.
4. **Pre-Dispatch Verification Barrier**:
   - The engine validates every candidate against `load_suppression_set()` before generating or transmitting any email. Suppressed addresses are automatically transitioned to `suppressed` and bypassed.
5. **Sender Identification Mandatory Retention**:
   - Every rendered email strictly includes:
     - Clear sender identity (`Terrell, Owner / Lead Architect`)
     - Direct contact coordinates (`acquire@elitze.ca`, `+1 250 555-0199`)
     - Physical mailing address (`777 Fort Street, Suite 300, Victoria, BC, V8W 1G9, Canada`)
     - Functional one-click and reply opt-out mechanism.

---

## 6. Troubleshooting & Data Recovery

### Scenario 1: Stalled or Missing Follow-Ups
- **Symptom**: Lead is in `email_1_sent` but does not trigger `email_2_due`.
- **Diagnostics**:
  1. Run `python follow_up_scheduler.py --status` to inspect elapsed days.
  2. Check if the lead's email or domain exists in `suppression.json`.
  3. Verify `email_1_sent_at` timestamp is formatted in valid ISO 8601 format.
  4. Use `--dry-run --verbose` to see specific evaluation output.

### Scenario 2: Corrupted JSON File Recovery
- **Symptom**: `load_raw_json` fails with parse errors due to unexpected external edits.
- **Remedy**:
  1. The engine automatically handles corrupted files and falls back to a clean recovery state.
  2. To force a clean re-initialization of all 30 B2B prospect leads, run:
     ```bash
     python sales_package/03_email_campaigns/follow_up_scheduler.py --seed-all --force
     ```

### Scenario 3: Bulk Suppression Ingestion
- **Symptom**: Need to import a list of unsubscribed emails from external CRM (e.g. Apollo, Lemlist).
- **Remedy**:
  - Add emails directly to `.frontier-data/suppression.json` as a JSON array of strings, or execute:
    ```bash
    python sales_package/03_email_campaigns/follow_up_scheduler.py --suppress "unsub@domain.com"
    ```
