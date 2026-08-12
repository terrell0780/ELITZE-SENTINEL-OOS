# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers import auth, workspaces, compliance, monitoring

app = FastAPI(
    title="Frontier Enterprise — Operating Layer",
    description="SSO, RBAC, Multi-tenancy, Compliance, Monitoring, Kubernetes",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(workspaces.router)
app.include_router(compliance.router)
app.include_router(monitoring.router)


@app.get("/")
async def root():
    return {
        "name": "Frontier Enterprise",
        "version": "1.0.0",
        "modules": ["sso", "rbac", "multi_tenancy", "compliance", "monitoring"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "Frontier-enterprise"}
