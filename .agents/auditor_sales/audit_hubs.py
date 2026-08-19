import os

BASE_DIR = r"c:\Elitze Sentinel Frontier Oos"
APP_DIR = os.path.join(BASE_DIR, "src", "app")

print("=== AUDITING ALL APPLICATION HUBS IN src/app ===")

hub_dirs = [
    d for d in os.listdir(APP_DIR)
    if os.path.isdir(os.path.join(APP_DIR, d)) and not d.startswith(".") and d != "api" and not d.startswith("[")
]

results = []
for hub in sorted(hub_dirs):
    page_path = os.path.join(APP_DIR, hub, "page.tsx")
    exists = os.path.exists(page_path)
    if not exists:
        results.append((hub, False, 0, "MISSING page.tsx"))
        continue
    
    with open(page_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        line_count = len(lines)
        content = "".join(lines)
        
    is_facade = False
    if line_count < 10 or ("return null" in content and line_count < 20):
        is_facade = True
        
    results.append((hub, exists, line_count, "OK" if not is_facade else "FACADE"))

print(f"Total hubs found: {len(results)}")
for hub, exists, lines, status in results:
    print(f"  * /{hub:20} -> {lines:4} lines | status: {status}")

facades = [r for r in results if r[3] != "OK"]
assert len(facades) == 0, f"Found facade or missing hubs: {facades}"
print("=== ALL APPLICATION HUBS CONFIRMED AUTHENTIC (ZERO FACADES) ===")
