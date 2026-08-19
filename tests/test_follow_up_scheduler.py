"""
Pytest Test Suite for Elitze Sentinel Follow-Up Automation Scheduler
Tests timing calculations, state machine transitions, CASL suppression,
template variable rendering, database persistence, and CLI execution.
"""

import os
import sys
import json
import tempfile
import subprocess
from datetime import datetime, timezone, timedelta
import pytest

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import importlib.util

SCHEDULER_FILE_PATH = os.path.join(BASE_DIR, "sales_package", "03_email_campaigns", "follow_up_scheduler.py")
spec = importlib.util.spec_from_file_location("follow_up_scheduler", SCHEDULER_FILE_PATH)
scheduler = importlib.util.module_from_spec(spec)
spec.loader.exec_module(scheduler)

calculate_elapsed_days = scheduler.calculate_elapsed_days
normalize_email = scheduler.normalize_email
is_suppressed = scheduler.is_suppressed
load_suppression_set = scheduler.load_suppression_set
parse_markdown_templates = scheduler.parse_markdown_templates
render_email_content = scheduler.render_email_content
build_lead_record = scheduler.build_lead_record
seed_database = scheduler.seed_database
load_emails_db = scheduler.load_emails_db
save_emails_db = scheduler.save_emails_db
suppress_lead = scheduler.suppress_lead
mark_lead_replied = scheduler.mark_lead_replied
evaluate_followups = scheduler.evaluate_followups
dispatch_followups = scheduler.dispatch_followups
format_status_table = scheduler.format_status_table
SEED_LEADS_DATA = scheduler.SEED_LEADS_DATA
LOCAL_BC_TEMPLATE_PATH = scheduler.LOCAL_BC_TEMPLATE_PATH
GLOBAL_TEMPLATE_PATH = scheduler.GLOBAL_TEMPLATE_PATH


@pytest.fixture
def temp_env(tmp_path):
    """Create isolated temporary files for emails.json and suppression.json."""
    emails_file = str(tmp_path / "emails.json")
    suppression_file = str(tmp_path / "suppression.json")
    
    # Save empty initial files
    with open(emails_file, "w", encoding="utf-8") as f:
        json.dump([], f)
    with open(suppression_file, "w", encoding="utf-8") as f:
        json.dump([], f)
        
    return {
        "emails_file": emails_file,
        "suppression_file": suppression_file,
        "tmp_path": tmp_path
    }


# ============================================================================
# 1. TIMING & ELAPSED TIME TESTS
# ============================================================================

def test_elapsed_days_calendar():
    """Verify standard calendar elapsed days calculation."""
    base = datetime(2026, 8, 1, 12, 0, 0, tzinfo=timezone.utc)
    
    # Same time
    assert calculate_elapsed_days(base, base, business_days=False) == 0
    
    # +3 days (72 hours)
    plus_3 = base + timedelta(days=3)
    assert calculate_elapsed_days(base, plus_3, business_days=False) == 3
    
    # +4 days
    plus_4 = base + timedelta(days=4)
    assert calculate_elapsed_days(base, plus_4, business_days=False) == 4
    
    # +9 days
    plus_9 = base + timedelta(days=9)
    assert calculate_elapsed_days(base, plus_9, business_days=False) == 9
    
    # Past time (end before start)
    past = base - timedelta(days=2)
    assert calculate_elapsed_days(base, past, business_days=False) == 0


def test_elapsed_days_business_days():
    """Verify Monday-Friday business day calculations (excluding weekends)."""
    # 2026-08-07 is Friday, 2026-08-10 is Monday (1 business day, 3 calendar days)
    friday = datetime(2026, 8, 7, 12, 0, 0, tzinfo=timezone.utc)
    monday = datetime(2026, 8, 10, 12, 0, 0, tzinfo=timezone.utc)
    wednesday = datetime(2026, 8, 12, 12, 0, 0, tzinfo=timezone.utc)

    assert calculate_elapsed_days(friday, monday, business_days=True) == 1
    assert calculate_elapsed_days(friday, wednesday, business_days=True) == 3


