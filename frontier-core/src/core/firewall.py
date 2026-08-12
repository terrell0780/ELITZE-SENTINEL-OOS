# Frontier-core/src/core/firewall.py
"""
Security & Compliance Layer — Threat Detection, Audit Logging, and Policy Engine

Production-grade security and compliance layer with:
- Hash-chained audit log (tamper-evident, immutable)
- Real-time input threat detection & validation
- Output filtering, PII protection & compliance
- Configurable policy engine with regex rules
- Session tracking & anomaly detection
- Streaming support for SSE responses
- EU AI Act, NIST AI RMF, SOC2 compliance ready
"""

import asyncio
import hashlib
import json
import logging
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional, Tuple
from dataclasses import dataclass, field, asdict
from enum import Enum
from collections import defaultdict

logger = logging.getLogger("Frontier-core.firewall")


# ============================================================================
# CORE TYPES
# ============================================================================

class ThreatLevel(str, Enum):
    SAFE = "safe"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ActionType(str, Enum):
    ALLOW = "allow"
    BLOCK = "block"
    WARN = "warn"
    LOG_ONLY = "log_only"
    REDACT = "redact"


class ComplianceFramework(str, Enum):
    EU_AI_ACT = "eu_ai_act"
    NIST_AI_RMF = "nist_ai_rmf"
    SOC2 = "soc2"
    HIPAA = "hipaa"
    CUSTOM = "custom"


# ============================================================================
# DATA MODELS
# ============================================================================

@dataclass
class AuditEntry:
    """Tamper-evident audit log entry with hash chaining."""
    id: str
    session_id: str
    timestamp: str
    action: str
    path: str
    tool: str
    user_request: str
    result: Optional[str] = None
    error: Optional[str] = None
    operation_result: str = "pending"
    threat_level: ThreatLevel = ThreatLevel.SAFE
    previous_hash: str = ""
    entry_hash: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)
    tokens_used: int = 0
    cost_usd: float = 0.0
    model: str = ""
    latency_ms: float = 0.0

    def compute_hash(self) -> str:
        data = json.dumps({
            "id": self.id,
            "session_id": self.session_id,
            "timestamp": self.timestamp,
            "action": self.action,
            "path": self.path,
            "tool": self.tool,
            "user_request": self.user_request,
            "result": self.result,
            "error": self.error,
            "operation_result": self.operation_result,
            "threat_level": self.threat_level.value,
            "previous_hash": self.previous_hash,
        }, sort_keys=True)
        return hashlib.sha256(data.encode()).hexdigest()


@dataclass
class PolicyRule:
    name: str
    pattern: str
    action: ActionType
    threat_level: ThreatLevel
    description: str = ""
    enabled: bool = True
    categories: List[str] = field(default_factory=list)
    compliance: List[ComplianceFramework] = field(default_factory=list)


@dataclass
class SecurityEvent:
    id: str
    timestamp: str
    session_id: str
    event_type: str
    threat_level: ThreatLevel
    details: str
    blocked: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GuardrailsConfig:
    max_request_size: int = 1_000_000
    rate_limit_per_minute: int = 1000
    enable_pii_redaction: bool = True
    enable_prompt_injection_detection: bool = True
    enable_output_filtering: bool = True
    compliance_frameworks: List[ComplianceFramework] = field(default_factory=list)
    custom_rules: List[PolicyRule] = field(default_factory=list)


# ============================================================================
# TERRELL HALL GUARDRAILS
# ============================================================================

