# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
API Gateway — Unified /v1 API for identity, governance, operations, intelligence, knowledge, marketplace, pipeline.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Frontier API Gateway",
    description="Unified /v1 API — Identity, Governance, Operations, Intelligence, Knowledge, Marketplace, Pipeline",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "name": "Frontier API Gateway",
        "version": "1.0.0",
        "domains": ["identity", "governance", "operations", "intelligence", "knowledge", "marketplace", "pipeline"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "component": "api-gateway", "version": "1.0.0"}