def test_day_4_trigger_evaluation():
    """Day 4 timing trigger evaluation: 3+ days elapsed marks lead ready for Email 2."""
    now = datetime(2026, 8, 19, 12, 0, 0, tzinfo=timezone.utc)
    
    # Lead sent 4 days ago
    lead_due = {
        "lead_id": "test-lead-01",
        "company_name": "Acme Corp",
        "target_email": "cto@acme.ca",
        "region": "victoria_bc",
        "lifecycle_status": "email_1_sent",
        "email_1_sent_at": (now - timedelta(days=4)).isoformat(),
        "history": []
    }
    
    db = {"leads": [lead_due], "suppression_list": []}
    res = evaluate_followups(db, current_time=now)
    
    assert len(res["pending_actions"]) == 1
    action = res["pending_actions"][0]
    assert action["lead_id"] == "test-lead-01"
    assert action["action_stage"] == 2
    assert action["trigger_target_state"] == "email_2_sent"
    assert "Send Email 2" in action["action_name"]


def test_day_1_not_due_premature():
    """Day 1 lead (1 day elapsed) should NOT trigger follow-up."""
    now = datetime(2026, 8, 19, 12, 0, 0, tzinfo=timezone.utc)
    
    lead_premature = {
        "lead_id": "test-lead-02",
        "company_name": "Beta Inc",
        "target_email": "vp@beta.ca",
        "region": "vancouver_bc",
        "lifecycle_status": "email_1_sent",
        "email_1_sent_at": (now - timedelta(days=1)).isoformat(),
        "history": []
    }
    
    db = {"leads": [lead_premature], "suppression_list": []}
    res = evaluate_followups(db, current_time=now)
    
    assert len(res["pending_actions"]) == 0
    assert res["summary_counts"]["email_1_sent"] == 1


def test_day_9_trigger_evaluation():
    """Day 9 timing trigger evaluation: 8+ days from Email 1 (or 5+ days from Email 2) triggers Email 3."""
    now = datetime(2026, 8, 19, 12, 0, 0, tzinfo=timezone.utc)
    
    lead_closing = {
        "lead_id": "test-lead-03",
        "company_name": "Gamma Ltd",
        "target_email": "ceo@gamma.ca",
        "region": "victoria_bc",
        "lifecycle_status": "email_2_sent",
        "email_1_sent_at": (now - timedelta(days=9)).isoformat(),
        "email_2_sent_at": (now - timedelta(days=5)).isoformat(),
        "history": []
    }
    
    db = {"leads": [lead_closing], "suppression_list": []}
    res = evaluate_followups(db, current_time=now)
    
    assert len(res["pending_actions"]) == 1
    action = res["pending_actions"][0]
    assert action["lead_id"] == "test-lead-03"
    assert action["action_stage"] == 3
    assert action["trigger_target_state"] == "email_3_sent"
    assert "Send Email 3" in action["action_name"]


# ============================================================================
# 2. STATE MACHINE LIFECYCLE TRANSITIONS
# ============================================================================

