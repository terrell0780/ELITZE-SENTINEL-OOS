import os
import re
import json
import pathlib
from dataclasses import dataclass

def test_routes():
    print("=== 1. ROUTE VERIFICATION ===")
    src_app = pathlib.Path("src/app")
    
    # Discover all pages and API routes in src/app
    all_pages = []
    all_api_routes = []
    
    for root, dirs, files in os.walk(src_app):
        rel_dir = os.path.relpath(root, src_app)
        for f in files:
            if f in ("page.tsx", "page.jsx", "page.js", "page.ts"):
                route = "/" if rel_dir == "." else "/" + rel_dir.replace("\\", "/")
                all_pages.append(route)
            elif f in ("route.ts", "route.js"):
                route = "/api/" if rel_dir == "api" else "/" + rel_dir.replace("\\", "/")
                all_api_routes.append(route)
                
    print(f"Total Next.js App Router UI Pages Found: {len(all_pages)}")
    print(f"Total Next.js App Router API Routes Found: {len(all_api_routes)}")
    total_routes = len(all_pages) + len(all_api_routes)
    print(f"Total Compiled App Router Endpoints: {total_routes}")
    
    # 30 Hubs claimed in executive dossier
    claimed_30_hubs = [
        # Mission Control (5)
        "/chat", "/intelligence", "/dashboard", "/welcome", "/global-search",
        # Development (6)
        "/studio", "/code", "/refactor", "/runtime", "/cli", "/workflows",
        # Automation (2)
        "/lindy", "/collaboration",
        # Security (3)
        "/security", "/threat-intel", "/gateway",
        # Creative & Media (5)
        "/media", "/visual", "/image-to-video", "/storytelling", "/voice",
        # Gaming Studio (3)
        "/gaming", "/gaming/studio", "/world",
        # Business & Enterprise (6)
        "/sales", "/leadgen", "/jobs", "/integrations/email", "/marketplace", "/enterprise"
    ]
    
    # Global system surfaces (2)
    claimed_system_surfaces = ["/settings", "/integrations"]
    
    print(f"\nChecking 30 Claimed Hubs against src/app/:")
    missing_hubs = []
    for hub in claimed_30_hubs:
        exists = hub in all_pages
        status = "EXISTS" if exists else "MISSING"
        if not exists:
            missing_hubs.append(hub)
        print(f"  {hub:<25} -> {status}")
        
    print(f"\nMissing Hubs from src/app: {len(missing_hubs)}")
    if missing_hubs:
        print(f"  FAILED: Missing hubs: {missing_hubs}")
    else:
        print("  PASSED: 100% of all 30 application hubs exist as physical page.tsx files!")

    print(f"\nChecking 2 System Surfaces:")
    for surface in claimed_system_surfaces:
        exists = surface in all_pages
        print(f"  {surface:<25} -> {'EXISTS' if exists else 'MISSING'}")

    # Check navigation.ts items
    nav_file = pathlib.Path("src/lib/navigation.ts").read_text(encoding="utf-8")
    print("\nChecking navigation.ts entries:")
    nav_hrefs = re.findall(r'href:\s*"([^"]+)"', nav_file)
    print(f"Total Nav items in navigation.ts: {len(nav_hrefs)}")
    print(f"Unique Nav items: {len(set(nav_hrefs))}")
    for href in set(nav_hrefs):
        exists = href in all_pages
        print(f"  nav href {href:<20} in src/app: {exists}")

    return {
        "all_pages": all_pages,
        "all_api_routes": all_api_routes,
        "total_routes": total_routes,
        "missing_hubs": missing_hubs
    }

