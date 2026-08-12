# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""Unit tests for Elitze Sentinel Frontier OOS Kernel (16 Planes)."""

import pytest
from app.core.kernel import (
    FrontierOSKernel,
    VerificationStatus,
    ProcessState,
    MemoryTier,
    ClaimObject,
    EvidenceLeadRecord,
)


@pytest.fixture
def os_kernel(tmp_path):
    return FrontierOSKernel(workspace_root=str(tmp_path))


def test_process_lifecycle(os_kernel):
    pid = os_kernel.create_process("agent-001", "indexing", {"target": "docs"})
    assert pid.startswith("proc-")
    assert os_kernel.processes[pid]["state"] == ProcessState.INITIALIZED


def test_tool_permissions(os_kernel):
    os_kernel.grant_agent_tools("agent-001", ["read_file", "git_status"])
    assert os_kernel.can_agent_use_tool("agent-001", "read_file")
    assert not os_kernel.can_agent_use_tool("agent-001", "delete_database")


def test_strict_tool_execution(os_kernel):
    os_kernel.grant_agent_tools("agent-001", ["calculate"])
    res = os_kernel.execute_tool("agent-001", "calculate", {"x": 5, "y": 10}, lambda x, y: x + y)
    assert res["status"] == VerificationStatus.VERIFIED.value
    assert res["result"] == 15


def test_unauthorized_tool_execution(os_kernel):
    res = os_kernel.execute_tool("agent-001", "unauthorized_tool", {}, lambda: None)
    assert res["status"] == VerificationStatus.BLOCKED.value
    assert "Security Violation" in res["error"]


def test_evidence_lead_system(os_kernel):
    lead = os_kernel.verify_lead(
        company_name="Acme Security",
        source_url="https://acme.com",
    )
    assert lead.status == VerificationStatus.PARTIALLY_VERIFIED
    assert lead.contact_name == "NOT VERIFIED"
    assert lead.contact_email == "NOT VERIFIED"

    verified_lead = os_kernel.verify_lead(
        company_name="Acme Security",
        source_url="https://acme.com",
        verified_contact={"name": "Alice Smith", "role": "CISO", "email": "alice@acme.com"}
    )
    assert verified_lead.status == VerificationStatus.VERIFIED
    assert verified_lead.contact_name == "Alice Smith"


def test_immutable_audit_chain(os_kernel):
    os_kernel.audit.log("agent-001", "READ", "/docs", {"detail": "viewing"})
    os_kernel.audit.log("agent-001", "WRITE", "/docs/a.txt", {"content": "data"})
    valid, message = os_kernel.audit.verify_integrity()
    assert valid, message


def test_memory_architecture(os_kernel):
    os_kernel.memory.set_working("current_step", "step_3")
    assert os_kernel.memory.working["current_step"] == "step_3"

    os_kernel.memory.add_episodic("task-1", "compile", "success")
    assert len(os_kernel.memory.episodic) == 1
    assert os_kernel.memory.episodic[0]["action"] == "compile"


def test_sandbox_path_sanitization(os_kernel, tmp_path):
    safe_path = os_kernel.workspace.sanitize_path("sub/file.txt")
    assert str(tmp_path) in safe_path

    with pytest.raises(PermissionError):
        os_kernel.workspace.sanitize_path("../../../etc/passwd")
