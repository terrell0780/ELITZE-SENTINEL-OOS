# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import json
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class AuditStatus(str, Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    DENIED = "denied"


@dataclass
class AuditEvent:
    event_id: str
    timestamp: str
    actor_id: str
    action: str
    resource_type: str
    resource_id: str
    details: dict[str, Any] = field(default_factory=dict)
    ip_address: str = ""
    status: AuditStatus = AuditStatus.SUCCESS
    workspace_id: str = ""


@dataclass
class MetricPoint:
    metric_name: str
    value: float
    timestamp: float = 0.0
    labels: dict[str, str] = field(default_factory=dict)
    unit: str = ""


class TraceStatus(str, Enum):
    OK = "ok"
    ERROR = "error"


@dataclass
class Span:
    span_id: str
    trace_id: str
    parent_span_id: str | None = None
    name: str = ""
    service: str = ""
    start_time: float = 0.0
    end_time: float | None = None
    duration_ms: float | None = None
    status: TraceStatus = TraceStatus.OK
    attributes: dict[str, Any] = field(default_factory=dict)


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class AlertStatus(str, Enum):
    FIRING = "firing"
    RESOLVED = "resolved"
    ACKNOWLEDGED = "acknowledged"


@dataclass
class Alert:
    alert_id: str
    name: str
    description: str
    severity: AlertSeverity
    source: str
    condition: str
    status: AlertStatus = AlertStatus.FIRING
    triggered_at: float = 0.0
    resolved_at: float | None = None
    acknowledged_by: str | None = None


class OperationsManager:
    def __init__(self):
        self._events: list[AuditEvent] = []
        self._metrics: list[MetricPoint] = []
        self._spans: dict[str, Span] = {}
        self._trace_spans: dict[str, list[str]] = {}
        self._alerts: dict[str, Alert] = {}

    def _now(self) -> float:
        return time.time()

    def _iso_now(self) -> str:
        return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    # ── Audit ────────────────────────────────────────────────────────

    def log_event(self, actor_id: str, action: str, resource_type: str,
                  resource_id: str, details: dict | None = None,
                  ip: str = "", status: str = "success",
                  workspace_id: str = "") -> AuditEvent:
        event = AuditEvent(
            event_id="evt-" + uuid.uuid4().hex[:12],
            timestamp=self._iso_now(),
            actor_id=actor_id, action=action,
            resource_type=resource_type, resource_id=resource_id,
            details=details or {}, ip_address=ip,
            status=AuditStatus(status.lower()),
            workspace_id=workspace_id
        )
        self._events.append(event)
        return event

    def list_events(self, actor: str | None = None, action: str | None = None,
                    resource_type: str | None = None, status: str | None = None,
                    limit: int = 100) -> list[dict]:
        result = []
        for e in reversed(self._events):
            if actor and e.actor_id != actor:
                continue
            if action and e.action != action:
                continue
            if resource_type and e.resource_type != resource_type:
                continue
            if status and e.status.value != status.lower():
                continue
            result.append({
                "event_id": e.event_id, "timestamp": e.timestamp,
                "actor_id": e.actor_id, "action": e.action,
                "resource_type": e.resource_type, "resource_id": e.resource_id,
                "details": e.details, "ip_address": e.ip_address,
                "status": e.status.value, "workspace_id": e.workspace_id
            })
            if len(result) >= limit:
                break
        return result

    def export_events(self, fmt: str = "json") -> str:
        data = [
            {"event_id": e.event_id, "timestamp": e.timestamp,
             "actor_id": e.actor_id, "action": e.action,
             "resource_type": e.resource_type, "resource_id": e.resource_id,
             "details": e.details, "ip_address": e.ip_address,
             "status": e.status.value, "workspace_id": e.workspace_id}
            for e in self._events
        ]
        return json.dumps(data, default=str, indent=2)

    # ── Metrics ──────────────────────────────────────────────────────

    def record_metric(self, name: str, value: float, labels: dict | None = None,
                      unit: str = "") -> MetricPoint:
        point = MetricPoint(
            metric_name=name, value=value, timestamp=self._now(),
            labels=labels or {}, unit=unit
        )
        self._metrics.append(point)
        return point

    def get_metric(self, name: str, time_range_minutes: int = 60) -> list[dict]:
        cutoff = self._now() - time_range_minutes * 60
        result = []
        for m in self._metrics:
            if m.metric_name == name and m.timestamp >= cutoff:
                result.append({
                    "metric_name": m.metric_name, "value": m.value,
                    "timestamp": m.timestamp, "labels": m.labels, "unit": m.unit
                })
        return result

    def list_metrics(self) -> list[str]:
        return list(dict.fromkeys(m.metric_name for m in self._metrics))

    # ── Tracing ──────────────────────────────────────────────────────

    def start_trace(self, name: str, service: str,
                    attributes: dict | None = None) -> Span:
        span_id = "spn-" + uuid.uuid4().hex[:12]
        now = self._now()
        span = Span(
            span_id=span_id, trace_id=span_id, parent_span_id=None,
            name=name, service=service, start_time=now,
            attributes=attributes or {}
        )
        self._spans[span_id] = span
        self._trace_spans[span_id] = [span_id]
        return span

    def start_span(self, name: str, service: str, parent_span_id: str,
                   attributes: dict | None = None) -> Span:
        parent = self._spans.get(parent_span_id)
        if not parent:
            raise ValueError(f"Parent span {parent_span_id} not found")
        span_id = "spn-" + uuid.uuid4().hex[:12]
        now = self._now()
        span = Span(
            span_id=span_id, trace_id=parent.trace_id,
            parent_span_id=parent_span_id, name=name, service=service,
            start_time=now, attributes=attributes or {}
        )
        self._spans[span_id] = span
        self._trace_spans.setdefault(parent.trace_id, []).append(span_id)
        return span

    def end_span(self, span_id: str, status: str = "ok") -> bool:
        span = self._spans.get(span_id)
        if not span:
            return False
        span.end_time = self._now()
        span.duration_ms = (span.end_time - span.start_time) * 1000
        span.status = TraceStatus(status.lower())
        return True

    def get_trace(self, trace_id: str) -> list[Span]:
        span_ids = self._trace_spans.get(trace_id, [])
        spans = [self._spans[sid] for sid in span_ids if sid in self._spans]
        result = []
        for s in spans:
            result.append({
                "span_id": s.span_id, "trace_id": s.trace_id,
                "parent_span_id": s.parent_span_id, "name": s.name,
                "service": s.service, "start_time": s.start_time,
                "end_time": s.end_time, "duration_ms": s.duration_ms,
                "status": s.status.value, "attributes": s.attributes
            })
        return result

    # ── Alerts ───────────────────────────────────────────────────────

    def create_alert(self, name: str, description: str, severity: str,
                     source: str, condition: str) -> Alert:
        alert_id = "alt-" + uuid.uuid4().hex[:12]
        alert = Alert(
            alert_id=alert_id, name=name, description=description,
            severity=AlertSeverity(severity.lower()), source=source,
            condition=condition, status=AlertStatus.FIRING,
            triggered_at=self._now()
        )
        self._alerts[alert_id] = alert
        return alert

    def list_alerts(self, severity: str | None = None,
                    status: str | None = None) -> list[dict]:
        result = []
        for a in self._alerts.values():
            if severity and a.severity.value != severity.lower():
                continue
            if status and a.status.value != status.lower():
                continue
            result.append({
                "alert_id": a.alert_id, "name": a.name,
                "description": a.description, "severity": a.severity.value,
                "source": a.source, "condition": a.condition,
                "status": a.status.value, "triggered_at": a.triggered_at,
                "resolved_at": a.resolved_at,
                "acknowledged_by": a.acknowledged_by
            })
        return result

    def acknowledge_alert(self, alert_id: str, user_id: str) -> bool:
        alert = self._alerts.get(alert_id)
        if not alert:
            return False
        alert.status = AlertStatus.ACKNOWLEDGED
        alert.acknowledged_by = user_id
        return True

    def resolve_alert(self, alert_id: str) -> bool:
        alert = self._alerts.get(alert_id)
        if not alert:
            return False
        alert.status = AlertStatus.RESOLVED
        alert.resolved_at = self._now()
        return True

    def get_dashboard(self) -> dict:
        status_counts: dict[str, int] = {}
        for e in self._events:
            status_counts[e.status.value] = status_counts.get(e.status.value, 0) + 1
        active_count = sum(1 for a in self._alerts.values()
                           if a.status == AlertStatus.FIRING)
        return {
            "total_events": len(self._events),
            "event_counts_by_status": status_counts,
            "total_metrics": len(self._metrics),
            "active_alerts": active_count,
            "total_traces": len(self._trace_spans),
            "total_alerts": len(self._alerts)
        }
