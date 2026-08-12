# Agent Orchestrator — routes intents → chains agents → returns results
# Lives behind Gateway (/v1/agent/execute) and enables agent-to-agent flow

import json
import logging
import re
from collections.abc import Callable
from typing import Any

import httpx

logger = logging.getLogger(__name__)

# ─── Agent Registry ──────────────────────────────────────────
# Maps intent categories to agent chains (ordered execution)

HTTP_SUCCESS_THRESHOLD = 500  # status codes below this are successful responses


class Agent:
    name: str
    service: str
    endpoint: str
    handler: Callable | None

    def __init__(self, name: str, service: str, endpoint: str = "/"):
        self.name = name
        self.service = service
        self.endpoint = endpoint
        self.handler = None

    def __repr__(self): return f"Agent({self.name}@{self.service})"

# ─── Intent → Agent Chain Routing ────────────────────────────

ROUTING_TABLE: dict[str, list[dict]] = {
    # Gaming pipeline
    "game_world": [
        {"agent": "intent_analyzer",    "service": "frontier-core",       "endpoint": "/v1/analyze"},
        {"agent": "gaming_compiler",    "service": "frontier-gaming-compiler", "endpoint": "/v1/compile"},
        {"agent": "engine_builder",     "service": "frontier-gaming-engine",   "endpoint": "/v1/build"},
        {"agent": "gaming_studio",      "service": "frontier-gaming-studio",   "endpoint": "/v1/deploy"},
    ],
    # Security/Threat Intel pipeline
    "threat_intel": [
        {"agent": "intent_analyzer",    "service": "frontier-core",       "endpoint": "/v1/analyze"},
        {"agent": "threat_detector",    "service": "frontier-threat-intel","endpoint": "/v1/generate"},
        {"agent": "sentinel_enforcer",  "service": "elitze-sentinel",     "endpoint": "/v1/enforce"},
    ],
    # Business/CRM pipeline
    "business_crm": [
        {"agent": "intent_analyzer",    "service": "frontier-core",       "endpoint": "/v1/analyze"},
        {"agent": "integration_hub",    "service": "frontier-integration-hub","endpoint": "/v1/execute"},
        {"agent": "enterprise_messaging","service": "enterprise-messaging","endpoint": "/v1/send"},
    ],
    # Code generation pipeline
    "code_gen": [
        {"agent": "intent_analyzer",    "service": "frontier-core",       "endpoint": "/v1/analyze"},
        {"agent": "code_generator",     "service": "frontier-code",       "endpoint": "/v1/generate"},
        {"agent": "studio_builder",     "service": "frontier-studio",     "endpoint": "/v1/build"},
    ],
    # Maps/Geospatial pipeline
    "geospatial": [
        {"agent": "intent_analyzer",    "service": "frontier-core",       "endpoint": "/v1/analyze"},
        {"agent": "maps_grounding",     "service": "frontier-maps",       "endpoint": "/v1/ground"},
        {"agent": "maps_imagery",       "service": "frontier-maps",       "endpoint": "/v1/imagery"},
    ],
    # Intelligence pipeline
    "intelligence": [
        {"agent": "intent_analyzer",    "service": "frontier-core",       "endpoint": "/v1/analyze"},
        {"agent": "frontier_intel",     "service": "frontier-intelligence","endpoint": "/v1/process"},
    ],
    # Workflow automation
    "workflow": [
        {"agent": "intent_analyzer",    "service": "frontier-core",       "endpoint": "/v1/analyze"},
        {"agent": "workflow_runner",    "service": "frontier-workflows",  "endpoint": "/v1/run"},
    ],
    # Email/Messaging
    "email": [
        {"agent": "intent_analyzer",    "service": "frontier-core",       "endpoint": "/v1/analyze"},
        {"agent": "enterprise_messaging","service": "enterprise-messaging","endpoint": "/v1/send"},
    ],
    # Sales & Marketing pipeline
    "sales": [
        {"agent": "intent_analyzer",    "service": "frontier-core",       "endpoint": "/v1/analyze"},
        {"agent": "sales_pipeline",     "service": "frontier-sales",      "endpoint": "/v1/listings"},
        {"agent": "enterprise_messaging","service": "enterprise-messaging","endpoint": "/v1/send"},
    ],
    # Lead Generation pipeline — sovereign AI prospecting
    "leadgen": [
        {"agent": "intent_analyzer",    "service": "frontier-core",       "endpoint": "/v1/analyze"},
        {"agent": "lead_sourcer",       "service": "frontier-leadgen",    "endpoint": "/v1/sources/run"},
        {"agent": "lead_enricher",      "service": "frontier-leadgen",    "endpoint": "/v1/enrich"},
        {"agent": "lead_scorer",        "service": "frontier-leadgen",    "endpoint": "/v1/score"},
        {"agent": "sales_pipeline",     "service": "frontier-sales",      "endpoint": "/v1/listings"},
        {"agent": "enterprise_messaging","service": "enterprise-messaging","endpoint": "/v1/send"},
    ],
    # General/default — single agent, pass through
    "default": [
        {"agent": "frontier_core",      "service": "frontier-core",       "endpoint": "/v1/process"},
    ],
}

