# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from src.core.sso import SSOProvider, SSOType
from src.core.rbac import RBACManager, Action

router = APIRouter(prefix="/api/v1/enterprise/auth", tags=["auth"])

sso = SSOProvider()
rbac = RBACManager()


class RegisterProviderBody(BaseModel):
    name: str
    provider_type: SSOType
    issuer_url: str
    client_id: str


class AuthenticateBody(BaseModel):
    credentials: dict


class CreateRoleBody(BaseModel):
    name: str
    permissions: list[Action]


class AssignRoleBody(BaseModel):
    user_id: str
    role_id: str
    workspace_id: Optional[str] = None
    granted_by: str = ""


class CheckPermissionBody(BaseModel):
    user_id: str
    action: Action
    resource: str
    workspace_id: Optional[str] = None


@router.post("/providers")
async def register_provider(body: RegisterProviderBody):
    provider = sso.register_provider(
        name=body.name,
        type=body.provider_type,
        issuer_url=body.issuer_url,
        client_id=body.client_id,
    )
    return provider


@router.get("/providers")
async def list_providers():
    return sso.list_providers()


@router.get("/providers/{provider_id}")
async def get_provider(provider_id: str):
    provider = sso.get_provider(provider_id)
    if provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


@router.post("/providers/{provider_id}/toggle")
async def toggle_provider(provider_id: str):
    provider = sso.toggle_provider(provider_id)
    if provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider


@router.post("/providers/{provider_id}/authenticate")
async def authenticate(provider_id: str, body: AuthenticateBody):
    identity = sso.authenticate(provider_id, body.credentials)
    if identity is None:
        raise HTTPException(status_code=401, detail="Authentication failed")
    return identity


@router.post("/roles")
async def create_role(body: CreateRoleBody):
    role = rbac.create_role(body.name, body.permissions)
    return role


@router.get("/roles")
async def list_roles():
    return rbac.list_roles()


@router.post("/roles/assign")
async def assign_role(body: AssignRoleBody):
    binding = rbac.assign_role(body.user_id, body.role_id, body.workspace_id, body.granted_by)
    return binding


@router.post("/roles/check")
async def check_permission(body: CheckPermissionBody):
    result = rbac.check_permission(body.user_id, body.action, body.resource, body.workspace_id)
    return {"allowed": result}


@router.get("/users/{user_id}/permissions")
async def get_user_permissions(user_id: str, workspace_id: Optional[str] = None):
    permissions = rbac.get_user_permissions(user_id, workspace_id)
    return {"user_id": user_id, "permissions": permissions}
