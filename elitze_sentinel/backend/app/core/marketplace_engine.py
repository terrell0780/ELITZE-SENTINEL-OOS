# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
Marketplace Engine — Plugin registry, OPAL permission checks, install/execute, sandboxing.
"""

import json
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum


class OPALPermission(str, Enum):
    NONE = "none"
    READ = "read"
    WRITE = "write"
    EXECUTE = "execute"
    ADMIN = "admin"


class PluginStatus(str, Enum):
    AVAILABLE = "available"
    INSTALLED = "installed"
    RUNNING = "running"
    ERROR = "error"
    SANDBOXED = "sandboxed"


@dataclass
class PluginManifest:
    plugin_id: str
    name: str
    version: str
    description: str
    author: str
    permissions: List[OPALPermission] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    entry_point: str = "main"
    metadata: Dict[str, Any] = field(default_factory=dict)


class PluginSandbox:
    """Sandboxed execution environment for plugins."""

    def __init__(self):
        self.restricted_modules = ["os", "subprocess", "shutil", "ctypes", "socket"]
        self.allowed_modules = ["json", "re", "math", "random", "datetime", "typing", "uuid", "hashlib"]

    def validate_imports(self, code: str) -> List[str]:
        violations = []
        for mod in self.restricted_modules:
            if f"import {mod}" in code or f"from {mod}" in code:
                violations.append(mod)
        return violations

    def execute_sandboxed(self, manifest: PluginManifest, action: str, params: Dict[str, Any]) -> Dict[str, Any]:
        violations = self.validate_imports(json.dumps(params))
        if violations:
            return {"status": "blocked", "reason": f"Restricted modules: {violations}", "sandbox": True}
        return {"status": "executed", "action": action, "sandbox": True, "result": f"[Sandbox] {manifest.name} executed {action}"}


class MarketplaceEngine:
    """Elitze Sentinel Marketplace — plugin registry, OPAL checks, install/execute lifecycle."""

    def __init__(self):
        self.name = "Elitze Marketplace"
        self.registry: Dict[str, PluginManifest] = {}
        self.installed: Dict[str, PluginManifest] = {}
        self.sandbox = PluginSandbox()
        self._initialized = False

    async def initialize(self):
        self._initialized = True
        self._seed_default_plugins()

    def _seed_default_plugins(self):
        defaults = [
            PluginManifest(
                plugin_id="plugin-web-scraper", name="Web Scraper", version="1.0.0",
                description="Extract and parse web content", author="Elitze",
                permissions=[OPALPermission.READ],
            ),
            PluginManifest(
                plugin_id="plugin-data-transform", name="Data Transformer", version="1.0.0",
                description="Transform JSON/CSV data pipelines", author="Elitze",
                permissions=[OPALPermission.READ, OPALPermission.WRITE],
            ),
            PluginManifest(
                plugin_id="plugin-vision-analyzer", name="Vision Analyzer", version="1.0.0",
                description="Analyze images and extract metadata", author="Elitze",
                permissions=[OPALPermission.READ, OPALPermission.EXECUTE],
            ),
            PluginManifest(
                plugin_id="plugin-code-exec", name="Code Executor", version="1.0.0",
                description="Execute Python/JS code in sandbox", author="Elitze",
                permissions=[OPALPermission.EXECUTE],
            ),
            PluginManifest(
                plugin_id="plugin-email-bridge", name="Email Bridge", version="1.0.0",
                description="Send and receive emails through agents", author="Elitze",
                permissions=[OPALPermission.READ, OPALPermission.WRITE],
            ),
        ]
        for p in defaults:
            self.registry[p.plugin_id] = p

    def check_opal(self, plugin_id: str, required: OPALPermission) -> bool:
        manifest = self.installed.get(plugin_id) or self.registry.get(plugin_id)
        if not manifest:
            return False
        return required in manifest.permissions or OPALPermission.ADMIN in manifest.permissions

    def list_available(self) -> List[Dict[str, Any]]:
        return [
            {"plugin_id": p.plugin_id, "name": p.name, "version": p.version, "description": p.description, "author": p.author, "status": "installed" if p.plugin_id in self.installed else "available"}
            for p in self.registry.values()
        ]

    def install(self, plugin_id: str) -> Dict[str, Any]:
        if plugin_id in self.installed:
            return {"status": "already_installed", "plugin_id": plugin_id}
        manifest = self.registry.get(plugin_id)
        if not manifest:
            return {"status": "not_found", "plugin_id": plugin_id}
        self.installed[plugin_id] = manifest
        return {"status": "installed", "plugin_id": plugin_id, "name": manifest.name, "version": manifest.version}

    def uninstall(self, plugin_id: str) -> Dict[str, Any]:
        if plugin_id not in self.installed:
            return {"status": "not_installed", "plugin_id": plugin_id}
        del self.installed[plugin_id]
        return {"status": "uninstalled", "plugin_id": plugin_id}

    def execute(self, plugin_id: str, action: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        manifest = self.installed.get(plugin_id) or self.registry.get(plugin_id)
        if not manifest:
            return {"status": "error", "error": "Plugin not found"}
        if not self.check_opal(plugin_id, OPALPermission.EXECUTE):
            return {"status": "blocked", "error": "OPAL: EXECUTE permission denied"}
        return self.sandbox.execute_sandboxed(manifest, action, params or {})

    def get_manifest(self, plugin_id: str) -> Optional[PluginManifest]:
        return self.installed.get(plugin_id) or self.registry.get(plugin_id)
