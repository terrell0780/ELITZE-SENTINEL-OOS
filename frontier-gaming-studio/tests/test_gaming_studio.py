# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import asyncio

from src.runtime import AgentBrain, NPCController, EconomySimulation, FactionLogic, WorldEvent
from src.engine import engine_summary, CPP_MODULES, UNREAL_SUBSYSTEMS
from src.tools import WorldBlueprint, QuestNode, AIScenario, AssetRecord
from src.cloud import PlayerAccount, MatchmakingTicket, TelemetryEvent


class TestEngineLayer:
    def test_engine_summary_names_unreal(self):
        s = engine_summary()
        assert "Unreal Engine 5" in s
        assert "PRIMARY" in s

    def test_cpp_modules_present(self):
        # the ten kingdom modules
        assert CPP_MODULES == (
            "Core", "Rendering", "Physics", "World", "AI",
            "Networking", "Animation", "Audio", "Terrain", "Streaming",
        )

    def test_unreal_subsystems(self):
        assert "Nanite" in UNREAL_SUBSYSTEMS and "Chaos Physics" in UNREAL_SUBSYSTEMS


class TestAIRuntimeOffThread:
    def test_agent_decide_returns_decision(self):
        async def fake(situation, meta):
            return {"action": "patrol", "confidence": 0.9}
        brain = AgentBrain(agent_id="npc-1", model="qwen")
        out = asyncio.run(brain.decide("enemy spotted", fake))
        assert out["action"] == "patrol"
        assert out["meta"]["agent_id"] == "npc-1"

    def test_npc_controller_collect(self):
        async def fake(situation, meta):
            return {"action": "flee"}
        ctrl = NPCController(AgentBrain("npc-2"))
        asyncio.run(ctrl.request_decision("fire", "r1", )) if False else None
        # request + collect flow
        async def run():
            res = await ctrl.request_decision("fire", "r1")
            return ctrl.collect("r1") or res
        got = asyncio.run(run())
        assert got is not None

    def test_economy_tick_changes_prices(self):
        eco = EconomySimulation(prices={"water": 1.0})
        eco.tick({"water": 1.0})  # high demand -> price up
        assert eco.prices["water"] > 1.0

    def test_faction_and_event(self):
        f = FactionLogic("house-a", allies=["house-b"])
        assert "house-b" in f.allies
        e = WorldEvent("e1", "raid", {"target": "outpost"})
        assert e.kind == "raid"


class TestStudioTools:
    def test_world_blueprint(self):
        w = WorldBlueprint("alpha", biome="desert", size_km=8.0)
        assert w.size_km == 8.0

    def test_quest_and_scenario(self):
        q = QuestNode("q1", "Rescue", rewards={"xp": 100})
        s = AIScenario("s1", agents=["npc-1"], objective="defend")
        a = AssetRecord("a1", "mesh")
        assert q.rewards["xp"] == 100 and s.objective == "defend" and a.kind == "mesh"


class TestCloud:
    def test_account_and_ticket(self):
        acc = PlayerAccount("u1", "Hero")
        tkt = MatchmakingTicket("t1", "pvp", latency_ms=30)
        ev = TelemetryEvent("frame", {"fps": 60})
        assert acc.display_name == "Hero" and tkt.mode == "pvp" and ev.tags["fps"] == 60
