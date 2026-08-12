# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from src.core import GovernanceEngine
from src.router import Router

router = Router(prefix="/v1/governance")
eng = GovernanceEngine()


@router.add_route("POST", "/policies")
def create_policy(query, body):
    p = eng.create_policy(
        name=body["name"], description=body.get("description", ""),
        category=body["category"], severity=body["severity"],
        action=body["action"], pattern=body["pattern"],
        priority=body.get("priority", 50)
    )
    return 201, {"policy_id": p.policy_id, "name": p.name, "category": p.category.value,
                  "severity": p.severity.value, "action": p.action.value}


@router.add_route("GET", "/policies")
def list_policies(query, body):
    return eng.list_policies(
        category=query.get("category"),
        severity=query.get("severity"),
        enabled_only=query.get("enabled_only", "").lower() == "true"
    )


@router.add_route("GET", "/policies/{policy_id}")
def get_policy(query, body, policy_id):
    p = eng.get_policy(policy_id)
    if not p:
        return 404, {"error": "Policy not found"}
    return {"policy_id": p.policy_id, "name": p.name, "description": p.description,
            "category": p.category.value, "severity": p.severity.value,
            "action": p.action.value, "pattern": p.pattern,
            "enabled": p.enabled, "priority": p.priority,
            "created_at": p.created_at, "updated_at": p.updated_at}


@router.add_route("PUT", "/policies/{policy_id}")
def update_policy(query, body, policy_id):
    try:
        p = eng.update_policy(policy_id, body)
    except ValueError as e:
        return 404, {"error": str(e)}
    return {"policy_id": p.policy_id, "name": p.name, "category": p.category.value,
            "severity": p.severity.value, "action": p.action.value,
            "pattern": p.pattern, "enabled": p.enabled, "priority": p.priority,
            "updated_at": p.updated_at}


@router.add_route("DELETE", "/policies/{policy_id}")
def delete_policy(query, body, policy_id):
    if eng.delete_policy(policy_id):
        return {"status": "deleted", "policy_id": policy_id}
    return 404, {"error": "Policy not found"}


@router.add_route("POST", "/policies/{policy_id}/toggle")
def toggle_policy(query, body, policy_id):
    if not eng.get_policy(policy_id):
        return 404, {"error": "Policy not found"}
    enabled = eng.toggle_policy(policy_id)
    return {"policy_id": policy_id, "enabled": enabled}


@router.add_route("GET", "/policies/{policy_id}/versions")
def get_versions(query, body, policy_id):
    return eng.get_version_history(policy_id)


@router.add_route("POST", "/evaluate")
def evaluate(query, body):
    return eng.evaluate(body["input_text"])


@router.add_route("POST", "/simulate")
def simulate(query, body):
    result = eng.simulate(body["input_text"])
    return {"sim_id": result.sim_id, "input_text": result.input_text,
            "matched_policies": result.matched_policies,
            "triggered_actions": result.triggered_actions,
            "verdict": result.verdict, "timestamp": result.timestamp}


@router.add_route("POST", "/approvals")
def create_approval(query, body):
    a = eng.create_approval(
        request_type=body["request_type"], requester_id=body["requester_id"],
        resource_type=body["resource_type"], resource_id=body["resource_id"],
        reason=body["reason"]
    )
    return 201, {"approval_id": a.approval_id, "request_type": a.request_type,
                  "status": a.status.value, "created_at": a.created_at}


@router.add_route("GET", "/approvals")
def list_approvals(query, body):
    return eng.list_approvals(status=query.get("status"))


@router.add_route("POST", "/approvals/{approval_id}/review")
def review_approval(query, body, approval_id):
    ok = eng.review_approval(approval_id, body["reviewer_id"],
                              body["status"], body.get("reason", ""))
    if not ok:
        return 404, {"error": "Approval not found or already reviewed"}
    return {"status": "reviewed", "approval_id": approval_id,
            "new_status": body["status"]}
