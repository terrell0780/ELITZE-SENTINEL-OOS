# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from pydantic import BaseModel, Field
from typing import Any, Dict, List


class BlockDef(BaseModel):
    type: str = Field(..., description="block type: fusion, plugin, logic, output")
    label: str
    config: Dict[str, Any] = Field(default_factory=dict)


class AgentRequest(BaseModel):
    name: str
    description: str = ""
    blocks: List[BlockDef] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class AgentResponse(BaseModel):
    agent_id: str
    name: str
    description: str = ""
    blocks: list = []
    version: str = "1.0.0"
    status: str = "created"
