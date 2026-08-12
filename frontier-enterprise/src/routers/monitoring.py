# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from src.core.monitoring import MonitoringService, AlertSeverity

router = APIRouter(prefix="/api/v1/enterprise/monitoring", tags=["monitoring"])

ms = MonitoringService()


class RecordMetricBody(BaseModel):
    name: str
    value: float
    labels: Optional[dict] = None
    unit: str = ""


class CreateAlertBody(BaseModel):
    name: str
    severity: AlertSeverity
    message: str
    condition: str


@router.get("/health")
async def check_all():
    return ms.check_all()


@router.get("/health/{component}")
async def check_component(component: str):
    valid = {"api", "database", "cache", "gateway", "voice", "agents"}
    if component not in valid:
        raise HTTPException(status_code=400, detail=f"Unknown component: {component}")
    return ms.check_health(component)


@router.get("/metrics")
async def list_metrics():
    return {"metrics": ms.list_metrics()}


@router.get("/metrics/{name}")
async def get_metric(name: str, time_range: int = Query(60, alias="time_range")):
    points = ms.get_metric(name, time_range)
    return {"metric": name, "points": points}


@router.post("/metrics")
async def record_metric(body: RecordMetricBody):
    point = ms.record_metric(body.name, body.value, body.labels, body.unit)
    return point


@router.get("/alerts")
async def list_alerts(
    severity: Optional[AlertSeverity] = Query(None),
    resolved: Optional[bool] = Query(None),
):
    return ms.list_alerts(severity, resolved)


@router.post("/alerts")
async def create_alert(body: CreateAlertBody):
    alert = ms.create_alert(body.name, body.severity, body.message, body.condition)
    return alert


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    alert = ms.acknowledge_alert(alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    alert = ms.resolve_alert(alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.get("/dashboard")
async def dashboard():
    return ms.get_dashboard_summary()
