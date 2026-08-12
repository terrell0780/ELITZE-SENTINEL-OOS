# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import re as _re
import time
import uuid
from dataclasses import dataclass
from enum import Enum


class PolicySeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PolicyAction(str, Enum):
    ALLOW = "allow"
    DENY = "deny"
    REVIEW = "review"
    LOG = "log"


class PolicyCategory(str, Enum):
    PROMPT_INJECTION = "prompt_injection"
    JAILBREAK = "jailbreak"
    PII = "pii"
    MODEL_EXTRACTION = "model_extraction"
    DATA_EXFILTRATION = "data_exfiltration"
    PROMPT_LEAK = "prompt_leak"
    THREAT = "threat"
    CUSTOM = "custom"


@dataclass
class Policy:
    policy_id: str
    name: str
    description: str
    category: PolicyCategory
    severity: PolicySeverity
    action: PolicyAction
    pattern: str
    enabled: bool = True
    priority: int = 50
    created_at: float = 0.0
    updated_at: float = 0.0


@dataclass
class PolicyVersion:
    version_id: str
    policy_id: str
    version_number: int
    pattern: str
    action: PolicyAction
    enabled: bool
    created_at: float = 0.0
    created_by: str = "system"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


@dataclass
class ApprovalRequest:
    approval_id: str
    request_type: str
    requester_id: str
    resource_type: str
    resource_id: str
    reason: str
    status: ApprovalStatus = ApprovalStatus.PENDING
    reviewed_by: str | None = None
    reviewed_at: float | None = None
    created_at: float = 0.0


@dataclass
class SimulationResult:
    sim_id: str
    input_text: str
    matched_policies: list[str]
    triggered_actions: list[str]
    verdict: str
    timestamp: float = 0.0


_DEFAULT_POLICIES = [
    ("Prompt Injection Guard", "Detects prompt injection attempts", PolicyCategory.PROMPT_INJECTION, PolicySeverity.HIGH, PolicyAction.DENY, "ignore all previous instructions", 100),
    ("Jailbreak Detection", "Detects jailbreak attempts", PolicyCategory.JAILBREAK, PolicySeverity.HIGH, PolicyAction.DENY, "DAN|Do Anything Now|hypothetical", 99),
    ("PII Leak Prevention", "Detects potential PII exposure", PolicyCategory.PII, PolicySeverity.MEDIUM, PolicyAction.REVIEW, "(SSN|credit card|passport)", 80),
    ("Model Extraction", "Prevents system prompt extraction", PolicyCategory.MODEL_EXTRACTION, PolicySeverity.HIGH, PolicyAction.DENY, "(system prompt|your instructions|your guidelines)", 95),
    ("Data Exfiltration", "Prevents data exfiltration", PolicyCategory.DATA_EXFILTRATION, PolicySeverity.HIGH, PolicyAction.DENY, "(upload|export|leak|send to external)", 90),
    ("Prompt Leak", "Detects prompt leakage attempts", PolicyCategory.PROMPT_LEAK, PolicySeverity.MEDIUM, PolicyAction.DENY, "(repeat|reveal|output) (the |your )?(prompt|instructions)", 85),
    ("Threat Detection", "Detects security threat references", PolicyCategory.THREAT, PolicySeverity.CRITICAL, PolicyAction.DENY, "(malware|virus|exploit|0day)", 100),
    ("Default Custom", "Default custom catch-all policy", PolicyCategory.CUSTOM, PolicySeverity.LOW, PolicyAction.ALLOW, "default custom catch-all", 1),
]


