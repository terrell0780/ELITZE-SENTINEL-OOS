# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from fastapi import APIRouter, HTTPException, Query
from ..core.workspace_manager import WorkspaceManager, Role
from ..models.workspace import WorkspaceCreate
from typing import Optional
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/workspaces", tags=["Workspaces"])

manager = WorkspaceManager()


class SwitchRequest(BaseModel):
    user_id: str


class AddMemberRequest(BaseModel):
    user_id: str
    role: str = Field(default="member", description="Role: owner, admin, member, viewer")


class RemoveMemberRequest(BaseModel):
    user_id: str


@router.post("/")
async def create_workspace(body: WorkspaceCreate):
    ws = manager.create_workspace(name=body.name, description=body.description, owner_id=body.owner_id)
    return {"workspace_id": ws.workspace_id, "name": ws.name, "description": ws.description, "created_at": ws.created_at, "owner_id": body.owner_id}


@router.get("/")
async def list_workspaces(user_id: Optional[str] = Query(default=None)):
    return {"workspaces": manager.list_workspaces(user_id)}


@router.get("/active")
async def get_active_workspace():
    ws = manager.get_active_workspace()
    if not ws:
        raise HTTPException(status_code=404, detail="No active workspace")
    return {"workspace_id": ws.workspace_id, "name": ws.name, "description": ws.description, "created_at": ws.created_at, "member_count": len(ws.members)}


@router.post("/{workspace_id}/switch")
async def switch_workspace(workspace_id: str, body: SwitchRequest):
    success = manager.switch_workspace(workspace_id, body.user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Workspace not found or user not a member")
    return {"status": "switched", "workspace_id": workspace_id}


@router.post("/{workspace_id}/members")
async def add_member(workspace_id: str, body: AddMemberRequest):
    try:
        role = Role(body.role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {body.role}")
    success = manager.add_member(workspace_id, body.user_id, role, actor_id="owner-001")
    if not success:
        raise HTTPException(status_code=404, detail="Workspace not found or permission denied")
    return {"status": "added", "workspace_id": workspace_id, "user_id": body.user_id, "role": body.role}


@router.delete("/{workspace_id}/members/{user_id}")
async def remove_member(workspace_id: str, user_id: str):
    success = manager.remove_member(workspace_id, user_id, actor_id="owner-001")
    if not success:
        raise HTTPException(status_code=404, detail="Workspace or member not found")
    return {"status": "removed", "workspace_id": workspace_id, "user_id": user_id}