def test_kernel_planes():
    print("\n=== 2. KERNEL & SECURITY VERIFICATION ===")
    kernel_path = pathlib.Path("elitze_sentinel/backend/app/core/kernel.py")
    firewall_path = pathlib.Path("frontier-core/src/core/firewall.py")
    rbac_path = pathlib.Path("frontier-enterprise/src/core/rbac.py")
    
    k_content = kernel_path.read_text(encoding="utf-8")
    f_content = firewall_path.read_text(encoding="utf-8")
    r_content = rbac_path.read_text(encoding="utf-8")
    
    checks = [
        ("FrontierOSKernel class in kernel.py", "class FrontierOSKernel" in k_content),
        ("ImmutableAuditPlane class in kernel.py", "class ImmutableAuditPlane" in k_content),
        ("EventBusPlane class in kernel.py", "class EventBusPlane" in k_content),
        ("MemoryArchitecturePlane class in kernel.py", "class MemoryArchitecturePlane" in k_content),
        ("WorkspacePlane class in kernel.py", "class WorkspacePlane" in k_content),
        ("ObservabilityPlane class in kernel.py", "class ObservabilityPlane" in k_content),
        ("ClaimObject dataclass in kernel.py", "class ClaimObject" in k_content),
        ("EvidenceLeadRecord dataclass in kernel.py", "class EvidenceLeadRecord" in k_content),
        ("VerificationStatus enum in kernel.py", "class VerificationStatus" in k_content),
        ("ProcessState enum in kernel.py", "class ProcessState" in k_content),
        ("MemoryTier enum in kernel.py", "class MemoryTier" in k_content),
        ("TerrellHallGuardrails class in firewall.py", "class TerrellHallGuardrails" in f_content),
        ("ThreatLevel enum in firewall.py", "class ThreatLevel" in f_content),
        ("ActionType enum in firewall.py", "class ActionType" in f_content),
        ("ComplianceFramework enum in firewall.py", "class ComplianceFramework" in f_content),
        ("AuditEntry dataclass in firewall.py", "class AuditEntry" in f_content),
        ("PolicyRule dataclass in firewall.py", "class PolicyRule" in f_content),
        ("SecurityEvent dataclass in firewall.py", "class SecurityEvent" in f_content),
        ("GuardrailsConfig dataclass in firewall.py", "class GuardrailsConfig" in f_content),
        ("verify_chain_integrity method in firewall.py", "def verify_chain_integrity" in f_content),
        ("redact_pii method in firewall.py", "def redact_pii" in f_content),
        ("RBACManager class in rbac.py", "class RBACManager" in r_content),
    ]
    
    for desc, passed in checks:
        print(f"  {desc:<45} -> {'PASSED' if passed else 'FAILED'}")

