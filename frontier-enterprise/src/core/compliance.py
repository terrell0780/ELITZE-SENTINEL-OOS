# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from __future__ import annotations

import json
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class ComplianceType(str, Enum):
    GDPR = "gdpr"
    SOC2 = "soc2"
    HIPAA = "hipaa"
    ISO27001 = "iso27001"
    CUSTOM = "custom"


class RETENTION_ACTION(str, Enum):
    ARCHIVE = "archive"
    DELETE = "delete"
    ANONYMIZE = "anonymize"


@dataclass
class ComplianceRule:
    rule_id: str
    name: str
    description: str
    rule_type: ComplianceType
    enabled: bool
    config: dict


@dataclass
class AuditEvent:
    event_id: str
    timestamp: str
    actor_id: str
    action: str
    resource_type: str
    resource_id: str
    details: dict
    ip_address: str
    user_agent: str
    workspace_id: str


@dataclass
class DataRetentionPolicy:
    policy_id: str
    name: str
    data_type: str
    retention_days: int
    action_on_expiry: RETENTION_ACTION
    enabled: bool


class ComplianceEngine:
    def __init__(self):
        self._rules: dict[str, ComplianceRule] = {}
        self._events: dict[str, AuditEvent] = {}
        self._policies: dict[str, DataRetentionPolicy] = {}
        self.seed_default_rules()

    def seed_default_rules(self):
        defaults = [
            ("GDPR Compliance", "General Data Protection Regulation", ComplianceType.GDPR, {"data_subject_access": True, "consent_required": True}),
            ("SOC2 Compliance", "Service Organization Control 2", ComplianceType.SOC2, {"audit_logging": True, "access_controls": True}),
            ("HIPAA Compliance", "Health Insurance Portability and Accountability Act", ComplianceType.HIPAA, {"phi_protection": True, "baa_required": True}),
            ("ISO 27001 Compliance", "Information Security Management", ComplianceType.ISO27001, {"risk_assessment": True, "security_policy": True}),
            ("Custom Compliance", "Custom compliance rules", ComplianceType.CUSTOM, {"custom_rules": []}),
        ]
        for name, desc, ctype, config in defaults:
            rule_id = f"rule-{ctype.value}"
            self._rules[rule_id] = ComplianceRule(
                rule_id=rule_id, name=name, description=desc, rule_type=ctype, enabled=True, config=config,
            )

    def list_rules(self) -> list[ComplianceRule]:
        return list(self._rules.values())

    def toggle_rule(self, rule_id: str) -> Optional[ComplianceRule]:
        rule = self._rules.get(rule_id)
        if rule is None:
            return None
        rule.enabled = not rule.enabled
        return rule

    def log_event(
        self,
        actor_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        details: Optional[dict] = None,
        ip: str = "",
        user_agent: str = "",
        workspace_id: str = "",
    ) -> AuditEvent:
        event_id = f"evt-{uuid.uuid4().hex[:12]}"
        event = AuditEvent(
            event_id=event_id,
            timestamp=datetime.now(timezone.utc).isoformat(),
            actor_id=actor_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip,
            user_agent=user_agent,
            workspace_id=workspace_id,
        )
        self._events[event_id] = event
        return event

    def get_events(
        self,
        filters: Optional[dict] = None,
        limit: int = 100,
    ) -> list[AuditEvent]:
        filters = filters or {}
        results = list(self._events.values())
        if "actor_id" in filters:
            results = [e for e in results if e.actor_id == filters["actor_id"]]
        if "action" in filters:
            results = [e for e in results if e.action == filters["action"]]
        if "resource_type" in filters:
            results = [e for e in results if e.resource_type == filters["resource_type"]]
        return results[:limit]

    def export_events(self, filters: Optional[dict] = None, format: str = "json") -> str:
        events = self.get_events(filters, limit=10000)
        data = []
        for e in events:
            data.append({
                "event_id": e.event_id,
                "timestamp": e.timestamp,
                "actor_id": e.actor_id,
                "action": e.action,
                "resource_type": e.resource_type,
                "resource_id": e.resource_id,
                "details": e.details,
                "ip_address": e.ip_address,
                "user_agent": e.user_agent,
                "workspace_id": e.workspace_id,
            })
        return json.dumps(data, indent=2)

    def create_retention_policy(
        self,
        name: str,
        data_type: str,
        retention_days: int,
        action: RETENTION_ACTION,
    ) -> DataRetentionPolicy:
        policy_id = f"policy-{uuid.uuid4().hex[:8]}"
        policy = DataRetentionPolicy(
            policy_id=policy_id,
            name=name,
            data_type=data_type,
            retention_days=retention_days,
            action_on_expiry=action,
            enabled=True,
        )
        self._policies[policy_id] = policy
        return policy

    def list_policies(self) -> list[DataRetentionPolicy]:
        return list(self._policies.values())

    def run_retention_check(self) -> list[dict]:
        expiring = []
        for policy in self._policies.values():
            if policy.enabled:
                expiring.append({
                    "policy_id": policy.policy_id,
                    "name": policy.name,
                    "data_type": policy.data_type,
                    "retention_days": policy.retention_days,
                    "action_on_expiry": policy.action_on_expiry.value,
                    "status": "pending_review",
                })
        return expiring

    def generate_compliance_report(self, standard: str) -> dict:
        rules = [r for r in self._rules.values() if r.rule_type.value == standard.lower()]
        enabled = sum(1 for r in rules if r.enabled)
        disabled = sum(1 for r in rules if not r.enabled)
        return {
            "standard": standard,
            "total_rules": len(rules),
            "enabled_rules": enabled,
            "disabled_rules": disabled,
            "compliant": enabled == len(rules) if rules else False,
            "status": "compliant" if enabled == len(rules) and rules else "non_compliant",
        }
