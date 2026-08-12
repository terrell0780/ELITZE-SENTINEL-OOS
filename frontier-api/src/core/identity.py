# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class TenantPlan(str, Enum):
    FREE = "free"
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class TenantStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"


@dataclass
class Tenant:
    tenant_id: str
    name: str
    slug: str
    plan: TenantPlan
    status: TenantStatus
    settings: dict[str, Any] = field(default_factory=dict)
    created_at: float = 0.0
    updated_at: float = 0.0
    member_count: int = 0


@dataclass
class User:
    user_id: str
    email: str
    display_name: str
    is_active: bool = True
    roles: list[str] = field(default_factory=list)
    mfa_enabled: bool = False
    created_at: float = 0.0


@dataclass
class Group:
    group_id: str
    name: str
    description: str = ""
    member_ids: list[str] = field(default_factory=list)
    created_at: float = 0.0


@dataclass
class ApiKey:
    key_id: str
    name: str
    key_prefix: str
    tenant_id: str
    user_id: str
    permissions: list[str] = field(default_factory=list)
    expires_at: float = 0.0
    created_at: float = 0.0
    last_used_at: float | None = None
    is_revoked: bool = False


class IdentityManager:
    def __init__(self):
        self._tenants: dict[str, Tenant] = {}
        self._users: dict[str, User] = {}
        self._groups: dict[str, Group] = {}
        self._api_keys: dict[str, ApiKey] = {}
        self._slug_index: dict[str, str] = {}

    def _now(self) -> float:
        return time.time()

    # ── Tenants ──────────────────────────────────────────────────────

    def create_tenant(self, name: str, slug: str, plan: str) -> Tenant:
        plan_enum = TenantPlan(plan.lower()) if isinstance(plan, str) else plan
        slug = slug.lower()
        if not slug.isalnum():
            raise ValueError("Slug must be lowercase alphanumeric")
        tenant_id = "tnt-" + uuid.uuid4().hex[:12]
        now = self._now()
        tenant = Tenant(
            tenant_id=tenant_id, name=name, slug=slug, plan=plan_enum,
            status=TenantStatus.ACTIVE, created_at=now, updated_at=now, member_count=0
        )
        self._tenants[tenant_id] = tenant
        self._slug_index[slug] = tenant_id
        return tenant

    def get_tenant(self, tenant_id: str) -> Tenant | None:
        return self._tenants.get(tenant_id)

    def get_tenant_by_slug(self, slug: str) -> Tenant | None:
        tid = self._slug_index.get(slug)
        return self._tenants.get(tid) if tid else None

    def list_tenants(self, plan: str | None = None, status: str | None = None) -> list[dict]:
        result = []
        for t in self._tenants.values():
            if plan and t.plan.value != plan.lower():
                continue
            if status and t.status.value != status.lower():
                continue
            result.append({
                "tenant_id": t.tenant_id, "name": t.name, "slug": t.slug,
                "plan": t.plan.value, "status": t.status.value,
                "member_count": t.member_count, "created_at": t.created_at, "updated_at": t.updated_at
            })
        return result

    def update_tenant(self, tenant_id: str, updates: dict) -> Tenant:
        tenant = self._tenants.get(tenant_id)
        if not tenant:
            raise ValueError(f"Tenant {tenant_id} not found")
        if "name" in updates:
            tenant.name = updates["name"]
        if "plan" in updates:
            tenant.plan = TenantPlan(updates["plan"].lower())
        if "settings" in updates:
            tenant.settings.update(updates["settings"])
        tenant.updated_at = self._now()
        return tenant

    def suspend_tenant(self, tenant_id: str) -> bool:
        tenant = self._tenants.get(tenant_id)
        if not tenant:
            return False
        tenant.status = TenantStatus.SUSPENDED
        tenant.updated_at = self._now()
        return True

    # ── Users ────────────────────────────────────────────────────────

    def register_user(self, email: str, display_name: str) -> User:
        user_id = "usr-" + uuid.uuid4().hex[:12]
        user = User(user_id=user_id, email=email, display_name=display_name,
                     is_active=True, roles=[], mfa_enabled=False, created_at=self._now())
        self._users[user_id] = user
        return user

    def get_user(self, user_id: str) -> User | None:
        return self._users.get(user_id)

    def list_users(self, tenant_id: str | None = None) -> list[dict]:
        result = []
        for u in self._users.values():
            if tenant_id and tenant_id not in getattr(u, "tenant_ids", []):
                continue
            result.append({
                "user_id": u.user_id, "email": u.email, "display_name": u.display_name,
                "is_active": u.is_active, "roles": u.roles, "mfa_enabled": u.mfa_enabled,
                "created_at": u.created_at
            })
        return result

    def deactivate_user(self, user_id: str) -> bool:
        user = self._users.get(user_id)
        if not user:
            return False
        user.is_active = False
        return True

    # ── Groups ───────────────────────────────────────────────────────

    def create_group(self, name: str, description: str = "") -> Group:
        group_id = "grp-" + uuid.uuid4().hex[:12]
        group = Group(group_id=group_id, name=name, description=description,
                       member_ids=[], created_at=self._now())
        self._groups[group_id] = group
        return group

    def get_group(self, group_id: str) -> Group | None:
        return self._groups.get(group_id)

    def list_groups(self) -> list[dict]:
        return [
            {"group_id": g.group_id, "name": g.name, "description": g.description,
             "member_count": len(g.member_ids), "created_at": g.created_at}
            for g in self._groups.values()
        ]

    def add_user_to_group(self, group_id: str, user_id: str) -> bool:
        group = self._groups.get(group_id)
        user = self._users.get(user_id)
        if not group or not user:
            return False
        if user_id not in group.member_ids:
            group.member_ids.append(user_id)
        return True

    def remove_user_from_group(self, group_id: str, user_id: str) -> bool:
        group = self._groups.get(group_id)
        if not group or user_id not in group.member_ids:
            return False
        group.member_ids.remove(user_id)
        return True

    # ── API Keys ─────────────────────────────────────────────────────

    def create_api_key(self, name: str, tenant_id: str, user_id: str,
                       permissions: list[str], expires_in_days: int = 365) -> ApiKey:
        key_id = "key-" + uuid.uuid4().hex[:12]
        key_prefix = uuid.uuid4().hex[:8]
        now = self._now()
        api_key = ApiKey(
            key_id=key_id, name=name, key_prefix=key_prefix,
            tenant_id=tenant_id, user_id=user_id, permissions=permissions,
            expires_at=now + expires_in_days * 86400, created_at=now,
            last_used_at=None, is_revoked=False
        )
        self._api_keys[key_id] = api_key
        return api_key

    def get_api_key(self, key_id: str) -> ApiKey | None:
        return self._api_keys.get(key_id)

    def list_api_keys(self, tenant_id: str | None = None) -> list[dict]:
        result = []
        for k in self._api_keys.values():
            if tenant_id and k.tenant_id != tenant_id:
                continue
            result.append({
                "key_id": k.key_id, "name": k.name, "key_prefix": k.key_prefix,
                "tenant_id": k.tenant_id, "user_id": k.user_id,
                "permissions": k.permissions, "expires_at": k.expires_at,
                "created_at": k.created_at, "last_used_at": k.last_used_at,
                "is_revoked": k.is_revoked
            })
        return result

    def revoke_api_key(self, key_id: str) -> bool:
        key = self._api_keys.get(key_id)
        if not key:
            return False
        key.is_revoked = True
        return True

    def validate_api_key(self, key_id: str) -> bool:
        key = self._api_keys.get(key_id)
        if not key:
            return False
        if key.is_revoked:
            return False
        if key.expires_at < self._now():
            return False
        key.last_used_at = self._now()
        return True
