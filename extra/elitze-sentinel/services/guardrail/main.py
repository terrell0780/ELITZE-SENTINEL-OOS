# Terrell Hall Guardrail
# The named security enforcement point across every Frontier layer.
# Every request passes through Guardrail before execution.
#
# Elitze Sentinel — Sovereign Security Platform
# Copyright (c) 2026 Terrell Hall / TrueElitze Digital

import os
import json
import hashlib
import hmac
import time
import uuid
from typing import Dict, List, Optional, Any, Literal
from enum import Enum
from datetime import datetime, timezone
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel, Field

# ── OpenTelemetry ─────────────────────────────────────────────
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from prometheus_client import start_http_server, Counter, Histogram

trace_provider = TracerProvider(resource=Resource.create({SERVICE_NAME: "terrell-hall-guardrail"}))
trace_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://jaeger:4318/v1/traces"))))
trace.set_tracer_provider(trace_provider)
metric_reader = PrometheusMetricReader()
meter_provider = MeterProvider(metric_readers=[metric_reader], resource=Resource.create({SERVICE_NAME: "terrell-hall-guardrail"}))
start_http_server(port=int(os.getenv("GUARDRAIL_METRICS_PORT", "9472")), addr="0.0.0.0")
FastAPIInstrumentor.instrument()
tracer = trace.get_tracer(__name__)

# ── Metrics ───────────────────────────────────────────────────
REQUESTS_CHECKED = Counter("guardrail_requests_total", "Requests checked", ["layer", "decision"])
POLICY_VIOLATIONS = Counter("guardrail_policy_violations_total", "Policy violations", ["policy"])
AUDIT_EVENTS = Counter("guardrail_audit_events_total", "Audit events written")
CHECK_DURATION = Histogram("guardrail_check_duration_seconds", "Time per policy check")

# ── Config ────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "dev-guardrail-key")
GUARDRAIL_TOKEN = os.getenv("GUARDRAIL_TOKEN", "guardrail-dev-token")
JWT_SECRET = os.getenv("JWT_SIGNING_KEY", "dev-jwt-secret")

# ── Types ─────────────────────────────────────────────────────
class Layer(str, Enum):
    PLATFORM = "platform"           # Chat, Studio, Console, CLI
    INTELLIGENCE = "intelligence"   # Gateway, Router, Agents, Runtime
    SENTINEL = "sentinel"           # Identity, Auth, Audit (self)
    DATA = "data"                   # Connectors, DBs, Event Bus
    COMPUTE = "compute"             # Ollama, vLLM, Docker, K8s
    OBSERVABILITY = "observability" # Metrics, Logs, Traces
    ENTERPRISE = "enterprise"       # SSO, Billing, Orgs, Licensing
    DEVELOPER = "developer"         # SDKs, CI/CD, Plugins

class Decision(str, Enum):
    ALLOW = "allow"
    DENY = "deny"
    REVIEW = "review"  # Human-in-the-loop required

class Effect(str, Enum):
    ALLOW = "allow"
    DENY = "deny"
    AUDIT = "audit"  # Allow but log for compliance

class EnforcementRequest(BaseModel):
    layer: Layer
    action: str
    resource: str
    subject: Dict[str, Any] = {}       # user, roles, org
    context: Dict[str, Any] = {}       # request context, IP, time, geo
    payload: Optional[Dict[str, Any]] = None

class EnforcementResponse(BaseModel):
    decision: Decision
    policy: str
    reason: str
    enforcement_id: str
    checks: List[str] = []
    obligations: List[str] = []        # e.g., "audit_log", "mfa_required"
    evaluated_at: str

class AuditEvent(BaseModel):
    event_id: str
    timestamp: str
    layer: str
    action: str
    resource: str
    subject: str
    decision: str
    policy: str
    reason: str
    metadata: Dict[str, Any] = {}

class PolicyDefinition(BaseModel):
    id: str
    name: str
    description: str
    layer: Layer
    effect: Effect
    conditions: Dict[str, Any] = {}
    priority: int = 0
    enabled: bool = True

