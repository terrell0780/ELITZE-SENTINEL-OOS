# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""Frontier Cloud Services — the Empire layer.

Matchmaking, persistence, telemetry, player accounts, live operations.
State ownership: this layer persists worlds/accounts; the C++ engine owns the live
frame; Elitze Sentinel owns security/compliance for all of it.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class PlayerAccount:
    account_id: str
    display_name: str
    tenants: list[str] = field(default_factory=list)


@dataclass
class MatchmakingTicket:
    ticket_id: str
    mode: str
    latency_ms: int = 50
    region: str = "us-east"


@dataclass
class TelemetryEvent:
    event: str
    tags: dict[str, Any] = field(default_factory=dict)
