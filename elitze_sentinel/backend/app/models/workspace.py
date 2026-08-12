# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from pydantic import BaseModel
from typing import Optional


class WorkspaceCreate(BaseModel):
    name: str
    description: str = ""
    owner_id: str = "owner-001"


class WorkspaceResponse(BaseModel):
    workspace_id: str
    name: str
    description: str = ""
    created_at: str = ""
    member_count: int = 0
    plugin_count: int = 0
    agent_count: int = 0
    my_role: Optional[str] = None