# ── Built-in Policies ─────────────────────────────────────────
# Terrell Hall Guardrail ships with opinionated security defaults.
# These can be overridden at runtime but provide safe defaults.

BUILTIN_POLICIES: List[PolicyDefinition] = [
    # Platform layer
    PolicyDefinition(id="plat-no-anon", name="No Anonymous Access", description="All platform requests must have authenticated subject",
                     layer=Layer.PLATFORM, effect=Effect.DENY, conditions={"require_subject": True}, priority=100),
    PolicyDefinition(id="plat-role-check", name="Role Enforcement", description="Subject must have required role for action",
                     layer=Layer.PLATFORM, effect=Effect.DENY, conditions={"require_role": True}, priority=90),

    # Intelligence layer
    PolicyDefinition(id="intel-model-allowlist", name="Model Allowlist", description="Only approved models may be used for inference",
                     layer=Layer.INTELLIGENCE, effect=Effect.DENY, conditions={"allowed_models": ["ollama", "vllm", "openrouter", "anthropic", "openai", "google"]}, priority=100),
    PolicyDefinition(id="intel-cost-cap", name="Cost Cap Enforcement", description="Per-user token spend must not exceed daily cap",
                     layer=Layer.INTELLIGENCE, effect=Effect.DENY, conditions={"daily_token_cap": 10_000_000}, priority=80),

    # Data layer
    PolicyDefinition(id="data-no-egress", name="Data Egress Control", description="Sensitive data must not leave designated boundary",
                     layer=Layer.DATA, effect=Effect.DENY, conditions={"blocked_destinations": ["external-llm", "public-internet"]}, priority=100),
    PolicyDefinition(id="data-encryption", name="Encryption Required", description="Data at rest and in transit must be encrypted",
                     layer=Layer.DATA, effect=Effect.DENY, conditions={"require_encryption": True}, priority=95),

    # Compute layer
    PolicyDefinition(id="compute-resource-limits", name="Resource Limits", description="Container/VM resources must not exceed allocation",
                     layer=Layer.COMPUTE, effect=Effect.DENY, conditions={"max_cpu": 16, "max_memory_gb": 64}, priority=90),
    PolicyDefinition(id="compute-no-crypto", name="No Cryptocurrency Mining", description="Prohibit crypto mining workloads",
                     layer=Layer.COMPUTE, effect=Effect.DENY, conditions={"blocked_workloads": ["cryptominer"]}, priority=100),

    # Enterprise layer
    PolicyDefinition(id="ent-audit-required", name="Audit Required", description="All admin actions must be audited",
                     layer=Layer.ENTERPRISE, effect=Effect.AUDIT, conditions={"audit_level": "full"}, priority=100),
    PolicyDefinition(id="ent-mfa-sensitive", name="MFA for Sensitive Actions", description="Sensitive admin actions require MFA",
                     layer=Layer.ENTERPRISE, effect=Effect.DENY, conditions={"require_mfa": True, "sensitive_actions": ["delete_org", "export_data", "modify_policy"]}, priority=95),

    # Developer layer
    PolicyDefinition(id="dev-signed-commits", name="Signed Commits Required", description="All code deployments must have verified signatures",
                     layer=Layer.DEVELOPER, effect=Effect.DENY, conditions={"require_signed": True}, priority=90),
    PolicyDefinition(id="dev-secret-scan", name="Secret Scanning", description="Code must pass secret scanning before deployment",
                     layer=Layer.DEVELOPER, effect=Effect.DENY, conditions={"require_secret_scan": True}, priority=95),
]

