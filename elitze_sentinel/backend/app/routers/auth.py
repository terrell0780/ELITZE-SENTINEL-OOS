# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from fastapi import APIRouter, HTTPException
from ..core.governance import SentinelPermissionLayer, Role
from ..models.user import UserCreate, LoginRequest
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

fable = SentinelPermissionLayer()


class OwnerOverrideRequest(BaseModel):
    user_id: str
    reason: str


@router.post("/register")
async def register(body: UserCreate):
    try:
        role = Role(body.role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {body.role}")
    user_id = f"user-{__import__('uuid').uuid4().hex[:8]}"
    workspaces = [body.workspace_id] if body.workspace_id else []
    user = fable.register_user(user_id=user_id, username=body.username, role=role, workspaces=workspaces)
    return {"user_id": user.user_id, "username": user.username, "role": user.role.value, "workspaces": user.workspace_ids}


@router.post("/login")
async def login(body: LoginRequest):
    users = fable.list_users()
    matched = [u for u in users if u["username"] == body.username]
    if not matched:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user = matched[0]
    return {"access_token": f"stub-token-{user['user_id']}", "token_type": "bearer", "user_id": user["user_id"], "role": user["role"]}


@router.get("/users")
async def list_users():
    return {"users": fable.list_users()}


@router.get("/users/{user_id}")
async def get_user(user_id: str):
    user = fable.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user.user_id, "username": user.username, "role": user.role.value, "workspaces": user.workspace_ids}


@router.post("/owner-override")
async def owner_override(body: OwnerOverrideRequest):
    result = fable.owner_override(body.user_id, body.reason)
    if result["status"] == "denied":
        raise HTTPException(status_code=403, detail=result["error"])
    return result
