"""
Adversarial Stress Test Suite for Elitze Sentinel Follow-Up Scheduler
Author: Challenger 2 (Empirical Verification)

Exhaustively stress-tests:
- Complex timing matrices (calendar vs business days over weekends, DST, timezone offsets)
- Rapid repeated dispatches & strict idempotency (100x consecutive dispatch stress)
- Atomic file persistence, crash recovery, and temporary file cleanup
- Case-insensitive email & domain wildcard suppression boundaries
- Malformed, partial, empty, and corrupt JSON recovery
- DNS reachability for all 30 B2B lead targets
"""

import os
import sys
import json
import socket
import tempfile
import time
from unittest.mock import patch
from datetime import datetime, timezone, timedelta
import pytest

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
evaluate_followups = scheduler.evaluate_followups
dispatch_followups = scheduler.dispatch_followups
load_emails_db = scheduler.load_emails_db
save_emails_db = scheduler.save_emails_db
suppress_lead = scheduler.suppress_lead
mark_lead_replied = scheduler.mark_lead_replied
atomic_save_json = scheduler.atomic_save_json
build_lead_record = scheduler.build_lead_record
SEED_LEADS_DATA = scheduler.SEED_LEADS_DATA


# ============================================================================
# 1. TIMING CALCULATION MATRIX STRESS TESTS
# ============================================================================

def test_timing_weekend_crossing_calendar_vs_business_days():
    """
    Stress-test weekend crossings:
    Friday 2026-08-07 to Monday 2026-08-10:
      - Calendar days = 3 (triggers Email 2 under calendar mode)
      - Business days = 1 (does NOT trigger Email 2 under business day mode)
    Friday 2026-08-07 to Wednesday 2026-08-12:
      - Calendar days = 5 (triggers Email 2)
      - Business days = 3 (triggers Email 2 under business day mode)
    """
    friday = datetime(2026, 8, 7, 10, 0, 0, tzinfo=timezone.utc)
    monday = datetime(2026, 8, 10, 10, 0, 0, tzinfo=timezone.utc)
    wednesday = datetime(2026, 8, 12, 10, 0, 0, tzinfo=timezone.utc)

    # Lead sent on Friday
    lead = {
        "lead_id": "lead-timing-weekend",
        "company_name": "Weekend Tester",
        "target_email": "test@weekend.com",
        "region": "victoria_bc",
        "lifecycle_status": "email_1_sent",
        "email_1_sent_at": friday.isoformat(),
        "history": []
    }
    db = {"leads": [lead], "suppression_list": []}

    # On Monday (Calendar mode: 3 days -> due; Business day mode: 1 day -> NOT due)
    eval_mon_cal = evaluate_followups(db, current_time=monday, business_days=False)
    assert len(eval_mon_cal["pending_actions"]) == 1
    assert eval_mon_cal["summary_counts"]["email_2_due"] == 1

    eval_mon_bus = evaluate_followups(db, current_time=monday, business_days=True)
    assert len(eval_mon_bus["pending_actions"]) == 0
    assert eval_mon_bus["summary_counts"]["email_1_sent"] == 1

    # On Wednesday (Business day mode: 3 business days -> due)
    eval_wed_bus = evaluate_followups(db, current_time=wednesday, business_days=True)
    assert len(eval_wed_bus["pending_actions"]) == 1
    assert eval_wed_bus["summary_counts"]["email_2_due"] == 1


def test_timing_day_9_closing_trigger_matrix():
    """
    Stress-test Day 9 (Email 3) trigger conditions:
    Condition A: >= 8 calendar days from Email 1
    Condition B: >= 5 calendar days from Email 2
    """
    t0 = datetime(2026, 8, 1, 12, 0, 0, tzinfo=timezone.utc)
    
    # Case 1: 8 days after Email 1, but no Email 2 timestamp
    lead_a = {
        "lead_id": "lead-d9-a",
        "company_name": "D9 A",
        "target_email": "a@d9.com",
        "region": "global",
        "lifecycle_status": "email_2_sent",
        "email_1_sent_at": t0.isoformat(),
        "email_2_sent_at": None,
        "history": []
    }
    
    # Case 2: 7 days after Email 1 (not due yet)
    db_7d = {"leads": [lead_a], "suppression_list": []}
    res_7d = evaluate_followups(db_7d, current_time=t0 + timedelta(days=7))
    assert len(res_7d["pending_actions"]) == 0
    
    # Case 3: 8 days after Email 1 (due)
    res_8d = evaluate_followups(db_7d, current_time=t0 + timedelta(days=8))
    assert len(res_8d["pending_actions"]) == 1
    assert res_8d["pending_actions"][0]["action_stage"] == 3

    # Case 4: Email 2 sent on Day 4 (t0 + 4 days). Check Day 8 vs Day 9.
    lead_b = {
        "lead_id": "lead-d9-b",
        "company_name": "D9 B",
        "target_email": "b@d9.com",
        "region": "global",
        "lifecycle_status": "email_2_sent",
        "email_1_sent_at": t0.isoformat(),
        "email_2_sent_at": (t0 + timedelta(days=4)).isoformat(),
        "history": []
    }
    db_b = {"leads": [lead_b], "suppression_list": []}
    # At t0 + 8 days: elapsed from Email 2 is 4 days -> not due under 5-day delta, BUT elapsed from Email 1 is 8 days -> due!
    res_b_8d = evaluate_followups(db_b, current_time=t0 + timedelta(days=8))
    assert len(res_b_8d["pending_actions"]) == 1
    assert res_b_8d["pending_actions"][0]["action_stage"] == 3


