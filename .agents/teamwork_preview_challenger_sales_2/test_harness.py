"""
Empirical Test Harness for Sales Package 02_lead_lists and 03_email_campaigns
Challenger Sales 2
"""

import os
import re
import socket
import urllib.request
import urllib.error
import ssl
import json

SALES_PKG = r"c:\Elitze Sentinel Frontier Oos\sales_package"
LOCAL_BC_EMAIL = os.path.join(SALES_PKG, "03_email_campaigns", "outreach_sequence_local_bc.md")
GLOBAL_EMAIL = os.path.join(SALES_PKG, "03_email_campaigns", "outreach_sequence_global.md")
CASL_GUIDE = os.path.join(SALES_PKG, "03_email_campaigns", "casl_compliance_guide.md")
OBJECTION_DOC = os.path.join(SALES_PKG, "03_email_campaigns", "objection_handling.md")
VANCOUVER_LEADS = os.path.join(SALES_PKG, "02_lead_lists", "vancouver_bc_leads.md")
VICTORIA_LEADS = os.path.join(SALES_PKG, "02_lead_lists", "victoria_bc_leads.md")
GLOBAL_LEADS = os.path.join(SALES_PKG, "02_lead_lists", "global_buyers_and_brokers.md")

results = {
    "casl_compliance": {},
    "lead_lists_bc": {},
    "global_directory": {},
    "objection_handling": {}
}

