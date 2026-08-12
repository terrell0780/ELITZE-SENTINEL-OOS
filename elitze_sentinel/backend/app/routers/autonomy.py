# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from fastapi import APIRouter, HTTPException
from ..core.autonomy_engine import AutonomyEngine, Trigger, TriggerType
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/autonomy", tags=["Autonomy"])

engine = AutonomyEngine()


class TriggerCreate(BaseModel):
    type: str = Field(..., description="TriggerType: time, event, custom")
    name: str
    config: Dict[str, Any] = Field(default_factory=dict)


class PlanCreate(BaseModel):
    name: str
    goal: str
    steps: Optional[List[Dict[str, Any]]] = None


@router.post("/triggers")
async def register_trigger(body: TriggerCreate):
    try:
        trigger_type = TriggerType(body.type)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid trigger type: {body.type}")
    trigger = Trigger(
        trigger_id=f"trg-{__import__('uuid').uuid4().hex[:8]}",
        type=trigger_type,
        name=body.name,
        config=body.config,
    )
    trigger_id = engine.register_trigger(trigger)
    return {"trigger_id": trigger_id, "type": body.type, "name": body.name}


@router.get("/triggers")
async def list_triggers():
    return {"triggers": [{"trigger_id": t.trigger_id, "type": t.type.value, "name": t.name, "enabled": t.enabled} for t in engine.triggers]}


@router.post("/plans")
async def create_plan(body: PlanCreate):
    plan = await engine.create_plan(name=body.name, goal=body.goal, steps=body.steps)
    return {"plan_id": plan.plan_id, "name": plan.name, "steps": [{"step_id": s.step_id, "action": s.action} for s in plan.steps], "status": plan.status.value}


@router.get("/plans")
async def list_plans():
    return {"plans": engine.list_plans()}


@router.post("/plans/{plan_id}/execute")
async def execute_plan(plan_id: str):
    try:
        plan = await engine.execute_plan(plan_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"plan_id": plan.plan_id, "name": plan.name, "status": plan.status.value, "steps": [{"step_id": s.step_id, "action": s.action, "status": s.status.value, "result": s.result} for s in plan.steps]}


@router.get("/plans/{plan_id}")
async def get_plan(plan_id: str):
    plan = engine.get_plan(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"plan_id": plan.plan_id, "name": plan.name, "status": plan.status.value, "created_at": plan.created_at, "executed_at": plan.executed_at, "error": plan.error, "steps": [{"step_id": s.step_id, "action": s.action, "params": s.params, "status": s.status.value, "result": s.result} for s in plan.steps]}