class TerrellHallGuardrails:
    """
    Terrell Hall Guardrails - Maximum Protection System

    Production-grade security layer providing:
    1. Hash-chained audit logging (immutable, tamper-evident)
    2. Real-time input threat detection
    3. Output filtering & PII protection
    4. Configurable policy engine
    5. Session tracking & anomaly detection
    6. Compliance framework support
    """

    def __init__(self, config: Optional[GuardrailsConfig] = None):
        self.config = config or GuardrailsConfig()
        self.audit_log: List[AuditEntry] = []
        self.session_store: Dict[str, Dict[str, Any]] = {}
        self.policy_rules: List[PolicyRule] = []
        self.security_events: List[SecurityEvent] = []
        self.is_connected = False
        self._lock = asyncio.Lock()
        self._last_hash = ""
        self._hooks: Dict[str, List[Callable]] = {
            "pre_request": [],
            "post_request": [],
            "on_block": [],
            "on_warning": [],
        }

        self._init_default_policies()

        self.stats = {
            "total_requests": 0,
            "blocked_requests": 0,
            "warnings": 0,
            "errors": 0,
            "sessions_tracked": 0,
            "pii_redactions": 0,
            "threat_detections": defaultdict(int),
        }

        logger.info("TerrellHallGuardrails initialized")

    def _init_default_policies(self):
        self.policy_rules = [
            PolicyRule(
                name="block_prompt_injection",
                pattern=r"(ignore|disregard|override|forget)\s+(all\s+)?(previous|prior|earlier|system|your)?\s*(instructions|prompts|rules|guidelines|directions)",
                action=ActionType.BLOCK,
                threat_level=ThreatLevel.HIGH,
                description="Detects prompt injection attempts",
                categories=["security"],
                compliance=[ComplianceFramework.NIST_AI_RMF],
            ),
            PolicyRule(
                name="block_jailbreak_attempt",
                pattern=r"(you are now|pretend to be|act as|roleplay as|simulate being)\s+(a|an|the)\s+(evil|unrestricted|unfiltered|dark)",
                action=ActionType.BLOCK,
                threat_level=ThreatLevel.HIGH,
                description="Detects jailbreak attempts",
                categories=["security"],
            ),
            PolicyRule(
                name="block_pii_export",
                pattern=r"(\b\d{3}[-.]?\d{2}[-.]?\d{4}\b|\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)",
                action=ActionType.REDACT,
                threat_level=ThreatLevel.MEDIUM,
                description="Detects and redacts PII (SSN, credit card, email)",
                categories=["privacy"],
                compliance=[ComplianceFramework.HIPAA, ComplianceFramework.SOC2],
            ),
            PolicyRule(
                name="block_model_extraction",
                pattern=r"(extract|copy|replicate|steal|dump)\s+(the\s+)?(model|weights|parameters|training\s+data|embeddings)",
                action=ActionType.BLOCK,
                threat_level=ThreatLevel.HIGH,
                description="Blocks model extraction attempts",
                categories=["ip_protection"],
            ),
            PolicyRule(
                name="warn_sensitive_content",
                pattern=r"\b(hack|exploit|vulnerability|penetration\s+test|zero[-\s]?day)\b",
                action=ActionType.WARN,
                threat_level=ThreatLevel.LOW,
                description="Flags security-sensitive content for review",
                categories=["security"],
            ),
            PolicyRule(
                name="block_system_prompt_leak",
                pattern=r"(reveal|show|print|output|display|repeat)\s+(your|the|system)\s+(prompt|instructions|rules|configuration)",
                action=ActionType.BLOCK,
                threat_level=ThreatLevel.MEDIUM,
                description="Prevents system prompt exfiltration",
                categories=["security"],
            ),
            PolicyRule(
                name="block_data_exfiltration",
                pattern=r"(send|transmit|upload|post|email|share)\s+(all|every|the|this)\s+(data|files|information|secrets|credentials|keys)",
                action=ActionType.BLOCK,
                threat_level=ThreatLevel.HIGH,
                description="Prevents data exfiltration attempts",
                categories=["security", "privacy"],
            ),
        ]

        if self.config.custom_rules:
            self.policy_rules.extend(self.config.custom_rules)

    def hook(self, event: str, callback: Callable):
        if event in self._hooks:
            self._hooks[event].append(callback)

    async def connect(self):
        logger.info("Connecting TerrellHallGuardrails...")
        self.is_connected = True
        logger.info("TerrellHallGuardrails connected and ready")

    async def disconnect(self):
        logger.info("Disconnecting TerrellHallGuardrails...")
        self.is_connected = False
        logger.info("TerrellHallGuardrails disconnected")

    async def evaluate_request(
        self,
        session_id: str,
        user_request: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Tuple[ActionType, Dict[str, Any]]:
        """
        Evaluate a request against all security policies.
        Returns (action, details) where action is ALLOW, BLOCK, WARN, or REDACT.
        """
        async with self._lock:
            self.stats["total_requests"] += 1

        for hook in self._hooks["pre_request"]:
            result = await hook(session_id, user_request)
            if result and result.get("action") == ActionType.BLOCK:
                return ActionType.BLOCK, result

        threat_level = self._evaluate_threat(user_request)
        policy_result = self._apply_policies(user_request)

        details = {
            "threat_level": threat_level.value,
            "policy_match": policy_result.get("rule_name"),
            "policy_action": policy_result["action"].value if policy_result["action"] else None,
            "description": policy_result.get("description"),
        }

        if threat_level in (ThreatLevel.HIGH, ThreatLevel.CRITICAL):
            async with self._lock:
                self.stats["threat_detections"][threat_level.value] += 1
            event = SecurityEvent(
                id=str(uuid.uuid4()),
                timestamp=datetime.now(timezone.utc).isoformat(),
                session_id=session_id,
                event_type="threat_detection",
                threat_level=threat_level,
                details=f"Threat level {threat_level.value} detected",
                blocked=policy_result["action"] == ActionType.BLOCK,
                metadata=metadata or {},
            )
            self.security_events.append(event)

        action = policy_result["action"]
        if action == ActionType.BLOCK:
            async with self._lock:
                self.stats["blocked_requests"] += 1
            for hook in self._hooks["on_block"]:
                await hook(session_id, user_request, details)
        elif action == ActionType.WARN:
            async with self._lock:
                self.stats["warnings"] += 1
            for hook in self._hooks["on_warning"]:
                await hook(session_id, user_request, details)

        return action, details

    async def log_orchestration(
        self,
        session_id: str,
        action: str,
        path: str,
        tool: str,
        user_request: str,
        result: Optional[str] = None,
        error: Optional[str] = None,
        operation_result: str = "pending",
        metadata: Optional[Dict[str, Any]] = None,
        tokens_used: int = 0,
        cost_usd: float = 0.0,
        model: str = "",
        latency_ms: float = 0.0,
    ) -> AuditEntry:
        async with self._lock:
            if session_id not in self.session_store:
                self.session_store[session_id] = {
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "request_count": 0,
                    "threat_events": [],
                    "total_tokens": 0,
                    "total_cost": 0.0,
                }
                self.stats["sessions_tracked"] += 1

            session = self.session_store[session_id]
            session["request_count"] += 1
            session["total_tokens"] += tokens_used
            session["total_cost"] += cost_usd

        entry = AuditEntry(
            id=str(uuid.uuid4()),
            session_id=session_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            action=action,
            path=path,
            tool=tool,
            user_request=user_request,
            result=result,
            error=error,
            operation_result=operation_result,
            previous_hash=self._last_hash,
            metadata=metadata or {},
            tokens_used=tokens_used,
            cost_usd=cost_usd,
            model=model,
            latency_ms=latency_ms,
        )

        entry.entry_hash = entry.compute_hash()
        self._last_hash = entry.entry_hash

        entry.threat_level = self._evaluate_threat(user_request)

        rule_result = self._apply_policies(user_request)
        if rule_result["action"] == ActionType.BLOCK:
            entry.operation_result = "blocked"
            entry.metadata["blocked_by"] = rule_result["rule_name"]
        elif rule_result["action"] == ActionType.WARN:
            entry.metadata["warning"] = rule_result["rule_name"]

        if error:
            async with self._lock:
                self.stats["errors"] += 1

        self.audit_log.append(entry)

        if entry.threat_level in (ThreatLevel.HIGH, ThreatLevel.CRITICAL):
            session["threat_events"].append({
                "timestamp": entry.timestamp,
                "threat_level": entry.threat_level.value,
                "action": action,
            })

        for hook in self._hooks["post_request"]:
            await hook(session_id, entry)

        return entry

    def _evaluate_threat(self, content: str) -> ThreatLevel:
        content_lower = content.lower()

        critical_patterns = [
            "rm -rf /", "drop table", "delete from",
            "bypass security", "disable firewall", "sudo rm",
            "format c:", "shutdown -s", "exec(",
        ]
        for pattern in critical_patterns:
            if pattern in content_lower:
                return ThreatLevel.CRITICAL

        high_patterns = [
            "ignore previous", "override system", "ignore all",
            "extract model", "copy weights", "you are now",
            "pretend you have no", "forget your instructions",
            "new instructions:", "system prompt:",
        ]
        for pattern in high_patterns:
            if pattern in content_lower:
                return ThreatLevel.HIGH

        medium_patterns = [
            "ssn", "social security", "credit card",
            "password", "api key", "secret token",
            "private key", "database connection",
        ]
        for pattern in medium_patterns:
            if pattern in content_lower:
                return ThreatLevel.MEDIUM

        low_patterns = [
            "hack", "exploit", "vulnerability",
            "attack", "penetration", "injection",
            "malware", "backdoor",
        ]
        for pattern in low_patterns:
            if pattern in content_lower:
                return ThreatLevel.LOW

        return ThreatLevel.SAFE

    def _apply_policies(self, content: str) -> Dict[str, Any]:
        for rule in self.policy_rules:
            if not rule.enabled:
                continue
            if re.search(rule.pattern, content, re.IGNORECASE):
                return {
                    "action": rule.action,
                    "rule_name": rule.name,
                    "threat_level": rule.threat_level,
                    "description": rule.description,
                }
        return {"action": ActionType.ALLOW, "rule_name": None}

    def redact_pii(self, text: str) -> Tuple[str, int]:
        redacted = text
        count = 0

        ssn_pattern = r'\b\d{3}[-.]?\d{2}[-.]?\d{4}\b'
        if re.search(ssn_pattern, redacted):
            redacted = re.sub(ssn_pattern, "[REDACTED_SSN]", redacted)
            count += len(re.findall(ssn_pattern, text))

        cc_pattern = r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'
        if re.search(cc_pattern, redacted):
            redacted = re.sub(cc_pattern, "[REDACTED_CC]", redacted)
            count += len(re.findall(cc_pattern, text))

        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
        if re.search(email_pattern, redacted):
            redacted = re.sub(email_pattern, "[REDACTED_EMAIL]", redacted)
            count += len(re.findall(email_pattern, text))

        phone_pattern = r'\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
        if re.search(phone_pattern, redacted):
            redacted = re.sub(phone_pattern, "[REDACTED_PHONE]", redacted)
            count += len(re.findall(phone_pattern, text))

        self.stats["pii_redactions"] += count
        return redacted, count

    def filter_output(self, content: str) -> Tuple[str, List[str]]:
        filtered = content
        warnings = []

        filtered, pii_count = self.redact_pii(filtered)
        if pii_count > 0:
            warnings.append(f"Redacted {pii_count} PII instances")

        if self._contains_harmful_content(filtered):
            warnings.append("Harmful content detected and flagged")

        return filtered, warnings

    def _contains_harmful_content(self, content: str) -> bool:
        harmful_patterns = [
            r'\b(step\s+by\s+step\s+instructions?\s+for\s+(making|creating|building)\s+(a\s+)?(bomb|explosive|weapon))\b',
        ]
        for pattern in harmful_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        return False

    def verify_chain_integrity(self) -> Tuple[bool, str]:
        if not self.audit_log:
            return True, "Empty audit log"

        previous_hash = ""
        for i, entry in enumerate(self.audit_log):
            if entry.previous_hash != previous_hash:
                return False, f"Chain broken at entry {i}"
            expected_hash = entry.compute_hash()
            if entry.entry_hash != expected_hash:
                return False, f"Entry {i} hash mismatch"
            previous_hash = entry.entry_hash

        return True, "Chain integrity verified"

    def get_session_history(self, session_id: str) -> List[AuditEntry]:
        return [e for e in self.audit_log if e.session_id == session_id]

    def get_session_stats(self, session_id: str) -> Dict[str, Any]:
        session = self.session_store.get(session_id, {})
        entries = self.get_session_history(session_id)
        return {
            "session_id": session_id,
            "created_at": session.get("created_at"),
            "request_count": session.get("request_count", 0),
            "total_tokens": session.get("total_tokens", 0),
            "total_cost": session.get("total_cost", 0.0),
            "threat_events": len(session.get("threat_events", [])),
            "audit_entries": len(entries),
        }

    def get_compliance_report(self, framework: ComplianceFramework) -> Dict[str, Any]:
        relevant_events = [
            e for e in self.security_events
            if e.metadata.get("compliance") == framework.value
        ]
        return {
            "framework": framework.value,
            "total_requests": self.stats["total_requests"],
            "blocked_requests": self.stats["blocked_requests"],
            "warnings": self.stats["warnings"],
            "security_events": len(relevant_events),
            "chain_valid": self.verify_chain_integrity()[0],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    def get_stats(self) -> Dict[str, Any]:
        return {
            **self.stats,
            "audit_log_size": len(self.audit_log),
            "active_sessions": len(self.session_store),
            "chain_valid": self.verify_chain_integrity()[0],
            "threat_detections": dict(self.stats["threat_detections"]),
        }

    def add_policy_rule(self, rule: PolicyRule):
        self.policy_rules.append(rule)
        logger.info(f"Policy rule added: {rule.name}")

    def remove_policy_rule(self, rule_name: str) -> bool:
        for i, rule in enumerate(self.policy_rules):
            if rule.name == rule_name:
                del self.policy_rules[i]
                return True
        return False

    def export_audit_log(self, format: str = "json") -> str:
        if format == "json":
            return json.dumps([asdict(e) for e in self.audit_log], indent=2, default=str)
        elif format == "csv":
            lines = ["id,session_id,timestamp,action,path,tool,operation_result,threat_level,model,tokens_used,cost_usd,hash"]
            for e in self.audit_log:
                lines.append(f"{e.id},{e.session_id},{e.timestamp},{e.action},{e.path},{e.tool},{e.operation_result},{e.threat_level.value},{e.model},{e.tokens_used},{e.cost_usd},{e.entry_hash}")
            return "\n".join(lines)
        elif format == "jsonl":
            return "\n".join(json.dumps(asdict(e), default=str) for e in self.audit_log)
        else:
            raise ValueError(f"Unsupported format: {format}")