def test_full_lifecycle_progression(temp_env):
    """Test full sequential lifecycle: Email 1 -> Email 2 -> Email 3 -> Completed."""
    emails_file = temp_env["emails_file"]
    start_time = datetime(2026, 8, 1, 12, 0, 0, tzinfo=timezone.utc)
    
    # Step 1: Initial state
    lead = {
        "lead_id": "lead-lifecycle-01",
        "company_name": "Lifecycle Test Inc",
        "contact_persona": "CTO",
        "target_email": "cto@lifecycle.ca",
        "region": "victoria_bc",
        "lifecycle_status": "email_1_sent",
        "email_1_sent_at": start_time.isoformat(),
        "email_2_sent_at": None,
        "email_3_sent_at": None,
        "history": [{"stage": 1, "sent_at": start_time.isoformat(), "subject": "Initial"}]
    }
    
    db = {"version": "1.0.0", "last_updated": start_time.isoformat(), "suppression_list": [], "execution_logs": [], "leads": [lead]}
    save_emails_db(db, emails_file)
    
    # Step 2: Day 4 dispatch (Email 2)
    day_4 = start_time + timedelta(days=4)
    res_e2 = dispatch_followups(db_path=emails_file, current_time=day_4)
    assert res_e2["total_dispatched"] == 1
    
    db_after_e2 = load_emails_db(emails_file)
    lead_e2 = db_after_e2["leads"][0]
    assert lead_e2["lifecycle_status"] == "email_2_sent"
    assert lead_e2["email_2_sent_at"] is not None
    assert len(lead_e2["history"]) == 2
    
    # Step 3: Day 9 dispatch (Email 3 / Completed)
    day_9 = start_time + timedelta(days=9)
    res_e3 = dispatch_followups(db_path=emails_file, current_time=day_9)
    assert res_e3["total_dispatched"] == 1
    
    db_after_e3 = load_emails_db(emails_file)
    lead_e3 = db_after_e3["leads"][0]
    assert lead_e3["lifecycle_status"] == "completed"
    assert lead_e3["email_3_sent_at"] is not None
    assert len(lead_e3["history"]) == 3
    
    # Step 4: Subsequent evaluation has 0 pending
    res_e4 = evaluate_followups(db_after_e3, current_time=day_9 + timedelta(days=1))
    assert len(res_e4["pending_actions"]) == 0
    assert res_e4["summary_counts"]["completed"] == 1


def test_mark_replied_halts_progression(temp_env):
    """Marking a lead as replied halts all further follow-up actions."""
    emails_file = temp_env["emails_file"]
    now = datetime(2026, 8, 19, 12, 0, 0, tzinfo=timezone.utc)
    
    lead = {
        "lead_id": "lead-reply-01",
        "company_name": "Reply Corp",
        "target_email": "reply@corp.ca",
        "region": "vancouver_bc",
        "lifecycle_status": "email_1_sent",
        "email_1_sent_at": (now - timedelta(days=5)).isoformat(),
        "history": []
    }
    db = {"leads": [lead], "suppression_list": [], "execution_logs": []}
    save_emails_db(db, emails_file)
    
    # Mark replied
    res = mark_lead_replied("reply@corp.ca", db_path=emails_file)
    assert res["status"] == "success"
    assert res["leads_updated"] == 1
    
    db_updated = load_emails_db(emails_file)
    assert db_updated["leads"][0]["lifecycle_status"] == "replied"
    
    # Evaluate - should be 0 pending actions
    eval_res = evaluate_followups(db_updated, current_time=now)
    assert len(eval_res["pending_actions"]) == 0
    assert eval_res["summary_counts"]["replied"] == 1


# ============================================================================
# 3. CASL SUPPRESSION & OPT-OUT TESTS
# ============================================================================

def test_case_insensitive_suppression():
    """Verify CASL suppression matches regardless of case formatting."""
    supp_set = {"optout@example.com", "tech@wbm.ca"}
    
    assert is_suppressed("optout@example.com", supp_set) is True
    assert is_suppressed("OPTOUT@EXAMPLE.COM", supp_set) is True
    assert is_suppressed("Tech@WBM.CA ", supp_set) is True
    assert is_suppressed("clean@wbm.ca", supp_set) is False


def test_domain_level_suppression():
    """Verify domain-level wildcard suppression."""
    supp_set = {"@blockedcompany.com", "baddomain.ca"}
    
    assert is_suppressed("ceo@blockedcompany.com", supp_set) is True
    assert is_suppressed("CTO@BlockedCompany.COM", supp_set) is True
    assert is_suppressed("sales@baddomain.ca", supp_set) is True
    assert is_suppressed("info@goodcompany.com", supp_set) is False


