# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import pytest
from src.core.multi_tenancy import TenantManager, TenantPlan, TenantRole


@pytest.fixture
def tm():
    return TenantManager()


class TestTenantManager:
    def test_create_tenant(self, tm):
        tenant = tm.create_tenant("Acme Corp", "acme-corp", TenantPlan.ENTERPRISE)
        assert tenant.name == "Acme Corp"
        assert tenant.slug == "acme-corp"
        assert tenant.plan == TenantPlan.ENTERPRISE
        assert tenant.is_active is True
        assert tenant.tenant_id.startswith("tnt-")

    def test_get_tenant(self, tm):
        t = tm.create_tenant("Test Inc", "test-inc", TenantPlan.STUDIO)
        found = tm.get_tenant(t.tenant_id)
        assert found is not None
        assert found.name == "Test Inc"

    def test_get_tenant_not_found(self, tm):
        assert tm.get_tenant("tnt-nonexistent") is None

    def test_get_tenant_by_slug(self, tm):
        tm.create_tenant("Alpha", "alpha-co", TenantPlan.CORE)
        found = tm.get_tenant_by_slug("alpha-co")
        assert found is not None
        assert found.name == "Alpha"

    def test_list_tenants(self, tm):
        tm.create_tenant("T1", "t1", TenantPlan.CORE)
        tm.create_tenant("T2", "t2", TenantPlan.STUDIO)
        assert len(tm.list_tenants()) == 2

    def test_deactivate_tenant(self, tm):
        t = tm.create_tenant("Active Co", "active", TenantPlan.CORE)
        assert t.is_active is True
        deactivated = tm.deactivate_tenant(t.tenant_id)
        assert deactivated.is_active is False

    def test_add_and_list_members(self, tm):
        t = tm.create_tenant("Team Co", "team-co", TenantPlan.STUDIO)
        tm.add_member(t.tenant_id, "user-1", TenantRole.OWNER)
        tm.add_member(t.tenant_id, "user-2", TenantRole.MEMBER)
        members = tm.list_members(t.tenant_id)
        assert len(members) == 2

    def test_get_member(self, tm):
        t = tm.create_tenant("Get Co", "get-co", TenantPlan.CORE)
        tm.add_member(t.tenant_id, "user-99", TenantRole.ADMIN)
        member = tm.get_member(t.tenant_id, "user-99")
        assert member is not None
        assert member.role == TenantRole.ADMIN

    def test_remove_member(self, tm):
        t = tm.create_tenant("Remove Co", "remove-co", TenantPlan.CORE)
        tm.add_member(t.tenant_id, "user-del", TenantRole.MEMBER)
        assert len(tm.list_members(t.tenant_id)) == 1
        assert tm.remove_member(t.tenant_id, "user-del") is True
        assert len(tm.list_members(t.tenant_id)) == 0

    def test_update_plan(self, tm):
        t = tm.create_tenant("Upgrade Co", "upgrade", TenantPlan.CORE)
        updated = tm.update_plan(t.tenant_id, TenantPlan.ENTERPRISE)
        assert updated.plan == TenantPlan.ENTERPRISE

    def test_is_full_core(self, tm):
        t = tm.create_tenant("Small Co", "small", TenantPlan.CORE)
        for i in range(5):
            tm.add_member(t.tenant_id, f"user-{i}", TenantRole.MEMBER)
        assert tm.is_full(t.tenant_id) is True

    def test_is_full_enterprise_unlimited(self, tm):
        t = tm.create_tenant("Big Co", "big", TenantPlan.ENTERPRISE)
        for i in range(100):
            tm.add_member(t.tenant_id, f"user-{i}", TenantRole.MEMBER)
        assert tm.is_full(t.tenant_id) is False