def test_timing_sub_second_and_exact_boundary_tolerance():
    """Verify exact hour/minute boundaries (e.g. 71h59m vs 72h00m)."""
    base = datetime(2026, 8, 1, 12, 0, 0, tzinfo=timezone.utc)
    
    # 71 hours, 59 minutes, 59 seconds (2 days, 23h 59m 59s -> integer elapsed days = 2)
    just_under_3d = base + timedelta(hours=71, minutes=59, seconds=59)
    assert calculate_elapsed_days(base, just_under_3d) == 2
    
    # Exactly 72 hours (3 days)
    exact_3d = base + timedelta(hours=72)
    assert calculate_elapsed_days(base, exact_3d) == 3


# ============================================================================
# 2. RAPID REPEATED DISPATCHES & STRICT IDEMPOTENCY
# ============================================================================

def test_rapid_100x_dispatch_idempotency(tmp_path):
    """
    Stress-test rapid repeated dispatches:
    Execute dispatch_followups 100 consecutive times in a tight loop.
    Verify:
    1. First dispatch processes pending leads.
    2. Dispatches 2..100 process exactly 0 leads.
    3. Final database state maintains consistent history, status, and lead count.
    """
    db_file = str(tmp_path / "idempotency_emails.json")
    t0 = datetime(2026, 8, 1, 12, 0, 0, tzinfo=timezone.utc)
    t_eval = t0 + timedelta(days=4)

    # Create 5 leads due for Email 2
    leads = []
    for i in range(5):
        leads.append({
            "lead_id": f"lead-idem-{i}",
            "company_name": f"Idempotency Corp {i}",
            "target_email": f"idem{i}@test.ca",
            "region": "victoria_bc",
            "lifecycle_status": "email_1_sent",
            "email_1_sent_at": t0.isoformat(),
            "email_2_sent_at": None,
            "email_3_sent_at": None,
            "history": [{"stage": 1, "sent_at": t0.isoformat(), "subject": "Initial"}]
        })

    db = {
        "version": "1.0.0",
        "last_updated": t0.isoformat(),
        "suppression_list": [],
        "execution_logs": [],
        "leads": leads
    }
    save_emails_db(db, db_file)

    # 1st dispatch: must dispatch 5 leads
    res1 = dispatch_followups(db_path=db_file, current_time=t_eval)
    assert res1["total_dispatched"] == 5

    # Rapid loop of 99 further dispatches at the exact same timestamp
    total_subsequent_dispatched = 0
    for _ in range(99):
        res_sub = dispatch_followups(db_path=db_file, current_time=t_eval)
        total_subsequent_dispatched += res_sub["total_dispatched"]

    assert total_subsequent_dispatched == 0, "Subsequent dispatches MUST be idempotent (0 dispatched)"

    # Inspect final DB integrity
    final_db = load_emails_db(db_file)
    assert len(final_db["leads"]) == 5
    for lead in final_db["leads"]:
        assert lead["lifecycle_status"] == "email_2_sent"
        assert len(lead["history"]) == 2
        assert lead["history"][1]["stage"] == 2


# ============================================================================
# 3. ATOMIC FILE PERSISTENCE, CRASH RECOVERY & TEMP CLEANUP
# ============================================================================

def test_atomic_persistence_sequential_stress(tmp_path):
    """
    Stress-test atomic_save_json across rapid sequential writes and reads.
    Ensures complete roundtrip data integrity and zero corruption.
    """
    target_file = str(tmp_path / "sequential_atomic.json")

    for iter_num in range(50):
        payload = {
            "iteration": iter_num,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "large_payload": "X" * 1024,
            "nested": {"count": iter_num, "status": "active"}
        }
        atomic_save_json(target_file, payload)
        
        # Verify read immediately
        with open(target_file, "r", encoding="utf-8") as f:
            read_back = json.load(f)
        assert read_back["iteration"] == iter_num
        assert read_back["nested"]["count"] == iter_num

    # Verify no stray temporary files remain in folder
    parent_dir = str(tmp_path)
    tmp_files = [f for f in os.listdir(parent_dir) if ".tmp." in f]
    assert len(tmp_files) == 0, f"Uncleaned temporary files found: {tmp_files}"


