# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
Agent Builder Studio — Drag-and-drop blocks for creating autonomous agents.
Block types: fusion, plugin, logic, output.
Agents are JSON-serializable and exportable.
"""

import uuid
import json
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field, asdict
from enum import Enum


class BlockType(str, Enum):
    FUSION = "fusion"
    PLUGIN = "plugin"
    LOGIC = "logic"
    OUTPUT = "output"


@dataclass
class AgentBlock:
    block_id: str
    type: BlockType
    label: str
    config: Dict[str, Any] = field(default_factory=dict)
    connections: List[str] = field(default_factory=list)
    position: Dict[str, int] = field(default_factory=lambda: {"x": 0, "y": 0})


@dataclass
class AgentModel:
    agent_id: str
    name: str
    description: str = ""
    blocks: List[AgentBlock] = field(default_factory=list)
    version: str = "1.0.0"
    created_at: str = ""
    updated_at: str = ""
    tags: List[str] = field(default_factory=list)
    workspace_id: Optional[str] = None

    def to_json(self) -> str:
        return json.dumps({"agent_id": self.agent_id, "name": self.name, "description": self.description, "version": self.version, "blocks": [asdict(b) for b in self.blocks], "tags": self.tags}, indent=2)

    @classmethod
    def from_json(cls, data: str) -> "AgentModel":
        d = json.loads(data)
        blocks = [AgentBlock(**b) for b in d.get("blocks", [])]
        return cls(agent_id=d.get("agent_id", str(uuid.uuid4())), name=d["name"], description=d.get("description", ""), blocks=blocks, version=d.get("version", "1.0.0"), tags=d.get("tags", []))


class AgentEngine:
    """Executes an AgentModel by running its blocks in sequence."""

    def __init__(self):
        self.name = "Elitze Agent Engine"

    async def run_agent(self, agent: AgentModel, input_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        results = []
        context = {"input": input_data or {}, "blocks": {}}
        for block in agent.blocks:
            result = await self._execute_block(block, context)
            context["blocks"][block.block_id] = result
            results.append({"block_id": block.block_id, "label": block.label, "type": block.type.value, "result": result})
        return {"agent_id": agent.agent_id, "name": agent.name, "status": "completed", "steps": len(results), "results": results, "context": context}

    async def _execute_block(self, block: AgentBlock, context: Dict) -> Any:
        if block.type == BlockType.FUSION:
            return {"status": "stubbed", "message": "[Fusion] Reasoning complete", "confidence": 0.95}
        elif block.type == BlockType.PLUGIN:
            return {"status": "stubbed", "plugin": block.config.get("plugin_id", "unknown"), "action": "executed"}
        elif block.type == BlockType.LOGIC:
            condition = block.config.get("condition", "True")
            normalized = condition.strip().lower()
            result = normalized in ("true", "1", "yes") if normalized in ("true", "false", "1", "0", "yes", "no") else True
            return {"status": "evaluated", "condition": condition, "result": result}
        elif block.type == BlockType.OUTPUT:
            return {"status": "output", "format": block.config.get("format", "text"), "preview": f"[Output] Agent: {context.get('input', {})}"}
        return {"status": "unknown", "type": block.type.value}


class AgentBuilderEngine:
    """Agent Builder Studio — create, edit, save, load, and export agents."""

    def __init__(self):
        self.name = "Elitze Agent Builder"
        self.agents: Dict[str, AgentModel] = {}
        self.engine = AgentEngine()
        self._initialized = False

    async def initialize(self):
        self._initialized = True

    def create_agent(self, name: str, description: str = "", tags: Optional[List[str]] = None) -> AgentModel:
        agent = AgentModel(agent_id=f"agent-{uuid.uuid4().hex[:12]}", name=name, description=description, tags=tags or [])
        self.agents[agent.agent_id] = agent
        return agent

    def add_block(self, agent_id: str, block_type: BlockType, label: str, config: Optional[Dict] = None) -> Optional[AgentBlock]:
        agent = self.agents.get(agent_id)
        if not agent:
            return None
        block = AgentBlock(block_id=f"blk-{uuid.uuid4().hex[:8]}", type=block_type, label=label, config=config or {})
        agent.blocks.append(block)
        return block

    def remove_block(self, agent_id: str, block_id: str) -> bool:
        agent = self.agents.get(agent_id)
        if not agent:
            return False
        agent.blocks = [b for b in agent.blocks if b.block_id != block_id]
        return True

    def get_agent(self, agent_id: str) -> Optional[AgentModel]:
        return self.agents.get(agent_id)

    def list_agents(self) -> List[Dict[str, Any]]:
        return [{"agent_id": a.agent_id, "name": a.name, "blocks": len(a.blocks), "version": a.version, "tags": a.tags} for a in self.agents.values()]

    def save_agent_json(self, agent_id: str) -> Optional[str]:
        agent = self.agents.get(agent_id)
        return agent.to_json() if agent else None

    def load_agent_json(self, json_str: str) -> AgentModel:
        agent = AgentModel.from_json(json_str)
        self.agents[agent.agent_id] = agent
        return agent

    def export_agent(self, agent_id: str) -> Optional[Dict[str, Any]]:
        agent = self.agents.get(agent_id)
        if not agent:
            return None
        return {"agent_id": agent.agent_id, "name": agent.name, "version": agent.version, "blocks": [asdict(b) for b in agent.blocks], "metadata": {"engine": self.engine.name, "exported_at": __import__("time").strftime("%Y-%m-%dT%H:%M:%SZ", __import__("time").gmtime())}}

    async def run_agent(self, agent_id: str, input_data: Optional[Dict] = None) -> Dict[str, Any]:
        agent = self.agents.get(agent_id)
        if not agent:
            return {"status": "error", "error": "Agent not found"}
        return await self.engine.run_agent(agent, input_data)
