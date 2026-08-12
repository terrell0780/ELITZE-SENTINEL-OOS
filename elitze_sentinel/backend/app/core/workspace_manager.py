# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
Workspace Manager — Multi-tenant isolation for Elitze Sentinel.
- Workspace creation and lifecycle
- Isolated data and plugins
- Role-based access control inside each workspace
- Switch active workspace
"""

import uuid
import time
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum


class Role(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


@dataclass
class Workspace:
    workspace_id: str
    name: str
    description: str = ""
    created_at: str = ""
    members: Dict[str, Role] = field(default_factory=dict)
    plugins: List[str] = field(default_factory=list)
    agents: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    isolated: bool = True


class RBACManager:
    """Role-based access control within a workspace."""

    def __init__(self):
        self.role_hierarchy = {Role.OWNER: 100, Role.ADMIN: 80, Role.MEMBER: 50, Role.VIEWER: 10}

    def has_permission(self, user_role: Role, required_role: Role) -> bool:
        return self.role_hierarchy.get(user_role, 0) >= self.role_hierarchy.get(required_role, 0)

    def can_manage(self, user_role: Role) -> bool:
        return user_role in (Role.OWNER, Role.ADMIN)

    def can_write(self, user_role: Role) -> bool:
        return user_role in (Role.OWNER, Role.ADMIN, Role.MEMBER)


class WorkspaceManager:
    """Elitze Sentinel Workspace Manager — multi-tenant isolation."""

    def __init__(self, governance=None):
        self.name = "Elitze Workspace Manager"
        self.governance = governance
        self.workspaces: Dict[str, Workspace] = {}
        self.active_workspace_id: Optional[str] = None
        self.rbac = RBACManager()
        self._initialized = False

    async def initialize(self):
        self._initialized = True
        root = self.create_workspace("Root Workspace", "Default system workspace", "owner-001")
        self.active_workspace_id = root.workspace_id

    def create_workspace(self, name: str, description: str, owner_id: str) -> Workspace:
        ws = Workspace(
            workspace_id=f"ws-{uuid.uuid4().hex[:12]}",
            name=name,
            description=description,
            created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            members={owner_id: Role.OWNER},
        )
        self.workspaces[ws.workspace_id] = ws
        return ws

    def get_workspace(self, workspace_id: str) -> Optional[Workspace]:
        return self.workspaces.get(workspace_id)

    def list_workspaces(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if user_id:
            return [{"workspace_id": ws.workspace_id, "name": ws.name, "my_role": ws.members.get(user_id, Role.VIEWER).value} for ws in self.workspaces.values() if user_id in ws.members]
        return [{"workspace_id": ws.workspace_id, "name": ws.name, "member_count": len(ws.members)} for ws in self.workspaces.values()]

    def switch_workspace(self, workspace_id: str, user_id: str) -> bool:
        ws = self.workspaces.get(workspace_id)
        if not ws or user_id not in ws.members:
            return False
        self.active_workspace_id = workspace_id
        return True

    def add_member(self, workspace_id: str, user_id: str, role: Role, actor_id: str) -> bool:
        ws = self.workspaces.get(workspace_id)
        if not ws:
            return False
        actor_role = ws.members.get(actor_id)
        if not actor_role or not self.rbac.can_manage(actor_role):
            return False
        ws.members[user_id] = role
        return True

    def remove_member(self, workspace_id: str, user_id: str, actor_id: str) -> bool:
        ws = self.workspaces.get(workspace_id)
        if not ws or user_id not in ws.members:
            return False
        actor_role = ws.members.get(actor_id)
        if not actor_role or not self.rbac.can_manage(actor_role):
            return False
        del ws.members[user_id]
        return True

    def get_active_workspace(self) -> Optional[Workspace]:
        if self.active_workspace_id:
            return self.workspaces.get(self.active_workspace_id)
        return None

    def add_plugin(self, workspace_id: str, plugin_id: str, actor_id: str) -> bool:
        ws = self.workspaces.get(workspace_id)
        if not ws:
            return False
        actor_role = ws.members.get(actor_id)
        if not actor_role or not self.rbac.can_manage(actor_role):
            return False
        if plugin_id not in ws.plugins:
            ws.plugins.append(plugin_id)
        return True

    def add_agent(self, workspace_id: str, agent_id: str, actor_id: str) -> bool:
        ws = self.workspaces.get(workspace_id)
        if not ws:
            return False
        actor_role = ws.members.get(actor_id)
        if not actor_role or not self.rbac.can_write(actor_role):
            return False
        if agent_id not in ws.agents:
            ws.agents.append(agent_id)
        return True
