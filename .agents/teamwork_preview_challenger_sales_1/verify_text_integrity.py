import os
import re
import pathlib

def verify_text_integrity():
    print("=== 4. TEXT & CROSS-DOCUMENT INTEGRITY AUDIT ===")
    sales_pkg = pathlib.Path("sales_package")
    
    files_to_check = [
        "05_valuation_and_dossier/executive_dossier_elitze_ca.md",
        "01_listing_copies/acquire_com_listing.md",
        "01_listing_copies/flippa_listing.md",
        "01_listing_copies/indie_hackers_pitch.md",
        "01_listing_copies/reddit_post_blueprints.md",
        "01_listing_copies/dan_afternic_sedo_listings.md",
        "04_marketplace_submission_guides/duckduckgo_marketplace_directory.md",
        "04_marketplace_submission_guides/manual_posting_checklist.md",
    ]
    
    for rel_path in files_to_check:
        full_path = sales_pkg / rel_path
        if not full_path.exists():
            print(f"File missing: {rel_path}")
            continue
        content = full_path.read_text(encoding="utf-8")
        
        # Check standard claims
        has_30_hubs = "30" in content and "hub" in content.lower()
        has_16_planes = "16" in content and "plane" in content.lower()
        has_281_tests = "281" in content
        has_42_routes = "42" in content
        has_pricing = "$10,000" in content or "$10k" in content.lower() or "$35,000" in content or "$35k" in content.lower()
        has_contact = "acquire@elitze.ca" in content or "elitze.ca" in content
        
        print(f"\nAudit of {rel_path}:")
        print(f"  Length: {len(content):,} chars, {len(content.splitlines())} lines")
        print(f"  Mentions 30 hubs: {has_30_hubs}")
        print(f"  Mentions 16 planes: {has_16_planes}")
        print(f"  Mentions 281 tests: {has_281_tests}")
        print(f"  Mentions 42 routes: {has_42_routes}")
        print(f"  Mentions $10k-$35k pricing: {has_pricing}")
        print(f"  Mentions brand/contact: {has_contact}")

if __name__ == "__main__":
    verify_text_integrity()