class GovernanceEngine:
    def __init__(self):
        self._policies: dict[str, Policy] = {}
        self._versions: dict[str, list[PolicyVersion]] = {}
        self._approvals: dict[str, ApprovalRequest] = {}
        self._simulations: list[SimulationResult] = []
        self._next_version: dict[str, int] = {}
        self._seed_defaults()

    def _now(self) -> float:
        return time.time()

    def _seed_defaults(self):
        for name, desc, cat, sev, act, pattern, pri in _DEFAULT_POLICIES:
            self.create_policy(name, desc, cat, sev, act, pattern, priority=pri)

    # ── Policies ─────────────────────────────────────────────────────

    def create_policy(self, name: str, description: str, category: PolicyCategory,
                      severity: PolicySeverity, action: PolicyAction, pattern: str,
                      priority: int = 50) -> Policy:
        policy_id = "pol-" + uuid.uuid4().hex[:12]
        now = self._now()
        policy = Policy(
            policy_id=policy_id, name=name, description=description,
            category=PolicyCategory(category) if isinstance(category, str) else category,
            severity=PolicySeverity(severity) if isinstance(severity, str) else severity,
            action=PolicyAction(action) if isinstance(action, str) else action,
            pattern=pattern, enabled=True, priority=priority,
            created_at=now, updated_at=now
        )
        self._policies[policy_id] = policy
        self._next_version[policy_id] = 1
        self._versions[policy_id] = []
        return policy

    def get_policy(self, policy_id: str) -> Policy | None:
        return self._policies.get(policy_id)

    def list_policies(self, category: str | None = None,
                      severity: str | None = None,
                      enabled_only: bool = False) -> list[dict]:
        result = []
        for p in self._policies.values():
            if category and p.category.value != category.lower():
                continue
            if severity and p.severity.value != severity.lower():
                continue
            if enabled_only and not p.enabled:
                continue
            result.append({
                "policy_id": p.policy_id, "name": p.name, "description": p.description,
                "category": p.category.value, "severity": p.severity.value,
                "action": p.action.value, "pattern": p.pattern,
                "enabled": p.enabled, "priority": p.priority,
                "created_at": p.created_at, "updated_at": p.updated_at
            })
        return result

    def update_policy(self, policy_id: str, updates: dict) -> Policy:
        policy = self._policies.get(policy_id)
        if not policy:
            raise ValueError(f"Policy {policy_id} not found")
        old_pattern = policy.pattern
        old_action = policy.action
        old_enabled = policy.enabled
        if "name" in updates:
            policy.name = updates["name"]
        if "description" in updates:
            policy.description = updates["description"]
        if "category" in updates:
            policy.category = PolicyCategory(updates["category"].lower())
        if "severity" in updates:
            policy.severity = PolicySeverity(updates["severity"].lower())
        if "action" in updates:
            policy.action = PolicyAction(updates["action"].lower())
        if "pattern" in updates:
            policy.pattern = updates["pattern"]
        if "priority" in updates:
            policy.priority = updates["priority"]
        policy.updated_at = self._now()
        vnum = self._next_version.get(policy_id, 0) + 1
        self._next_version[policy_id] = vnum
        version = PolicyVersion(
            version_id="ver-" + uuid.uuid4().hex[:12],
            policy_id=policy_id, version_number=vnum,
            pattern=old_pattern, action=old_action, enabled=old_enabled,
            created_at=self._now(), created_by="system"
        )
        self._versions.setdefault(policy_id, []).append(version)
        return policy

    def delete_policy(self, policy_id: str) -> bool:
        if policy_id not in self._policies:
            return False
        del self._policies[policy_id]
        self._versions.pop(policy_id, None)
        self._next_version.pop(policy_id, None)
        return True

    def toggle_policy(self, policy_id: str) -> bool:
        policy = self._policies.get(policy_id)
        if not policy:
            return False
        policy.enabled = not policy.enabled
        policy.updated_at = self._now()
        return policy.enabled

    def evaluate(self, input_text: str) -> list[dict]:
        matches = []
        sorted_pols = sorted(self._policies.values(), key=lambda p: p.priority, reverse=True)
        for p in sorted_pols:
            if not p.enabled:
                continue
            try:
                if _re.search(p.pattern, input_text, _re.IGNORECASE):
                    matches.append({
                        "policy_id": p.policy_id, "name": p.name,
                        "category": p.category.value, "severity": p.severity.value,
                        "action": p.action.value, "priority": p.priority
                    })
            except _re.error:
                continue
        return matches

    def simulate(self, input_text: str) -> SimulationResult:
        matches = self.evaluate(input_text)
        triggered_actions = list(dict.fromkeys(m["action"] for m in matches))
        if PolicyAction.DENY.value in triggered_actions:
            verdict = PolicyAction.DENY.value
        elif PolicyAction.REVIEW.value in triggered_actions:
            verdict = PolicyAction.REVIEW.value
        else:
            verdict = PolicyAction.ALLOW.value
        sim_id = "sim-" + uuid.uuid4().hex[:12]
        result = SimulationResult(
            sim_id=sim_id, input_text=input_text,
            matched_policies=[m["policy_id"] for m in matches],
            triggered_actions=triggered_actions, verdict=verdict,
            timestamp=self._now()
        )
        self._simulations.append(result)
        return result

    def get_version_history(self, policy_id: str) -> list[dict]:
        versions = self._versions.get(policy_id, [])
        return [
            {"version_id": v.version_id, "policy_id": v.policy_id,
             "version_number": v.version_number, "pattern": v.pattern,
             "action": v.action.value, "enabled": v.enabled,
             "created_at": v.created_at, "created_by": v.created_by}
            for v in versions
        ]

    # ── Approvals ────────────────────────────────────────────────────

    def create_approval(self, request_type: str, requester_id: str,
                        resource_type: str, resource_id: str, reason: str) -> ApprovalRequest:
        approval_id = "apr-" + uuid.uuid4().hex[:12]
        req = ApprovalRequest(
            approval_id=approval_id, request_type=request_type,
            requester_id=requester_id, resource_type=resource_type,
            resource_id=resource_id, reason=reason,
            status=ApprovalStatus.PENDING, created_at=self._now()
        )
        self._approvals[approval_id] = req
        return req

    def list_approvals(self, status: str | None = None) -> list[dict]:
        result = []
        for a in self._approvals.values():
            if status and a.status.value != status.lower():
                continue
            result.append({
                "approval_id": a.approval_id, "request_type": a.request_type,
                "requester_id": a.requester_id, "resource_type": a.resource_type,
                "resource_id": a.resource_id, "reason": a.reason,
                "status": a.status.value, "reviewed_by": a.reviewed_by,
                "reviewed_at": a.reviewed_at, "created_at": a.created_at
            })
        return result

    def review_approval(self, approval_id: str, reviewer_id: str,
                        status_str: str, reason: str) -> bool:
        req = self._approvals.get(approval_id)
        if not req or req.status != ApprovalStatus.PENDING:
            return False
        req.status = ApprovalStatus(status_str.lower())
        req.reviewed_by = reviewer_id
        req.reviewed_at = self._now()
        return True