# --- TEST 1: CASL Compliance in Email Sequences ---
def test_email_compliance(file_path, seq_name):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Find emails (marked by ## 📧 Email 1, 2, 3)
    email_blocks = re.findall(r"## 📧 (Email \d:[^\n]+)(.*?)(?=(?:## 📧 Email|\Z))", content, re.DOTALL)
    seq_results = {"total_emails_found": len(email_blocks), "emails": []}

    for title, block in email_blocks:
        email_data = {"title": title.strip()}
        
        # Check Sender Identity
        has_sender_name = bool(re.search(r"\[Your Name\]", block))
        has_sender_title = bool(re.search(r"Owner / Lead Architect|Founder / Asset Manager", block))
        has_business_name = bool(re.search(r"Elitze Sentinel", block))
        has_domain = bool(re.search(r"elitze\.ca", block))
        has_direct_email = bool(re.search(r"acquire@elitze\.ca", block))
        
        # Check Physical Address Placeholder
        has_physical_address = bool(re.search(r"Mailing Address:.*\[Your Physical.*Address.*\]", block, re.IGNORECASE))
        
        # Check Unsubscribe Mechanism
        has_unsubscribe_notice = bool(re.search(r"UNSUBSCRIBE|OPT-OUT", block, re.IGNORECASE))
        has_opt_out_sla = bool(re.search(r"24 hours|10 business days", block, re.IGNORECASE))
        
        # Check Statutory Notice
        has_statutory_notice = bool(re.search(r"CASL Section 6\(6\)|Anti-Spam & Privacy Notice", block, re.IGNORECASE))

        email_data["checks"] = {
            "has_sender_name": has_sender_name,
            "has_sender_title": has_sender_title,
            "has_business_name": has_business_name,
            "has_domain": has_domain,
            "has_direct_email": has_direct_email,
            "has_physical_address": has_physical_address,
            "has_unsubscribe_notice": has_unsubscribe_notice,
            "has_opt_out_sla": has_opt_out_sla,
            "has_statutory_notice": has_statutory_notice
        }
        email_data["all_passed"] = all(email_data["checks"].values())
        seq_results["emails"].append(email_data)
        
    return seq_results

# --- TEST 2: DNS & Reachability of Lead List Domains ---
def check_domain(domain):
    # Strip backticks or spaces
    domain = domain.strip("` ").lower()
    res = {"domain": domain, "dns_resolved": False, "ip": None, "http_status": None, "error": None}
    
    # 1. DNS Resolution
    try:
        ip = socket.gethostbyname(domain)
        res["dns_resolved"] = True
        res["ip"] = ip
    except Exception as e:
        res["error"] = f"DNS resolution failed: {e}"
        return res

    # 2. HTTP/HTTPS probe
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    
    for scheme in ["https://", "http://"]:
        url = f"{scheme}{domain}"
        try:
            req = urllib.request.Request(url, headers=headers, method="GET")
            with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
                res["http_status"] = response.getcode()
                break
        except urllib.error.HTTPError as e:
            res["http_status"] = e.code
            break
        except Exception as e:
            res["error"] = f"HTTP probe error: {e}"

    return res

def parse_lead_table(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    rows = []
    # Match markdown table rows with domain
    matches = re.findall(r"\|\s*\*\*([^*]+)\*\*\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|", content)
    for name, domain, specialty, persona, casl_basis, channel, value_prop in matches:
        rows.append({
            "name": name.strip(),
            "domain": domain.strip(),
            "specialty": specialty.strip(),
            "persona": persona.strip(),
            "casl_basis": casl_basis.strip(),
            "channel": channel.strip(),
            "value_prop": value_prop.strip()
        })
    return rows

# Run tests
results["casl_compliance"]["local_bc"] = test_email_compliance(LOCAL_BC_EMAIL, "Local BC")
results["casl_compliance"]["global"] = test_email_compliance(GLOBAL_EMAIL, "Global")

vancouver_leads = parse_lead_table(VANCOUVER_LEADS)
victoria_leads = parse_lead_table(VICTORIA_LEADS)

results["lead_lists_bc"]["vancouver_count"] = len(vancouver_leads)
results["lead_lists_bc"]["victoria_count"] = len(victoria_leads)

print("Testing Vancouver Leads Domains...")
van_results = []
for lead in vancouver_leads:
    dom_check = check_domain(lead["domain"])
    lead_res = {**lead, **dom_check}
    van_results.append(lead_res)
    print(f"  [{lead['name']}] ({lead['domain']}) -> DNS: {dom_check['dns_resolved']} (IP: {dom_check['ip']}), HTTP: {dom_check['http_status']}")

print("Testing Victoria Leads Domains...")
vic_results = []
for lead in victoria_leads:
    dom_check = check_domain(lead["domain"])
    lead_res = {**lead, **dom_check}
    vic_results.append(lead_res)
    print(f"  [{lead['name']}] ({lead['domain']}) -> DNS: {dom_check['dns_resolved']} (IP: {dom_check['ip']}), HTTP: {dom_check['http_status']}")

results["lead_lists_bc"]["vancouver_details"] = van_results
results["lead_lists_bc"]["victoria_details"] = vic_results

# Check Global Directory Platforms
global_leads = parse_lead_table(GLOBAL_LEADS)
results["global_directory"]["count"] = len(global_leads)
print("Testing Global Platforms Domains...")
glob_results = []
for lead in global_leads:
    dom_check = check_domain(lead["domain"])
    lead_res = {**lead, **dom_check}
    glob_results.append(lead_res)
    print(f"  [{lead['name']}] ({lead['domain']}) -> DNS: {dom_check['dns_resolved']} (IP: {dom_check['ip']}), HTTP: {dom_check['http_status']}")
results["global_directory"]["details"] = glob_results

# Financial and Legal Sanity Check in Objection Handling
with open(OBJECTION_DOC, "r", encoding="utf-8") as f:
    obj_content = f.read()

# Verify CIRA Canadian Presence Requirements mechanisms mentioned
cira_mechanisms = [
    "Registrar Trustee", "Nominee", "Canadian Trademark", "Canadian Corporate Entity", "Escrow.com"
]
cira_checks = {mech: bool(re.search(mech, obj_content, re.IGNORECASE)) for mech in cira_mechanisms}

# Verify Floor Prices mentioned
floor_checks = {
    "tier_1_floor_7500": bool(re.search(r"\$7,500", obj_content)),
    "tier_2_floor_18000": bool(re.search(r"\$18,000", obj_content)),
    "tier_3_floor_28000": bool(re.search(r"\$28,000", obj_content)),
    "replacement_cost_100k": bool(re.search(r"\$100,000\+", obj_content)),
    "dev_months_9": bool(re.search(r"9\+\s*months", obj_content))
}

results["objection_handling"]["cira_checks"] = cira_checks
results["objection_handling"]["floor_checks"] = floor_checks

with open(r"c:\Elitze Sentinel Frontier Oos\.agents\teamwork_preview_challenger_sales_2\test_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

print("\n--- TEST SUMMARY ---")
print(f"Local BC Emails Checked: {results['casl_compliance']['local_bc']['total_emails_found']}, All Passed: {all(e['all_passed'] for e in results['casl_compliance']['local_bc']['emails'])}")
print(f"Global Emails Checked: {results['casl_compliance']['global']['total_emails_found']}, All Passed: {all(e['all_passed'] for e in results['casl_compliance']['global']['emails'])}")
print(f"Vancouver Leads: {len(van_results)}/10, DNS Resolved: {sum(1 for v in van_results if v['dns_resolved'])}")
print(f"Victoria Leads: {len(vic_results)}/10, DNS Resolved: {sum(1 for v in vic_results if v['dns_resolved'])}")
print(f"Global Platforms: {len(glob_results)}/10, DNS Resolved: {sum(1 for g in glob_results if g['dns_resolved'])}")
print(f"CIRA Checks Passed: {all(cira_checks.values())}")
print(f"Floor Pricing Checks Passed: {all(floor_checks.values())}")
