# Sovereign Security, Privacy & Domain Rules

## 1. Secrets & Credentials Safety
- NEVER stage or commit `.env`, `.env.local`, `.env.production`, `*.pem`, `*.key`, `credentials.json`, or `secrets.json` files.
- All secret patterns must be strictly excluded via `.gitignore`.
- Before pushing to Git, verify `git ls-files` contains zero secret/credential files or hardcoded API keys (`sk-`, `ghp_`, `AIzaSy`).

## 2. Canonical Domain & Branding Invariants
- Official Production Domain: `https://elitze.org`
- Official App Console Subdomain: `https://app.elitze.org`
- Official System Name: `Elitze Sentinel Frontier Oss`
- Sole Contact Email: `terrell0780@gmail.com`
- Exclude all legacy or non-target domains (`elitze.ca`, `elitze.com`).

## 3. Strict Verification & Audit Mandate
- Run `pytest` across all microservices (`elitze_sentinel`, `frontier-core`, `frontier-enterprise`, `frontier-api`, `frontier-code`, `frontier-gaming-studio`). All 281 unit tests must pass cleanly.
- Run `npm run build` for Next.js App Router compilation. All 42 routes must compile with Exit Code 0 before declaring success.
