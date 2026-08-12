# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class PluginRequest(BaseModel):
    plugin_id: str
    action: str = Field(default="info", description="Action: info, install, uninstall, execute")
    params: Optional[Dict[str, Any]] = None


class PluginResponse(BaseModel):
    status: str
    plugin_id: Optional[str] = None
    name: Optional[str] = None
    version: Optional[str] = None
    description: Optional[str] = None
    permissions: List[str] = Field(default_factory=list)
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
