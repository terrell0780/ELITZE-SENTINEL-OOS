# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    username: str
    role: str = "member"
    workspace_id: Optional[str] = None


class UserResponse(BaseModel):
    user_id: str
    username: str
    role: str
    workspaces: list = []


class LoginRequest(BaseModel):
    username: str
    password: str = "stub"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