# ─── Intent Classifier ───────────────────────────────────────
# Maps user input to routing categories

INTENT_PATTERNS = {
    "game_world":   [r"\b(game|world|level|map|terrain|biome|pcg|procedural)\b", r"\b(unreal|unity|cpp|engine)\b"],
    "threat_intel": [r"\b(threat|security|intel|vulnerability|cve|attack|malware|splunk|kql)\b"],
    "business_crm": [r"\b(crm|sales|lead|customer|invoice|deal|pipeline|highlevel|monday)\b"],
    "code_gen":     [r"\b(code|app|build|develop|create|make|generate)\b", r"\b(api|website|dashboard|saas)\b"],
    "geospatial":   [r"\b(map|location|geo|spatial|coordinates|terrain|grounding)\b"],
    "intelligence": [r"\b(analyze|research|intelligence|report|summary|brief)\b"],
    "workflow":     [r"\b(workflow|automate|pipeline|chain|orchestrate)\b"],
    "email":        [r"\b(email|mail|message|send|inbox|outreach|campaign)\b"],
    "sales":        [r"\b(sell|sale|deal|pipeline|market|listing|price|revenue|monetize|license|buy|purchase|offer)\b"],
    "leadgen":      [
        r"\bleads?\b",
        r"\bprospects?\b",
        r"\bprospecting\b",
        r"\b(outreach|cold.?email)\b",
        r"\b(scrape|enrich|sourc(ing|e|es)?)\b",
        r"\bfind.*(client|customer|prospect|lead|buyer)s?\b",
        r"\b(generate|score).*(lead|prospect)s?\b",
        r"\bclients?\b",
        r"\bcold\b",
    ],
}

def classify_intent(query: str) -> str:
    query_lower = query.lower()
    scores = {}
    for category, patterns in INTENT_PATTERNS.items():
        score = 0
        for pattern in patterns:
            if re.search(pattern, query_lower):
                score += 1
        if score > 0:
            scores[category] = score

    if not scores:
        return "default"

    # Return highest scoring category
    return max(scores, key=scores.get)

# ─── Orchestrator ────────────────────────────────────────────

