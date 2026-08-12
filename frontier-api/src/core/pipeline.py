# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
Sentinel Pipeline Orchestrator — Chains auth → policy → route → execute → prove + trace + audit.
"""

import hashlib
import json
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from .governance import GovernanceEngine, PolicyAction
from .identity import IdentityManager


class PipelineStage(str, Enum):
    AUTH = "auth"
    TENANT = "tenant"
    ENVIRONMENT = "environment"
    POLICY = "policy"
    ROUTING = "routing"
    EXECUTION = "execution"
    PROVENANCE = "provenance"


class PipelineStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    DENIED = "denied"
    REQUIRES_APPROVAL = "requires_approval"
    FAILED = "failed"


class EnvironmentType(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


@dataclass
class PipelineResult:
    pipeline_id: str
    status: PipelineStatus
    stages: dict[str, dict[str, Any]] = field(default_factory=dict)
    user_id: str | None = None
    tenant_id: str | None = None
    tenant_slug: str | None = None
    environment: str = "development"
    policy_verdict: str | None = None
    policy_matches: list[dict] = field(default_factory=list)
    routed_target: str | None = None
    routed_type: str | None = None  # "model", "workflow", "agent"
    execution_result: dict | None = None
    provenance_hash: str | None = None
    trace_id: str | None = None
    audit_event_id: str | None = None
    error: str | None = None
    started_at: float = 0.0
    completed_at: float | None = None
    total_duration_ms: float | None = None


class PipelineOrchestrator:
    """
    Six-stage request pipeline:
    1. Auth — validate OIDC/API key, resolve identity
    2. Tenant — resolve tenant from identity
    3. Environment — resolve runtime environment
    4. Policy — evaluate against governance policies
    5. Routing — determine target (model/workflow/agent)
    6. Execution — execute + provenance + trace + audit
    """

    def __init__(self, identity: IdentityManager, governance: GovernanceEngine, operations=None):
        self.identity = identity
        self.governance = governance
        self.operations = operations
        self._stages: dict[str, Any] = {}
        self._context: dict[str, Any] = {}

    def _now(self) -> float:
        return time.time()

    def _iso_now(self) -> str:
        return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    def execute(
        self,
        input_text: str,
        auth_type: str = "api_key",
        auth_token: str = "",
        model_preference: str | None = None,
        workflow_id: str | None = None,
        environment: str | None = None,
        context: dict[str, Any] | None = None,
    ) -> PipelineResult:
        started = self._now()
        pipeline_id = f"pl-{uuid.uuid4().hex[:12]}"
        stages: dict[str, dict[str, Any]] = {}
        result = PipelineResult(pipeline_id=pipeline_id, status=PipelineStatus.RUNNING, started_at=started)

        try:
            # ── Stage 1: Auth ────────────────────────────────────────────
            stage_start = self._now()
            user_id = None
            tenant_id = None
            if auth_type == "api_key":
                valid = self.identity.validate_api_key(auth_token)
                if not valid:
                    result.status = PipelineStatus.DENIED
                    result.error = "Invalid or revoked API key"
                    stages["auth"] = {"status": "denied", "reason": result.error, "duration_ms": (self._now() - stage_start) * 1000}
                    result.stages = stages
                    result.completed_at = self._now()
                    result.total_duration_ms = (result.completed_at - started) * 1000
                    return result
                key = self.identity.get_api_key(auth_token)
                if key:
                    user_id = key.user_id
                    tenant_id = key.tenant_id
            elif auth_type == "oidc":
                # Stubbed OIDC — extract user from token or use default
                user_id = "usr-" + uuid.uuid4().hex[:8] if not auth_token.startswith("usr-") else auth_token
                tenant_id = context.get("tenant_id") if context else None

            stages["auth"] = {
                "status": "ok", "auth_type": auth_type, "user_id": user_id, "tenant_id": tenant_id,
                "duration_ms": round((self._now() - stage_start) * 1000, 2)
            }
            result.user_id = user_id

            # ── Stage 2: Tenant ──────────────────────────────────────────
            stage_start = self._now()
            tenant = None
            tenant_slug = None
            if tenant_id:
                tenant = self.identity.get_tenant(tenant_id)
                tenant_slug = tenant.slug if tenant else None
            result.tenant_id = tenant_id
            result.tenant_slug = tenant_slug
            stages["tenant"] = {
                "status": "ok" if tenant or not tenant_id else "not_found",
                "tenant_id": tenant_id, "slug": tenant_slug,
                "duration_ms": round((self._now() - stage_start) * 1000, 2)
            }

            # ── Stage 3: Environment ─────────────────────────────────────
            stage_start = self._now()
            env = environment or "development"
            if tenant and tenant.settings.get("environment"):
                env = tenant.settings["environment"]
            result.environment = env
            stages["environment"] = {
                "status": "ok", "environment": env,
                "duration_ms": round((self._now() - stage_start) * 1000, 2)
            }

            # ── Stage 4: Policy ──────────────────────────────────────────
            stage_start = self._now()
            matches = self.governance.evaluate(input_text)
            result.policy_matches = matches
            triggered = list(dict.fromkeys(m["action"] for m in matches))

            if PolicyAction.DENY.value in triggered:
                verdict = PolicyAction.DENY.value
                result.status = PipelineStatus.DENIED
                result.error = f"Blocked by policy: {', '.join(m['name'] for m in matches if m['action'] == PolicyAction.DENY.value)}"
            elif PolicyAction.REVIEW.value in triggered:
                verdict = PolicyAction.REVIEW.value
                result.status = PipelineStatus.REQUIRES_APPROVAL
            else:
                verdict = PolicyAction.ALLOW.value

            result.policy_verdict = verdict
            stages["policy"] = {
                "status": verdict, "matches_count": len(matches),
                "triggered_actions": triggered,
                "duration_ms": round((self._now() - stage_start) * 1000, 2)
            }

            # If denied or requires approval, stop here
            if result.status in (PipelineStatus.DENIED, PipelineStatus.REQUIRES_APPROVAL):
                result.stages = stages
                result.completed_at = self._now()
                result.total_duration_ms = (result.completed_at - started) * 1000
                return result

            # ── Stage 5: Routing ─────────────────────────────────────────
            stage_start = self._now()
            routed_target = model_preference or "Frontier-stub-v1"
            routed_type = "model"
            if workflow_id:
                routed_target = workflow_id
                routed_type = "workflow"

            # Check for route transforms from policy
            for m in matches:
                if m.get("action") == "route" and m.get("route_target"):
                    routed_target = m["route_target"]
                    break

            result.routed_target = routed_target
            result.routed_type = routed_type
            stages["routing"] = {
                "status": "ok", "target": routed_target, "type": routed_type,
                "duration_ms": round((self._now() - stage_start) * 1000, 2)
            }

            # ── Stage 6: Execution ───────────────────────────────────────
            stage_start = self._now()
            exec_result = self._stub_execution(input_text, routed_target, routed_type, context)
            result.execution_result = exec_result
            stages["execution"] = {
                "status": "ok", "model": routed_target, "output_length": len(exec_result.get("output", "")),
                "duration_ms": round((self._now() - stage_start) * 1000, 2)
            }

            # ── Provenance ───────────────────────────────────────────────
            stage_start = self._now()
            raw = input_text + json.dumps(exec_result) + pipeline_id + (user_id or "")
            provenance_hash = hashlib.sha256(raw.encode()).hexdigest()
            result.provenance_hash = provenance_hash

            trace_id = f"trc-{uuid.uuid4().hex[:12]}"
            result.trace_id = trace_id

            audit_event_id = None
            if self.operations:
                event = self.operations.log_event(
                    actor_id=user_id or "anonymous",
                    action="pipeline.execute",
                    resource_type="pipeline",
                    resource_id=pipeline_id,
                    details={"input_length": len(input_text), "verdict": verdict, "provenance": provenance_hash},
                    ip=context.get("ip", "") if context else "",
                    status="success",
                    workspace_id=tenant_id or ""
                )
                audit_event_id = event.event_id
                self.operations.record_metric("pipeline.execution", 1, {"environment": env, "verdict": verdict}, "count")

            result.audit_event_id = audit_event_id
            stages["provenance"] = {
                "status": "ok", "provenance_hash": provenance_hash,
                "trace_id": trace_id, "audit_event_id": audit_event_id,
                "duration_ms": round((self._now() - stage_start) * 1000, 2)
            }

            result.status = PipelineStatus.COMPLETED

        except Exception as e:
            result.status = PipelineStatus.FAILED
            result.error = str(e)

        result.stages = stages
        result.completed_at = self._now()
        result.total_duration_ms = round((result.completed_at - started) * 1000, 2)
        return result

    def _stub_execution(self, input_text: str, target: str, target_type: str, context: dict | None) -> dict:
        """Stubbed model/workflow execution."""
        if target_type == "workflow":
            return {
                "type": "workflow",
                "workflow_id": target,
                "output": f"[Workflow {target}] Executed with input ({len(input_text)} chars). Steps: 3 completed.",
                "steps_completed": 3,
            }
        return {
            "type": "model",
            "model": target,
            "output": f"[{target}] Processed input ({len(input_text)} chars). Response generated via Elitze Sentinel pipeline.",
            "tokens_used": max(len(input_text) // 4, 1),
        }

    def to_dict(self, result: PipelineResult) -> dict[str, Any]:
        return {
            "pipeline_id": result.pipeline_id,
            "status": result.status.value,
            "stages": result.stages,
            "user_id": result.user_id,
            "tenant_id": result.tenant_id,
            "tenant_slug": result.tenant_slug,
            "environment": result.environment,
            "policy_verdict": result.policy_verdict,
            "policy_matches": result.policy_matches,
            "routed_target": result.routed_target,
            "routed_type": result.routed_type,
            "execution_result": result.execution_result,
            "provenance_hash": result.provenance_hash,
            "trace_id": result.trace_id,
            "audit_event_id": result.audit_event_id,
            "error": result.error,
            "started_at": result.started_at,
            "completed_at": result.completed_at,
            "total_duration_ms": result.total_duration_ms,
        }
