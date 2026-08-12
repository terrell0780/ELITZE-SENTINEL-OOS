# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
Elitze Sentinel — Sovereign AI Platform Backend
FastAPI application with all core modules, routers, and middleware.
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import fusion, autonomy, plugins, agents, voice, workspaces, auth

app = FastAPI(
    title="Elitze Sentinel — Sovereign AI Platform",
    description="Fusion Core • Autonomy Engine • Marketplace • Agent Builder • Voice Agent • Workspaces • SENTINEL Governance",
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

app.include_router(fusion.router)
app.include_router(autonomy.router)
app.include_router(plugins.router)
app.include_router(agents.router)
app.include_router(voice.router)
app.include_router(workspaces.router)
app.include_router(auth.router)


@app.get("/")
async def root():
    return {
        "name": "Elitze Sentinel",
        "version": "1.0.0",
        "status": "operational",
        "modules": ["fusion", "autonomy", "marketplace", "agents", "voice", "workspaces", "auth"],
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "component": "elitze-sentinal", "version": "1.0.0"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
