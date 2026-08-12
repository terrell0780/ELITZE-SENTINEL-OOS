# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from fastapi import APIRouter, HTTPException
from ..core.marketplace_engine import MarketplaceEngine
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/plugins", tags=["Plugins"])

marketplace = MarketplaceEngine()


class ExecuteRequest(BaseModel):
    action: str = Field(default="info", description="Action to execute on the plugin")
    params: Optional[Dict[str, Any]] = None


@router.get("/")
async def list_plugins():
    return {"plugins": marketplace.list_available()}


@router.post("/{plugin_id}/install")
async def install_plugin(plugin_id: str):
    result = marketplace.install(plugin_id)
    if result["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Plugin not found")
    return result


@router.post("/{plugin_id}/uninstall")
async def uninstall_plugin(plugin_id: str):
    result = marketplace.uninstall(plugin_id)
    if result["status"] == "not_installed":
        raise HTTPException(status_code=404, detail="Plugin not installed")
    return result


@router.post("/{plugin_id}/execute")
async def execute_plugin(plugin_id: str, body: ExecuteRequest):
    result = marketplace.execute(plugin_id, body.action, body.params)
    if result.get("status") == "error" and "not found" in result.get("error", ""):
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/{plugin_id}")
async def get_plugin(plugin_id: str):
    manifest = marketplace.get_manifest(plugin_id)
    if not manifest:
        raise HTTPException(status_code=404, detail="Plugin not found")
    return {
        "plugin_id": manifest.plugin_id,
        "name": manifest.name,
        "version": manifest.version,
        "description": manifest.description,
        "author": manifest.author,
        "permissions": [p.value for p in manifest.permissions],
        "dependencies": manifest.dependencies,
        "entry_point": manifest.entry_point,
        "metadata": manifest.metadata,
    }
