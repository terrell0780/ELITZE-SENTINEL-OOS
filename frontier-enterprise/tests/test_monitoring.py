# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import pytest
from src.core.monitoring import MonitoringService, AlertSeverity


@pytest.fixture
def ms():
    return MonitoringService()


class TestMonitoringService:
    def test_seeded_alerts(self, ms):
        alerts = ms.list_alerts()
        assert len(alerts) == 3
        names = {a.name for a in alerts}
        assert names == {"High Latency", "API Down", "Memory Usage"}

    def test_check_health_returns_status(self, ms):
        status = ms.check_health("api")
        assert status.component == "api"
        assert status.status in ("healthy", "degraded", "down")
        assert status.latency_ms >= 0

    def test_check_all_returns_six(self, ms):
        results = ms.check_all()
        assert len(results) == 6
        components = {r.component for r in results}
        assert components == {"api", "database", "cache", "gateway", "voice", "agents"}

    def test_record_metric(self, ms):
        point = ms.record_metric("cpu_usage", 45.2, {"host": "node-1"}, unit="percent")
        assert point.metric_name == "cpu_usage"
        assert point.value == 45.2
        assert point.labels == {"host": "node-1"}

    def test_get_metric(self, ms):
        ms.record_metric("memory_mb", 1024, unit="MB")
        points = ms.get_metric("memory_mb", time_range_minutes=60)
        assert len(points) == 1
        assert points[0].value == 1024

    def test_list_metrics(self, ms):
        ms.record_metric("m1", 1.0)
        ms.record_metric("m2", 2.0)
        assert set(ms.list_metrics()) == {"m1", "m2"}

    def test_create_alert(self, ms):
        alert = ms.create_alert("Disk Full", AlertSeverity.CRITICAL, "Disk usage 99%", "disk > 95%")
        assert alert.name == "Disk Full"
        assert alert.severity == AlertSeverity.CRITICAL
        assert alert.resolved_at is None
        assert alert.acknowledged is False

    def test_list_alerts_filter_by_severity(self, ms):
        warnings = ms.list_alerts(severity=AlertSeverity.WARNING)
        assert all(a.severity == AlertSeverity.WARNING for a in warnings)

    def test_list_alerts_filter_resolved(self, ms):
        resolved = ms.list_alerts(resolved=True)
        assert all(a.resolved_at is not None for a in resolved)
        unresolved = ms.list_alerts(resolved=False)
        assert all(a.resolved_at is None for a in unresolved)

    def test_acknowledge_alert(self, ms):
        alerts = ms.list_alerts()
        target = alerts[0]
        ack = ms.acknowledge_alert(target.alert_id)
        assert ack.acknowledged is True

    def test_resolve_alert(self, ms):
        alerts = ms.list_alerts(resolved=False)
        target = alerts[0]
        resolved = ms.resolve_alert(target.alert_id)
        assert resolved.resolved_at is not None

    def test_dashboard_summary(self, ms):
        summary = ms.get_dashboard_summary()
        assert "total_alerts" in summary
        assert summary["total_alerts"] == 3
        assert "healthy_components" in summary
        assert "degraded_components" in summary
        assert "recent_metrics" in summary
