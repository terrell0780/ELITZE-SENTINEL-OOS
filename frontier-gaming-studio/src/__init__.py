# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""Frontier Gaming Studio — Frontier Autonomous World Engine (tm).

Position: a platform for building autonomous, persistent, AI-driven worlds on a
C++ engine core. Not "an AI game maker" — a AAA-grade world engine where C++ owns
the frame, and the Frontier AI Runtime supplies intelligence off the game thread.

Architecture (see README.md / ARCHITECTURE.md):
    Elitze Sentinel Frontier OOS
      └── Frontier Gaming Studio
            ├── C++ Engine Layer (PRIMARY)  -> /frontier-gaming-engine  cpp/
            ├── Frontier AI Runtime          -> agent brain, npc, economy, faction, events
            ├── Frontier Studio Tools        -> editor, world builder, quest, asset, AI scenario
            └── Frontier Cloud Services      -> matchmaking, persistence, telemetry, accounts, liveops

Golden rules:
  * C++ = Kingdom. Unreal = Castle. Frontier Runtime = Intelligence.
    Elitze Sentinel = Security. Cloud = Empire.
  * Do NOT run LLMs inside the frame loop. AI decisions return on worker threads.
  * Unreal Engine 5 is the flagship path (Nanite/Lumen/World Partition/Chaos/Mass).
"""

from __future__ import annotations

__all__ = ["__version__", "STUDIO_NAME", "PRODUCT_POSITION"]

STUDIO_NAME = "Frontier Gaming Studio"
PRODUCT_POSITION = "Frontier Autonomous World Engine"

__version__ = "0.1.0"
