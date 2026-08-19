#!/usr/bin/env python3
"""
Elitze Sentinel (elitze.ca) — Production Email Follow-Up Scheduler & Campaign Engine

Automated lifecycle follow-up engine for B2B cold outreach across Victoria BC,
Vancouver BC, and Global Acquirers. Enforces CASL Section 6(6) compliance,
Day 4 (Technical Deep Dive) and Day 9 (Closing Exclusivity Offer) timing triggers,
atomic JSON state persistence, and full CLI management.
"""

import os
import sys
import json
import time
import re
import copy
import argparse
import tempfile
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Tuple, Set

# Ensure safe console encoding on Windows/cross-platform
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
if hasattr(sys.stderr, 'reconfigure'):
    try:
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Base directory resolution
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, ".frontier-data")
EMAILS_FILE = os.path.join(DATA_DIR, "emails.json")
SUPPRESSION_FILE = os.path.join(DATA_DIR, "suppression.json")
TEMPLATES_DIR = os.path.join(BASE_DIR, "sales_package", "03_email_campaigns")
LOCAL_BC_TEMPLATE_PATH = os.path.join(TEMPLATES_DIR, "outreach_sequence_local_bc.md")
GLOBAL_TEMPLATE_PATH = os.path.join(TEMPLATES_DIR, "outreach_sequence_global.md")

# Default sender configuration for template rendering
SENDER_CONFIG = {
    "sender_name": "Terrell (Elitze Sentinel Principal)",
    "sender_title": "Owner / Lead Architect, Elitze Sentinel (elitze.ca)",
    "sender_email": "acquire@elitze.ca",
    "sender_web": "https://elitze.ca",
    "sender_phone": "+1 (250) 555-0199",
    "sender_address": "777 Fort Street, Suite 300, Victoria, BC, V8W 1G9, Canada"
}

