# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""Coding tools — filesystem, shell, git, search, web."""
from __future__ import annotations

import json
import os
import re
import subprocess
from pathlib import Path
from typing import Any

__all__ = ["ToolRegistry", "tools_spec"]


def _run(cmd: list[str], timeout: int = 30, cwd: str | None = None) -> dict[str, Any]:
    """Run a shell command safely."""
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=cwd)
        return {"stdout": r.stdout, "stderr": r.stderr, "exit_code": r.returncode}
    except FileNotFoundError:
        return {"stdout": "", "stderr": f"Command not found: {cmd[0]}", "exit_code": -1}
    except subprocess.TimeoutExpired:
        return {"stdout": "", "stderr": f"Timeout after {timeout}s", "exit_code": -1}


class ToolRegistry:
    """Registry of all tools the coding agent can call."""

    def __init__(self, workdir: str | None = None) -> None:
        self.workdir = workdir or os.getcwd()

    # --- Tool implementations ---

    def read_file(self, path: str, offset: int = 1, limit: int = 100) -> dict[str, Any]:
        """Read a file with line numbers."""
        full = Path(self.workdir) / path if not Path(path).is_absolute() else Path(path)
        if not full.exists():
            return {"error": f"File not found: {path}", "exists": False}
        try:
            lines = full.read_text(encoding="utf-8").splitlines()
            total = len(lines)
            start = max(0, offset - 1)
            end = min(total, start + limit)
            content = "\n".join(f"{i+1}|{l}" for i, l in enumerate(lines[start:end]))
            return {"path": str(full), "total_lines": total, "content": content,
                    "offset": offset, "limit": limit, "truncated": end < total}
        except Exception as e:
            return {"error": str(e)}

    def write_file(self, path: str, content: str) -> dict[str, Any]:
        """Write content to a file (overwrites)."""
        full = Path(self.workdir) / path if not Path(path).is_absolute() else Path(path)
        try:
            full.parent.mkdir(parents=True, exist_ok=True)
            full.write_text(content, encoding="utf-8")
            return {"path": str(full), "bytes": len(content), "status": "written"}
        except Exception as e:
            return {"error": str(e)}

    def patch(self, path: str, old: str, new: str) -> dict[str, Any]:
        """Find and replace in a file."""
        full = Path(self.workdir) / path if not Path(path).is_absolute() else Path(path)
        if not full.exists():
            return {"error": f"File not found: {path}"}
        try:
            content = full.read_text(encoding="utf-8")
            if old not in content:
                return {"error": "old_string not found in file", "matches": content.count(old)}
            new_content = content.replace(old, new)
            full.write_text(new_content, encoding="utf-8")
            return {"path": str(full), "replacements": content.count(old), "status": "patched"}
        except Exception as e:
            return {"error": str(e)}

    def search_files(self, pattern: str, path: str = ".", file_glob: str | None = None) -> dict[str, Any]:
        """Search files by pattern (grep)."""
        cwd = Path(self.workdir) / path if not Path(path).is_absolute() else Path(path)
        cmd = ["grep", "-rn", "--include=*.py", "--include=*.ts", "--include=*.tsx",
               "--include=*.js", "--include=*.json", "--include=*.yaml", "--include=*.yml",
               "--include=*.md", "--include=*.sh", "--include=*.ps1"]
        if file_glob:
            cmd = cmd[:-1] + [f"--include={file_glob}"]
        cmd.append(pattern)
        r = _run(cmd + [str(cwd)], timeout=30)
        return {"matches": r["stdout"].count("\n"), "results": r["stdout"][:5000]}

    def terminal(self, command: str, timeout: int = 30) -> dict[str, Any]:
        """Run a shell command in the workspace."""
        r = _run(command, timeout=timeout, cwd=self.workdir, shell=True)
        return {"stdout": r["stdout"][:5000], "stderr": r["stderr"][:2000],
                "exit_code": r["exit_code"], "truncated": len(r["stdout"]) > 5000}

    def git_status(self) -> dict[str, Any]:
        """Get git status of the workspace."""
        r = _run(["git", "status", "--short"], cwd=self.workdir)
        return {"status": r["stdout"][:2000], "branch": self._git_branch()}

    def _git_branch(self) -> str:
        r = _run(["git", "branch", "--show-current"], cwd=self.workdir)
        return r["stdout"].strip()

    def git_diff(self, path: str | None = None) -> dict[str, Any]:
        """Show uncommitted changes."""
        cmd = ["git", "diff"]
        if path:
            cmd.append(path)
        r = _run(cmd, cwd=self.workdir)
        return {"diff": r["stdout"][:5000]}

    def list_dir(self, path: str = ".") -> dict[str, Any]:
        """List directory contents."""
        full = Path(self.workdir) / path if not Path(path).is_absolute() else Path(path)
        if not full.is_dir():
            return {"error": f"Not a directory: {path}"}
        try:
            entries = []
            for e in sorted(full.iterdir()):
                etype = "dir" if e.is_dir() else "file"
                entries.append({"name": e.name, "type": etype, "size": e.stat().st_size if e.is_file() else 0})
            return {"path": str(full), "entries": entries, "count": len(entries)}
        except Exception as e:
            return {"error": str(e)}


# --- Tool definitions for LLM function calling ---

def tools_spec() -> list[dict]:
    """Return the tool definitions in OpenAI function-calling format."""
    return [
        {
            "type": "function",
            "function": {
                "name": "read_file",
                "description": "Read a file with line numbers. Use offset/limit for pagination.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {"type": "string", "description": "File path relative to workspace"},
                        "offset": {"type": "integer", "description": "Starting line (1-indexed)", "default": 1},
                        "limit": {"type": "integer", "description": "Max lines to return", "default": 100},
                    },
                    "required": ["path"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "write_file",
                "description": "Write content to a file (creates dirs if needed). Overwrites!",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {"type": "string", "description": "File path"},
                        "content": {"type": "string", "description": "Full file content"},
                    },
                    "required": ["path", "content"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "patch",
                "description": "Find and replace text in a file. Use for targeted edits.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {"type": "string", "description": "File path"},
                        "old": {"type": "string", "description": "Text to find (must be unique)"},
                        "new": {"type": "string", "description": "Replacement text"},
                    },
                    "required": ["path", "old", "new"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "search_files",
                "description": "Search file contents by regex pattern.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pattern": {"type": "string", "description": "Regex pattern to search"},
                        "path": {"type": "string", "description": "Directory to search", "default": "."},
                        "file_glob": {"type": "string", "description": "Filter by glob (e.g. *.py)", "default": None},
                    },
                    "required": ["pattern"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "terminal",
                "description": "Run a shell command in the workspace. Use for builds, tests, git.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "command": {"type": "string", "description": "Shell command to run"},
                        "timeout": {"type": "integer", "description": "Timeout in seconds", "default": 30},
                    },
                    "required": ["command"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "git_status",
                "description": "Show git status (modified, untracked files, current branch).",
                "parameters": {"type": "object", "properties": {}},
            },
        },
        {
            "type": "function",
            "function": {
                "name": "git_diff",
                "description": "Show uncommitted changes diff.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {"type": "string", "description": "Optional file path to filter", "default": None},
                    },
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "list_dir",
                "description": "List directory contents (files and subdirectories).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {"type": "string", "description": "Directory path", "default": "."},
                    },
                    "required": [],
                },
            },
        },
    ]
