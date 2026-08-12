# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from src.core import IdentityManager
from src.router import Router

router = Router(prefix="/v1/identity")
mgr = IdentityManager()


@router.add_route("POST", "/tenants")
def create_tenant(query, body):
    tenant = mgr.create_tenant(body["name"], body["slug"], body["plan"])
    return 201, {"tenant_id": tenant.tenant_id, "name": tenant.name, "slug": tenant.slug,
                  "plan": tenant.plan.value, "status": tenant.status.value}


@router.add_route("GET", "/tenants")
def list_tenants(query, body):
    return mgr.list_tenants(plan=query.get("plan"), status=query.get("status"))


@router.add_route("GET", "/tenants/{tenant_id}")
def get_tenant(query, body, tenant_id):
    t = mgr.get_tenant(tenant_id)
    if not t:
        return 404, {"error": "Tenant not found"}
    return {"tenant_id": t.tenant_id, "name": t.name, "slug": t.slug,
            "plan": t.plan.value, "status": t.status.value,
            "member_count": t.member_count, "created_at": t.created_at,
            "updated_at": t.updated_at}


@router.add_route("PATCH", "/tenants/{tenant_id}")
def update_tenant(query, body, tenant_id):
    try:
        t = mgr.update_tenant(tenant_id, body)
    except ValueError as e:
        return 404, {"error": str(e)}
    return {"tenant_id": t.tenant_id, "name": t.name, "plan": t.plan.value,
            "status": t.status.value, "updated_at": t.updated_at}


@router.add_route("POST", "/tenants/{tenant_id}/suspend")
def suspend_tenant(query, body, tenant_id):
    if mgr.suspend_tenant(tenant_id):
        return {"status": "suspended", "tenant_id": tenant_id}
    return 404, {"error": "Tenant not found"}


@router.add_route("POST", "/users")
def register_user(query, body):
    u = mgr.register_user(body["email"], body["display_name"])
    return 201, {"user_id": u.user_id, "email": u.email, "display_name": u.display_name,
                  "is_active": u.is_active}


@router.add_route("GET", "/users")
def list_users(query, body):
    return mgr.list_users(tenant_id=query.get("tenant_id"))


@router.add_route("GET", "/users/{user_id}")
def get_user(query, body, user_id):
    u = mgr.get_user(user_id)
    if not u:
        return 404, {"error": "User not found"}
    return {"user_id": u.user_id, "email": u.email, "display_name": u.display_name,
            "is_active": u.is_active, "roles": u.roles,
            "mfa_enabled": u.mfa_enabled, "created_at": u.created_at}


@router.add_route("POST", "/users/{user_id}/deactivate")
def deactivate_user(query, body, user_id):
    if mgr.deactivate_user(user_id):
        return {"status": "deactivated", "user_id": user_id}
    return 404, {"error": "User not found"}


@router.add_route("POST", "/groups")
def create_group(query, body):
    g = mgr.create_group(body["name"], description=body.get("description", ""))
    return 201, {"group_id": g.group_id, "name": g.name, "description": g.description}


@router.add_route("GET", "/groups")
def list_groups(query, body):
    return mgr.list_groups()


@router.add_route("GET", "/groups/{group_id}")
def get_group(query, body, group_id):
    g = mgr.get_group(group_id)
    if not g:
        return 404, {"error": "Group not found"}
    return {"group_id": g.group_id, "name": g.name, "description": g.description,
            "member_ids": g.member_ids, "created_at": g.created_at}


@router.add_route("POST", "/groups/{group_id}/members")
def add_member(query, body, group_id):
    if mgr.add_user_to_group(group_id, body["user_id"]):
        return {"status": "member_added", "group_id": group_id, "user_id": body["user_id"]}
    return 404, {"error": "Group or user not found"}


@router.add_route("DELETE", "/groups/{group_id}/members/{user_id}")
def remove_member(query, body, group_id, user_id):
    if mgr.remove_user_from_group(group_id, user_id):
        return {"status": "member_removed", "group_id": group_id, "user_id": user_id}
    return 404, {"error": "Group or user not found"}


@router.add_route("POST", "/keys")
def create_api_key(query, body):
    k = mgr.create_api_key(
        name=body["name"], tenant_id=body["tenant_id"],
        user_id=body["user_id"], permissions=body.get("permissions", []),
        expires_in_days=body.get("expires_in_days", 365)
    )
    return 201, {"key_id": k.key_id, "name": k.name, "key_prefix": k.key_prefix,
                  "expires_at": k.expires_at}


@router.add_route("GET", "/keys")
def list_api_keys(query, body):
    return mgr.list_api_keys(tenant_id=query.get("tenant_id"))


@router.add_route("GET", "/keys/{key_id}")
def get_api_key(query, body, key_id):
    k = mgr.get_api_key(key_id)
    if not k:
        return 404, {"error": "API key not found"}
    return {"key_id": k.key_id, "name": k.name, "key_prefix": k.key_prefix,
            "tenant_id": k.tenant_id, "user_id": k.user_id,
            "permissions": k.permissions, "expires_at": k.expires_at,
            "created_at": k.created_at, "last_used_at": k.last_used_at,
            "is_revoked": k.is_revoked}


@router.add_route("POST", "/keys/{key_id}/revoke")
def revoke_api_key(query, body, key_id):
    if mgr.revoke_api_key(key_id):
        return {"status": "revoked", "key_id": key_id}
    return 404, {"error": "API key not found"}


@router.add_route("POST", "/keys/validate")
def validate_api_key(query, body):
    valid = mgr.validate_api_key(body["key_id"])
    return {"valid": valid, "key_id": body["key_id"]}
