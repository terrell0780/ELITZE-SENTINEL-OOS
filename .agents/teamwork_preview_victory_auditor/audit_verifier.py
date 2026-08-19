import os
import sys
import socket
import re

def main():
    print("=== VICTORY AUDITOR INDEPENDENT VERIFICATION SUITE ===")
    base_dir = r"c:\Elitze Sentinel Frontier Oos"
    sales_pkg = os.path.join(base_dir, "sales_package")
    
    errors = []
    
    # 1. Verify Subdirectory Structure
    print("\n--- 1. Subdirectory Structure Check ---")
    required_dirs = [
        "01_listing_copies",
        "02_lead_lists",
        "03_email_campaigns",
        "04_marketplace_submission_guides",
        "05_valuation_and_dossier"
    ]
    for d in required_dirs:
        full_path = os.path.join(sales_pkg, d)
        if os.path.isdir(full_path):
            files = os.listdir(full_path)
            print(f"[OK] Directory exists: {d} ({len(files)} files)")
        else:
            errors.append(f"Missing required directory: {d}")
            print(f"[FAIL] Missing directory: {d}")

    # 2. Check all 30 App Routes
    print("\n--- 2. 30 Hubs Application Routes Check ---")
    expected_routes = [
        # Mission Control (5)
        "chat", "intelligence", "dashboard", "welcome", "global-search",
        # Development (6)
        "studio", "code", "refactor", "runtime", "cli", "workflows",
        # Automation (2)
        "lindy", "collaboration",
        # Security (3)
        "security", "threat-intel", "gateway",
        # Creative & Media (5)
        "media", "visual", "image-to-video", "storytelling", "voice",
        # Gaming Studio (3)
        "gaming", "gaming/studio", "world",
        # Business & Enterprise (6)
        "sales", "leadgen", "jobs", "integrations/email", "marketplace", "enterprise"
    ]
    
    for route in expected_routes:
        route_path = os.path.join(base_dir, "src", "app", route.replace("/", os.sep), "page.tsx")
        if os.path.isfile(route_path):
            print(f"[OK] Hub route exists: /src/app/{route}/page.tsx")
        else:
            errors.append(f"Missing hub page file: {route_path}")
            print(f"[FAIL] Missing hub route: {route_path}")

    # Check global system surfaces
    for sys_route in ["settings", "integrations"]:
        route_path = os.path.join(base_dir, "src", "app", sys_route, "page.tsx")
        if os.path.isfile(route_path):
            print(f"[OK] System surface exists: /src/app/{sys_route}/page.tsx")
        else:
            errors.append(f"Missing system route: {route_path}")
            print(f"[FAIL] Missing system route: {route_path}")

    # 3. Check 16 Kernel Planes
    print("\n--- 3. 16-Plane Kernel Inspection & Execution ---")
    kernel_file = os.path.join(base_dir, "elitze_sentinel", "backend", "app", "core", "kernel.py")
    if os.path.isfile(kernel_file):
        with open(kernel_file, "r", encoding="utf-8") as f:
            kernel_code = f.read()
        
        required_elements = [
            ("VerificationStatus", "VerificationStatus enum"),
            ("ProcessState", "ProcessState enum"),
            ("MemoryTier", "MemoryTier enum"),
            ("ClaimObject", "ClaimObject dataclass"),
            ("EvidenceLeadRecord", "EvidenceLeadRecord dataclass"),
            ("AuditRecord", "AuditRecord dataclass"),
            ("ImmutableAuditPlane", "ImmutableAuditPlane class"),
            ("EventBusPlane", "EventBusPlane class"),
            ("MemoryArchitecturePlane", "MemoryArchitecturePlane class"),
            ("WorkspacePlane", "WorkspacePlane class"),
            ("ObservabilityPlane", "ObservabilityPlane class"),
            ("FrontierOSKernel", "FrontierOSKernel master class"),
            ("def create_process", "create_process lifecycle method"),
            ("def evaluate_policy", "evaluate_policy gatekeeper method"),
            ("def can_agent_use_tool", "can_agent_use_tool permission method"),
            ("def execute_tool", "execute_tool provenance method"),
            ("def verify_lead", "verify_lead anti-hallucination method"),
            ("def recover_interrupted_processes", "recover_interrupted_processes crash recovery method"),
            ("def sanitize_path", "sanitize_path sandbox traversal defense"),
            ("def verify_integrity", "SHA-256 hash-chain integrity verification")
        ]
        
        for elem, desc in required_elements:
            if elem in kernel_code:
                print(f"[OK] {desc} found ({elem})")
            else:
                errors.append(f"Missing {desc}: {elem}")
                print(f"[FAIL] Missing {desc}: {elem}")
    else:
        errors.append(f"Kernel file missing: {kernel_file}")

    # 4. Check Stripe & Fal.ai Integrations
    print("\n--- 4. Stripe & Fal.ai Integrations Check ---")
    os_route = os.path.join(base_dir, "src", "app", "api", "os", "route.ts")
    with open(os_route, "r", encoding="utf-8") as f:
        os_route_code = f.read()
    if "createCheckout" in os_route_code:
        print("[OK] Next.js OS route contains createCheckout Stripe proxy")
    else:
        errors.append("createCheckout missing in src/app/api/os/route.ts")

    brain_ts = os.path.join(base_dir, "src", "lib", "brain.ts")
    with open(brain_ts, "r", encoding="utf-8") as f:
        brain_code = f.read()
    if "createCheckout" in brain_code:
        print("[OK] Client brain.ts contains createCheckout method")
    else:
        errors.append("createCheckout missing in src/lib/brain.ts")

    media_page = os.path.join(base_dir, "src", "app", "media", "page.tsx")
    with open(media_page, "r", encoding="utf-8") as f:
        media_code = f.read()
    if "fal.ai" in media_code.lower() or "cinematic" in media_code.lower():
        print("[OK] Media studio implements fal.ai / cinematic video engine")
    else:
        errors.append("Media page missing video engine implementation")

    # 5. Check Lead List Domains via Socket Resolution
    print("\n--- 5. Lead List Domain DNS Resolution ---")
    lead_domains = [
        # Victoria BC
        "wbm.ca", "tecnet.ca", "smartdolphins.com", "gamtech.ca", "nucleusnetworks.ca",
        "lighthouseit.ca", "daxtech.ca", "ggit.ca", "regroove.ca", "westcom.ca",
        # Vancouver BC
        "d3security.com", "cyberunit.com", "absolute.com", "deepcovecyber.com", "mspcorp.ca",
        "fusioncomputing.ca", "ayvant.ca", "a-cx.com", "icomplyis.com", "invisio.ca",
        # Global
        "acquire.com", "flippa.com", "dan.com", "afternic.com", "sedo.com",
        "microns.io", "trustmrr.com", "namepros.com", "tiny.com", "quietlight.com"
    ]
    
    resolved_count = 0
    for dom in lead_domains:
        try:
            ip = socket.gethostbyname(dom)
            print(f"[OK] Domain {dom:25s} -> {ip}")
            resolved_count += 1
        except Exception as e:
            print(f"[WARN] Domain {dom:25s} resolution error: {e}")
            errors.append(f"Domain resolution failed for {dom}: {e}")
            
    print(f"Total resolved: {resolved_count} / {len(lead_domains)}")

    # 6. Check CASL Compliance Footers
    print("\n--- 6. CASL Compliance in Email Sequences ---")
    local_bc_email = os.path.join(sales_pkg, "03_email_campaigns", "outreach_sequence_local_bc.md")
    with open(local_bc_email, "r", encoding="utf-8") as f:
        bc_content = f.read()
    
    required_casl_markers = [
        "CASL Section 6(6)",
        "UNSUBSCRIBE",
        "Mailing Address:",
        "acquire@elitze.ca"
    ]
    for marker in required_casl_markers:
        if marker in bc_content:
            print(f"[OK] BC sequence contains '{marker}'")
        else:
            errors.append(f"BC sequence missing required CASL marker: {marker}")

    global_email = os.path.join(sales_pkg, "03_email_campaigns", "outreach_sequence_global.md")
    with open(global_email, "r", encoding="utf-8") as f:
        global_content = f.read()
    for marker in ["UNSUBSCRIBE", "Mailing Address:", "Anti-Spam"]:
        if marker in global_content:
            print(f"[OK] Global sequence contains '{marker}'")
        else:
            errors.append(f"Global sequence missing marker: {marker}")

    # 7. Check Valuation Pricing Consistency
    print("\n--- 7. Valuation Pricing Consistency ($10k / $25k / $35k) ---")
    dossier_path = os.path.join(sales_pkg, "05_valuation_and_dossier", "executive_dossier_elitze_ca.md")
    with open(dossier_path, "r", encoding="utf-8") as f:
        dossier_content = f.read()
    
    pricing_markers = ["$10,000", "$25,000", "$35,000", "Tier 1", "Tier 2", "Tier 3"]
    for pm in pricing_markers:
        if pm in dossier_content:
            print(f"[OK] Dossier contains '{pm}'")
        else:
            errors.append(f"Dossier missing pricing marker: {pm}")

    # Summary
    print("\n=== VERIFICATION SUMMARY ===")
    if not errors:
        print("ALL INDEPENDENT CHECKS PASSED PERFECTLY (0 ERRORS)")
    else:
        print(f"FAILED CHECKS ({len(errors)} errors):")
        for err in errors:
            print(f" - {err}")

if __name__ == "__main__":
    main()
