# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from src.core import OperationsManager
from src.router import Router

router = Router(prefix="/v1/operations")
mgr = OperationsManager()


@router.add_route("POST", "/audit/events")
def log_event(query, body):
    e = mgr.log_event(
        actor_id=body["actor_id"], action=body["action"],
        resource_type=body["resource_type"], resource_id=body["resource_id"],
        details=body.get("details"), ip=body.get("ip", ""),
        status=body.get("status", "success"),
        workspace_id=body.get("workspace_id", "")
    )
    return 201, {"event_id": e.event_id, "timestamp": e.timestamp,
                  "status": e.status.value}


@router.add_route("GET", "/audit/events")
def list_events(query, body):
    limit = int(query.get("limit", 100))
    return mgr.list_events(
        actor=query.get("actor"), action=query.get("action"),
        resource_type=query.get("resource_type"),
        status=query.get("status"), limit=limit
    )


@router.add_route("GET", "/audit/events/export")
def export_events(query, body):
    return {"data": mgr.export_events()}


@router.add_route("POST", "/metrics")
def record_metric(query, body):
    m = mgr.record_metric(
        name=body["name"], value=body["value"],
        labels=body.get("labels"), unit=body.get("unit", "")
    )
    return 201, {"metric_name": m.metric_name, "value": m.value,
                  "timestamp": m.timestamp}


@router.add_route("GET", "/metrics")
def list_metrics(query, body):
    return {"metrics": mgr.list_metrics()}


@router.add_route("GET", "/metrics/{name}")
def get_metric(query, body, name):
    time_range = int(query.get("time_range", 60))
    return mgr.get_metric(name, time_range_minutes=time_range)


@router.add_route("POST", "/traces")
def start_trace(query, body):
    s = mgr.start_trace(
        name=body["name"], service=body["service"],
        attributes=body.get("attributes")
    )
    return 201, {"span_id": s.span_id, "trace_id": s.trace_id, "name": s.name,
                  "service": s.service, "start_time": s.start_time}


@router.add_route("POST", "/traces/{trace_id}/spans")
def start_child_span(query, body, trace_id):
    try:
        s = mgr.start_span(
            name=body["name"], service=body["service"],
            parent_span_id=body["parent_span_id"],
            attributes=body.get("attributes")
        )
    except ValueError as e:
        return 404, {"error": str(e)}
    return 201, {"span_id": s.span_id, "trace_id": s.trace_id,
                  "parent_span_id": s.parent_span_id, "name": s.name,
                  "service": s.service, "start_time": s.start_time}


@router.add_route("POST", "/spans/{span_id}/end")
def end_span(query, body, span_id):
    ok = mgr.end_span(span_id, status=body.get("status", "ok"))
    if not ok:
        return 404, {"error": "Span not found"}
    return {"status": "ended", "span_id": span_id}


@router.add_route("GET", "/traces/{trace_id}")
def get_trace(query, body, trace_id):
    spans = mgr.get_trace(trace_id)
    if not spans:
        return 404, {"error": "Trace not found"}
    return {"trace_id": trace_id, "spans": spans}


@router.add_route("POST", "/alerts")
def create_alert(query, body):
    a = mgr.create_alert(
        name=body["name"], description=body.get("description", ""),
        severity=body["severity"], source=body["source"],
        condition=body["condition"]
    )
    return 201, {"alert_id": a.alert_id, "name": a.name,
                  "severity": a.severity.value, "status": a.status.value}


@router.add_route("GET", "/alerts")
def list_alerts(query, body):
    return mgr.list_alerts(severity=query.get("severity"), status=query.get("status"))


@router.add_route("POST", "/alerts/{alert_id}/acknowledge")
def acknowledge_alert(query, body, alert_id):
    if mgr.acknowledge_alert(alert_id, body["user_id"]):
        return {"status": "acknowledged", "alert_id": alert_id,
                "acknowledged_by": body["user_id"]}
    return 404, {"error": "Alert not found"}


@router.add_route("POST", "/alerts/{alert_id}/resolve")
def resolve_alert(query, body, alert_id):
    if mgr.resolve_alert(alert_id):
        return {"status": "resolved", "alert_id": alert_id}
    return 404, {"error": "Alert not found"}


@router.add_route("GET", "/dashboard")
def get_dashboard(query, body):
    return mgr.get_dashboard()