# ── Guardrail Engine ──────────────────────────────────────────
class GuardrailEngine:
    """The core enforcement engine. Every request is evaluated against policies."""

    def __init__(self):
        self.policies: Dict[str, PolicyDefinition] = {p.id: p for p in BUILTIN_POLICIES}
        self.custom_policies: Dict[str, PolicyDefinition] = {}
        self.audit_log: List[AuditEvent] = []
        self.secrets: Dict[str, str] = {}  # In-memory for dev; Vault-backed in prod
        self.subject_cache: Dict[str, Dict[str, Any]] = {}  # subject_id → attributes
        self.sessions: Dict[str, Dict[str, Any]] = {}  # session_id → session data
        self.rate_limits: Dict[str, List[float]] = {}  # key → [timestamps]

    def get_all_policies(self) -> List[PolicyDefinition]:
        return list(self.policies.values()) + list(self.custom_policies.values())

    def get_policy(self, policy_id: str) -> Optional[PolicyDefinition]:
        return self.policies.get(policy_id) or self.custom_policies.get(policy_id)

    def add_policy(self, policy: PolicyDefinition) -> PolicyDefinition:
        self.custom_policies[policy.id] = policy
        return policy

    def remove_policy(self, policy_id: str) -> bool:
        if policy_id in self.custom_policies:
            del self.custom_policies[policy_id]
            return True
        if policy_id in self.policies:
            return False  # Cannot remove built-in policies
        return False

    def evaluate(self, req: EnforcementRequest) -> EnforcementResponse:
        """Evaluate a request against all applicable policies. Returns decision."""
        enforcement_id = str(uuid.uuid4())
        applicable = []
        decisions = []

        with tracer.start_as_current_span("guardrail_evaluate") as span:
            span.set_attribute("layer", req.layer.value)
            span.set_attribute("action", req.action)
            span.set_attribute("resource", req.resource)
            span.set_attribute("subject", req.subject.get("id", "anonymous"))

            for policy in self.get_all_policies():
                if not policy.enabled:
                    continue
                if policy.layer != req.layer:
                    continue

                applicable.append(policy.id)
                result = self._evaluate_one(policy, req)
                decisions.append(result)

                if result["effect"] == Effect.DENY:
                    POLICY_VIOLATIONS.labels(policy=policy.id).inc()
                    span.add_event("policy_denied", {"policy": policy.id, "reason": result["reason"]})
                    REQUESTS_CHECKED.labels(layer=req.layer.value, decision="deny").inc()

                    return EnforcementResponse(
                        decision=Decision.DENY,
                        policy=policy.id,
                        reason=result["reason"],
                        enforcement_id=enforcement_id,
                        checks=applicable,
                        obligations=result.get("obligations", []),
                        evaluated_at=datetime.now(timezone.utc).isoformat(),
                    )

                if result["effect"] == Effect.AUDIT:
                    REQUESTS_CHECKED.labels(layer=req.layer.value, decision="allow").inc()

            # All policies passed
            REQUESTS_CHECKED.labels(layer=req.layer.value, decision="allow").inc()
            span.set_attribute("decision", "allow")

            return EnforcementResponse(
                decision=Decision.ALLOW,
                policy="builtin:default-allow",
                reason="All policies passed",
                enforcement_id=enforcement_id,
                checks=applicable,
                evaluated_at=datetime.now(timezone.utc).isoformat(),
            )

    def _evaluate_one(self, policy: PolicyDefinition, req: EnforcementRequest) -> Dict[str, Any]:
        """Evaluate a single policy against a request. Returns effect + reason."""
        conditions = policy.conditions

        if policy.id == "plat-no-anon":
            if conditions.get("require_subject") and not req.subject.get("id"):
                return {"effect": Effect.DENY, "reason": "Anonymous access denied. Authentication required."}

        elif policy.id == "plat-role-check":
            required_role = conditions.get("required_role")
            if required_role and required_role not in req.subject.get("roles", []):
                return {"effect": Effect.DENY, "reason": f"Subject missing required role: {required_role}"}

        elif policy.id == "intel-model-allowlist":
            model = req.context.get("model", "")
            allowed = conditions.get("allowed_models", [])
            if model and model not in allowed:
                return {"effect": Effect.DENY, "reason": f"Model '{model}' not in allowlist. Allowed: {', '.join(allowed)}"}

        elif policy.id == "intel-cost-cap":
            cap = conditions.get("daily_token_cap", 0)
            subject_id = req.subject.get("id", "anonymous")
            if cap and self._exceeded_cost_cap(subject_id, cap):
                return {"effect": Effect.DENY, "reason": f"Daily token cap of {cap:,} exceeded for {subject_id}"}

        elif policy.id == "data-no-egress":
            destination = req.context.get("destination", "")
            blocked = conditions.get("blocked_destinations", [])
            if destination in blocked:
                return {"effect": Effect.DENY, "reason": f"Data egress to '{destination}' blocked by policy"}

        elif policy.id == "data-encryption":
            if conditions.get("require_encryption") and not req.context.get("encrypted", False):
                return {"effect": Effect.DENY, "reason": "Encryption required but not detected"}

        elif policy.id == "compute-resource-limits":
            cpu = req.context.get("cpu", 0)
            memory = req.context.get("memory_gb", 0)
            if cpu > conditions.get("max_cpu", 999):
                return {"effect": Effect.DENY, "reason": f"CPU request ({cpu}) exceeds limit ({conditions['max_cpu']})"}
            if memory > conditions.get("max_memory_gb", 999):
                return {"effect": Effect.DENY, "reason": f"Memory request ({memory}GB) exceeds limit ({conditions['max_memory_gb']}GB)"}

        elif policy.id == "compute-no-crypto":
            workload = req.context.get("workload_type", "")
            if workload in conditions.get("blocked_workloads", []):
                return {"effect": Effect.DENY, "reason": f"Workload type '{workload}' is prohibited"}

        elif policy.id == "ent-audit-required":
            if conditions.get("audit_level") == "full":
                # Audit is fulfilled by writing to the audit log after evaluation
                return {"effect": Effect.AUDIT, "reason": "Action audited per policy", "obligations": ["write_audit_log"]}

        elif policy.id == "ent-mfa-sensitive":
            sensitive = conditions.get("sensitive_actions", [])
            if req.action in sensitive and not req.context.get("mfa_verified", False):
                return {"effect": Effect.DENY, "reason": "MFA required for this action. Re-authenticate with MFA."}

        elif policy.id == "dev-signed-commits":
            if conditions.get("require_signed") and not req.context.get("signature_verified", False):
                return {"effect": Effect.DENY, "reason": "Signed commit required. Commit must have a verified signature."}

        elif policy.id == "dev-secret-scan":
            if conditions.get("require_secret_scan") and not req.context.get("secret_scan_passed", False):
                return {"effect": Effect.DENY, "reason": "Secret scanning must pass before deployment. Run 'guardrail scan' first."}

        return {"effect": Effect.ALLOW, "reason": f"Policy '{policy.id}' passed"}

    def _exceeded_cost_cap(self, subject_id: str, cap: int) -> bool:
        """Check if a subject has exceeded their daily cost cap."""
        # In production, this queries the cost engine.
        return False  # Placeholder: assume under cap

    # ── Audit ─────────────────────────────────────────────────
    def write_audit(self, req: EnforcementRequest, response: EnforcementResponse) -> AuditEvent:
        event = AuditEvent(
            event_id=str(uuid.uuid4()),
            timestamp=datetime.now(timezone.utc).isoformat(),
            layer=req.layer.value,
            action=req.action,
            resource=req.resource,
            subject=req.subject.get("id", "anonymous"),
            decision=response.decision.value,
            policy=response.policy,
            reason=response.reason,
            metadata={
                "roles": req.subject.get("roles", []),
                "org": req.subject.get("org", ""),
                "ip": req.context.get("ip", ""),
                "user_agent": req.context.get("user_agent", ""),
            },
        )
        self.audit_log.append(event)
        AUDIT_EVENTS.inc()
        return event

    # ── Secrets ───────────────────────────────────────────────
    def set_secret(self, key: str, value: str) -> None:
        self.secrets[key] = value

    def get_secret(self, key: str) -> Optional[str]:
        return self.secrets.get(key)

    def delete_secret(self, key: str) -> bool:
        if key in self.secrets:
            del self.secrets[key]
            return True
        return False

    # ── Identity ──────────────────────────────────────────────
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify a JWT token and return subject info."""
        try:
            import jwt
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            return payload
        except Exception:
            return None

    def verify_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """Verify an API key against stored secrets."""
        for sub_id, attrs in self.subject_cache.items():
            if attrs.get("api_key") == api_key:
                return attrs
        return None

    # ── Rate Limiting ─────────────────────────────────────────
    def check_rate_limit(self, key: str, max_requests: int = 100, window_seconds: int = 60) -> bool:
        """Returns True if under limit, False if exceeded."""
        now = time.time()
        if key not in self.rate_limits:
            self.rate_limits[key] = []
        # Clean old entries
        self.rate_limits[key] = [t for t in self.rate_limits[key] if now - t < window_seconds]
        if len(self.rate_limits[key]) >= max_requests:
            return False
        self.rate_limits[key].append(now)
        return True


# ── App ───────────────────────────────────────────────────────
engine = GuardrailEngine()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: seed test subjects
    engine.subject_cache["guardrail-test"] = {"id": "guardrail-test", "roles": ["admin"], "org": "frontier"}
    engine.subject_cache["dev-user"] = {"id": "dev-user", "roles": ["developer"], "org": "frontier"}
    engine.set_secret("test-api-key", "sk-test-" + hashlib.sha256(b"test").hexdigest()[:16])
    yield

app = FastAPI(title="Terrell Hall Guardrail", version="1.0.0", lifespan=lifespan)


# ── Middleware ────────────────────────────────────────────────
async def verify_auth(authorization: str = Header(None)) -> Dict[str, Any]:
    """Verify request auth and return subject info."""
    if not authorization:
        return {"id": "anonymous", "roles": [], "authenticated": False}
    if authorization.startswith("Bearer "):
        token = authorization[7:]
        payload = engine.verify_token(token)
        if payload:
            return {"id": payload.get("sub"), "roles": payload.get("roles", []), "org": payload.get("org", ""), "authenticated": True}
        api_key = engine.verify_api_key(token)
        if api_key:
            return {**api_key, "authenticated": True}
    return {"id": "anonymous", "roles": [], "authenticated": False}


# ── API Routes ────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "service": "terrell-hall-guardrail", "version": "1.0.0", "policies_loaded": len(engine.get_all_policies())}


# ═══ CORE: Enforce ═══════════════════════════════════════════
@app.post("/v1/enforce")
async def enforce(req: EnforcementRequest, subject: Dict[str, Any] = Depends(verify_auth)):
    """Evaluate a request against all policies. Every service calls this before executing actions."""
    with CHECK_DURATION.time():
        with tracer.start_as_current_span("enforce") as span:
            req.subject = {**req.subject, **subject}
            result = engine.evaluate(req)
            span.set_attribute("decision", result.decision.value)
            span.set_attribute("policy", result.policy)

            # Write audit for all decisions
            engine.write_audit(req, result)

            return result


# ═══ POLICY MANAGEMENT ═══════════════════════════════════════
@app.get("/v1/policies")
async def list_policies(layer: Optional[Layer] = None, enabled: Optional[bool] = None):
    """List all policies, optionally filtered by layer and enabled status."""
    policies = engine.get_all_policies()
    if layer:
        policies = [p for p in policies if p.layer == layer]
    if enabled is not None:
        policies = [p for p in policies if p.enabled == enabled]
    return {"policies": policies, "count": len(policies)}

@app.get("/v1/policies/{policy_id}")
async def get_policy(policy_id: str):
    policy = engine.get_policy(policy_id)
    if not policy:
        raise HTTPException(404, f"Policy '{policy_id}' not found")
    return policy

@app.post("/v1/policies")
async def add_custom_policy(policy: PolicyDefinition):
    """Add a custom policy. Built-in policies cannot be overwritten."""
    if policy.id in engine.policies:
        raise HTTPException(400, f"Cannot overwrite built-in policy '{policy.id}'. Use a custom policy ID.")
    return engine.add_policy(policy)

@app.delete("/v1/policies/{policy_id}")
async def delete_policy(policy_id: str):
    if not engine.remove_policy(policy_id):
        raise HTTPException(400, f"Cannot remove built-in policy '{policy_id}' or policy not found")
    return {"message": f"Policy '{policy_id}' removed"}


# ═══ SECRETS ════════════════════════════════════════════════
class SecretRequest(BaseModel):
    key: str = Field(..., min_length=3, max_length=200)
    value: str = Field(..., min_length=1)

@app.post("/v1/secrets")
async def create_secret(req: SecretRequest):
    engine.set_secret(req.key, req.value)
    return {"message": "Secret stored", "key": req.key}

@app.get("/v1/secrets/{key}")
async def get_secret(key: str):
    value = engine.get_secret(key)
    if value is None:
        raise HTTPException(404, f"Secret '{key}' not found")
    return {"key": key, "value": "[REDACTED]"}

@app.delete("/v1/secrets/{key}")
async def delete_secret(key: str):
    if not engine.delete_secret(key):
        raise HTTPException(404, f"Secret '{key}' not found")
    return {"message": f"Secret '{key}' deleted"}


# ═══ AUDIT ══════════════════════════════════════════════════
@app.get("/v1/audit")
async def list_audit(layer: Optional[str] = None, limit: int = 50):
    """Return recent audit log entries."""
    entries = engine.audit_log
    if layer:
        entries = [e for e in entries if e.layer == layer]
    return {"audit_entries": entries[-limit:], "total": len(entries)}


# ═══ ENFORCEMENT POINTS ── Per-Layer Shortcuts ═══════════════
@app.post("/v1/platform/{action}")
async def enforce_platform(action: str, req: EnforcementRequest):
    """Enforce platform layer policy (Chat, Studio, Console, CLI)."""
    req.layer = Layer.PLATFORM
    req.action = action
    return await enforce(req)

@app.post("/v1/intelligence/{action}")
async def enforce_intelligence(action: str, req: EnforcementRequest):
    """Enforce intelligence layer policy (Gateway, Router, Agents, Runtime)."""
    req.layer = Layer.INTELLIGENCE
    req.action = action
    return await enforce(req)

@app.post("/v1/data/{action}")
async def enforce_data(action: str, req: EnforcementRequest):
    """Enforce data layer policy (Connectors, DBs, MCP)."""
    req.layer = Layer.DATA
    req.action = action
    return await enforce(req)

@app.post("/v1/compute/{action}")
async def enforce_compute(action: str, req: EnforcementRequest):
    """Enforce compute layer policy (Models, Containers, Runtimes)."""
    req.layer = Layer.COMPUTE
    req.action = action
    return await enforce(req)

@app.post("/v1/enterprise/{action}")
async def enforce_enterprise(action: str, req: EnforcementRequest):
    """Enforce enterprise layer policy (Billing, Orgs, SSO)."""
    req.layer = Layer.ENTERPRISE
    req.action = action
    return await enforce(req)

@app.post("/v1/developer/{action}")
async def enforce_developer(action: str, req: EnforcementRequest):
    """Enforce developer layer policy (SDKs, Plugins, CI/CD)."""
    req.layer = Layer.DEVELOPER
    req.action = action
    return await enforce(req)


# ── Main ──────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("GUARDRAIL_PORT", "8010"))
    print(f"Terrell Hall Guardrail — enforcing security across all layers")
    print(f"  Policies loaded: {len(engine.get_all_policies())}")
    print(f"  Layers: {', '.join(l.value for l in Layer)}")
    uvicorn.run(app, host="0.0.0.0", port=port)
