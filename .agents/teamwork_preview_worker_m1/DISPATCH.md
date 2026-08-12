# Task Assignment: Worker 1 (Milestone 1 - R1 Dependency & Build Remediation)

Working directory: `c:\Elitze Sentinel Frontier Oos\.agents\teamwork_preview_worker_m1`
Root directory: `c:\Elitze Sentinel Frontier Oos`
Original request path: `c:\Elitze Sentinel Frontier Oos\ORIGINAL_REQUEST.md`

Objective:
Implement Requirement 1:
1. Review findings and proposed files from Explorer 1 in `c:\Elitze Sentinel Frontier Oos\.agents\teamwork_preview_explorer_survey_1\`.
2. Update `package.json` with necessary `overrides` for security vulnerabilities (`tar`, `next`, `undici`, `postcss`, `path-to-regexp`, `nanoid`, `sharp`, `smol-toml`, `minimatch`).
3. Update `tsconfig.json` to properly scope `include` to `src/**/*.ts`, `src/**/*.tsx`, `next-env.d.ts`, `.next/types/**/*.ts` and exclude `elitze-sentinel-frontier-overview` and `node_modules`.
4. Update `next.config.ts` to clean up deprecated experimental options (`experimental: { turbo: {} }`).
5. Run `npm install` (or `npm audit fix` / `npm install --legacy-peer-deps` as appropriate) to update the lockfile and install clean dependencies.
6. Run `npm run build` and `tsc` (or `npx tsc --noEmit`) to verify clean compilation with exit code 0.
7. Write `handoff.md` in your working directory documenting the exact changes, command execution results, build/test logs, and layout compliance.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
