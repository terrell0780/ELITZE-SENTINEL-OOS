# R1 Survey Report: NPM Dependencies, Vulnerabilities & Build System

**Target Workspace**: `c:\Elitze Sentinel Frontier Oos`  
**Date**: 2026-08-12  
**Surveyed By**: Survey Explorer 1  

---

## Executive Summary
This investigation analyzed Requirement 1: NPM installation, security vulnerabilities, TypeScript compilation (`tsc`), and Next.js build (`npm run build`).

- **NPM Installation Status**: `npm install` runs and succeeds (453 packages installed).
- **Vulnerabilities**: Identified 34 total vulnerabilities (1 low, 11 moderate, 21 high, 1 critical), including all specifically flagged packages (`tar`, `next`, `undici`, `postcss`, `path-to-regexp`), plus `nanoid`, `sharp`, `smol-toml`, and `minimatch`.
- **TypeScript Compilation / Type Checking Root Cause**: Running `tsc` or `next build` type-checking failed because `tsconfig.json` included `"**/*.ts"`. This caused TypeScript to scan nested subdirectories such as `./elitze-sentinel-frontier-overview/src/app/api/health/route.ts`, which attempts `import { db } from "@/db"`. Because `@/*` points to `./src/*`, TypeScript could not resolve `@/db` in the root workspace.
- **Next.js Build Failure Root Cause**: `node node_modules/next/dist/bin/next build` compiles Next.js pages in `./src/` cleanly (`✓ Compiled successfully in 5.7s`), but fails at the `Linting and checking validity of types ...` step due to the same root `tsconfig.json` scanning issue in `elitze-sentinel-frontier-overview`.
- **Next.js Config Deprecation**: `next.config.ts` contains `experimental: { turbo: {} }`, which emits deprecation warnings in Next.js 15.

---

## Detailed Audit Findings

### 1. Security Vulnerabilities Audit

| Package | Severity | Affected Range / Installed | Vulnerability Description | Advisory IDs |
|---|---|---|---|---|
| **tar** | Critical | `<=7.5.20` (Installed `7.5.7`) | Hardlink Target Escape, Symlink Path Traversal, PAX size override, DoS | GHSA-83g3-92jg-28cx, GHSA-qffp-2rhf-9h96, GHSA-9ppj-qmqm-q256, GHSA-vmf3-w455-68vh, GHSA-w8wr-v893-vjvp |
| **next** | High | `9.3.4-canary.0 - 16.3.0-preview.10` (Installed `15.2.0`) | App Router DoS, SSRF in Server Actions & rewrites, Cache confusion, Unbounded payload | GHSA-m99w-x7hq-7vfj, GHSA-89xv-2m56-2m9x, GHSA-68g3-v927-f742, GHSA-4633-3j49-mh5q, GHSA-p9j2-gv94-2wf4 |
| **undici** | High | `<=6.27.0` | HTTP Request/Response Smuggling, CRLF Injection, WebSocket DoS, Insufficient randomness | GHSA-2mjp-6q6p-2qxm, GHSA-c76h-2ccp-4975, GHSA-g9mf-h72j-4rw9, GHSA-vrm6-8vpv-qv8q, GHSA-4992-7rv2-5pvq |
| **postcss** | High | `<=8.5.22` | XSS via Unescaped `</style>`, Path Traversal via `sourceMappingURL` | GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849 |
| **path-to-regexp** | High | `4.0.0-6.2.2 || 8.0.0-8.3.0` | ReDoS via backtracking regex, sequential optional groups, multiple wildcards | GHSA-9wv6-86v2-598j, GHSA-j3q9-mxjg-w52f, GHSA-27v5-c462-wpq7 |
| **nanoid** | High | `<3.3.17` | Infinite loop in custom generators when size is zero | GHSA-2v37-7h3g-55p8 |
| **sharp** | High | `<0.35.0` | Inherited libvips vulnerabilities (CVE-2026-33327, CVE-2026-33328) | GHSA-f88m-g3jw-g9cj |
| **minimatch** | Moderate | `<9.0.5` / `<10.0.1` | ReDoS in nested `*()` extglobs | GHSA-23c5-xmqv-rm74 |
| **smol-toml** | Moderate | `<1.6.1` | DoS via TOML documents containing thousands of consecutive commented lines | GHSA-v3rj-xjv7-4jmq |

### 2. TypeScript Compilation (`tsc`) Audit

- **Command**: `node node_modules/typescript/lib/tsc.js --noEmit`
- **Output Error**:
  ```text
  elitze-sentinel-frontier-overview/src/app/api/health/route.ts(1,20): error TS2307: Cannot find module '@/db' or its corresponding type declarations.
  elitze-sentinel-frontier-overview/src/app/api/seed/route.ts(2,20): error TS2307: Cannot find module '@/db' or its corresponding type declarations.
  elitze-sentinel-frontier-overview/src/app/api/seed/route.ts(3,59): error TS2307: Cannot find module '@/db/schema' or its corresponding type declarations.
  ```
- **Cause**: Root `tsconfig.json` has `"include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]` without excluding `./elitze-sentinel-frontier-overview`. The root project's `@/*` mapping points to `./src/*`, so `@/db` cannot resolve for nested subproject files.

### 3. Next.js Build Audit

- **Command**: `node node_modules/next/dist/bin/next build`
- **Build Log Snippet**:
  ```text
   ▲ Next.js 15.2.0

   Creating an optimized production build ...
   ✓ Compiled successfully in 5.7s
   Linting and checking validity of types ...
  Failed to compile.

  ./elitze-sentinel-frontier-overview/src/app/api/health/route.ts:1:20
  Type error: Cannot find module '@/db' or its corresponding type declarations.

  > 1 | import { db } from "@/db";
      |                    ^
  ```
- **Conclusion**: Next.js compilation of `src/` pages succeeds 100%. The only build failure is triggered during the type-checking phase by the `tsconfig.json` scope inclusion of `elitze-sentinel-frontier-overview`.

---

## Action Plan & Proposed Changes

1. **Vulnerability Remediation (`package.json`)**:
   Add an `"overrides"` object to `package.json` specifying safe non-vulnerable versions for transitive dependencies:
   ```json
   "overrides": {
     "tar": "^7.5.22",
     "postcss": "^8.5.23",
     "undici": "^6.27.1",
     "path-to-regexp": "^8.3.1",
     "nanoid": "^3.3.17",
     "sharp": "^0.35.0",
     "smol-toml": "^1.6.1",
     "minimatch": "^9.0.5"
   }
   ```
   After updating `package.json`, execute `npm install` to update `package-lock.json` and resolve all audit warnings cleanly.

2. **TypeScript & Build Configuration Fix (`tsconfig.json`)**:
   Update `tsconfig.json` to explicitly limit `include` to root source files (`src/**/*.ts`, `src/**/*.tsx`, `next.config.ts`, `next-env.d.ts`) and exclude `elitze-sentinel-frontier-overview`:
   ```json
   "include": [
     "next-env.d.ts",
     "next.config.ts",
     "src/**/*.ts",
     "src/**/*.tsx",
     ".next/types/**/*.ts"
   ],
   "exclude": [
     "node_modules",
     "elitze-sentinel-frontier-overview"
   ]
   ```

3. **Next.js Config Clean Up (`next.config.ts`)**:
   Remove deprecated `experimental: { turbo: {} }` from `next.config.ts`.
