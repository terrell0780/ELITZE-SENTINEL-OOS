# Gaming Compiler — FastAPI HTTP Gateway
# Wraps ElitzeWorldOSCompiler in REST for Gateway routing (port 8771)
# gRPC server still runs on 8775 for internal engine communication

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from compiler_core import ElitzeWorldOSCompiler, ElitzeWorldSpecification
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

app = FastAPI(title="Frontier Gaming Compiler REST", version="4.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

compiler = ElitzeWorldOSCompiler()

# ─── Request Models ───────────────────────────────────────────

class CompileRequest(BaseModel):
    prompt: str
    world_scale: str = "Medium_4KM"
    security_difficulty: str = "Standard"
    enable_cybernetic_networks: bool = True
    enable_single_companion_ai: bool = True

class ValidateRequest(BaseModel):
    prompt: str

# ─── Routes ──────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "version": compiler.compiler_version}

@app.get("/v1/engine_targets")
def engine_targets():
    return {
        "targets": [
            {"target": "UNREAL_5_5", "display_name": "Unreal Engine 5.5", "version": "5.5", "supports_cpp": True, "supports_csharp": False},
            {"target": "UNREAL_5_6", "display_name": "Unreal Engine 5.6", "version": "5.6", "supports_cpp": True, "supports_csharp": False},
            {"target": "UNREAL_5_8_EXPERIMENTAL", "display_name": "Unreal Engine 5.8 (Experimental)", "version": "5.8", "supports_cpp": True, "supports_csharp": False},
            {"target": "UNITY_6_LTS", "display_name": "Unity 6 LTS", "version": "6", "supports_cpp": False, "supports_csharp": True},
            {"target": "UNITY_RUNTIME_CORE", "display_name": "Unity Runtime Core", "version": "1.0", "supports_cpp": False, "supports_csharp": True},
        ]
    }

@app.post("/v1/compile")
def compile_world(req: CompileRequest):
    try:
        config = ElitzeWorldSpecification(
            prompt=req.prompt,
            world_scale=req.world_scale,
            security_difficulty=req.security_difficulty,
            enable_cybernetic_networks=req.enable_cybernetic_networks,
            enable_single_companion_ai=req.enable_single_companion_ai,
        )
        result = compiler.compile_world(config)
        
        bp = result["blueprint"]
        return {
            "status": result["status"],
            "provenance_hash": result["provenance_hash"],
            "blueprint_id": bp["blueprint_id"],
            "seed": bp["seed"],
            "scale_meters": bp["scale_meters"],
            "geological_layer": bp["geological_layer"],
            "cyber_infrastructure": bp["cyber_infrastructure"],
            "ai_companion_profile": bp["ai_companion_profile"],
            "geospatial_layer": bp["geospatial_layer"],
            "engine_bindings": bp["target_engine_bindings"],
            "mythos_validation": bp["mythos_validation"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/v1/validate")
def validate_prompt(req: ValidateRequest):
    config = ElitzeWorldSpecification(prompt=req.prompt)
    return {"valid": True, "sanitized_prompt": config.prompt, "warnings": []}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8771)
