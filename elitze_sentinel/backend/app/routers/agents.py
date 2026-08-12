# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from fastapi import APIRouter, HTTPException
from ..core.agent_builder import AgentBuilderEngine, BlockType
from ..models.agent import AgentRequest
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/agents", tags=["Agents"])

builder = AgentBuilderEngine()


class AddBlockRequest(BaseModel):
    type: str = Field(..., description="BlockType: fusion, plugin, logic, output")
    label: str
    config: Dict[str, Any] = Field(default_factory=dict)


class RunRequest(BaseModel):
    input_data: Optional[Dict[str, Any]] = None


@router.post("/")
async def create_agent(body: AgentRequest):
    agent = builder.create_agent(name=body.name, description=body.description, tags=body.tags)
    for b in body.blocks:
        try:
            block_type = BlockType(b.type)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid block type: {b.type}")
        builder.add_block(agent.agent_id, block_type, b.label, b.config)
    return {"agent_id": agent.agent_id, "name": agent.name, "description": agent.description, "blocks": len(agent.blocks), "version": agent.version, "tags": agent.tags, "status": "created"}


@router.get("/")
async def list_agents():
    return {"agents": builder.list_agents()}


@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    agent = builder.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"agent_id": agent.agent_id, "name": agent.name, "description": agent.description, "version": agent.version, "tags": agent.tags, "blocks": [{"block_id": b.block_id, "type": b.type.value, "label": b.label, "config": b.config} for b in agent.blocks]}


@router.post("/{agent_id}/blocks")
async def add_block(agent_id: str, body: AddBlockRequest):
    try:
        block_type = BlockType(body.type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid block type: {body.type}")
    block = builder.add_block(agent_id, block_type, body.label, body.config)
    if not block:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"block_id": block.block_id, "type": block.type.value, "label": block.label, "config": block.config}


@router.delete("/{agent_id}/blocks/{block_id}")
async def remove_block(agent_id: str, block_id: str):
    removed = builder.remove_block(agent_id, block_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Agent or block not found")
    return {"status": "removed", "block_id": block_id}


@router.post("/{agent_id}/run")
async def run_agent(agent_id: str, body: RunRequest):
    result = await builder.run_agent(agent_id, body.input_data)
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/{agent_id}/export")
async def export_agent(agent_id: str):
    data = builder.export_agent(agent_id)
    if not data:
        raise HTTPException(status_code=404, detail="Agent not found")
    return data
