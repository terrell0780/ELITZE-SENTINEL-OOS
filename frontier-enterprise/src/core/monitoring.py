# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from __future__ import annotations

import uuid
import time
import random
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class HealthState(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


@dataclass
class HealthStatus:
    component: str
    status: HealthState
    last_checked: str
    latency_ms: float
    details: str


@dataclass
class MetricPoint:
    metric_name: str
    value: float
    timestamp: str
    labels: dict
    unit: str


@dataclass
class Alert:
    alert_id: str
    name: str
    severity: AlertSeverity
    message: str
    condition: str
    triggered_at: str
    resolved_at: Optional[str]
    acknowledged: bool


class MonitoringService:
    def __init__(self):
        self._metrics: dict[str, list[MetricPoint]] = {}
        self._alerts: dict[str, Alert] = {}
        self._seed_default_alerts()

    def _seed_default_alerts(self):
        now = datetime.now(timezone.utc).isoformat()
        defaults = [
            ("High Latency", AlertSeverity.WARNING, "API response time exceeds 500ms", "latency > 500ms"),
            ("API Down", AlertSeverity.CRITICAL, "API endpoint is unreachable", "http_status != 200"),
            ("Memory Usage", AlertSeverity.INFO, "Memory usage above 80%", "memory_usage > 80%"),
        ]
        for name, severity, message, condition in defaults:
            alert_id = f"alert-{uuid.uuid4().hex[:8]}"
            resolved_at = now if name == "API Down" else None
            self._alerts[alert_id] = Alert(
                alert_id=alert_id,
                name=name,
                severity=severity,
                message=message,
                condition=condition,
                triggered_at=now,
                resolved_at=resolved_at,
                acknowledged=False,
            )

    def check_health(self, component: str) -> HealthStatus:
        start = time.time()
        status = HealthState.HEALTHY
        details = "All systems operational"
        if component in ("database", "cache") and random.random() < 0.1:
            status = HealthState.DEGRADED
            details = f"{component} experiencing latency"
        latency = round((time.time() - start) * 1000, 2)
        return HealthStatus(
            component=component,
            status=status,
            last_checked=datetime.now(timezone.utc).isoformat(),
            latency_ms=latency,
            details=details,
        )

    def check_all(self) -> list[HealthStatus]:
        components = ["api", "database", "cache", "gateway", "voice", "agents"]
        return [self.check_health(c) for c in components]

    def record_metric(self, name: str, value: float, labels: Optional[dict] = None, unit: str = "") -> MetricPoint:
        point = MetricPoint(
            metric_name=name,
            value=value,
            timestamp=datetime.now(timezone.utc).isoformat(),
            labels=labels or {},
            unit=unit,
        )
        if name not in self._metrics:
            self._metrics[name] = []
        self._metrics[name].append(point)
        return point

    def get_metric(self, name: str, time_range_minutes: int = 60) -> list[MetricPoint]:
        points = self._metrics.get(name, [])
        cutoff = datetime.now(timezone.utc).timestamp() - time_range_minutes * 60
        return [p for p in points if datetime.fromisoformat(p.timestamp).timestamp() >= cutoff]

    def list_metrics(self) -> list[str]:
        return list(self._metrics.keys())

    def create_alert(
        self,
        name: str,
        severity: AlertSeverity,
        message: str,
        condition: str,
    ) -> Alert:
        alert_id = f"alert-{uuid.uuid4().hex[:8]}"
        alert = Alert(
            alert_id=alert_id,
            name=name,
            severity=severity,
            message=message,
            condition=condition,
            triggered_at=datetime.now(timezone.utc).isoformat(),
            resolved_at=None,
            acknowledged=False,
        )
        self._alerts[alert_id] = alert
        return alert

    def list_alerts(
        self,
        severity: Optional[AlertSeverity] = None,
        resolved: Optional[bool] = None,
    ) -> list[Alert]:
        results = list(self._alerts.values())
        if severity:
            results = [a for a in results if a.severity == severity]
        if resolved is not None:
            if resolved:
                results = [a for a in results if a.resolved_at is not None]
            else:
                results = [a for a in results if a.resolved_at is None]
        return results

    def acknowledge_alert(self, alert_id: str) -> Optional[Alert]:
        alert = self._alerts.get(alert_id)
        if alert is None:
            return None
        alert.acknowledged = True
        return alert

    def resolve_alert(self, alert_id: str) -> Optional[Alert]:
        alert = self._alerts.get(alert_id)
        if alert is None:
            return None
        alert.resolved_at = datetime.now(timezone.utc).isoformat()
        return alert

    def get_dashboard_summary(self) -> dict:
        all_alerts = list(self._alerts.values())
        health_statuses = self.check_all()
        return {
            "total_alerts": len(all_alerts),
            "healthy_components": sum(1 for h in health_statuses if h.status == HealthState.HEALTHY),
            "degraded_components": sum(1 for h in health_statuses if h.status == HealthState.DEGRADED),
            "down_components": sum(1 for h in health_statuses if h.status == HealthState.DOWN),
            "recent_metrics": list(self._metrics.keys()),
        }