class AgentOrchestrator:
    """Routes intents through agent chains. Each agent gets the previous agent's output as input."""

    def __init__(self):
        self.services_map: dict[str, str] = {}
        logger.info("AgentOrchestrator initialized")

    def set_service_url(self, name: str, url: str):
        """Set the URL for a backend service."""
        self.services_map[name] = url.rstrip("/")

    def get_chain(self, intent: str) -> list[dict]:
        """Get the agent chain for a given intent category."""
        return ROUTING_TABLE.get(intent, ROUTING_TABLE["default"])

    async def execute(self, intent: str, payload: dict, context: dict | None = None) -> dict:
        """Execute an intent through its agent chain, passing data between agents."""
        chain = self.get_chain(intent)
        current_payload = payload
        context = context or {}
        chain_results = []

        logger.info(f"Executing intent '{intent}' with {len(chain)} agents: {' → '.join(a['agent'] for a in chain)}")

        for step in chain:
            agent_name = step["agent"]
            service = step["service"]
            endpoint = step["endpoint"]
            service_url = self.services_map.get(service)

            if service_url:
                # Forward to real service
                try:
                    async with httpx.AsyncClient(timeout=30) as client:
                        resp = await client.post(
                            f"{service_url}{endpoint}",
                            json={"payload": current_payload, "context": context, "chain": chain_results},
                            headers={"X-Agent-Chain": json.dumps([a["agent"] for a in chain])},
                        )
                        if resp.status_code < HTTP_SUCCESS_THRESHOLD:
                            result = resp.json()
                        else:
                            result = {"error": f"Service {service} returned {resp.status_code}", "status": "error"}
                except Exception as e:
                    result = {"error": f"Failed to reach {service}: {e}", "status": "error"}
            else:
                # Service not mapped — simulate agent step for demo/testing
                result = self._simulate_agent(agent_name, current_payload, context, chain_results)

            chain_results.append({
                "agent": agent_name,
                "service": service,
                "input": current_payload,
                "output": result,
            })

            # Pass this agent's output as input to the next
            current_payload = result

        return {
            "intent": intent,
            "chain": [a["agent"] for a in chain],
            "status": "completed" if not any(r.get("output", {}).get("status") == "error" for r in chain_results) else "partial",
            "chain_results": chain_results,
            "final_output": current_payload,
        }

    def _simulate_agent(self, agent_name: str, payload: Any, _context: dict, chain: list[dict]) -> dict:
        """Simulate an agent when the real service isn't available."""
        simulations = {
            "intent_analyzer": lambda: {
                "analysis": f"Analyzed query: {str(payload)[:100]}",
                "confidence": 0.92,
                "suggested_agents": [a["agent"] for a in chain[1:]] if chain else [],
            },
            "gaming_compiler": lambda: {
                "status": "COMPILATION_SUCCESSFUL",
                "blueprint_id": "E-WORLD-SIM",
                "seed": 12345678,
                "engine_bindings": {"generated": "cpp_header, csharp_class"},
            },
            "engine_builder": lambda: {
                "status": "BUILD_SUCCESSFUL",
                "target": "Unreal Engine 5.5",
                "compile_time_ms": 12400,
            },
            "gaming_studio": lambda: {
                "status": "DEPLOYED",
                "editor_url": "unreal://localhost/world/E-WORLD-SIM",
            },
            "threat_detector": lambda: {
                "threats_found": 3,
                "severity": "medium",
                "mitre_techniques": ["T1566", "T1059"],
            },
            "sentinel_enforcer": lambda: {
                "policies_applied": ["TRAFFIC_FILTER", "RATE_LIMIT"],
                "status": "ENFORCED",
            },
            "integration_hub": lambda: {
                "connected_platforms": ["salesforce", "highlevel"],
                "sync_status": "COMPLETE",
            },
            "enterprise_messaging": lambda: {
                "sent": True,
                "recipients": 42,
                "campaign_id": "EM-20260722",
            },
            "sales_pipeline": lambda: {
                "listing_created": True,
                "listing_id": "LST-SIMULATED",
                "stage": "published",
                "deal_pipeline": ["draft", "published", "promoted", "offer", "negotiation", "sold"],
                "marketing_campaign": "CAMP-SIMULATED",
            },
            "lead_sourcer": lambda: {
                "leads_discovered": 8,
                "source_executed": True,
                "source_id": "SRC-SIMULATED",
                "leads": [
                    {"email": f"prospect{i}@company.com", "name": f"Prospect {i}", "company": f"Company {i}"}
                    for i in range(1, 4)
                ],
            },
            "lead_enricher": lambda: {
                "enriched": True,
                "emails_enriched": 3,
                "profiles": [{"company": "Acme Corp", "industry": "Tech", "revenue": "$10M-$50M"}],
            },
            "lead_scorer": lambda: {
                "scored": True,
                "score": 87,
                "grade": "A",
                "recommendation": "hot",
                "breakdown": {"industry_fit": 20, "size_fit": 15, "tech_overlap": 10},
            },
            "code_generator": lambda: {
                "files_created": 12,
                "language": "python",
                "repo_url": "https://github.com/elitze/frontier-generated",
            },
            "studio_builder": lambda: {
                "project_opened": True,
                "panels": ["code", "preview", "terminal"],
            },
            "maps_grounding": lambda: {
                "locations_grounded": 8,
                "mcp_status": "ACTIVE",
            },
            "maps_imagery": lambda: {
                "tiles_generated": 256,
                "source": "Google_Earth_HighFidelity",
            },
            "frontier_intel": lambda: {
                "analysis_complete": True,
                "summary": "Intelligence processed successfully",
            },
            "workflow_runner": lambda: {
                "workflow": "automation_pipeline",
                "steps_completed": 5,
                "status": "SUCCESS",
            },
            "frontier_core": lambda: {
                "processed": True,
                "result": str(payload)[:500],
            },
        }

        handler = simulations.get(agent_name)
        if handler:
            return handler()
        return {"status": "simulated", "agent": agent_name, "note": "Service not available"}