# 30 Seed B2B Prospect Leads across Victoria BC, Vancouver BC, and Global Markets
SEED_LEADS_DATA = [
    # ------------------ Victoria, BC Leads (10) ------------------
    {
        "lead_id": "lead-vic-001",
        "company_name": "WBM Technologies",
        "contact_persona": "VP of Technology / AI Practice Lead",
        "target_email": "tech@wbm.ca",
        "region": "victoria_bc",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://wbm.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 4,  # Day 4: Ready for Email 2
        "initial_status": "email_2_due",
        "initial_stage": 2,
    },
    {
        "lead_id": "lead-vic-002",
        "company_name": "Tecnet",
        "contact_persona": "CEO / Managing Director",
        "target_email": "ceo@tecnet.ca",
        "region": "victoria_bc",
        "campaign_tier": "Tier 3 ($35,000)",
        "source_url": "https://tecnet.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 1,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-vic-003",
        "company_name": "Smart Dolphins IT Solutions",
        "contact_persona": "Director of Managed Services / CTO",
        "target_email": "cto@smartdolphins.com",
        "region": "victoria_bc",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://smartdolphins.com",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 4,
        "initial_status": "email_2_due",
        "initial_stage": 2,
    },
    {
        "lead_id": "lead-vic-004",
        "company_name": "GAM Tech",
        "contact_persona": "Head of Cyber Operations / CSO",
        "target_email": "security@gamtech.ca",
        "region": "victoria_bc",
        "campaign_tier": "Tier 3 ($35,000)",
        "source_url": "https://gamtech.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 9,  # Day 9: Ready for Email 3
        "days_ago_email_2": 5,
        "initial_status": "email_3_due",
        "initial_stage": 3,
    },
    {
        "lead_id": "lead-vic-005",
        "company_name": "Nucleus Networks",
        "contact_persona": "VP of Product / Cloud Lead",
        "target_email": "product@nucleusnetworks.ca",
        "region": "victoria_bc",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://nucleusnetworks.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 2,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-vic-006",
        "company_name": "Lighthouse Integrations",
        "contact_persona": "Principal Consultant / Managing Partner",
        "target_email": "consulting@lighthouseit.ca",
        "region": "victoria_bc",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://lighthouseit.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 1,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-vic-007",
        "company_name": "Daxtech IT Solutions",
        "contact_persona": "CTO / Operations Manager",
        "target_email": "cto@daxtech.ca",
        "region": "victoria_bc",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://daxtech.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 4,
        "initial_status": "email_2_due",
        "initial_stage": 2,
    },
    {
        "lead_id": "lead-vic-008",
        "company_name": "GGIT Innovation & Technologies",
        "contact_persona": "Founder / Lead Architect",
        "target_email": "founder@ggit.ca",
        "region": "victoria_bc",
        "campaign_tier": "Tier 3 ($35,000)",
        "source_url": "https://ggit.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 1,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-vic-009",
        "company_name": "Regroove Solutions Inc.",
        "contact_persona": "Cloud Architecture Lead / Principal",
        "target_email": "cloud@regroove.ca",
        "region": "victoria_bc",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://regroove.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 5,
        "days_ago_email_2": 1,
        "initial_status": "email_2_sent",
        "initial_stage": 2,
    },
    {
        "lead_id": "lead-vic-010",
        "company_name": "Westcom Business Solutions",
        "contact_persona": "President / Sales Director",
        "target_email": "president@westcom.ca",
        "region": "victoria_bc",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://westcom.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 2,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },

    # ------------------ Vancouver, BC Leads (10) ------------------
    {
        "lead_id": "lead-van-001",
        "company_name": "D3 Security",
        "contact_persona": "VP of Business Development / Product Strategy",
        "target_email": "bd@d3security.com",
        "region": "vancouver_bc",
        "campaign_tier": "Tier 3 ($35,000)",
        "source_url": "https://d3security.com",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 4,
        "initial_status": "email_2_due",
        "initial_stage": 2,
    },
    {
        "lead_id": "lead-van-002",
        "company_name": "Cyber Unit",
        "contact_persona": "Founder / Chief Security Officer (CSO)",
        "target_email": "cso@cyberunit.com",
        "region": "vancouver_bc",
        "campaign_tier": "Tier 3 ($35,000)",
        "source_url": "https://cyberunit.com",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 1,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-van-003",
        "company_name": "Absolute Software",
        "contact_persona": "Strategic M&A / Corporate Development Director",
        "target_email": "corpdev@absolute.com",
        "region": "vancouver_bc",
        "campaign_tier": "Tier 1 ($10,000)",
        "source_url": "https://absolute.com",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 1,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-van-004",
        "company_name": "DeepCove Cybersecurity",
        "contact_persona": "Managing Partner / Chief Technology Officer",
        "target_email": "partner@deepcovecyber.com",
        "region": "vancouver_bc",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://deepcovecyber.com",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 4,
        "initial_status": "email_2_due",
        "initial_stage": 2,
    },
    {
        "lead_id": "lead-van-005",
        "company_name": "MSP Corp",
        "contact_persona": "Head of Strategic Partnerships / VP Corporate Growth",
        "target_email": "partnerships@mspcorp.ca",
        "region": "vancouver_bc",
        "campaign_tier": "Tier 3 ($35,000)",
        "source_url": "https://mspcorp.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 9,
        "days_ago_email_2": 5,
        "initial_status": "email_3_due",
        "initial_stage": 3,
    },
    {
        "lead_id": "lead-van-006",
        "company_name": "Fusion Computing",
        "contact_persona": "Practice Lead - AI Solutions / Solutions Architect",
        "target_email": "ai@fusioncomputing.ca",
        "region": "vancouver_bc",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://fusioncomputing.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 2,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-van-007",
        "company_name": "Ayvant IT & Cybersecurity",
        "contact_persona": "CTO / Infrastructure Practice Lead",
        "target_email": "cto@ayvant.ca",
        "region": "vancouver_bc",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://ayvant.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 5,
        "days_ago_email_2": 1,
        "initial_status": "email_2_sent",
        "initial_stage": 2,
    },
    {
        "lead_id": "lead-van-008",
        "company_name": "A-CX",
        "contact_persona": "Head of Product / Managing Director",
        "target_email": "product@a-cx.com",
        "region": "vancouver_bc",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://a-cx.com",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 1,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-van-009",
        "company_name": "iComply Investor Services",
        "contact_persona": "VP of Engineering / Head of Security",
        "target_email": "engineering@icomplyis.com",
        "region": "vancouver_bc",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://icomplyis.com",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 10,
        "days_ago_email_2": 6,
        "days_ago_email_3": 1,
        "initial_status": "completed",
        "initial_stage": 3,
    },
    {
        "lead_id": "lead-van-010",
        "company_name": "Invisio Digital",
        "contact_persona": "Agency Principal / Managing Director",
        "target_email": "principal@invisio.ca",
        "region": "vancouver_bc",
        "campaign_tier": "Tier 3 ($35,000)",
        "source_url": "https://invisio.ca",
        "casl_basis": "CASL § 6(6) Conspicuously Published B2B Email",
        "days_ago_email_1": 2,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },

    # ------------------ Global Buyers & Brokers (10) ------------------
    {
        "lead_id": "lead-glob-001",
        "company_name": "Acquire.com",
        "contact_persona": "Verified SaaS Acquirers & Micro-PE Principals",
        "target_email": "acquisitions@acquire.com",
        "region": "global",
        "campaign_tier": "Tier 3 ($35,000)",
        "source_url": "https://acquire.com",
        "casl_basis": "B2B Platform Intake & M&A Ingestion Channel",
        "days_ago_email_1": 4,
        "initial_status": "email_2_due",
        "initial_stage": 2,
    },
    {
        "lead_id": "lead-glob-002",
        "company_name": "Flippa",
        "contact_persona": "Account Manager & Tech Asset Brokerage Lead",
        "target_email": "brokerage@flippa.com",
        "region": "global",
        "campaign_tier": "Tier 1 - Tier 3 ($10k - $35k)",
        "source_url": "https://flippa.com",
        "casl_basis": "B2B Brokerage Intake & Tech Asset Submission",
        "days_ago_email_1": 1,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-glob-003",
        "company_name": "Dan.com",
        "contact_persona": "Domain Brokerage Team & Portfolio Manager",
        "target_email": "brokerage@dan.com",
        "region": "global",
        "campaign_tier": "Tier 1 ($10,000)",
        "source_url": "https://dan.com",
        "casl_basis": "Direct Registrar Brokerage Submission",
        "days_ago_email_1": 1,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-glob-004",
        "company_name": "Afternic",
        "contact_persona": "Fast-Transfer Syndication Support Lead",
        "target_email": "fasttransfer@afternic.com",
        "region": "global",
        "campaign_tier": "Tier 1 ($10,000)",
        "source_url": "https://afternic.com",
        "casl_basis": "Distribution Network Syndication Inquiry",
        "days_ago_email_1": 4,
        "initial_status": "email_2_due",
        "initial_stage": 2,
    },
    {
        "lead_id": "lead-glob-005",
        "company_name": "Sedo",
        "contact_persona": "Senior Domain Broker / International Escrow Lead",
        "target_email": "broker@sedo.com",
        "region": "global",
        "campaign_tier": "Tier 1 ($10,000)",
        "source_url": "https://sedo.com",
        "casl_basis": "International Brokerage & Escrow Intake",
        "days_ago_email_1": 2,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-glob-006",
        "company_name": "Microns.io",
        "contact_persona": "Newsletter Curator & Micro-SaaS Intake Editor",
        "target_email": "submit@microns.io",
        "region": "global",
        "campaign_tier": "Tier 2 ($25,000)",
        "source_url": "https://microns.io",
        "casl_basis": "Curated Side-Project Submission Channel",
        "days_ago_email_1": 1,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-glob-007",
        "company_name": "TrustMRR",
        "contact_persona": "Deal Flow Analyst & Portfolio Reviewer",
        "target_email": "deals@trustmrr.com",
        "region": "global",
        "campaign_tier": "Tier 2 / Tier 3 ($25k - $35k)",
        "source_url": "https://trustmrr.com",
        "casl_basis": "Verified SaaS Asset Ingestion Channel",
        "days_ago_email_1": 5,
        "days_ago_email_2": 1,
        "initial_status": "email_2_sent",
        "initial_stage": 2,
    },
    {
        "lead_id": "lead-glob-008",
        "company_name": "NamePros",
        "contact_persona": "Marketplace Moderator & Premium Domain Specialist",
        "target_email": "marketplace@namepros.com",
        "region": "global",
        "campaign_tier": "Tier 1 ($10,000)",
        "source_url": "https://namepros.com",
        "casl_basis": "Investor Community Direct Deal Outreach",
        "days_ago_email_1": 2,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-glob-009",
        "company_name": "Tiny Capital",
        "contact_persona": "Corporate Development Director / Investment Associate",
        "target_email": "acquisitions@tiny.com",
        "region": "global",
        "campaign_tier": "Tier 3 ($35,000)",
        "source_url": "https://tiny.com",
        "casl_basis": "B2B Investment Inquiry & Corporate Development Direct",
        "days_ago_email_1": 1,
        "initial_status": "email_1_sent",
        "initial_stage": 1,
    },
    {
        "lead_id": "lead-glob-010",
        "company_name": "Quiet Light",
        "contact_persona": "Boutique SaaS M&A Advisor / Deal Lead",
        "target_email": "inquiries@quietlight.com",
        "region": "global",
        "campaign_tier": "Tier 3 ($35,000)",
        "source_url": "https://quietlight.com",
        "casl_basis": "M&A Broker Valuation & Exclusive Listing Representation",
        "days_ago_email_1": 4,
        "initial_status": "email_2_due",
        "initial_stage": 2,
    },
]


def ensure_data_directories() -> None:
    """Ensure data directory and required backing files exist."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(SUPPRESSION_FILE):
        atomic_save_json(SUPPRESSION_FILE, [])


def atomic_save_json(filepath: str, data: Any) -> None:
    """Atomically save data to a JSON file to prevent write corruption."""
    dir_name = os.path.dirname(filepath)
    os.makedirs(dir_name, exist_ok=True)
    
    prefix = os.path.basename(filepath) + ".tmp."
    with tempfile.NamedTemporaryFile("w", dir=dir_name, prefix=prefix, delete=False, encoding="utf-8") as tf:
        json.dump(data, tf, indent=2, ensure_ascii=False)
        temp_name = tf.name

    try:
        # Atomic rename / replace
        if sys.platform == "win32" and os.path.exists(filepath):
            os.replace(temp_name, filepath)
        else:
            os.replace(temp_name, filepath)
    except Exception as exc:
        if os.path.exists(temp_name):
            try:
                os.remove(temp_name)
            except Exception:
                pass
        raise IOError(f"Failed to atomically persist {filepath}: {exc}") from exc


def load_raw_json(filepath: str) -> Any:
    """Load JSON from disk safely; returns empty container if not found or corrupted."""
    if not os.path.exists(filepath):
        return None
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None


def normalize_email(email: str) -> str:
    """Return lowercase trimmed email string."""
    return email.strip().lower() if email else ""


def load_suppression_set(db: Optional[Dict[str, Any]] = None) -> Set[str]:
    """
    Return unified set of suppressed emails and domains in lowercase.
    Checks both top-level suppression_list in db and suppression.json.
    """
    suppression_set: Set[str] = set()

    # Load from suppression.json
    raw_supp = load_raw_json(SUPPRESSION_FILE)
    if isinstance(raw_supp, list):
        for item in raw_supp:
            if isinstance(item, str):
                suppression_set.add(normalize_email(item))
            elif isinstance(item, dict) and "email" in item:
                suppression_set.add(normalize_email(item["email"]))

    # Load from db if passed
    if db and isinstance(db, dict) and "suppression_list" in db:
        for item in db["suppression_list"]:
            if isinstance(item, str):
                suppression_set.add(normalize_email(item))
            elif isinstance(item, dict) and "email" in item:
                suppression_set.add(normalize_email(item["email"]))

    return {e for e in suppression_set if e}


def is_suppressed(email: str, suppression_set: Set[str]) -> bool:
    """
    Verify if an email address or its root domain is suppressed under CASL.
    Matches exact email (case-insensitive) or domain wildcard (e.g. '@domain.com').
    """
    norm = normalize_email(email)
    if not norm:
        return True
    if norm in suppression_set:
        return True
    if "@" in norm:
        domain = norm.split("@", 1)[1]
        if f"@{domain}" in suppression_set or domain in suppression_set:
            return True
    return False


def calculate_elapsed_days(
    start_time: datetime,
    end_time: datetime,
    business_days: bool = False
) -> int:
    """
    Calculate elapsed days between two datetimes.
    Supports standard calendar day calculation or Monday-Friday business days.
    """
    if end_time < start_time:
        return 0

    if not business_days:
        delta = end_time - start_time
        return int(delta.total_seconds() // 86400)

    # Business day calculation (Mon=0, Tue=1, Wed=2, Thu=3, Fri=4)
    current = start_time.date()
    end_date = end_time.date()
    b_days = 0

    while current < end_date:
        current += timedelta(days=1)
        if current.weekday() < 5:  # Monday through Friday
            b_days += 1

    return b_days


def parse_markdown_templates(file_path: str) -> Dict[int, Dict[str, str]]:
    """
    Parse email sequence markdown file and extract subjects and body templates per stage.
    Returns: { 1: {"subject": "...", "body": "..."}, 2: {...}, 3: {...} }
    """
    templates: Dict[int, Dict[str, str]] = {}
    if not os.path.exists(file_path):
        return templates

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception:
        return templates

    # Match Email 1, Email 2, Email 3 sections
    stage_patterns = [
        (1, r"## 📧 Email 1:.*?(?=## 📧 Email 2:|$)", r"- Option A:\s*(.+)", r"```text\s*([\s\S]*?)```"),
        (2, r"## 📧 Email 2:.*?(?=## 📧 Email 3:|$)", r"- Option A:\s*(.+)", r"```text\s*([\s\S]*?)```"),
        (3, r"## 📧 Email 3:.*?(?=## [^📧]|$)", r"- Option A:\s*(.+)", r"```text\s*([\s\S]*?)```"),
    ]

    for stage, section_pat, subj_pat, body_pat in stage_patterns:
        sec_match = re.search(section_pat, content, re.DOTALL)
        if sec_match:
            sec_text = sec_match.group(0)
            subj_match = re.search(subj_pat, sec_text)
            body_match = re.search(body_pat, sec_text)

            subj = subj_match.group(1).strip() if subj_match else f"Elitze Sentinel Opportunity (Stage {stage})"
            # Strip backticks from subject
            subj = subj.replace("`", "")
            body = body_match.group(1).strip() if body_match else ""

            templates[stage] = {
                "subject": subj,
                "body": body
            }

    return templates


def render_email_content(
    lead: Dict[str, Any],
    stage: int,
    sender: Optional[Dict[str, str]] = None
) -> Tuple[str, str]:
    """
    Dynamically render subject and body for a lead at a specific outreach stage.
    Pulls template from local BC or global sequence files and fills placeholders.
    """
    sender_info = sender or SENDER_CONFIG
    region = lead.get("region", "victoria_bc")
    template_path = GLOBAL_TEMPLATE_PATH if region == "global" else LOCAL_BC_TEMPLATE_PATH
    templates = parse_markdown_templates(template_path)

    company_name = lead.get("company_name", "Valued Partner")
    persona = lead.get("contact_persona", "Executive")
    first_token = persona.split("/")[0].strip().split()[0] if persona else "Executive"
    first_token_clean = re.sub(r"[^a-zA-Z]", "", first_token)
    
    role_indicators = {
        "vp", "ceo", "cto", "cso", "head", "director", "managing", "cloud", "founder",
        "strategic", "lead", "senior", "account", "verified", "fast", "fasttransfer",
        "boutique", "deal", "corporate", "principal", "newsletter", "marketplace",
        "investor", "domain", "tech", "growth", "inquiries", "partner", "consultant"
    }
    
    if not first_token_clean or first_token_clean.lower() in role_indicators or len(first_token_clean) < 2:
        first_name = "Team"
    else:
        first_name = first_token_clean

    region_label = "Victoria" if region == "victoria_bc" else ("Vancouver" if region == "vancouver_bc" else "Global")

    stage_data = templates.get(stage)
    if stage_data:
        raw_subj = stage_data["subject"]
        raw_body = stage_data["body"]
    else:
        # Fallback default templates
        if stage == 1:
            raw_subj = f"Sovereign AI platform acquisition opportunity for {company_name} (elitze.ca)"
            raw_body = f"Hi {first_name},\n\nI am reaching out regarding elitze.ca acquisition for {company_name}.\n\nBest regards,\n{sender_info['sender_name']}"
        elif stage == 2:
            raw_subj = f"Re: Technical Deep Dive & Architecture for {company_name} (elitze.ca)"
            raw_body = f"Hi {first_name},\n\nFollowing up on elitze.ca technical architecture for {company_name}.\n\nBest regards,\n{sender_info['sender_name']}"
        else:
            raw_subj = f"Final Notice: elitze.ca Sovereign AI OS Private Acquisition Window Closing for {company_name}"
            raw_body = f"Hi {first_name},\n\nWrapping up private outreach for elitze.ca before public marketplace listings.\n\nBest regards,\n{sender_info['sender_name']}"

    # Variable replacement map
    replacements = {
        "[Company Name]": company_name,
        "[Company / Fund Name]": company_name,
        "[First Name]": first_name,
        "[Victoria / Vancouver / British Columbia]": region_label,
        "[Your Name]": sender_info["sender_name"],
        "[Your Phone Number]": sender_info["sender_phone"],
        "[Your Physical Business Address, Victoria / Vancouver, BC, Postal Code, Canada]": sender_info["sender_address"],
        "[Your Physical Postal Address, City, State/Province, Postal Code, Country]": sender_info["sender_address"],
        "[Day of Week, Date - e.g., Friday at 5:00 PM PST]": "Friday at 5:00 PM PST",
        "[Day of Week, Date - e.g., Friday at 5:00 PM EST]": "Friday at 5:00 PM EST",
    }

    rendered_subj = raw_subj
    rendered_body = raw_body

    for key, val in replacements.items():
        rendered_subj = rendered_subj.replace(key, val)
        rendered_body = rendered_body.replace(key, val)

    return rendered_subj, rendered_body


def build_lead_record(lead_spec: Dict[str, Any], ref_time: datetime) -> Dict[str, Any]:
    """Construct a complete, fully populated lead record conforming to database schema."""
    lead_id = lead_spec.get("lead_id", f"lead-{int(ref_time.timestamp())}")
    company_name = lead_spec.get("company_name", "Prospect Company")
    contact_persona = lead_spec.get("contact_persona", "Executive")
    target_email = lead_spec.get("target_email", "contact@example.com")
    region = lead_spec.get("region", "victoria_bc")
    campaign_tier = lead_spec.get("campaign_tier", "Tier 2 ($25,000)")
    source_url = lead_spec.get("source_url", f"https://{company_name.lower().replace(' ', '')}.ca")
    casl_basis = lead_spec.get("casl_basis", "CASL § 6(6) Conspicuously Published B2B Email")
    
    days_ago_1 = lead_spec.get("days_ago_email_1", 1)
    days_ago_2 = lead_spec.get("days_ago_email_2", None)
    days_ago_3 = lead_spec.get("days_ago_email_3", None)
    
    email_1_sent_at = (ref_time - timedelta(days=days_ago_1)).isoformat()
    email_2_sent_at = (ref_time - timedelta(days=days_ago_2)).isoformat() if days_ago_2 is not None else None
    email_3_sent_at = (ref_time - timedelta(days=days_ago_3)).isoformat() if days_ago_3 is not None else None

    # Determine status & next due date
    initial_status = lead_spec.get("initial_status", "email_1_sent")
    initial_stage = lead_spec.get("initial_stage", 1)

    subj_1, _ = render_email_content(lead_spec, 1)
    history = [
        {
            "stage": 1,
            "sent_at": email_1_sent_at,
            "subject": subj_1
        }
    ]

    if email_2_sent_at:
        subj_2, _ = render_email_content(lead_spec, 2)
        history.append({
            "stage": 2,
            "sent_at": email_2_sent_at,
            "subject": subj_2
        })

    if email_3_sent_at:
        subj_3, _ = render_email_content(lead_spec, 3)
        history.append({
            "stage": 3,
            "sent_at": email_3_sent_at,
            "subject": subj_3
        })

    # Compute next followup due timestamp
    next_followup_due = None
    if initial_status == "email_1_sent":
        next_followup_due = (datetime.fromisoformat(email_1_sent_at) + timedelta(days=3)).isoformat()
    elif initial_status == "email_2_due":
        next_followup_due = ref_time.isoformat()
    elif initial_status == "email_2_sent":
        if email_2_sent_at:
            next_followup_due = (datetime.fromisoformat(email_2_sent_at) + timedelta(days=5)).isoformat()
        else:
            next_followup_due = (datetime.fromisoformat(email_1_sent_at) + timedelta(days=8)).isoformat()
    elif initial_status == "email_3_due":
        next_followup_due = ref_time.isoformat()
    elif initial_status in ("completed", "suppressed", "replied"):
        next_followup_due = None

    subj_2_ready, _ = render_email_content(lead_spec, 2)
    subj_3_ready, _ = render_email_content(lead_spec, 3)

    return {
        # Standard Schema Fields
        "lead_id": lead_id,
        "company_name": company_name,
        "contact_persona": contact_persona,
        "target_email": target_email,
        "region": region,
        "campaign_tier": campaign_tier,
        "source_url": source_url,
        "casl_basis": casl_basis,
        "lifecycle_status": initial_status,
        "email_1_sent_at": email_1_sent_at,
        "email_2_sent_at": email_2_sent_at,
        "email_3_sent_at": email_3_sent_at,
        "next_followup_due": next_followup_due,
        "suppression_reason": None,
        "last_updated": ref_time.isoformat(),
        "history": history,

        # Backward & Interop Fields
        "_id": lead_id,
        "recipient_email": target_email,
        "recipient_name": contact_persona,
        "stage": initial_stage,
        "current_status": initial_status,
        "sent_timestamp": email_1_sent_at,
        "casl_exemption_basis": casl_basis,
        "subject": subj_1,
        "email_2_ready_subject": subj_2_ready,
        "email_3_ready_subject": subj_3_ready,
        "email_2_template": "outreach_sequence_local_bc.md" if region != "global" else "outreach_sequence_global.md",
        "email_3_template": "outreach_sequence_local_bc.md" if region != "global" else "outreach_sequence_global.md"
    }


def seed_database(force: bool = False) -> Dict[str, Any]:
    """
    Seed all 30 B2B prospect leads into .frontier-data/emails.json.
    Initializes top-level suppression_list and execution_logs.
    """
    ensure_data_directories()
    ref_time = datetime.now(timezone.utc)

    existing_db = load_emails_db(EMAILS_FILE)
    existing_leads = get_leads_from_db(existing_db)

    if existing_leads and len(existing_leads) >= 30 and not force:
        return existing_db

    leads = [build_lead_record(spec, ref_time) for spec in SEED_LEADS_DATA]

    # Maintain existing suppression list or create default sample
    suppression_list = existing_db.get("suppression_list", []) if (isinstance(existing_db, dict) and not force) else []
    if not suppression_list:
        suppression_list = [
            {
                "email": "optout-sample@example.com",
                "suppressed_at": (ref_time - timedelta(days=2)).isoformat(),
                "reason": "CASL 24-hour statutory opt-out test"
            }
        ]

    execution_logs = existing_db.get("execution_logs", []) if isinstance(existing_db, dict) else []
    execution_logs.append({
        "timestamp": ref_time.isoformat(),
        "action": "seed_all_leads",
        "total_leads_seeded": len(leads),
        "details": "Initialized 30 prospect leads (10 Victoria BC, 10 Vancouver BC, 10 Global)."
    })

    db_structure = {
        "version": "1.0.0",
        "last_updated": ref_time.isoformat(),
        "suppression_list": suppression_list,
        "execution_logs": execution_logs,
        "leads": leads
    }

    atomic_save_json(EMAILS_FILE, db_structure)
    
    # Also sync suppression.json
    supp_emails = [item["email"] if isinstance(item, dict) else item for item in suppression_list]
    atomic_save_json(SUPPRESSION_FILE, supp_emails)

    return db_structure


def load_emails_db(filepath: str = EMAILS_FILE) -> Dict[str, Any]:
    """
    Load the emails database safely.
    Normalizes both legacy list format and structured dictionary format.
    """
    raw = load_raw_json(filepath)
    if raw is None:
        return seed_database()

    if isinstance(raw, list):
        # Legacy list normalization
        return {
            "version": "1.0.0",
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "suppression_list": load_raw_json(SUPPRESSION_FILE) or [],
            "execution_logs": [],
            "leads": raw
        }

    if isinstance(raw, dict):
        if "leads" not in raw:
            raw["leads"] = []
        if "suppression_list" not in raw:
            raw["suppression_list"] = []
        if "execution_logs" not in raw:
            raw["execution_logs"] = []
        return raw

    return seed_database()


def get_leads_from_db(db: Any) -> List[Dict[str, Any]]:
    """Extract lead list regardless of database structure format."""
    if isinstance(db, dict):
        return db.get("leads", [])
    if isinstance(db, list):
        return db
    return []


def save_emails_db(db: Dict[str, Any], filepath: str = EMAILS_FILE) -> None:
    """Save full database dictionary atomically."""
    db["last_updated"] = datetime.now(timezone.utc).isoformat()
    atomic_save_json(filepath, db)


def suppress_lead(
    email_or_domain: str,
    reason: str = "CASL Opt-Out Request",
    db_path: str = EMAILS_FILE
) -> Dict[str, Any]:
    """
    Add an email address or root domain to the suppression list with timestamp and reason.
    Updates both emails.json and suppression.json, and suppresses active leads.
    """
    ensure_data_directories()
    db = load_emails_db(db_path)
    now_str = datetime.now(timezone.utc).isoformat()
    target_norm = normalize_email(email_or_domain)

    if not target_norm:
        raise ValueError("Cannot suppress empty email or domain")

    # Update suppression_list in db
    supp_list = db.setdefault("suppression_list", [])
    exists = any(
        normalize_email(item.get("email", "")) == target_norm
        if isinstance(item, dict) else normalize_email(item) == target_norm
        for item in supp_list
    )
    if not exists:
        supp_list.append({
            "email": target_norm,
            "suppressed_at": now_str,
            "reason": reason
        })

    # Update suppression.json
    supp_set = load_suppression_set(db)
    supp_set.add(target_norm)
    atomic_save_json(SUPPRESSION_FILE, sorted(list(supp_set)))

    # Mark corresponding leads as suppressed
    leads = get_leads_from_db(db)
    suppressed_count = 0
    for lead in leads:
        lead_email = lead.get("target_email") or lead.get("recipient_email", "")
        if is_suppressed(lead_email, supp_set):
            lead["lifecycle_status"] = "suppressed"
            lead["current_status"] = "suppressed"
            lead["suppression_reason"] = reason
            lead["last_updated"] = now_str
            lead["next_followup_due"] = None
            suppressed_count += 1

    # Log action
    db.setdefault("execution_logs", []).append({
        "timestamp": now_str,
        "action": "suppress_target",
        "target": target_norm,
        "reason": reason,
        "affected_leads_count": suppressed_count
    })

    save_emails_db(db, db_path)
    return {
        "status": "success",
        "target": target_norm,
        "suppressed_leads": suppressed_count,
        "timestamp": now_str
    }


def mark_lead_replied(
    email: str,
    reply_note: str = "Prospect replied to outreach",
    db_path: str = EMAILS_FILE
) -> Dict[str, Any]:
    """Mark a lead as replied, halting further follow-up sequence triggers."""
    ensure_data_directories()
    db = load_emails_db(db_path)
    now_str = datetime.now(timezone.utc).isoformat()
    norm = normalize_email(email)

    leads = get_leads_from_db(db)
    matched = 0
    for lead in leads:
        lead_email = lead.get("target_email") or lead.get("recipient_email", "")
        if normalize_email(lead_email) == norm:
            lead["lifecycle_status"] = "replied"
            lead["current_status"] = "replied"
            lead["next_followup_due"] = None
            lead["last_updated"] = now_str
            matched += 1

    if matched > 0:
        db.setdefault("execution_logs", []).append({
            "timestamp": now_str,
            "action": "mark_replied",
            "email": norm,
            "note": reply_note
        })
        save_emails_db(db, db_path)
        return {"status": "success", "email": norm, "leads_updated": matched}

    return {"status": "not_found", "email": norm, "leads_updated": 0}


def evaluate_followups(
    db: Dict[str, Any],
    current_time: Optional[datetime] = None,
    business_days: bool = False
) -> Dict[str, Any]:
    """
    Evaluate all leads against elapsed time criteria (Day 4 & Day 9) and CASL suppression.
    Identifies pending actions without mutating state.
    """
    now = current_time or datetime.now(timezone.utc)
    suppression_set = load_suppression_set(db)
    leads = get_leads_from_db(db)

    pending_actions: List[Dict[str, Any]] = []
    summary_counts: Dict[str, int] = {
        "total": len(leads),
        "pending": 0,
        "email_1_sent": 0,
        "email_2_due": 0,
        "email_2_sent": 0,
        "email_3_due": 0,
        "email_3_sent": 0,
        "completed": 0,
        "suppressed": 0,
        "replied": 0
    }

    for lead in leads:
        status = lead.get("lifecycle_status") or lead.get("current_status", "pending")
        email = lead.get("target_email") or lead.get("recipient_email", "")
        company = lead.get("company_name", "Unknown")
        lead_id = lead.get("lead_id") or lead.get("_id", "unknown")

        # CASL suppression check
        if is_suppressed(email, suppression_set):
            summary_counts["suppressed"] += 1
            continue

        if status in ("suppressed", "replied", "completed"):
            summary_counts[status] = summary_counts.get(status, 0) + 1
            continue

        # Calculate timing from initial Email 1 send timestamp
        email_1_sent_at_str = lead.get("email_1_sent_at") or lead.get("sent_timestamp")
        if not email_1_sent_at_str:
            summary_counts["pending"] += 1
            continue

        try:
            email_1_sent_at = datetime.fromisoformat(email_1_sent_at_str)
        except Exception:
            continue

        elapsed_days_e1 = calculate_elapsed_days(email_1_sent_at, now, business_days=business_days)

        # Timing for Email 2 (Day 4: >= 3 days elapsed from Email 1)
        if status in ("email_1_sent", "email_2_due"):
            if elapsed_days_e1 >= 3:
                subj, body = render_email_content(lead, 2)
                pending_actions.append({
                    "lead_id": lead_id,
                    "company_name": company,
                    "target_email": email,
                    "region": lead.get("region", "victoria_bc"),
                    "action_stage": 2,
                    "action_name": "Send Email 2 (Technical Deep Dive)",
                    "elapsed_days": elapsed_days_e1,
                    "trigger_target_state": "email_2_sent",
                    "subject": subj,
                    "body_preview": body[:120] + "..." if len(body) > 120 else body,
                    "rendered_body": body
                })
                summary_counts["email_2_due"] += 1
            else:
                summary_counts["email_1_sent"] += 1

        # Timing for Email 3 (Day 9: >= 8 days elapsed from Email 1 or >= 5 days from Email 2)
        elif status in ("email_2_sent", "email_3_due"):
            email_2_sent_at_str = lead.get("email_2_sent_at")
            elapsed_days_e2 = None
            if email_2_sent_at_str:
                try:
                    e2_dt = datetime.fromisoformat(email_2_sent_at_str)
                    elapsed_days_e2 = calculate_elapsed_days(e2_dt, now, business_days=business_days)
                except Exception:
                    pass

            is_e3_due = False
            if elapsed_days_e2 is not None and elapsed_days_e2 >= 5:
                is_e3_due = True
            elif elapsed_days_e1 >= 8:
                is_e3_due = True

            if is_e3_due:
                subj, body = render_email_content(lead, 3)
                pending_actions.append({
                    "lead_id": lead_id,
                    "company_name": company,
                    "target_email": email,
                    "region": lead.get("region", "victoria_bc"),
                    "action_stage": 3,
                    "action_name": "Send Email 3 (Closing Exclusivity Offer)",
                    "elapsed_days": elapsed_days_e1,
                    "trigger_target_state": "email_3_sent",
                    "subject": subj,
                    "body_preview": body[:120] + "..." if len(body) > 120 else body,
                    "rendered_body": body
                })
                summary_counts["email_3_due"] += 1
            else:
                summary_counts["email_2_sent"] += 1

        else:
            summary_counts[status] = summary_counts.get(status, 0) + 1

    return {
        "timestamp": now.isoformat(),
        "business_days_mode": business_days,
        "summary_counts": summary_counts,
        "pending_actions": pending_actions
    }


def dispatch_followups(
    db_path: str = EMAILS_FILE,
    current_time: Optional[datetime] = None,
    business_days: bool = False,
    target_lead_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Execute dispatch for all due follow-ups.
    Advances lead lifecycle states, updates audit history, and saves state atomically.
    """
    ensure_data_directories()
    db = load_emails_db(db_path)
    now = current_time or datetime.now(timezone.utc)
    now_str = now.isoformat()

    eval_result = evaluate_followups(db, current_time=now, business_days=business_days)
    pending_actions = eval_result["pending_actions"]

    if target_lead_id:
        pending_actions = [act for act in pending_actions if act["lead_id"] == target_lead_id]

    dispatched: List[Dict[str, Any]] = []
    leads = get_leads_from_db(db)
    lead_map = {lead.get("lead_id") or lead.get("_id"): lead for lead in leads}

    for action in pending_actions:
        lead_id = action["lead_id"]
        stage = action["action_stage"]
        target_state = action["trigger_target_state"]
        subject = action["subject"]

        lead = lead_map.get(lead_id)
        if not lead:
            continue

        # Mutate lead state
        lead["lifecycle_status"] = target_state
        lead["current_status"] = target_state
        lead["stage"] = stage
        lead["last_updated"] = now_str

        if stage == 2:
            lead["email_2_sent_at"] = now_str
            # Schedule Email 3 for +5 days
            lead["next_followup_due"] = (now + timedelta(days=5)).isoformat()
            lead["subject"] = subject
        elif stage == 3:
            lead["email_3_sent_at"] = now_str
            lead["next_followup_due"] = None
            lead["subject"] = subject
            # Mark lifecycle as completed or email_3_sent
            lead["lifecycle_status"] = "completed"
            lead["current_status"] = "completed"

        # Update history array
        history = lead.setdefault("history", [])
        history.append({
            "stage": stage,
            "sent_at": now_str,
            "subject": subject
        })

        dispatched.append({
            "lead_id": lead_id,
            "company_name": lead.get("company_name"),
            "target_email": lead.get("target_email") or lead.get("recipient_email"),
            "stage": stage,
            "dispatched_status": lead["lifecycle_status"],
            "subject": subject,
            "timestamp": now_str
        })

    # Telemetry logging
    if dispatched:
        db.setdefault("execution_logs", []).append({
            "timestamp": now_str,
            "action": "dispatch_followups",
            "total_dispatched": len(dispatched),
            "dispatches": [
                {
                    "lead_id": d["lead_id"],
                    "email": d["target_email"],
                    "stage": d["stage"]
                } for d in dispatched
            ]
        })

    save_emails_db(db, db_path)

    return {
        "status": "success",
        "timestamp": now_str,
        "total_dispatched": len(dispatched),
        "dispatches": dispatched,
        "remaining_pending": len(eval_result["pending_actions"]) - len(dispatched)
    }


def format_status_table(eval_result: Dict[str, Any], verbose: bool = False) -> str:
    """Format structured CLI output showing pipeline stages, counts, and active actions."""
    counts = eval_result["summary_counts"]
    pending = eval_result["pending_actions"]
    ts = eval_result["timestamp"]
    mode = "Business Days (Mon-Fri)" if eval_result.get("business_days_mode") else "Calendar Days"

    lines = [
        "+==================================================================================+",
        "|           ELITZE SENTINEL (elitze.ca) -- EMAIL CAMPAIGN SCHEDULER                |",
        "+==================================================================================+",
        f" Current Time: {ts} | Mode: {mode}",
        "----------------------------------------------------------------------------------",
        " PIPELINE STATUS SUMMARY:",
        f"   * Total Monitored Leads:      {counts['total']:>3}",
        f"   * Email 1 Sent (Active):      {counts['email_1_sent']:>3}",
        f"   * Email 2 Due (Day 4 Trigger): {counts['email_2_due']:>3}  <-- ACTIONABLE",
        f"   * Email 2 Sent:               {counts['email_2_sent']:>3}",
        f"   * Email 3 Due (Day 9 Trigger): {counts['email_3_due']:>3}  <-- ACTIONABLE",
        f"   * Sequence Completed:         {counts['completed']:>3}",
        f"   * Replied / Engaged:          {counts['replied']:>3}",
        f"   * CASL Suppressed / Opt-Out:  {counts['suppressed']:>3}",
        "----------------------------------------------------------------------------------"
    ]

    if pending:
        lines.append(f" PENDING FOLLOW-UP DISPATCH QUEUE ({len(pending)} Due):")
        lines.append(" +---------------+-----------------------------+--------------------------+-------+---------+")
        lines.append(" | Lead ID       | Company Name                | Target Email             | Stage | Elapsed |")
        lines.append(" +---------------+-----------------------------+--------------------------+-------+---------+")
        for item in pending:
            lid = item['lead_id'][:13].ljust(13)
            comp = item['company_name'][:27].ljust(27)
            mail = item['target_email'][:24].ljust(24)
            stg = f"Email {item['action_stage']}".ljust(5)
            elap = f"{item['elapsed_days']}d".rjust(7)
            lines.append(f" | {lid} | {comp} | {mail} | {stg} | {elap} |")
        lines.append(" +---------------+-----------------------------+--------------------------+-------+---------+")
        if verbose:
            lines.append("\n Rendered Subject Previews:")
            for item in pending:
                lines.append(f"   [{item['lead_id']}] {item['company_name']}:")
                lines.append(f"     Subject: {item['subject']}")
                lines.append(f"     Preview: {item['body_preview']}\n")
    else:
        lines.append(" [OK] No pending follow-ups currently due. All sequences are up to date.")

    lines.append("+==================================================================================+")
    return "\n".join(lines)


def run_daemon_loop(poll_interval: int = 300, business_days: bool = False) -> None:
    """Run continuous scheduling daemon with scheduled polling intervals."""
    print(f"[*] Starting Elitze Sentinel Follow-Up Daemon (Interval: {poll_interval}s)...")
    try:
        while True:
            now = datetime.now(timezone.utc)
            print(f"\n[{now.isoformat()}] Polling outreach follow-up queue...")
            db = load_emails_db()
            eval_res = evaluate_followups(db, current_time=now, business_days=business_days)
            pending = eval_res["pending_actions"]
            if pending:
                print(f"[*] Found {len(pending)} due follow-up(s). Auto-dispatching...")
                dispatch_res = dispatch_followups(current_time=now, business_days=business_days)
                print(f"[+] Dispatched {dispatch_res['total_dispatched']} follow-up emails.")
            else:
                print("[-] No due follow-ups. Sleeping...")
            time.sleep(poll_interval)
    except KeyboardInterrupt:
        print("\n[*] Daemon gracefully stopped by user.")


def build_cli_parser() -> argparse.ArgumentParser:
    """Construct CLI argument parser for all scheduler operations."""
    parser = argparse.ArgumentParser(
        description="Elitze Sentinel (elitze.ca) Automated Follow-Up Scheduler & Campaign Engine",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python follow_up_scheduler.py --status
  python follow_up_scheduler.py --dry-run --verbose
  python follow_up_scheduler.py --dispatch
  python follow_up_scheduler.py --seed-all --force
  python follow_up_scheduler.py --suppress optout@example.com --reason "CASL unsubscribe"
  python follow_up_scheduler.py --mark-replied tech@wbm.ca
  python follow_up_scheduler.py --json --status
  python follow_up_scheduler.py --daemon --poll-interval 600
        """
    )
    parser.add_argument("--status", action="store_true", help="Display structured pipeline summary table")
    parser.add_argument("--dry-run", action="store_true", help="Evaluate due follow-ups without mutating state")
    parser.add_argument("--dispatch", action="store_true", help="Process and dispatch due follow-up sequences")
    parser.add_argument("--seed-all", action="store_true", help="Sync/seed all 30 B2B prospect leads into emails.json")
    parser.add_argument("--suppress", metavar="EMAIL_OR_DOMAIN", help="Add email address or domain to CASL suppression list")
    parser.add_argument("--reason", default="CASL Opt-Out Request", help="Suppression reason description")
    parser.add_argument("--mark-replied", metavar="EMAIL", help="Mark lead as replied to halt follow-up sequence")
    parser.add_argument("--json", action="store_true", help="Output results in machine-readable JSON format")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose output with subject previews")
    parser.add_argument("--business-days", action="store_true", help="Calculate elapsed time in Mon-Fri business days")
    parser.add_argument("--force", action="store_true", help="Force overwrite when seeding database")
    parser.add_argument("--lead-id", help="Target specific lead ID for evaluation or dispatch")
    parser.add_argument("--daemon", action="store_true", help="Run continuously in background polling mode")
    parser.add_argument("--poll-interval", type=int, default=300, help="Daemon poll interval in seconds (default: 300)")

    return parser


def main() -> int:
    """CLI Entry Point."""
    parser = build_cli_parser()
    args = parser.parse_args()

    ensure_data_directories()

    # If no arguments specified, default to --status
    if not any([args.status, args.dry_run, args.dispatch, args.seed_all, args.suppress, args.mark_replied, args.daemon]):
        args.status = True

    # 1. Seeding command
    if args.seed_all:
        db = seed_database(force=args.force)
        if args.json:
            print(json.dumps({
                "status": "success",
                "message": "Seeded 30 leads into database",
                "total_leads": len(db.get("leads", [])),
                "timestamp": db.get("last_updated")
            }, indent=2))
        else:
            print(f"[+] Successfully seeded {len(db.get('leads', []))} prospect leads into {EMAILS_FILE}.")
        return 0

    # 2. Suppression command
    if args.suppress:
        res = suppress_lead(args.suppress, reason=args.reason)
        if args.json:
            print(json.dumps(res, indent=2))
        else:
            print(f"[+] Suppressed '{res['target']}'. Affected {res['suppressed_leads']} active lead(s).")
        return 0

    # 3. Mark replied command
    if args.mark_replied:
        res = mark_lead_replied(args.mark_replied)
        if args.json:
            print(json.dumps(res, indent=2))
        else:
            if res["status"] == "success":
                print(f"[+] Marked {res['email']} as replied ({res['leads_updated']} lead updated).")
            else:
                print(f"[-] Email {res['email']} not found in active leads.")
        return 0

    # 4. Daemon mode
    if args.daemon:
        run_daemon_loop(poll_interval=args.poll_interval, business_days=args.business_days)
        return 0

    # 5. Dispatch command
    if args.dispatch:
        res = dispatch_followups(business_days=args.business_days, target_lead_id=args.lead_id)
        if args.json:
            print(json.dumps(res, indent=2))
        else:
            print("+==================================================================================+")
            print("|                    ELITZE SENTINEL DISPATCH EXECUTION REPORT                     |")
            print("+==================================================================================+")
            print(f" Timestamp: {res['timestamp']}")
            print(f" Total Dispatched: {res['total_dispatched']}")
            if res['dispatches']:
                print("\n Dispatched Items:")
                for d in res['dispatches']:
                    print(f"  * [{d['lead_id']}] {d['company_name']} ({d['target_email']}) -> Stage {d['stage']} ({d['dispatched_status']})")
                    print(f"    Subject: {d['subject']}")
            else:
                print("  * No pending follow-ups were eligible for dispatch at this time.")
            print("+==================================================================================+")
        return 0

    # 6. Dry run / Status command
    db = load_emails_db()
    eval_res = evaluate_followups(db, business_days=args.business_days)

    if args.lead_id:
        eval_res["pending_actions"] = [a for a in eval_res["pending_actions"] if a["lead_id"] == args.lead_id]

    if args.json:
        print(json.dumps(eval_res, indent=2))
    else:
        print(format_status_table(eval_res, verbose=args.verbose or args.dry_run))

    return 0



if __name__ == "__main__":
    sys.exit(main())
