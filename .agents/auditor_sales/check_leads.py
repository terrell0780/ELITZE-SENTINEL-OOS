import json

with open(r"c:\Elitze Sentinel Frontier Oos\.frontier-data\emails.json", "r", encoding="utf-8") as f:
    db = json.load(f)

for l in db["leads"]:
    print(f"{l['lead_id']} | {l['company_name']} | {l['target_email']} | {l['casl_basis']}")
