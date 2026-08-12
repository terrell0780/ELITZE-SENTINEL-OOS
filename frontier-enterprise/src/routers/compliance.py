# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from src.core.compliance import ComplianceEngine, RETENTION_ACTION

router = APIRouter(prefix="/api/v1/enterprise/compliance", tags=["compliance"])

engine = ComplianceEngine()


class LogEventBody(BaseModel):
    actor_id: str
    action: str
    resource_type: str
    resource_id: str
    details: Optional[dict] = None
    ip_address: str = ""


class CreatePolicyBody(BaseModel):
    name: str
    data_type: str
    retention_days: int
    action_on_expiry: RETENTION_ACTION


@router.get("/rules")
async def list_rules():
    return engine.list_rules()


@router.post("/rules/{rule_id}/toggle")
async def toggle_rule(rule_id: str):
    rule = engine.toggle_rule(rule_id)
    if rule is None:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rule


@router.get("/events")
async def list_events(
    actor_id: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    limit: int = Query(100),
):
    filters = {}
    if actor_id:
        filters["actor_id"] = actor_id
    if action:
        filters["action"] = action
    if resource_type:
        filters["resource_type"] = resource_type
    return engine.get_events(filters, limit)


@router.post("/events")
async def log_event(body: LogEventBody):
    event = engine.log_event(
        actor_id=body.actor_id,
        action=body.action,
        resource_type=body.resource_type,
        resource_id=body.resource_id,
        details=body.details,
        ip=body.ip_address,
    )
    return event


@router.get("/events/export")
async def export_events(format: str = Query("json")):
    return engine.export_events(format=format)


@router.post("/retention-policies")
async def create_policy(body: CreatePolicyBody):
    policy = engine.create_retention_policy(
        name=body.name,
        data_type=body.data_type,
        retention_days=body.retention_days,
        action=body.action_on_expiry,
    )
    return policy


@router.get("/retention-policies")
async def list_policies():
    return engine.list_policies()


@router.post("/retention/check")
async def run_retention_check():
    return engine.run_retention_check()


@router.get("/report/{standard}")
async def compliance_report(standard: str):
    return engine.generate_compliance_report(standard)
