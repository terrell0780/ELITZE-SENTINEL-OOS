# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class TenantPlan(str, Enum):
    CORE = "core"
    STUDIO = "studio"
    ENTERPRISE = "enterprise"


class TenantRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


@dataclass
class Tenant:
    tenant_id: str
    name: str
    slug: str
    plan: TenantPlan
    is_active: bool
    settings: dict
    created_at: str


@dataclass
class TenantMember:
    member_id: str
    tenant_id: str
    user_id: str
    role: TenantRole
    joined_at: str


class TenantManager:
    def __init__(self):
        self._tenants: dict[str, Tenant] = {}
        self._members: dict[str, TenantMember] = {}

    def create_tenant(self, name: str, slug: str, plan: TenantPlan) -> Tenant:
        tenant_id = f"tnt-{uuid.uuid4().hex[:12]}"
        tenant = Tenant(
            tenant_id=tenant_id,
            name=name,
            slug=slug,
            plan=plan,
            is_active=True,
            settings={},
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self._tenants[tenant_id] = tenant
        return tenant

    def get_tenant(self, tenant_id: str) -> Optional[Tenant]:
        return self._tenants.get(tenant_id)

    def get_tenant_by_slug(self, slug: str) -> Optional[Tenant]:
        for tenant in self._tenants.values():
            if tenant.slug == slug:
                return tenant
        return None

    def list_tenants(self) -> list[Tenant]:
        return list(self._tenants.values())

    def deactivate_tenant(self, tenant_id: str) -> Optional[Tenant]:
        tenant = self._tenants.get(tenant_id)
        if tenant is None:
            return None
        tenant.is_active = False
        return tenant

    def add_member(self, tenant_id: str, user_id: str, role: TenantRole) -> Optional[TenantMember]:
        tenant = self._tenants.get(tenant_id)
        if tenant is None:
            return None
        member_id = f"mem-{uuid.uuid4().hex[:12]}"
        member = TenantMember(
            member_id=member_id,
            tenant_id=tenant_id,
            user_id=user_id,
            role=role,
            joined_at=datetime.now(timezone.utc).isoformat(),
        )
        self._members[member_id] = member
        return member

    def remove_member(self, tenant_id: str, user_id: str) -> bool:
        to_remove = None
        for mid, mem in self._members.items():
            if mem.tenant_id == tenant_id and mem.user_id == user_id:
                to_remove = mid
                break
        if to_remove is None:
            return False
        del self._members[to_remove]
        return True

    def list_members(self, tenant_id: str) -> list[TenantMember]:
        return [m for m in self._members.values() if m.tenant_id == tenant_id]

    def get_member(self, tenant_id: str, user_id: str) -> Optional[TenantMember]:
        for m in self._members.values():
            if m.tenant_id == tenant_id and m.user_id == user_id:
                return m
        return None

    def update_plan(self, tenant_id: str, new_plan: TenantPlan) -> Optional[Tenant]:
        tenant = self._tenants.get(tenant_id)
        if tenant is None:
            return None
        tenant.plan = new_plan
        return tenant

    def is_full(self, tenant_id: str) -> bool:
        tenant = self._tenants.get(tenant_id)
        if tenant is None:
            return True
        limits = {TenantPlan.CORE: 5, TenantPlan.STUDIO: 50, TenantPlan.ENTERPRISE: float("inf")}
        member_count = len(self.list_members(tenant_id))
        limit = limits[tenant.plan]
        return member_count >= limit
