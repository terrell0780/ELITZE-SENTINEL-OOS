# Frontier-core/src/main.py
"""
Frontier Core — Open-Source AI Gateway & Workbench

Production-grade platform with:
- Full Anthropic API integration
- Workbench (API Playground & Analytics)
- Story Mode for creative writing
- Terrell Hall Guardrails (security & compliance)
- Streaming support
- Multi-model routing with fallback

Model specifications:
- Frontier 5:   $10/$50 MTok | 1M ctx | 128k out | Adaptive thinking | Jan 2026 cutoff
- Sonnet 5:  $3/$15 MTok  | 1M ctx | 128k out | Adaptive thinking | Jan 2026 cutoff
- Opus 4.8:  $5/$25 MTok  | 1M ctx | 128k out | Adaptive thinking | Jan 2026 cutoff
- Haiku 4.5: $1/$5 MTok   | 200k   | 64k out  | Extended thinking | Feb 2025 cutoff
"""

from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from .workbench import router as workbench_router
from .agents.orchestrator import AgentOrchestrator, classify_intent

orchestrator = AgentOrchestrator()

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

app = FastAPI(
    title="Frontier Core API",
    description="Open-Source AI Gateway — multi-model, guardrails, workbench",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workbench_router)


# ============================================================================
# ROOT ENDPOINTS
# ============================================================================

@app.get("/", response_class=HTMLResponse)
async def root():
    index = STATIC_DIR / "index.html"
    if index.exists():
        return FileResponse(index, media_type="text/html")
    return HTMLResponse("<h1>Frontier Core</h1><p>static/index.html not found.</p><p><a href='/docs'>API Docs</a></p>")


@app.get("/healthz")
async def health_check():
    return {"status": "healthy", "component": "Frontier-core", "version": "1.0.0"}


@app.get("/api")
async def api_info():
    return {
        "name": "Frontier Core API",
        "version": "1.0.0",
        "endpoints": {
            "workbench": "/api/v1/workbench/",
            "completions": "/api/v1/workbench/completions",
            "streaming": "/api/v1/workbench/completions/stream",
            "story": "/api/v1/workbench/story",
            "models": "/api/v1/workbench/models",
            "analytics": "/api/v1/workbench/analytics",
            "guardrails": "/api/v1/workbench/guardrails/stats",
            "evaluate": "/api/v1/workbench/evaluate",
            "docs": "/docs",
        },
    }


if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


# ─── Orchestrator Routes (Agent-to-Agent) ──────────────────

from pydantic import BaseModel
from typing import Optional, Dict, Any

class OrchestrateRequest(BaseModel):
    query: str
    intent: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

@app.post("/v1/analyze")
async def analyze_intent(req: OrchestrateRequest):
    """Classify intent and return the agent chain."""
    intent = req.intent or classify_intent(req.query)
    chain = orchestrator.get_chain(intent)
    return {
        "intent": intent,
        "agent_chain": [a["agent"] for a in chain],
        "total_agents": len(chain),
    }

@app.post("/v1/orchestrate")
async def orchestrate(req: OrchestrateRequest):
    """Execute an intent through its full agent chain."""
    intent = req.intent or classify_intent(req.query)
    result = await orchestrator.execute(intent, {"query": req.query}, req.context)
    return result

@app.post("/v1/process")
async def process(req: OrchestrateRequest):
    """Default handler — process a query directly."""
    return {
        "status": "processed",
        "query": req.query[:500],
        "result": f"Frontier Core processed: {req.query[:100]}",
    }
