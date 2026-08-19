"""
Empirical DNS Resolution and Lead Reachability Validator
Validates domains for all 30 lead targets across Victoria, Vancouver, and Global lead directories.
"""

import socket
import json

LEADS_TO_CHECK = [
    # Victoria, BC (10)
    {"name": "WBM Technologies", "domain": "wbm.ca", "email": "tech@wbm.ca", "region": "Victoria, BC"},
    {"name": "Tecnet", "domain": "tecnet.ca", "email": "ceo@tecnet.ca", "region": "Victoria, BC"},
    {"name": "Smart Dolphins IT Solutions", "domain": "smartdolphins.com", "email": "cto@smartdolphins.com", "region": "Victoria, BC"},
    {"name": "GAM Tech", "domain": "gamtech.ca", "email": "security@gamtech.ca", "region": "Victoria, BC"},
    {"name": "Nucleus Networks", "domain": "nucleusnetworks.ca", "email": "product@nucleusnetworks.ca", "region": "Victoria, BC"},
    {"name": "Lighthouse Integrations", "domain": "lighthouseit.ca", "email": "consulting@lighthouseit.ca", "region": "Victoria, BC"},
    {"name": "Daxtech IT Solutions", "domain": "daxtech.ca", "email": "cto@daxtech.ca", "region": "Victoria, BC"},
    {"name": "GGIT Innovation & Technologies", "domain": "ggit.ca", "email": "founder@ggit.ca", "region": "Victoria, BC"},
    {"name": "Regroove Solutions Inc.", "domain": "regroove.ca", "email": "cloud@regroove.ca", "region": "Victoria, BC"},
    {"name": "Westcom Business Solutions", "domain": "westcom.ca", "email": "president@westcom.ca", "region": "Victoria, BC"},

    # Vancouver, BC (10)
    {"name": "D3 Security", "domain": "d3security.com", "email": "bd@d3security.com", "region": "Vancouver, BC"},
    {"name": "Cyber Unit", "domain": "cyberunit.com", "email": "cso@cyberunit.com", "region": "Vancouver, BC"},
    {"name": "Absolute Software", "domain": "absolute.com", "email": "corpdev@absolute.com", "region": "Vancouver, BC"},
    {"name": "DeepCove Cybersecurity", "domain": "deepcovecyber.com", "email": "partner@deepcovecyber.com", "region": "Vancouver, BC"},
    {"name": "MSP Corp", "domain": "mspcorp.ca", "email": "partnerships@mspcorp.ca", "region": "Vancouver, BC"},
    {"name": "Fusion Computing", "domain": "fusioncomputing.ca", "email": "ai@fusioncomputing.ca", "region": "Vancouver, BC"},
    {"name": "Ayvant IT & Cybersecurity", "domain": "ayvant.ca", "email": "cto@ayvant.ca", "region": "Vancouver, BC"},
    {"name": "A-CX", "domain": "a-cx.com", "email": "product@a-cx.com", "region": "Vancouver, BC"},
    {"name": "iComply Investor Services", "domain": "icomplyis.com", "email": "engineering@icomplyis.com", "region": "Vancouver, BC"},
    {"name": "Invisio Digital", "domain": "invisio.ca", "email": "principal@invisio.ca", "region": "Vancouver, BC"},

    # Global (10)
    {"name": "Acquire.com", "domain": "acquire.com", "email": "acquisitions@acquire.com", "region": "Global"},
    {"name": "Flippa", "domain": "flippa.com", "email": "brokerage@flippa.com", "region": "Global"},
    {"name": "Dan.com", "domain": "dan.com", "email": "brokerage@dan.com", "region": "Global"},
    {"name": "Afternic", "domain": "afternic.com", "email": "fasttransfer@afternic.com", "region": "Global"},
    {"name": "Sedo", "domain": "sedo.com", "email": "broker@sedo.com", "region": "Global"},
    {"name": "Microns.io", "domain": "microns.io", "email": "submit@microns.io", "region": "Global"},
    {"name": "TrustMRR", "domain": "trustmrr.com", "email": "deals@trustmrr.com", "region": "Global"},
    {"name": "NamePros", "domain": "namepros.com", "email": "marketplace@namepros.com", "region": "Global"},
    {"name": "Tiny Capital", "domain": "tiny.com", "email": "acquisitions@tiny.com", "region": "Global"},
    {"name": "Quiet Light", "domain": "quietlight.com", "email": "inquiries@quietlight.com", "region": "Global"}
]

def check_domains():
    results = []
    resolved = 0
    failed = 0

    print(f"[*] Checking DNS resolution for {len(LEADS_TO_CHECK)} lead domains...")
    print(f"{'Company Name':<30} | {'Domain':<22} | {'DNS Status':<10} | {'IP Address / Note'}")
    print("-" * 85)

    for item in LEADS_TO_CHECK:
        domain = item["domain"]
        try:
            ip = socket.gethostbyname(domain)
            status = "RESOLVED"
            note = ip
            resolved += 1
        except socket.gaierror as e:
            status = "FAILED"
            note = str(e)
            failed += 1
        
        results.append({
            "name": item["name"],
            "domain": domain,
            "region": item["region"],
            "email": item["email"],
            "status": status,
            "note": note
        })
        print(f"{item['name']:<30} | {domain:<22} | {status:<10} | {note}")

    print("-" * 85)
    print(f"Summary: {resolved}/{len(LEADS_TO_CHECK)} resolved ({resolved/len(LEADS_TO_CHECK)*100:.1f}%), {failed} failed.")
    return results

if __name__ == "__main__":
    check_domains()
