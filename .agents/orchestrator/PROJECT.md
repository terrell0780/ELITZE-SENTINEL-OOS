# Project: Elitze Sentinel Frontier Oos Remediation

## Architecture
- Workspace containing Node.js / React / Next.js frontend app and multiple Python packages (`elitze_sentinel`, `frontier-core`, `frontier-enterprise`, `frontier-code`, `frontier-gaming-studio`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dependency & Security Vulnerabilities | Resolve vulnerabilities (tar, next, undici, postcss, path-to-regexp) via npm update/audit fix | M1 | ORIGINAL_REQUEST R1 |
| 2 | Clean Compilation | Ensure npm run build and tsc complete with exit code 0 | M1 | ORIGINAL_REQUEST R1 |
| 3 | Python pytest Collection & Imports | Resolve collection/import errors across 5 Python packages with root conftest.py and sys.path | M2 | ORIGINAL_REQUEST R2 |
| 4 | Python Deprecation Warnings | Eliminate Python deprecation warnings in test suite | M2 | ORIGINAL_REQUEST R2 |
| 5 | Dark Mode Palette Restoration | Revert layout.tsx background from light bg-[#F5F7FA] to #09090B dark palette | M3 | ORIGINAL_REQUEST R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Dependency & Build Remediation | Resolve NPM vulns, ensure npm run build and tsc pass | none | DONE |
| 2 | Python Test Suite & Module Resolution | Fix pytest collection/imports, conftest.py, deprecation warnings | none | DONE |
| 3 | Dark Mode Aesthetic Restoration | Restore dark mode (#09090B) in layout.tsx | none | DONE |

## Interface Contracts
- Python root conftest.py configuring sys.path for elitze_sentinel, frontier-core, frontier-enterprise, frontier-code, frontier-gaming-studio.
- Next.js root layout styling consistent with dark-mode enterprise specification (#09090B).

## Code Layout
- Node.js frontend: `package.json`, `tsconfig.json`, `app/` or `src/` (containing `layout.tsx`).
- Python packages: `elitze_sentinel/`, `frontier-core/`, `frontier-enterprise/`, `frontier-code/`, `frontier-gaming-studio/`.