def test_suppress_lead_function(temp_env):
    """Verify suppress_lead mutates database, suppression list, and active leads."""
    emails_file = temp_env["emails_file"]
    now = datetime(2026, 8, 19, 12, 0, 0, tzinfo=timezone.utc)
    
    lead = {
        "lead_id": "lead-supp-01",
        "company_name": "Supp Test",
        "target_email": "supp@test.ca",
        "region": "victoria_bc",
        "lifecycle_status": "email_1_sent",
        "email_1_sent_at": (now - timedelta(days=4)).isoformat(),
        "history": []
    }
    db = {"leads": [lead], "suppression_list": [], "execution_logs": []}
    save_emails_db(db, emails_file)
    
    # Suppress target
    supp_res = suppress_lead("supp@test.ca", reason="CASL opt-out", db_path=emails_file)
    assert supp_res["status"] == "success"
    assert supp_res["suppressed_leads"] == 1
    
    db_updated = load_emails_db(emails_file)
    assert db_updated["leads"][0]["lifecycle_status"] == "suppressed"
    assert db_updated["leads"][0]["suppression_reason"] == "CASL opt-out"
    
    # Ensure no pending actions
    eval_res = evaluate_followups(db_updated, current_time=now)
    assert len(eval_res["pending_actions"]) == 0
    assert eval_res["summary_counts"]["suppressed"] == 1


# ============================================================================
# 4. TEMPLATE RENDERING TESTS
# ============================================================================

def test_template_parsing_local_bc():
    """Verify extraction of local BC email sequences from markdown."""
    assert os.path.exists(LOCAL_BC_TEMPLATE_PATH)
    templates = parse_markdown_templates(LOCAL_BC_TEMPLATE_PATH)
    
    assert 1 in templates
    assert 2 in templates
    assert 3 in templates
    assert "Sovereign AI platform" in templates[1]["subject"]
    assert "Technical" in templates[2]["subject"] or "Re:" in templates[2]["subject"]
    assert "Final check-in" in templates[3]["subject"] or "Exclusivity" in templates[3]["subject"]


def test_template_parsing_global():
    """Verify extraction of global email sequences from markdown."""
    assert os.path.exists(GLOBAL_TEMPLATE_PATH)
    templates = parse_markdown_templates(GLOBAL_TEMPLATE_PATH)
    
    assert 1 in templates
    assert 2 in templates
    assert 3 in templates
    assert "Acquisition Opportunity" in templates[1]["subject"] or "elitze.ca" in templates[1]["subject"]


def test_render_email_placeholders():
    """Verify dynamic placeholder substitution in rendered email templates."""
    lead = {
        "lead_id": "lead-vic-001",
        "company_name": "WBM Technologies",
        "contact_persona": "VP of Technology / AI Practice Lead",
        "target_email": "tech@wbm.ca",
        "region": "victoria_bc"
    }
    
    subj, body = render_email_content(lead, 2)
    
    assert "WBM Technologies" in subj
    assert "[Company Name]" not in subj
    assert "[First Name]" not in body
    assert "[Your Name]" not in body
    assert "elitze.ca" in body
    assert "CASL Section 6(6)" in body or "UNSUBSCRIBE" in body


# ============================================================================
# 5. DATABASE SEEDING & 30-LEAD SCHEMA VALIDATION
# ============================================================================

def test_seed_leads_data_count():
    """Verify exactly 30 seed leads exist in specification."""
    assert len(SEED_LEADS_DATA) == 30
    
    vic_leads = [l for l in SEED_LEADS_DATA if l["region"] == "victoria_bc"]
    van_leads = [l for l in SEED_LEADS_DATA if l["region"] == "vancouver_bc"]
    glob_leads = [l for l in SEED_LEADS_DATA if l["region"] == "global"]
    
    assert len(vic_leads) == 10
    assert len(van_leads) == 10
    assert len(glob_leads) == 10


def test_build_lead_record_schema():
    """Verify built lead record has all mandatory fields and valid types."""
    ref_time = datetime(2026, 8, 19, 12, 0, 0, tzinfo=timezone.utc)
    spec = SEED_LEADS_DATA[0]
    lead = build_lead_record(spec, ref_time)
    
    required_keys = [
        "lead_id", "company_name", "contact_persona", "target_email",
        "region", "campaign_tier", "source_url", "casl_basis",
        "lifecycle_status", "email_1_sent_at", "email_2_sent_at",
        "email_3_sent_at", "next_followup_due", "suppression_reason",
        "last_updated", "history", "_id", "recipient_email",
        "recipient_name", "stage", "current_status", "sent_timestamp"
    ]
    
    for key in required_keys:
        assert key in lead, f"Missing required key: {key}"
        
    assert "@" in lead["target_email"]
    assert lead["region"] in ("victoria_bc", "vancouver_bc", "global")
    assert isinstance(lead["history"], list)
    assert len(lead["history"]) >= 1


