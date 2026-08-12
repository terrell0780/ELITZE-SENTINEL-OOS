# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import pytest
from src.core.rbac import RBACManager, Action, RoleType


@pytest.fixture
def rbac():
    return RBACManager()


class TestRBACManager:
    def test_seeded_system_roles(self, rbac):
        roles = rbac.list_roles()
        assert len(roles) == 5
        names = {r.name for r in roles}
        assert names == {
            RoleType.SUPER_ADMIN,
            RoleType.ADMIN,
            RoleType.WORKSPACE_ADMIN,
            RoleType.MEMBER,
            RoleType.VIEWER,
        }

    def test_super_admin_has_all_actions(self, rbac):
        role = rbac.get_role("role-super_admin")
        assert role is not None
        actions = {p.action for p in role.permissions}
        assert actions == {
            Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.ADMIN,
        }

    def test_viewer_only_read(self, rbac):
        role = rbac.get_role("role-viewer")
        assert role is not None
        actions = {p.action for p in role.permissions}
        assert actions == {Action.READ}

    def test_create_custom_role(self, rbac):
        role = rbac.create_role("custom_role", [Action.READ, Action.UPDATE])
        assert role.name == "custom_role"
        assert len(role.permissions) == 2
        assert role.is_system_role is False

    def test_delete_system_role_fails(self, rbac):
        result = rbac.delete_role("role-super_admin")
        assert result is False
        assert rbac.get_role("role-super_admin") is not None

    def test_delete_custom_role_succeeds(self, rbac):
        role = rbac.create_role("temp_role", [Action.READ])
        result = rbac.delete_role(role.role_id)
        assert result is True
        assert rbac.get_role(role.role_id) is None

    def test_assign_and_revoke_role(self, rbac):
        binding = rbac.assign_role("user-1", "role-admin", granted_by="system")
        assert binding.user_id == "user-1"
        assert binding.role_id == "role-admin"
        assert rbac.revoke_role(binding.binding_id) is True

    def test_get_user_permissions(self, rbac):
        rbac.assign_role("user-1", "role-viewer", workspace_id="ws-1", granted_by="admin")
        perms = rbac.get_user_permissions("user-1", workspace_id="ws-1")
        assert perms == [Action.READ]

    def test_get_user_permissions_no_match(self, rbac):
        rbac.assign_role("user-1", "role-viewer", workspace_id="ws-1", granted_by="admin")
        perms = rbac.get_user_permissions("user-1", workspace_id="ws-2")
        assert perms == []

    def test_check_permission(self, rbac):
        rbac.assign_role("user-1", "role-viewer", workspace_id="ws-1", granted_by="admin")
        assert rbac.check_permission("user-1", Action.READ, "workspace", "ws-1") is True
        assert rbac.check_permission("user-1", Action.CREATE, "workspace", "ws-1") is False

    def test_workspace_scoped_permissions(self, rbac):
        rbac.assign_role("user-1", "role-workspace_admin", workspace_id="ws-1", granted_by="admin")
        perms = rbac.get_user_permissions("user-1", workspace_id="ws-1")
        assert Action.CREATE in perms
        assert Action.READ in perms
        assert Action.UPDATE in perms
        assert Action.DELETE not in perms
