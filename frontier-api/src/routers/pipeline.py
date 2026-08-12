# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from src.core import GovernanceEngine, IdentityManager, OperationsManager
from src.core.pipeline import PipelineOrchestrator
from src.router import Router

router = Router(prefix="/v1/pipeline")
identity = IdentityManager()
governance = GovernanceEngine()
operations = OperationsManager()
orchestrator = PipelineOrchestrator(identity, governance, operations)


@router.add_route("POST", "/execute")
def execute_pipeline(query, body):
    result = orchestrator.execute(
        input_text=body.get("input", ""),
        auth_type=body.get("auth_type", "api_key"),
        auth_token=body.get("auth_token", ""),
        model_preference=body.get("model"),
        workflow_id=body.get("workflow_id"),
        environment=body.get("environment"),
        context=body.get("context"),
    )
    return orchestrator.to_dict(result)


@router.add_route("POST", "/validate")
def validate_pipeline(query, body):
    result = orchestrator.execute(
        input_text=body.get("input", ""),
        auth_type=body.get("auth_type", "api_key"),
        auth_token=body.get("auth_token", ""),
        environment="development",
    )
    return {
        "pipeline_id": result.pipeline_id,
        "status": result.status.value,
        "policy_verdict": result.policy_verdict,
        "policy_matches": result.policy_matches,
        "error": result.error,
        "total_duration_ms": result.total_duration_ms,
    }


@router.add_route("GET", "/stages")
def list_stages(query, body):
    return {
        "stages": [
            {"name": "auth", "order": 1, "description": "Validate API key or OIDC token"},
            {"name": "tenant", "order": 2, "description": "Resolve tenant from identity"},
            {"name": "environment", "order": 3, "description": "Resolve runtime environment"},
            {"name": "policy", "order": 4, "description": "Evaluate against governance policies"},
            {"name": "routing", "order": 5, "description": "Determine target (model/workflow/agent)"},
            {"name": "execution", "order": 6, "description": "Execute + provenance + trace + audit"},
        ]
    }
