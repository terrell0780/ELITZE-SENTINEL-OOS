# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
Governance + SENTINEL Permission Layer — Sovereign authority for Elitze Sentinel.
- Role-based permissions with owner override
- Workspace isolation
- Action gating (fusion.run, autonomy.run, plugin.use)
- Enterprise-ready access control
"""

import uuid
import time
from typing import Any, Dict, List, Optional, Set
from dataclasses import dataclass, field
from enum import Enum


class Role(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    WORKSPACE_ADMIN = "workspace_admin"
    MEMBER = "member"
    VIEWER = "viewer"


class Action(str, Enum):
    FUSION_RUN = "fusion.run"
    AUTONOMY_RUN = "autonomy.run"
    PLUGIN_USE = "plugin.use"
    PLUGIN_INSTALL = "plugin.install"
    AGENT_CREATE = "agent.create"
    AGENT_EXPORT = "agent.export"
    WORKSPACE_MANAGE = "workspace.manage"
    VOICE_USE = "voice.use"
    ADMIN_OVERRIDE = "admin.override"


ROLE_PERMISSIONS: Dict[Role, Set[Action]] = {
    Role.OWNER: {
        Action.FUSION_RUN, Action.AUTONOMY_RUN, Action.PLUGIN_USE, Action.PLUGIN_INSTALL,
        Action.AGENT_CREATE, Action.AGENT_EXPORT, Action.WORKSPACE_MANAGE, Action.VOICE_USE,
        Action.ADMIN_OVERRIDE,
    },
    Role.ADMIN: {
        Action.FUSION_RUN, Action.AUTONOMY_RUN, Action.PLUGIN_USE, Action.PLUGIN_INSTALL,
        Action.AGENT_CREATE, Action.AGENT_EXPORT, Action.WORKSPACE_MANAGE, Action.VOICE_USE,
    },
    Role.WORKSPACE_ADMIN: {
        Action.FUSION_RUN, Action.AUTONOMY_RUN, Action.PLUGIN_USE,
        Action.AGENT_CREATE, Action.VOICE_USE,
    },
    Role.MEMBER: {
        Action.FUSION_RUN, Action.PLUGIN_USE, Action.AGENT_CREATE, Action.VOICE_USE,
    },
    Role.VIEWER: set(),
}


@dataclass
class User:
    user_id: str
    username: str
    role: Role
    workspace_ids: List[str] = field(default_factory=list)


class SentinelPermissionLayer:
    """
    SENTINEL — Sovereign Enforcement for Network Trust, Integrity, and Enhanced Logic-gate Layer.
    Handles all authorization checks, owner override, and action gating.
    """

    def __init__(self):
        self.name = "SENTINEL Permission Layer"
        self.owner_override_key = str(uuid.uuid4())
        self._users: Dict[str, User] = {}
        self._seed_owner()

    def _seed_owner(self):
        owner = User(user_id="owner-001", username="OWNER", role=Role.OWNER, workspace_ids=["workspace-root"])
        self._users[owner.user_id] = owner

    def register_user(self, user_id: str, username: str, role: Role, workspaces: Optional[List[str]] = None) -> User:
        user = User(user_id=user_id, username=username, role=role, workspace_ids=workspaces or [])
        self._users[user_id] = user
        return user

    def check_permission(self, user_id: str, action: Action, workspace_id: Optional[str] = None) -> bool:
        user = self._users.get(user_id)
        if not user:
            return False
        if user.role == Role.OWNER:
            return True
        if workspace_id and workspace_id not in user.workspace_ids:
            return False
        return action in ROLE_PERMISSIONS.get(user.role, set())

    def get_user(self, user_id: str) -> Optional[User]:
        return self._users.get(user_id)

    def list_users(self) -> List[Dict[str, Any]]:
        return [{"user_id": u.user_id, "username": u.username, "role": u.role.value, "workspaces": u.workspace_ids} for u in self._users.values()]

    def owner_override(self, requesting_user_id: str, reason: str) -> Dict[str, Any]:
        user = self._users.get(requesting_user_id)
        if not user or user.role != Role.OWNER:
            return {"status": "denied", "error": "Only OWNER can invoke override"}
        return {"status": "approved", "override_key": self.owner_override_key, "reason": reason, "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
