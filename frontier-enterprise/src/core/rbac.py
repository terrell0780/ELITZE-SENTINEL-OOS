# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class Action(str, Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    ADMIN = "admin"


class RoleType(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    WORKSPACE_ADMIN = "workspace_admin"
    MEMBER = "member"
    VIEWER = "viewer"


@dataclass
class Permission:
    permission_id: str
    name: str
    resource: str
    action: Action
    description: str


@dataclass
class Role:
    role_id: str
    name: str
    permissions: list[Permission]
    is_system_role: bool


@dataclass
class UserRoleBinding:
    binding_id: str
    user_id: str
    role_id: str
    workspace_id: Optional[str]
    granted_at: str
    granted_by: str


class RBACManager:
    def __init__(self):
        self._permissions: dict[str, Permission] = {}
        self._roles: dict[str, Role] = {}
        self._bindings: dict[str, UserRoleBinding] = {}
        self._seed_system_roles()

    def _make_perm(self, name: str, resource: str, action: Action, description: str = "") -> Permission:
        perm_id = f"perm-{uuid.uuid4().hex[:8]}"
        p = Permission(permission_id=perm_id, name=name, resource=resource, action=action, description=description)
        self._permissions[perm_id] = p
        return p

    def _seed_system_roles(self):
        all_actions = [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.ADMIN]
        no_admin = [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE]
        crud = [Action.CREATE, Action.READ, Action.UPDATE]
        cr = [Action.CREATE, Action.READ]
        r = [Action.READ]

        sa_perms = [self._make_perm(f"super_admin_{a.value}", "*", a) for a in all_actions]
        self._roles["role-super_admin"] = Role(
            role_id="role-super_admin", name=RoleType.SUPER_ADMIN.value, permissions=sa_perms, is_system_role=True
        )
        ad_perms = [self._make_perm(f"admin_{a.value}", "*", a) for a in no_admin]
        self._roles["role-admin"] = Role(
            role_id="role-admin", name=RoleType.ADMIN.value, permissions=ad_perms, is_system_role=True
        )
        wa_perms = [self._make_perm(f"workspace_admin_{a.value}", "workspace", a) for a in crud]
        self._roles["role-workspace_admin"] = Role(
            role_id="role-workspace_admin", name=RoleType.WORKSPACE_ADMIN.value, permissions=wa_perms, is_system_role=True
        )
        m_perms = [self._make_perm(f"member_{a.value}", "workspace", a) for a in cr]
        self._roles["role-member"] = Role(
            role_id="role-member", name=RoleType.MEMBER.value, permissions=m_perms, is_system_role=True
        )
        v_perms = [self._make_perm(f"viewer_{a.value}", "workspace", a) for a in r]
        self._roles["role-viewer"] = Role(
            role_id="role-viewer", name=RoleType.VIEWER.value, permissions=v_perms, is_system_role=True
        )

    def create_role(self, name: str, permissions: list[Action], is_system_role: bool = False) -> Role:
        role_id = f"role-{uuid.uuid4().hex[:12]}"
        role_perms = []
        for action in permissions:
            perm = self._make_perm(f"{name}_{action.value}", name, action)
            role_perms.append(perm)
        role = Role(role_id=role_id, name=name, permissions=role_perms, is_system_role=is_system_role)
        self._roles[role_id] = role
        return role

    def get_role(self, role_id: str) -> Optional[Role]:
        return self._roles.get(role_id)

    def list_roles(self) -> list[Role]:
        return list(self._roles.values())

    def delete_role(self, role_id: str) -> bool:
        role = self._roles.get(role_id)
        if role is None or role.is_system_role:
            return False
        del self._roles[role_id]
        return True

    def assign_role(self, user_id: str, role_id: str, workspace_id: Optional[str] = None, granted_by: str = "") -> UserRoleBinding:
        binding_id = f"bind-{uuid.uuid4().hex[:12]}"
        binding = UserRoleBinding(
            binding_id=binding_id,
            user_id=user_id,
            role_id=role_id,
            workspace_id=workspace_id,
            granted_at=datetime.now(timezone.utc).isoformat(),
            granted_by=granted_by,
        )
        self._bindings[binding_id] = binding
        return binding

    def revoke_role(self, binding_id: str) -> bool:
        binding = self._bindings.pop(binding_id, None)
        return binding is not None

    def get_user_permissions(self, user_id: str, workspace_id: Optional[str] = None) -> list[Action]:
        actions: set[Action] = set()
        for binding in self._bindings.values():
            if binding.user_id != user_id:
                continue
            if workspace_id and binding.workspace_id and binding.workspace_id != workspace_id:
                continue
            role = self._roles.get(binding.role_id)
            if role:
                for perm in role.permissions:
                    actions.add(perm.action)
        return list(actions)

    def check_permission(self, user_id: str, action: Action, resource: str, workspace_id: Optional[str] = None) -> bool:
        permissions = self.get_user_permissions(user_id, workspace_id)
        return action in permissions