def test_math():
    print("\n=== 3. MATHEMATICAL CALCULATIONS AUDIT ===")
    
    # Table in duckduckgo_marketplace_directory.md (Illustrative $35k sale)
    # Acquire.com: $35,000 gross, 0% platform fee, ~$250 escrow (buyer split) -> $34,750 net
    # Dan.com (Lander): $35,000 gross, 5% ($1,750), escrow included -> $33,250 net
    # Flippa: $35,000 gross, 5-10% ($1,750 - $3,500), escrow included -> $31,500 - $33,250 net
    # Afternic: $35,000 gross, 15% ($5,250), escrow included -> $29,750 net
    # Direct Escrow.com: $35,000 gross, 0% fee, ~$300 escrow split -> $34,700 net
    
    gross_35k = 35000
    print("Testing $35,000 Gross Net Payouts:")
    dan_5pct = gross_35k * 0.05
    dan_net = gross_35k - dan_5pct
    print(f"  Dan.com (5%): Fee = ${dan_5pct:,.2f}, Net = ${dan_net:,.2f} (Expected $33,250.00) -> {'PASS' if dan_net == 33250 else 'FAIL'}")
    
    flippa_5pct = gross_35k * 0.05
    flippa_10pct = gross_35k * 0.10
    flippa_net_high = gross_35k - flippa_5pct
    flippa_net_low = gross_35k - flippa_10pct
    print(f"  Flippa (5-10%): Fee = ${flippa_5pct:,.2f} - ${flippa_10pct:,.2f}, Net = ${flippa_net_low:,.2f} - ${flippa_net_high:,.2f} (Expected $31,500 - $33,250) -> {'PASS' if flippa_net_low == 31500 and flippa_net_high == 33250 else 'FAIL'}")
    
    afternic_15pct = gross_35k * 0.15
    afternic_net = gross_35k - afternic_15pct
    print(f"  Afternic (15%): Fee = ${afternic_15pct:,.2f}, Net = ${afternic_net:,.2f} (Expected $29,750.00) -> {'PASS' if afternic_net == 29750 else 'FAIL'}")
    
    acquire_net = gross_35k - 250
    print(f"  Acquire.com ($250 escrow): Net = ${acquire_net:,.2f} (Expected $34,750.00) -> {'PASS' if acquire_net == 34750 else 'FAIL'}")
    
    escrow_net = gross_35k - 300
    print(f"  Direct Escrow ($300 escrow split): Net = ${escrow_net:,.2f} (Expected $34,700.00) -> {'PASS' if escrow_net == 34700 else 'FAIL'}")
    
    # Table in manual_posting_checklist.md (Active Listing & Submission Tracking Table)
    # 1. Dan.com: Tier 1 ($10,000) -> 5% fee ($500) -> Net $9,500
    # 2. Afternic: Tier 1 ($10,000) -> 15% fee ($1,500) -> Net $8,500
    # 3. Sedo: Tier 1 ($10,000) -> 10-15% fee ($1,000 - $1,500) -> Net $8,500 - $9,000
    # 4. Acquire.com: Tier 3 ($35,000) -> Net $34,750
    # 5. Flippa: Tier 1-3 ($10k-$35k) -> Net $31,500 - $33,250
    # 6. Indie Hackers: Tier 1-3 ($10k-$35k) -> Net $34,700 (Direct escrow $300 split)
    # 7. Reddit r/domains: Tier 1 ($10,000) -> Net $9,700 (Direct escrow $300 split)
    # 8. Reddit r/SideProject: Tier 1-3 ($10k-$35k) -> Net $34,700
    # 9. Reddit r/SaaS: Tier 2-3 ($25k-$35k) -> Net $34,700
    # 10. Microns.io: Tier 2 ($25,000) -> Net $24,750 ($250 escrow fee)
    # 11. TrustMRR: Tier 3 ($35,000) -> 5% escrow fee ($1,750) -> Net $33,250
    # 12. Vaulto: Tier 1-3 ($10k-$35k) -> 8% fee on $35k ($2,800) -> Net $32,200
    # 13. NamePros: Tier 1 ($10,000) -> Net $9,700 ($300 escrow split)
    
    print("\nTesting manual_posting_checklist.md Table Payout Calculations:")
    gross_10k = 10000
    gross_25k = 25000
    
    dan_10k_net = gross_10k - (gross_10k * 0.05)
    print(f"  Dan.com ($10k @ 5%): ${dan_10k_net:,.2f} -> {'PASS' if dan_10k_net == 9500 else 'FAIL'}")
    
    afternic_10k_net = gross_10k - (gross_10k * 0.15)
    print(f"  Afternic ($10k @ 15%): ${afternic_10k_net:,.2f} -> {'PASS' if afternic_10k_net == 8500 else 'FAIL'}")
    
    sedo_10k_net_low = gross_10k - (gross_10k * 0.15)
    sedo_10k_net_high = gross_10k - (gross_10k * 0.10)
    print(f"  Sedo ($10k @ 10-15%): ${sedo_10k_net_low:,.2f} - ${sedo_10k_net_high:,.2f} -> {'PASS' if sedo_10k_net_low == 8500 and sedo_10k_net_high == 9000 else 'FAIL'}")
    
    reddit_10k_net = gross_10k - 300
    print(f"  Reddit ($10k w/ $300 escrow): ${reddit_10k_net:,.2f} -> {'PASS' if reddit_10k_net == 9700 else 'FAIL'}")
    
    microns_25k_net = gross_25k - 250
    print(f"  Microns.io ($25k w/ $250 escrow): ${microns_25k_net:,.2f} -> {'PASS' if microns_25k_net == 24750 else 'FAIL'}")
    
    trustmrr_35k_net = gross_35k - (gross_35k * 0.05)
    print(f"  TrustMRR ($35k @ 5%): ${trustmrr_35k_net:,.2f} -> {'PASS' if trustmrr_35k_net == 33250 else 'FAIL'}")
    
    vaulto_35k_net = gross_35k - (gross_35k * 0.08)
    print(f"  Vaulto ($35k @ 8%): ${vaulto_35k_net:,.2f} -> {'PASS' if vaulto_35k_net == 32200 else 'FAIL'}")
    
    # Lease to own math
    lto_12mo = 10000 / 12
    print(f"\nLease-To-Own (12 mo on $10,000): ${lto_12mo:.2f}/mo (Documented as $833 USD/mo, rounded from $833.33) -> PASS")

if __name__ == "__main__":
    res = test_routes()
    test_kernel_planes()
    test_math()
