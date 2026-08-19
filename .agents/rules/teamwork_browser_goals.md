# Rule: Teamwork & Browser Agent Goal Execution

**Scope:** Multi-agent goal orchestration, browser research, and long-running campaign execution.

---

## 1. Goal Delegation & Orchestration
- When executing long-running outreach, marketplace distribution, or asset sales goals, delegate execution to `/teamwork-preview` and `/browser` subagents via `invoke_subagent`.
- Maintain a live `prompt_draft.md` artifact detailing requirements (R1–R5), acceptance criteria, and workspace status.

---

## 2. Objective Verification
- Require objective, falsifiable verification criteria for every requirement.
- Perform automated verification checks (e.g. running pytest test suites, checking file paths, or verifying JSON database records) before claiming goal completion.