def test_seed_database_execution(temp_env):
    """Test seed_database initializes all 30 leads and top-level lists."""
    emails_file = temp_env["emails_file"]
    
    # Save seed using custom file path
    ref_time = datetime.now(timezone.utc)
    leads = [build_lead_record(spec, ref_time) for spec in SEED_LEADS_DATA]
    db_structure = {
        "version": "1.0.0",
        "last_updated": ref_time.isoformat(),
        "suppression_list": [{"email": "optout-sample@example.com", "suppressed_at": ref_time.isoformat(), "reason": "Test"}],
        "execution_logs": [{"timestamp": ref_time.isoformat(), "action": "seed_all_leads", "total_leads_seeded": 30}],
        "leads": leads
    }
    save_emails_db(db_structure, emails_file)
    
    loaded = load_emails_db(emails_file)
    assert len(loaded["leads"]) == 30
    assert len(loaded["suppression_list"]) == 1
    assert len(loaded["execution_logs"]) == 1


# ============================================================================
# 6. ATOMIC PERSISTENCE & DATA INTEGRITY TESTS
# ============================================================================

def test_atomic_persistence(temp_env):
    """Test atomic file persistence and roundtrip reading."""
    emails_file = temp_env["emails_file"]
    
    data = {
        "version": "1.0.0",
        "last_updated": "2026-08-19T12:00:00Z",
        "suppression_list": [],
        "execution_logs": [],
        "leads": [{"lead_id": "atomic-test", "company_name": "Atomic Inc"}]
    }
    
    save_emails_db(data, emails_file)
    loaded = load_emails_db(emails_file)
    
    assert loaded["version"] == "1.0.0"
    assert len(loaded["leads"]) == 1
    assert loaded["leads"][0]["lead_id"] == "atomic-test"


# ============================================================================
# 7. CLI INTEGRATION TESTS
# ============================================================================

def test_cli_status_command():
    """Verify CLI --status command runs successfully and returns code 0."""
    script_path = os.path.join(BASE_DIR, "sales_package", "03_email_campaigns", "follow_up_scheduler.py")
    res = subprocess.run(
        [sys.executable, script_path, "--status"],
        capture_output=True,
        text=True,
        cwd=BASE_DIR
    )
    assert res.returncode == 0
    assert "ELITZE SENTINEL" in res.stdout
    assert "PIPELINE STATUS SUMMARY" in res.stdout
    assert "Total Monitored Leads" in res.stdout


def test_cli_dry_run_command():
    """Verify CLI --dry-run --verbose command outputs preview without errors."""
    script_path = os.path.join(BASE_DIR, "sales_package", "03_email_campaigns", "follow_up_scheduler.py")
    res = subprocess.run(
        [sys.executable, script_path, "--dry-run", "--verbose"],
        capture_output=True,
        text=True,
        cwd=BASE_DIR
    )
    assert res.returncode == 0
    assert "PENDING FOLLOW-UP DISPATCH QUEUE" in res.stdout


def test_cli_json_status():
    """Verify CLI --json --status produces valid JSON output."""
    script_path = os.path.join(BASE_DIR, "sales_package", "03_email_campaigns", "follow_up_scheduler.py")
    res = subprocess.run(
        [sys.executable, script_path, "--json", "--status"],
        capture_output=True,
        text=True,
        cwd=BASE_DIR
    )
    assert res.returncode == 0
    parsed = json.loads(res.stdout)
    assert "summary_counts" in parsed
    assert "pending_actions" in parsed
    assert parsed["summary_counts"]["total"] >= 30
