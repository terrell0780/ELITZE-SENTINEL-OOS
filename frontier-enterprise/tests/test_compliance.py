# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import pytest
from src.core.compliance import ComplianceEngine, ComplianceType, RETENTION_ACTION


@pytest.fixture
def engine():
    return ComplianceEngine()


class TestComplianceEngine:
    def test_seeded_rules(self, engine):
        rules = engine.list_rules()
        assert len(rules) == 5
        types = {r.rule_type for r in rules}
        assert types == {
            ComplianceType.GDPR,
            ComplianceType.SOC2,
            ComplianceType.HIPAA,
            ComplianceType.ISO27001,
            ComplianceType.CUSTOM,
        }

    def test_toggle_rule(self, engine):
        rule = engine.toggle_rule("rule-gdpr")
        assert rule is not None
        assert rule.enabled is False
        toggled = engine.toggle_rule("rule-gdpr")
        assert toggled.enabled is True

    def test_log_event(self, engine):
        event = engine.log_event(
            actor_id="user-1",
            action="create",
            resource_type="document",
            resource_id="doc-123",
            details={"name": "report.pdf"},
            ip="10.0.0.1",
            user_agent="Mozilla/5.0",
            workspace_id="ws-1",
        )
        assert event.event_id.startswith("evt-")
        assert event.actor_id == "user-1"
        assert event.action == "create"

    def test_get_events_filtered(self, engine):
        engine.log_event("u1", "read", "file", "f1", workspace_id="ws-1")
        engine.log_event("u2", "write", "file", "f2", workspace_id="ws-1")
        engine.log_event("u1", "delete", "file", "f3", workspace_id="ws-2")
        results = engine.get_events(filters={"actor_id": "u1"})
        assert len(results) == 2

    def test_export_events(self, engine):
        engine.log_event("u1", "read", "doc", "d1")
        data = engine.export_events()
        assert '"event_id"' in data
        assert '"actor_id": "u1"' in data

    def test_create_retention_policy(self, engine):
        policy = engine.create_retention_policy(
            name="Log Retention",
            data_type="audit_logs",
            retention_days=365,
            action=RETENTION_ACTION.ARCHIVE,
        )
        assert policy.name == "Log Retention"
        assert policy.retention_days == 365
        assert policy.action_on_expiry == RETENTION_ACTION.ARCHIVE

    def test_list_policies(self, engine):
        engine.create_retention_policy("P1", "type1", 30, RETENTION_ACTION.DELETE)
        engine.create_retention_policy("P2", "type2", 90, RETENTION_ACTION.ANONYMIZE)
        assert len(engine.list_policies()) == 2

    def test_run_retention_check(self, engine):
        engine.create_retention_policy("Check Policy", "data", 30, RETENTION_ACTION.DELETE)
        results = engine.run_retention_check()
        assert len(results) >= 1
        assert results[0]["status"] == "pending_review"

    def test_generate_compliance_report_gdpr(self, engine):
        report = engine.generate_compliance_report("GDPR")
        assert report["standard"] == "GDPR"
        assert report["total_rules"] == 1
        assert report["enabled_rules"] == 1
        assert report["compliant"] is True

    def test_generate_compliance_report_unknown(self, engine):
        report = engine.generate_compliance_report("UNKNOWN")
        assert report["total_rules"] == 0
        assert report["compliant"] is False
