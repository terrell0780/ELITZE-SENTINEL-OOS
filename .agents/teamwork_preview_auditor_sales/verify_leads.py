import os, glob

lead_dir = r'c:\Elitze Sentinel Frontier Oos\sales_package\02_lead_lists'
lead_files = glob.glob(os.path.join(lead_dir, '*.md'))

for f in sorted(lead_files):
    name = os.path.basename(f)
    print(f'=== Validating {name} ===')
    with open(f, 'r', encoding='utf-8') as fh:
        lines = fh.readlines()
    
    table_rows = []
    for line in lines:
        if line.strip().startswith('|') and '---' not in line and 'Company Name' not in line and 'Buyer / Broker Platform' not in line:
            parts = [p.strip() for p in line.strip().split('|')[1:-1]]
            if len(parts) >= 6:
                table_rows.append(parts)
    
    print(f'Found {len(table_rows)} structured table entries:')
    for idx, row in enumerate(table_rows, 1):
        print(f'  Row {idx}: {row[0]} | {row[1]} | {row[3]}')
        # Check no empty cells
        for c_idx, cell in enumerate(row):
            if not cell or cell == '-' or cell == 'TBD':
                print(f'    [WARNING] Row {idx} cell {c_idx} empty or stub: "{cell}"')
    print()
