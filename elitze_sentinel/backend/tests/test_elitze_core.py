# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
Comprehensive unit tests for all 8 Elitze Sentinel core engines.
"""

import pytest
import json
from app.core.fusion_core import FusionCore, CompressionMethod, IntelligenceTier
from app.core.autonomy_engine import AutonomyEngine, Trigger, TriggerType, AutonomyPlan, BAS44Executor, Scheduler, AutonomyStep, PlanStatus
from app.core.marketplace_engine import MarketplaceEngine, OPALPermission
from app.core.agent_builder import AgentBuilderEngine, BlockType, AgentModel, AgentBlock, AgentEngine, BlockType
from app.core.voice_agent import VoiceAgentCore, VoxMorphEffect, WakeWordSystem
from app.core.workspace_manager import WorkspaceManager, Role
from app.core.governance import SentinelPermissionLayer, Action
from app.core.quintuple_fusion import QuintupleFusionLayer, PerplexityStub, NotebookLMStub, GeminiStub


# ─── Fixtures ───────────────────────────────────────────────────────────────

@pytest.fixture
def fusion_core():
    return FusionCore()


@pytest.fixture
async def initialized_fusion(fusion_core):
    await fusion_core.initialize()
    return fusion_core


@pytest.fixture
def autonomy():
    return AutonomyEngine()


@pytest.fixture
def marketplace():
    return MarketplaceEngine()


@pytest.fixture
def agent_builder():
    return AgentBuilderEngine()


@pytest.fixture
def voice():
    return VoiceAgentCore()


@pytest.fixture
def workspace_mgr():
    return WorkspaceManager()


@pytest.fixture
def governance():
    return SentinelPermissionLayer()


@pytest.fixture
def quintuple():
    return QuintupleFusionLayer()


# ═══════════════════════════════════════════════════════════════════════════
# 1. FUSION CORE
# ═══════════════════════════════════════════════════════════════════════════

class TestFusionCore:
    async def test_initialize(self, fusion_core):
        assert fusion_core._initialized is False
        await fusion_core.initialize()
        assert fusion_core._initialized is True

    async def test_process_default(self, initialized_fusion):
        result = await initialized_fusion.process("Hello Fusion Core")
        assert result.fusion_id.startswith("fc-")
        assert result.provenance_hash is not None
        assert len(result.provenance_hash) == 64
        assert result.compressed.method == CompressionMethod.SEMANTIC
        assert result.intelligence.tier == IntelligenceTier.STUBBED
        assert len(result.fused_layers) >= 3
        assert result.final_output is not None

    async def test_process_with_context(self, initialized_fusion):
        result = await initialized_fusion.process("test", context={"task": "reason"})
        assert "reason" in result.intelligence.raw_response
        assert len(result.fused_layers) == 4

    async def test_process_all_compression_methods(self, initialized_fusion):
        for method in CompressionMethod:
            result = await initialized_fusion.process("A" * 600, compression=method)
            assert result.compressed.method == method
            assert result.compressed.compressed_length <= result.compressed.original_length or method == CompressionMethod.TOKEN

    async def test_compression_ratio(self, fusion_core):
        text = "Hello world, this is a test of compression ratios in the fusion core."
        compressed = fusion_core._compress(text, CompressionMethod.SEMANTIC)
        assert compressed.compression_ratio > 0
        assert compressed.compression_ratio <= 1.0

    async def test_provenance_hash_consistency(self, initialized_fusion):
        r1 = await initialized_fusion.process("consistent")
        r2 = await initialized_fusion.process("different")
        assert r1.provenance_hash != r2.provenance_hash

    async def test_to_dict(self, initialized_fusion):
        result = await initialized_fusion.process("dict test")
        d = initialized_fusion.to_dict(result)
        assert d["fusion_id"] == result.fusion_id
        assert d["provenance_hash"] == result.provenance_hash
        assert d["final_output"] == result.final_output
        assert isinstance(d["compressed"], dict)
        assert isinstance(d["fused_layers"], list)


# ═══════════════════════════════════════════════════════════════════════════
# 2. AUTONOMY ENGINE
# ═══════════════════════════════════════════════════════════════════════════

class TestAutonomyEngine:
    async def test_initialize(self, autonomy):
        assert autonomy._running is False
        await autonomy.initialize()
        assert autonomy._running is True

    async def test_register_trigger(self, autonomy):
        trigger = Trigger(trigger_id="t1", type=TriggerType.TIME, name="Daily Check", cron_expr="0 9 * * *")
        tid = autonomy.register_trigger(trigger)
        assert tid == "t1"
        assert len(autonomy.triggers) == 1

    async def test_create_plan_default_steps(self, autonomy):
        plan = await autonomy.create_plan("Test Plan", "analyze data")
        assert plan.plan_id.startswith("plan-")
        assert len(plan.steps) == 3
        assert plan.steps[0].action == "analyze"

    async def test_create_plan_custom_steps(self, autonomy):
        steps = [{"action": "fetch", "params": {"url": "test"}}, {"action": "process", "params": {}}]
        plan = await autonomy.create_plan("Custom", "custom goal", steps=steps)
        assert len(plan.steps) == 2
        assert plan.steps[0].action == "fetch"

    async def test_execute_plan_success(self, autonomy):
        plan = await autonomy.create_plan("Success", "do it")
        result = await autonomy.execute_plan(plan.plan_id)
        assert result.status == PlanStatus.COMPLETED
        assert all(s.status == PlanStatus.COMPLETED for s in result.steps)

    async def test_execute_plan_not_found(self, autonomy):
        with pytest.raises(ValueError, match="Plan not found"):
            await autonomy.execute_plan("nonexistent")

    async def test_get_plan(self, autonomy):
        plan = await autonomy.create_plan("Get Me", "test")
        assert autonomy.get_plan(plan.plan_id) is plan
        assert autonomy.get_plan("nope") is None

    async def test_list_plans(self, autonomy):
        assert autonomy.list_plans() == []
        await autonomy.create_plan("P1", "g1")
        await autonomy.create_plan("P2", "g2")
        assert len(autonomy.list_plans()) == 2

    async def test_bas44_executor(self):
        executor = BAS44Executor()
        step = AutonomyStep(step_id="s1", action="test_action", params={"key": "val"})
        result = await executor.execute_step(step)
        assert result.status == PlanStatus.COMPLETED
        assert "test_action" in result.result

    async def test_scheduler_register(self):
        scheduler = Scheduler()
        trigger = Trigger(trigger_id="t1", type=TriggerType.TIME, name="t", cron_expr="* * * * *")
        plan = AutonomyPlan(plan_id="plan-1", name="p")
        task_id = scheduler.register(trigger, plan)
        assert task_id.startswith("sched-")
        assert len(scheduler.tasks) == 1

    async def test_scheduler_unregister(self):
        scheduler = Scheduler()
        t = Trigger(trigger_id="t1", type=TriggerType.TIME, name="t1")
        p = AutonomyPlan(plan_id="p1", name="p1")
        tid = scheduler.register(t, p)
        scheduler.unregister(tid)
        assert len(scheduler.tasks) == 0

    async def test_scheduler_list_tasks(self):
        scheduler = Scheduler()
        scheduler.register(Trigger(trigger_id="t1", type=TriggerType.TIME, name="t"), AutonomyPlan(plan_id="p1", name="p"))
        assert len(scheduler.list_tasks()) == 1
        assert scheduler.list_tasks()[0]["trigger"].trigger_id == "t1"


# ═══════════════════════════════════════════════════════════════════════════
# 3. MARKETPLACE ENGINE
# ═══════════════════════════════════════════════════════════════════════════

class TestMarketplaceEngine:
    async def test_initialize_seeds_defaults(self, marketplace):
        await marketplace.initialize()
        assert len(marketplace.registry) == 5
        assert marketplace._initialized is True

    async def test_list_available_shows_all(self, marketplace):
        await marketplace.initialize()
        available = marketplace.list_available()
        assert len(available) == 5
        assert all(p["status"] in ("available", "installed") for p in available)

    async def test_install_plugin(self, marketplace):
        await marketplace.initialize()
        result = marketplace.install("plugin-web-scraper")
        assert result["status"] == "installed"
        assert "plugin-web-scraper" in marketplace.installed

    async def test_install_already_installed(self, marketplace):
        await marketplace.initialize()
        marketplace.install("plugin-web-scraper")
        result = marketplace.install("plugin-web-scraper")
        assert result["status"] == "already_installed"

    async def test_install_not_found(self, marketplace):
        result = marketplace.install("nonexistent")
        assert result["status"] == "not_found"

    async def test_uninstall_plugin(self, marketplace):
        await marketplace.initialize()
        marketplace.install("plugin-web-scraper")
        result = marketplace.uninstall("plugin-web-scraper")
        assert result["status"] == "uninstalled"
        assert "plugin-web-scraper" not in marketplace.installed

    async def test_uninstall_not_installed(self, marketplace):
        result = marketplace.uninstall("ghost")
        assert result["status"] == "not_installed"

    async def test_execute_with_permission(self, marketplace):
        await marketplace.initialize()
        marketplace.install("plugin-code-exec")
        result = marketplace.execute("plugin-code-exec", "run", {"code": "print(1)"})
        assert result["status"] == "executed"

    async def test_execute_without_permission(self, marketplace):
        await marketplace.initialize()
        marketplace.install("plugin-web-scraper")
        result = marketplace.execute("plugin-web-scraper", "run", {})
        assert result["status"] == "blocked"
        assert "EXECUTE" in result["error"]

    async def test_execute_not_found(self, marketplace):
        result = marketplace.execute("ghost", "run", {})
        assert result["status"] == "error"

    async def test_check_opal(self, marketplace):
        await marketplace.initialize()
        marketplace.install("plugin-web-scraper")
        assert marketplace.check_opal("plugin-web-scraper", OPALPermission.READ) is True
        assert marketplace.check_opal("plugin-web-scraper", OPALPermission.EXECUTE) is False

    async def test_get_manifest(self, marketplace):
        await marketplace.initialize()
        m = marketplace.get_manifest("plugin-web-scraper")
        assert m is not None
        assert m.name == "Web Scraper"
        assert marketplace.get_manifest("nope") is None

    async def test_sandbox_blocks_restricted_imports(self, marketplace):
        await marketplace.initialize()
        violations = marketplace.sandbox.validate_imports("import os")
        assert "os" in violations
        assert marketplace.sandbox.validate_imports("import random") == []


# ═══════════════════════════════════════════════════════════════════════════
# 4. AGENT BUILDER
# ═══════════════════════════════════════════════════════════════════════════

class TestAgentBuilder:
    async def test_initialize(self, agent_builder):
        assert agent_builder._initialized is False
        await agent_builder.initialize()
        assert agent_builder._initialized is True

    async def test_create_agent(self, agent_builder):
        agent = agent_builder.create_agent("TestBot", "A test agent", tags=["demo"])
        assert agent.agent_id.startswith("agent-")
        assert agent.name == "TestBot"
        assert agent.description == "A test agent"
        assert agent.tags == ["demo"]
        assert len(agent_builder.agents) == 1

    async def test_add_block(self, agent_builder):
        agent = agent_builder.create_agent("Bot")
        block = agent_builder.add_block(agent.agent_id, BlockType.FUSION, "Reason")
        assert block is not None
        assert block.type == BlockType.FUSION
        assert len(agent.blocks) == 1

    async def test_add_block_nonexistent_agent(self, agent_builder):
        block = agent_builder.add_block("ghost", BlockType.FUSION, "X")
        assert block is None

    async def test_remove_block(self, agent_builder):
        agent = agent_builder.create_agent("Bot")
        block = agent_builder.add_block(agent.agent_id, BlockType.FUSION, "X")
        assert agent_builder.remove_block(agent.agent_id, block.block_id) is True
        assert len(agent.blocks) == 0

    async def test_remove_block_nonexistent(self, agent_builder):
        assert agent_builder.remove_block("ghost", "blk-x") is False

    async def test_get_agent(self, agent_builder):
        agent = agent_builder.create_agent("Bot")
        assert agent_builder.get_agent(agent.agent_id) is agent
        assert agent_builder.get_agent("nope") is None

    async def test_list_agents(self, agent_builder):
        agent_builder.create_agent("A")
        agent_builder.create_agent("B")
        lst = agent_builder.list_agents()
        assert len(lst) == 2
        assert all(a["blocks"] == 0 for a in lst)

    async def test_save_and_load_json(self, agent_builder):
        agent = agent_builder.create_agent("ExportBot")
        agent_builder.add_block(agent.agent_id, BlockType.FUSION, "Reason")
        json_str = agent_builder.save_agent_json(agent.agent_id)
        assert json_str is not None
        loaded = agent_builder.load_agent_json(json_str)
        assert loaded.name == "ExportBot"
        assert len(loaded.blocks) == 1

    async def test_save_json_nonexistent(self, agent_builder):
        assert agent_builder.save_agent_json("ghost") is None

    async def test_export_agent(self, agent_builder):
        agent = agent_builder.create_agent("ExportMe")
        exported = agent_builder.export_agent(agent.agent_id)
        assert exported is not None
        assert exported["name"] == "ExportMe"
        assert "metadata" in exported

    async def test_export_nonexistent(self, agent_builder):
        assert agent_builder.export_agent("ghost") is None

    async def test_run_agent(self, agent_builder):
        agent = agent_builder.create_agent("Runner")
        agent_builder.add_block(agent.agent_id, BlockType.FUSION, "R")
        agent_builder.add_block(agent.agent_id, BlockType.OUTPUT, "O", config={"format": "json"})
        result = await agent_builder.run_agent(agent.agent_id)
        assert result["status"] == "completed"
        assert result["steps"] == 2

    async def test_run_agent_not_found(self, agent_builder):
        result = await agent_builder.run_agent("ghost")
        assert result["status"] == "error"

    async def test_agent_model_to_json(self):
        block = AgentBlock(block_id="b1", type=BlockType.LOGIC, label="Check", config={"condition": "true"})
        agent = AgentModel(agent_id="a1", name="JsonBot", blocks=[block])
        j = json.loads(agent.to_json())
        assert j["name"] == "JsonBot"
        assert len(j["blocks"]) == 1

    async def test_agent_model_from_json(self):
        data = '{"agent_id": "a1", "name": "FromJson", "blocks": [{"block_id": "b1", "type": "fusion", "label": "F", "config": {}, "connections": [], "position": {"x": 0, "y": 0}}]}'
        agent = AgentModel.from_json(data)
        assert agent.name == "FromJson"
        assert len(agent.blocks) == 1

    async def test_agent_engine_execute_all_types(self):
        engine = AgentEngine()
        blocks = [
            AgentBlock(block_id="b1", type=BlockType.FUSION, label="F"),
            AgentBlock(block_id="b2", type=BlockType.PLUGIN, label="P", config={"plugin_id": "web"}),
            AgentBlock(block_id="b3", type=BlockType.LOGIC, label="L", config={"condition": "True"}),
            AgentBlock(block_id="b4", type=BlockType.OUTPUT, label="O", config={"format": "text"}),
        ]
        agent = AgentModel(agent_id="a1", name="AllTypes", blocks=blocks)
        result = await engine.run_agent(agent)
        assert result["status"] == "completed"
        assert result["steps"] == 4


# ═══════════════════════════════════════════════════════════════════════════
# 5. VOICE AGENT
# ═══════════════════════════════════════════════════════════════════════════

class TestVoiceAgent:
    async def test_initialize(self, voice):
        assert voice._initialized is False
        await voice.initialize()
        assert voice._initialized is True

    async def test_has_5_personas(self, voice):
        assert len(voice.personas) == 5
        assert "persona-oracle" in voice.personas

    async def test_set_persona(self, voice):
        assert voice.set_persona("persona-lyra") is True
        assert voice.current_persona.name == "Lyra"
        assert voice.set_persona("nonexistent") is False

    async def test_list_personas(self, voice):
        personas = voice.list_personas()
        assert len(personas) == 5
        assert all(p["persona_id"] for p in personas)

    async def test_apply_vox_morph(self, voice):
        result = voice.apply_vox_morph("Hello", VoxMorphEffect.DEEP)
        assert result["effect"] == "deep"
        assert result["params"]["pitch_shift"] == -3
        assert result["persona"] == "Oracle"

    async def test_apply_vox_morph_all_effects(self, voice):
        for effect in VoxMorphEffect:
            result = voice.apply_vox_morph("Test", effect)
            assert result["effect"] == effect.value

    async def test_apply_vox_morph_default(self, voice):
        result = voice.apply_vox_morph("Hello")
        assert result["effect"] == voice.current_persona.vox_morph_effect.value

    async def test_process_voice_input(self, voice):
        result = await voice.process_voice_input("Hello Elitze")
        assert result["transcript"] == "Hello Elitze"
        assert result["persona"] == "Oracle"
        assert "response_text" in result
        assert result["conversation_turn"] == 1

    async def test_process_voice_with_wake_word(self, voice):
        result = await voice.process_voice_input("hey sentinal what is the weather")
        assert result["wake_word_triggered"] is True
        assert result["wake_word"] == "hey sentinal"
        assert "what is the weather" in result["transcript"]

    async def test_conversation_history(self, voice):
        await voice.process_voice_input("First message")
        await voice.process_voice_input("Second message")
        assert len(voice.conversation_history) == 4

    async def test_get_persona(self, voice):
        p = voice.get_persona("persona-echo")
        assert p is not None
        assert p.name == "Echo"
        assert voice.get_persona("nope") is None


class TestWakeWordSystem:
    def test_detect(self):
        ww = WakeWordSystem()
        assert ww.detect("hey sentinal turn on lights") == "hey sentinal"
        assert ww.detect("elitze do something") == "elitze"
        assert ww.detect("nothing here") is None

    def test_set_wake_words(self):
        ww = WakeWordSystem()
        ww.set_wake_words(["custom word"])
        assert ww.detect("custom word activate") == "custom word"

    def test_toggle(self):
        ww = WakeWordSystem()
        assert ww.active is True
        ww.toggle()
        assert ww.active is False
        ww.toggle()
        assert ww.active is True


# ═══════════════════════════════════════════════════════════════════════════
# 6. WORKSPACE MANAGER
# ═══════════════════════════════════════════════════════════════════════════

class TestWorkspaceManager:
    async def test_initialize_creates_root(self, workspace_mgr):
        await workspace_mgr.initialize()
        assert workspace_mgr._initialized is True
        assert workspace_mgr.active_workspace_id is not None
        assert len(workspace_mgr.workspaces) >= 1

    async def test_create_workspace(self, workspace_mgr):
        ws = workspace_mgr.create_workspace("My Workspace", "Description", "user-001")
        assert ws.workspace_id.startswith("ws-")
        assert ws.name == "My Workspace"
        assert ws.members["user-001"] == Role.OWNER

    async def test_get_workspace(self, workspace_mgr):
        ws = workspace_mgr.create_workspace("Test", "", "u1")
        assert workspace_mgr.get_workspace(ws.workspace_id) is ws
        assert workspace_mgr.get_workspace("nope") is None

    async def test_list_workspaces(self, workspace_mgr):
        workspace_mgr.create_workspace("A", "", "u1")
        workspace_mgr.create_workspace("B", "", "u1")
        lst = workspace_mgr.list_workspaces()
        assert len(lst) == 2

    async def test_list_workspaces_filtered_by_user(self, workspace_mgr):
        ws = workspace_mgr.create_workspace("Mine", "", "u1")
        workspace_mgr.create_workspace("Theirs", "", "u2")
        lst = workspace_mgr.list_workspaces(user_id="u1")
        assert len(lst) == 1
        assert lst[0]["name"] == "Mine"

    async def test_switch_workspace(self, workspace_mgr):
        ws1 = workspace_mgr.create_workspace("W1", "", "u1")
        ws2 = workspace_mgr.create_workspace("W2", "", "u1")
        assert workspace_mgr.switch_workspace(ws2.workspace_id, "u1") is True
        assert workspace_mgr.active_workspace_id == ws2.workspace_id

    async def test_switch_workspace_not_member(self, workspace_mgr):
        ws = workspace_mgr.create_workspace("W", "", "u1")
        assert workspace_mgr.switch_workspace(ws.workspace_id, "u2") is False

    async def test_add_member(self, workspace_mgr):
        ws = workspace_mgr.create_workspace("W", "", "owner-001")
        assert workspace_mgr.add_member(ws.workspace_id, "user-002", Role.MEMBER, "owner-001") is True
        assert ws.members["user-002"] == Role.MEMBER

    async def test_add_member_not_authorized(self, workspace_mgr):
        ws = workspace_mgr.create_workspace("W", "", "owner-001")
        assert workspace_mgr.add_member(ws.workspace_id, "user-002", Role.MEMBER, "user-002") is False

    async def test_remove_member(self, workspace_mgr):
        ws = workspace_mgr.create_workspace("W", "", "owner-001")
        workspace_mgr.add_member(ws.workspace_id, "user-002", Role.MEMBER, "owner-001")
        assert workspace_mgr.remove_member(ws.workspace_id, "user-002", "owner-001") is True
        assert "user-002" not in ws.members

    async def test_add_plugin(self, workspace_mgr):
        ws = workspace_mgr.create_workspace("W", "", "owner-001")
        assert workspace_mgr.add_plugin(ws.workspace_id, "plugin-1", "owner-001") is True
        assert "plugin-1" in ws.plugins

    async def test_add_agent(self, workspace_mgr):
        ws = workspace_mgr.create_workspace("W", "", "owner-001")
        assert workspace_mgr.add_agent(ws.workspace_id, "agent-1", "owner-001") is True
        assert "agent-1" in ws.agents

    async def test_get_active_workspace(self, workspace_mgr):
        await workspace_mgr.initialize()
        active = workspace_mgr.get_active_workspace()
        assert active is not None
        assert active.name == "Root Workspace"

    async def test_rbac_has_permission(self, workspace_mgr):
        assert workspace_mgr.rbac.has_permission(Role.OWNER, Role.MEMBER) is True
        assert workspace_mgr.rbac.has_permission(Role.VIEWER, Role.ADMIN) is False

    async def test_rbac_can_manage(self, workspace_mgr):
        assert workspace_mgr.rbac.can_manage(Role.OWNER) is True
        assert workspace_mgr.rbac.can_manage(Role.ADMIN) is True
        assert workspace_mgr.rbac.can_manage(Role.MEMBER) is False


# ═══════════════════════════════════════════════════════════════════════════
# 7. GOVERNANCE + SENTINEL
# ═══════════════════════════════════════════════════════════════════════════

class TestGovernance:
    def test_seed_owner(self, governance):
        user = governance.get_user("owner-001")
        assert user is not None
        assert user.role == Role.OWNER

    def test_register_user(self, governance):
        user = governance.register_user("u1", "Alice", Role.ADMIN, ["ws-1"])
        assert user.user_id == "u1"
        assert governance.get_user("u1") is user

    def test_check_permission_owner_allows_all(self, governance):
        assert governance.check_permission("owner-001", Action.FUSION_RUN) is True
        assert governance.check_permission("owner-001", Action.ADMIN_OVERRIDE) is True

    def test_check_permission_viewer_denies_all(self, governance):
        governance.register_user("v1", "Viewer", Role.VIEWER)
        assert governance.check_permission("v1", Action.FUSION_RUN) is False
        assert governance.check_permission("v1", Action.PLUGIN_USE) is False

    def test_check_permission_member_allows_some(self, governance):
        governance.register_user("m1", "Member", Role.MEMBER)
        assert governance.check_permission("m1", Action.FUSION_RUN) is True
        assert governance.check_permission("m1", Action.PLUGIN_INSTALL) is False

    def test_check_permission_unknown_user(self, governance):
        assert governance.check_permission("ghost", Action.FUSION_RUN) is False

    def test_check_permission_workspace_bound(self, governance):
        governance.register_user("u1", "Bob", Role.ADMIN, ["ws-1"])
        assert governance.check_permission("u1", Action.FUSION_RUN, workspace_id="ws-1") is True
        assert governance.check_permission("u1", Action.FUSION_RUN, workspace_id="ws-2") is False

    def test_list_users(self, governance):
        governance.register_user("u1", "A", Role.ADMIN)
        governance.register_user("u2", "B", Role.MEMBER)
        users = governance.list_users()
        assert len(users) >= 3

    def test_owner_override_success(self, governance):
        result = governance.owner_override("owner-001", "Emergency maintenance")
        assert result["status"] == "approved"
        assert "override_key" in result

    def test_owner_override_denied(self, governance):
        governance.register_user("u1", "NotOwner", Role.ADMIN)
        result = governance.owner_override("u1", "hack")
        assert result["status"] == "denied"


# ═══════════════════════════════════════════════════════════════════════════
# 8. QUINTUPLE FUSION LAYER
# ═══════════════════════════════════════════════════════════════════════════

class TestQuintupleFusion:
    async def test_perplexity_stub(self):
        p = PerplexityStub()
        result = await p.fetch("What is AI?", sources=3)
        assert result["engine"] == "PerplexityStub"
        assert result["confidence"] > 0
        assert "sources_synthesized" in result

    async def test_notebooklm_stub(self):
        n = NotebookLMStub()
        result = await n.recognize("memory query", "my_notes")
        assert result["engine"] == "NotebookLMStub"
        assert result["context_used"] == "my_notes"

    async def test_gemini_stub(self):
        g = GeminiStub()
        result = await g.analyze("describe this", modality="image", media_ref="img001")
        assert result["engine"] == "GeminiStub"
        assert result["modality"] == "image"
        assert "Visual" in result["analysis"]

    async def test_gemini_stub_all_modalities(self):
        g = GeminiStub()
        for mod in ["text", "image", "audio", "video"]:
            r = await g.analyze("test", modality=mod)
            assert r["modality"] == mod

    async def test_quintuple_fuse_standalone(self, quintuple):
        result = await quintuple.fuse("What is the meaning of life?")
        assert result.fusion_id.startswith("qf-")
        assert result.web_reasoning["engine"] == "PerplexityStub"
        assert result.memory_reasoning["engine"] == "NotebookLMStub"
        assert result.multimodal_reasoning["engine"] == "GeminiStub"
        assert result.core_fusion_ref is None
        assert result.governance_ref is None

    async def test_quintuple_fuse_with_core_and_governance(self):
        from app.core.fusion_core import FusionCore
        from app.core.governance import SentinelPermissionLayer
        fc = FusionCore()
        await fc.initialize()
        gov = SentinelPermissionLayer()
        qf = QuintupleFusionLayer(fusion_core=fc, governance=gov)
        result = await qf.fuse("test query", context={"modality": "text"})
        assert result.core_fusion_ref is not None
        assert result.governance_ref is not None
        assert "final_output" in result.core_fusion_ref

    async def test_quintuple_final_output_format(self, quintuple):
        result = await quintuple.fuse("test")
        assert "QuintupleFusion" in result.final_output
        assert "Web" in result.final_output
