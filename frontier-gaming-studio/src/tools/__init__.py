# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""Frontier Studio Tools — authoring surface for autonomous worlds.

Tools: Editor, World Builder, Quest Designer, Asset Pipeline, AI Scenario Builder.
Web dashboard is TypeScript; AI pipeline is Python; engine stays C++.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class WorldBlueprint:
    name: str
    biome: str = "temperate"
    size_km: float = 4.0
    seed: int = 0


@dataclass
class QuestNode:
    quest_id: str
    title: str
    prerequisites: list[str] = field(default_factory=list)
    rewards: dict[str, Any] = field(default_factory=dict)


@dataclass
class AIScenario:
    scenario_id: str
    agents: list[str] = field(default_factory=list)
    trigger: str = ""
    objective: str = ""


@dataclass
class AssetRecord:
    asset_id: str
    kind: str  # mesh | texture | audio | behavior
    path: str = ""
