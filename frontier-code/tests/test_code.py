# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import pytest, os, json
from src.tools import ToolRegistry, tools_spec
from src.model import LLMClient
from src.agent import CodingAgent


def test_tool_registry_read_write(tmp_path):
    reg = ToolRegistry(workdir=str(tmp_path))
    # Write
    result = reg.write_file("test.txt", "hello world")
    assert result["status"] == "written"
    # Read
    result = reg.read_file("test.txt")
    assert "hello world" in result["content"]
    assert result["total_lines"] == 1


def test_tool_patch(tmp_path):
    reg = ToolRegistry(workdir=str(tmp_path))
    reg.write_file("test.py", "old content")
    result = reg.patch("test.py", "old", "new")
    assert result["status"] == "patched"
    result = reg.read_file("test.py")
    assert "new content" in result["content"]


def test_tool_list_dir(tmp_path):
    reg = ToolRegistry(workdir=str(tmp_path))
    (tmp_path / "a.py").write_text("")
    (tmp_path / "sub").mkdir()
    result = reg.list_dir(".")
    assert result["count"] >= 2
    names = [e["name"] for e in result["entries"]]
    assert "a.py" in names
    assert "sub" in names


def test_tool_git(tmp_path):
    reg = ToolRegistry(workdir=str(tmp_path))
    # Init a git repo
    import subprocess
    subprocess.run(["git", "init"], cwd=str(tmp_path), capture_output=True)
    subprocess.run(["git", "config", "user.email", "test@test.com"], cwd=str(tmp_path), capture_output=True)
    subprocess.run(["git", "config", "user.name", "Test"], cwd=str(tmp_path), capture_output=True)
    # Check status in empty repo
    result = reg.git_status()
    assert "status" in result


def test_tools_spec():
    spec = tools_spec()
    assert len(spec) >= 6
    names = [s["function"]["name"] for s in spec]
    assert "read_file" in names
    assert "write_file" in names
    assert "patch" in names
    assert "terminal" in names
    assert "git_status" in names


def test_llm_client_init():
    client = LLMClient()
    assert client.provider in ("ollama", "openrouter", "anthropic", "openai", "opencode")
    assert client.model


def test_coding_agent_init():
    agent = CodingAgent(workdir="/tmp")
    assert agent.tools is not None
    assert agent.tool_specs


if __name__ == "__main__":
    pytest.main([__file__, "-v"])