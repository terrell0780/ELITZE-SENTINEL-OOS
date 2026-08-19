# Sovereign Security, Privacy & Domain Rules

## 1. Secrets & Credentials Safety
- NEVER stage or commit `.env`, `.env.local`, `.env.production`, `*.pem`, `*.key`, `credentials.json`, or `secrets.json` files.
- All secret patterns must be strictly excluded via `.gitignore`.
- Before pushing to Git, verify `git ls-files` contains zero secret/credential files or hardcoded API keys (`sk-`, `ghp_`, `AIzaSy`).

## 2. Canonical Domain & Branding Invariants
- Official Production Domain & App Console: `https://elitze.org` ONLY (no `app.elitze.org` subdomain)
- Official System Name: `Elitze Sentinel Frontier Oss`
- Sole Contact Email: `terrell0780@gmail.com`
- Exclude all subdomains (`app.elitze.org`) and legacy/non-target domains (`elitze.ca`, `elitze.com`).

## 3. Strict Verification & Audit Mandate
- Run `pytest` across all microservices (`elitze_sentinel`, `frontier-core`, `frontier-enterprise`, `frontier-api`, `frontier-code`, `frontier-gaming-studio`). All 281 unit tests must pass cleanly.
- Run `npm run build` for Next.js App Router compilation. All 43 routes must compile with Exit Code 0 before declaring success.

## 4. Product Lock Mandate
- Product: **Elitze Sentinel Frontier OOS** (B2B Sovereign AI + Security Operating System).
- Objective: Make the existing working product look expensive, coherent, and finished.
- Frontend modifications only unless a visual change genuinely requires backend work.
- Preserve every existing feature: APIs, authentication, chat, agents, model routing, security, workflows, databases, integrations, runtime, routes.
- Do NOT rename product, do NOT change architecture, do NOT rebuild from scratch, do NOT remove functionality.