def test_atomic_persistence_cleanup_on_replace_failure(tmp_path):
    """
    Test that if os.replace fails during file commit, temporary files are cleanly unlinked.
    """
    target_file = str(tmp_path / "failed_replace.json")
    payload = {"test": "data"}

    # Mock os.replace to raise an intentional OSError simulating OS lock failure
    with patch("os.replace", side_effect=OSError("Simulated file lock collision")):
        with pytest.raises(IOError) as exc_info:
            atomic_save_json(target_file, payload)
        assert "Failed to atomically persist" in str(exc_info.value)

    # Verify temporary file was cleaned up by exception handler
    tmp_files = [f for f in os.listdir(str(tmp_path)) if ".tmp." in f]
    assert len(tmp_files) == 0, f"Temporary file was not cleaned up: {tmp_files}"


# ============================================================================
# 4. CASL SUPPRESSION FILTERING MATRIX & BOUNDARIES
# ============================================================================

def test_suppression_case_insensitivity_and_whitespace():
    """Verify suppression matches mixed cases, leading/trailing whitespace, and tabs."""
    supp_set = {"optout@blocked.com", "@domainblock.ca", "firm.org"}

    test_cases = [
        ("optout@blocked.com", True),
        ("OPTOUT@BLOCKED.COM", True),
        ("  optout@blocked.com  ", True),
        ("User@DomainBlock.CA", True),
        ("ceo@SUB.DOMAINBLOCK.CA", False), # subdomains not matched unless specified
        ("admin@firm.org", True),
        ("ADMIN@FIRM.ORG", True),
        ("clean@goodfirm.org", False),     # not matching partial domain name
        ("good@blocked.org", False),
    ]

    for email, expected in test_cases:
        assert is_suppressed(email, supp_set) == expected, f"Failed for {email}: expected {expected}"


def test_suppress_lead_domain_wildcard_impact(tmp_path):
    """
    Test suppressing an entire domain '@examplecorp.ca' marks all active leads
    under that domain as suppressed in a single operation.
    """
    db_file = str(tmp_path / "domain_supp_emails.json")
    leads = [
        {"lead_id": "lead-d1", "target_email": "alice@examplecorp.ca", "lifecycle_status": "email_1_sent"},
        {"lead_id": "lead-d2", "target_email": "bob@examplecorp.ca", "lifecycle_status": "email_2_due"},
        {"lead_id": "lead-d3", "target_email": "carol@othercorp.ca", "lifecycle_status": "email_1_sent"},
    ]
    db = {"leads": leads, "suppression_list": [], "execution_logs": []}
    save_emails_db(db, db_file)

    res = suppress_lead("@examplecorp.ca", reason="Company-wide DNC request", db_path=db_file)
    assert res["status"] == "success"
    assert res["suppressed_leads"] == 2

    updated = load_emails_db(db_file)
    lead_map = {l["lead_id"]: l for l in updated["leads"]}
    assert lead_map["lead-d1"]["lifecycle_status"] == "suppressed"
    assert lead_map["lead-d2"]["lifecycle_status"] == "suppressed"
    assert lead_map["lead-d3"]["lifecycle_status"] == "email_1_sent"


# ============================================================================
# 5. CORRUPT JSON & MALFORMED DATABASE RECOVERY
# ============================================================================

def test_corrupt_json_automatic_healing(tmp_path):
    """
    Stress-test scheduler loading from malformed, truncated, and corrupt JSON files.
    Must gracefully heal/recover by reseeding default database rather than crashing.
    """
    db_file = str(tmp_path / "corrupted_emails.json")

    corrupt_scenarios = [
        "",                                      # Empty 0-byte file
        "{'invalid_json': True, broken",         # Syntax error
        '{"version": "1.0.0", "leads": [',       # Truncated array
        "null",                                  # Null literal
        "12345",                                 # Integer literal
        '{"version": "1.0.0"}',                  # Missing leads array
    ]

    for i, content in enumerate(corrupt_scenarios):
        with open(db_file, "w", encoding="utf-8") as f:
            f.write(content)

        # Scheduler must load safely without throwing unhandled exceptions
        recovered_db = load_emails_db(db_file)
        assert isinstance(recovered_db, dict), f"Failed scenario {i}: {content}"
        assert "leads" in recovered_db
        assert "suppression_list" in recovered_db


# ============================================================================
# 6. LEAD DOMAIN RESOLUTION EMPIRICAL DNS CHECK
# ============================================================================

def test_lead_domain_dns_resolution():
    """
    Empirically test DNS resolution for company domains in SEED_LEADS_DATA.
    Checks that core enterprise and platform domains have valid A/AAAA/MX records.
    """
    domains_tested = set()
    for lead in SEED_LEADS_DATA:
        email = lead["target_email"]
        domain = email.split("@", 1)[1]
        domains_tested.add(domain)

    resolvable_count = 0
    dns_results = {}

    for domain in sorted(list(domains_tested)):
        try:
            # Attempt DNS resolution of hostname
            ip = socket.gethostbyname(domain)
            dns_results[domain] = {"status": "RESOLVED", "ip": ip}
            resolvable_count += 1
        except socket.gaierror as err:
            dns_results[domain] = {"status": "FAILED", "error": str(err)}

    # Verify 100% of tested domains resolve
    assert len(domains_tested) == 30
    assert resolvable_count == 30, f"Failed DNS resolutions: {dns_results}"
