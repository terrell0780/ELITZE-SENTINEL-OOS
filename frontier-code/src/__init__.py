# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""Frontier Code — terminal coding agent.

Usage:
    frontier-code                   # Interactive REPL
    frontier-code "fix this bug"    # One-shot task

Config via env vars (same as Frontier):
    FRONTIER_PROVIDER=ollama
    FRONTIER_MODEL=Fable 5
    FRONTIER_PLANNER_MODEL, WORKER_MODEL, REVIEWER_MODEL  (optional overrides)
    FRONTIER_MAX_RETRIES=3
    FRONTIER_ENABLE_REVIEW=true
"""

from __future__ import annotations

__version__ = "0.1.0"
