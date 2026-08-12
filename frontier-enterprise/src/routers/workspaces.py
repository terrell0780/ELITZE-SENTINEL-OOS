# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.core.multi_tenancy import TenantManager, TenantPlan, TenantRole

router = APIRouter(prefix="/api/v1/enterprise/workspaces", tags=["workspaces"])

tm = TenantManager()


class CreateTenantBody(BaseModel):
    name: str
    slug: str
    plan: TenantPlan


class AddMemberBody(BaseModel):
    user_id: str
    role: TenantRole


class ChangePlanBody(BaseModel):
    plan: TenantPlan


@router.post("/tenants")
async def create_tenant(body: CreateTenantBody):
    tenant = tm.create_tenant(body.name, body.slug, body.plan)
    return tenant


@router.get("/tenants")
async def list_tenants():
    return tm.list_tenants()


@router.get("/tenants/{tenant_id}")
async def get_tenant(tenant_id: str):
    tenant = tm.get_tenant(tenant_id)
    if tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.post("/tenants/{tenant_id}/deactivate")
async def deactivate_tenant(tenant_id: str):
    tenant = tm.deactivate_tenant(tenant_id)
    if tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.post("/tenants/{tenant_id}/members")
async def add_member(tenant_id: str, body: AddMemberBody):
    if tm.is_full(tenant_id):
        raise HTTPException(status_code=400, detail="Tenant member limit reached")
    member = tm.add_member(tenant_id, body.user_id, body.role)
    if member is None:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return member


@router.delete("/tenants/{tenant_id}/members/{user_id}")
async def remove_member(tenant_id: str, user_id: str):
    success = tm.remove_member(tenant_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"detail": "Member removed"}


@router.get("/tenants/{tenant_id}/members")
async def list_members(tenant_id: str):
    return tm.list_members(tenant_id)


@router.put("/tenants/{tenant_id}/plan")
async def change_plan(tenant_id: str, body: ChangePlanBody):
    tenant = tm.update_plan(tenant_id, body.plan)
    if tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant
