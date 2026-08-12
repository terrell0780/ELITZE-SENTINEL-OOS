# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
Smoke test for all Elitze Sentinel API endpoints.
Tests: root, health, fusion (2), autonomy (5), plugins (5), agents (7), voice (4), workspaces (6), auth (5)
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_root(client):
    resp = await client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Elitze Sentinel"
    assert data["status"] == "operational"


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


# ─── Fusion ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_fusion_process(client):
    resp = await client.post("/api/v1/fusion/process", json={
        "input_text": "Hello Fusion", "compression": "semantic", "tier": "stubbed"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["fusion_id"].startswith("fc-")
    assert data["provenance_hash"]
    assert "final_output" in data


@pytest.mark.asyncio
async def test_fusion_process_default(client):
    resp = await client.post("/api/v1/fusion/process", json={"input_text": "test"})
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_fusion_quintuple(client):
    resp = await client.post("/api/v1/fusion/quintuple?input_text=Test+quintuple+fusion")
    assert resp.status_code == 200
    data = resp.json()
    assert data["fusion_id"].startswith("qf-")
    assert data["web_reasoning"]["engine"] == "PerplexityStub"


@pytest.mark.asyncio
async def test_fusion_quintuple_with_context(client):
    resp = await client.post(
        "/api/v1/fusion/quintuple?input_text=test",
        json={"modality": "image"}
    )
    assert resp.status_code == 200
    assert resp.json()["multimodal_reasoning"]["modality"] == "image"


# ─── Autonomy ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_autonomy_create_trigger(client):
    resp = await client.post("/api/v1/autonomy/triggers", json={
        "type": "time", "name": "Daily", "config": {"cron": "0 9 * * *"}
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["trigger_id"].startswith("trg-")
    assert data["name"] == "Daily"


@pytest.mark.asyncio
async def test_autonomy_list_triggers(client):
    resp = await client.get("/api/v1/autonomy/triggers")
    assert resp.status_code == 200
    data = resp.json()
    assert "triggers" in data
    assert isinstance(data["triggers"], list)


@pytest.mark.asyncio
async def test_autonomy_create_plan(client):
    resp = await client.post("/api/v1/autonomy/plans", json={"name": "Test Plan", "goal": "analyze"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["plan_id"].startswith("plan-")
    assert len(data["steps"]) == 3


@pytest.mark.asyncio
async def test_autonomy_create_plan_custom_steps(client):
    resp = await client.post("/api/v1/autonomy/plans", json={
        "name": "Custom", "goal": "do",
        "steps": [{"action": "fetch", "params": {"url": "x"}}]
    })
    assert resp.status_code == 200
    assert len(resp.json()["steps"]) == 1


@pytest.mark.asyncio
async def test_autonomy_list_plans(client):
    resp = await client.get("/api/v1/autonomy/plans")
    assert resp.status_code == 200
    assert "plans" in resp.json()


@pytest.mark.asyncio
async def test_autonomy_execute_plan(client):
    create = await client.post("/api/v1/autonomy/plans", json={"name": "Exec", "goal": "run"})
    plan_id = create.json()["plan_id"]
    resp = await client.post(f"/api/v1/autonomy/plans/{plan_id}/execute")
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_autonomy_get_plan(client):
    create = await client.post("/api/v1/autonomy/plans", json={"name": "GetMe", "goal": "find"})
    plan_id = create.json()["plan_id"]
    resp = await client.get(f"/api/v1/autonomy/plans/{plan_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "GetMe"


@pytest.mark.asyncio
async def test_autonomy_get_plan_not_found(client):
    resp = await client.get("/api/v1/autonomy/plans/nonexistent")
    assert resp.status_code == 404


# ─── Marketplace ───────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_marketplace_list(client):
    resp = await client.get("/api/v1/plugins/")
    assert resp.status_code == 200
    data = resp.json()
    assert "plugins" in data
    # Marketplace is not auto-initialized, so plugins list may be empty


@pytest.mark.asyncio
async def test_marketplace_install_not_found(client):
    resp = await client.post("/api/v1/plugins/ghost/install")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_marketplace_get_manifest_not_found(client):
    resp = await client.get("/api/v1/plugins/ghost")
    assert resp.status_code == 404


# ─── Agents ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_agents_create(client):
    resp = await client.post("/api/v1/agents/", json={"name": "TestAgent", "description": "A test agent"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["agent_id"].startswith("agent-")
    assert data["name"] == "TestAgent"
    assert data["status"] == "created"


@pytest.mark.asyncio
async def test_agents_list(client):
    resp = await client.get("/api/v1/agents/")
    assert resp.status_code == 200
    assert "agents" in resp.json()


@pytest.mark.asyncio
async def test_agents_get(client):
    create = await client.post("/api/v1/agents/", json={"name": "GetAgent"})
    agent_id = create.json()["agent_id"]
    resp = await client.get(f"/api/v1/agents/{agent_id}")
    assert resp.status_code == 200
    assert resp.json()["name"] == "GetAgent"


@pytest.mark.asyncio
async def test_agents_add_block(client):
    create = await client.post("/api/v1/agents/", json={"name": "BlockAgent"})
    agent_id = create.json()["agent_id"]
    resp = await client.post(
        f"/api/v1/agents/{agent_id}/blocks",
        json={"type": "fusion", "label": "Reason"}
    )
    assert resp.status_code == 200
    assert resp.json()["block_id"].startswith("blk-")


@pytest.mark.asyncio
async def test_agents_remove_block(client):
    create = await client.post("/api/v1/agents/", json={"name": "RemoveBlock"})
    agent_id = create.json()["agent_id"]
    add = await client.post(f"/api/v1/agents/{agent_id}/blocks", json={"type": "fusion", "label": "R"})
    block_id = add.json()["block_id"]
    resp = await client.delete(f"/api/v1/agents/{agent_id}/blocks/{block_id}")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_agents_run(client):
    create = await client.post("/api/v1/agents/", json={"name": "RunAgent"})
    agent_id = create.json()["agent_id"]
    await client.post(f"/api/v1/agents/{agent_id}/blocks", json={"type": "fusion", "label": "F"})
    resp = await client.post(f"/api/v1/agents/{agent_id}/run", json={})
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"


@pytest.mark.asyncio
async def test_agents_export(client):
    create = await client.post("/api/v1/agents/", json={"name": "ExportAgent"})
    agent_id = create.json()["agent_id"]
    resp = await client.get(f"/api/v1/agents/{agent_id}/export")
    assert resp.status_code == 200
    assert resp.json()["name"] == "ExportAgent"


# ─── Voice ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_voice_personas(client):
    resp = await client.get("/api/v1/voice/personas")
    assert resp.status_code == 200
    data = resp.json()
    assert "personas" in data
    assert len(data["personas"]) == 5


@pytest.mark.asyncio
async def test_voice_set_persona(client):
    resp = await client.post("/api/v1/voice/persona", json={"persona_id": "persona-lyra"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "Lyra"


@pytest.mark.asyncio
async def test_voice_process(client):
    """After setting persona to Lyra, process should use Lyra."""
    await client.post("/api/v1/voice/persona", json={"persona_id": "persona-oracle"})
    resp = await client.post("/api/v1/voice/process", json={"transcript": "Hello Elitze"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["persona"] == "Oracle"
    assert "response_text" in data


@pytest.mark.asyncio
async def test_voice_simulate(client):
    resp = await client.post("/api/v1/voice/simulate", json={"text": "Test microphone input"})
    assert resp.status_code == 200
    assert "response_text" in resp.json()


# ─── Workspaces ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_workspaces_create(client):
    body = {"name": "My Workspace", "description": "Test workspace", "owner_id": "owner-001"}
    resp = await client.post("/api/v1/workspaces/", json=body)
    assert resp.status_code == 200
    data = resp.json()
    assert data["workspace_id"].startswith("ws-")
    assert data["name"] == "My Workspace"


@pytest.mark.asyncio
async def test_workspaces_list(client):
    resp = await client.get("/api/v1/workspaces/")
    assert resp.status_code == 200
    data = resp.json()
    assert "workspaces" in data


@pytest.mark.asyncio
async def test_workspaces_get_active(client):
    resp = await client.get("/api/v1/workspaces/active")
    # No active workspace since WorkspaceManager is not initialized
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_workspaces_switch(client):
    create = await client.post("/api/v1/workspaces/", json={"name": "SwitchTarget", "owner_id": "owner-001"})
    ws_id = create.json()["workspace_id"]
    resp = await client.post(f"/api/v1/workspaces/{ws_id}/switch", json={"user_id": "owner-001"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "switched"


@pytest.mark.asyncio
async def test_workspaces_add_member(client):
    create = await client.post("/api/v1/workspaces/", json={"name": "MemberTest", "owner_id": "owner-001"})
    ws_id = create.json()["workspace_id"]
    resp = await client.post(
        f"/api/v1/workspaces/{ws_id}/members",
        json={"user_id": "user-002", "role": "member"}
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "added"


@pytest.mark.asyncio
async def test_workspaces_remove_member(client):
    create = await client.post("/api/v1/workspaces/", json={"name": "RemoveMemberTest", "owner_id": "owner-001"})
    ws_id = create.json()["workspace_id"]
    await client.post(f"/api/v1/workspaces/{ws_id}/members", json={"user_id": "user-002", "role": "member"})
    resp = await client.delete(f"/api/v1/workspaces/{ws_id}/members/user-002")
    assert resp.status_code == 200
    assert resp.json()["status"] == "removed"


# ─── Auth ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_auth_register(client):
    resp = await client.post("/api/v1/auth/register", json={"username": "TestUser", "role": "member"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["user_id"].startswith("user-")
    assert data["username"] == "TestUser"
    assert data["role"] == "member"


@pytest.mark.asyncio
async def test_auth_login(client):
    resp = await client.post("/api/v1/auth/login", json={"username": "OWNER", "password": "admin"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_auth_login_invalid(client):
    resp = await client.post("/api/v1/auth/login", json={"username": "ghost", "password": "wrong"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_auth_list_users(client):
    resp = await client.get("/api/v1/auth/users")
    assert resp.status_code == 200
    assert "users" in resp.json()


@pytest.mark.asyncio
async def test_auth_get_user(client):
    resp = await client.get("/api/v1/auth/users/owner-001")
    assert resp.status_code == 200
    assert resp.json()["username"] == "OWNER"


@pytest.mark.asyncio
async def test_auth_owner_override(client):
    resp = await client.post("/api/v1/auth/owner-override", json={
        "user_id": "owner-001", "reason": "Emergency"
    })
    assert resp.status_code == 200
    assert resp.json()["status"] == "approved"
