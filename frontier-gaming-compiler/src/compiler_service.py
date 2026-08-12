# Gaming Compiler gRPC Service
# Wraps ElitzeWorldOSCompiler as a gRPC service for Gateway routing

import asyncio
import hashlib
import json
import re
import uuid
from concurrent import futures
from typing import Dict, List, Optional

import grpc
from grpc_health.v1 import health_pb2, health_pb2_grpc

# ─── OpenTelemetry ────────────────────────────────────────────
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.grpc import GrpcInstrumentorClient, GrpcInstrumentorServer
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.resources import Resource, SERVICE_NAME
from prometheus_client import start_http_server

# Initialize tracing
trace_provider = TracerProvider(resource=Resource.create({SERVICE_NAME: "frontier-gaming-compiler"}))
trace_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint="jaeger:4317", insecure=True)))
trace.set_tracer_provider(trace_provider)

# Initialize metrics
metric_reader = PrometheusMetricReader()
meter_provider = MeterProvider(metric_readers=[metric_reader], resource=Resource.create({SERVICE_NAME: "frontier-gaming-compiler"}))
start_http_server(port=9466, addr="0.0.0.0")

# Auto-instrument gRPC
GrpcInstrumentorServer().instrument()
GrpcInstrumentorClient().instrument()

# ─── Compiler Core ──────────────────────────────────
from compiler_core import ElitzeWorldSpecification, ElitzeWorldOSCompiler

tracer = trace.get_tracer(__name__)

# ─── gRPC Service Implementation ─────────────────────────────
class GamingCompilerServicer:
    def __init__(self):
        self.compiler = ElitzeWorldOSCompiler()
        self.engine_targets = {
            "UNREAL_5_5": {"name": "Unreal Engine 5.5", "cpp": True, "csharp": False},
            "UNREAL_5_6": {"name": "Unreal Engine 5.6", "cpp": True, "csharp": False},
            "UNREAL_5_8_EXPERIMENTAL": {"name": "Unreal Engine 5.8 (Experimental)", "cpp": True, "csharp": False},
            "UNITY_6_LTS": {"name": "Unity 6 LTS", "cpp": False, "csharp": True},
            "UNITY_RUNTIME_CORE": {"name": "Unity Runtime Core", "cpp": False, "csharp": True},
        }

    def CompileWorld(self, request, context):
        config = ElitzeWorldSpecification(
            prompt=request.prompt,
            world_scale=request.world_scale.name.replace("WORLD_SCALE_", "") if request.world_scale else "Medium_4KM",
            security_difficulty=request.security_difficulty.name.replace("SECURITY_DIFFICULTY_", "") if request.security_difficulty else "Standard",
            enable_cybernetic_networks=request.enable_cybernetic_networks,
            enable_single_companion_ai=request.enable_single_companion_ai,
        )
        result = self.compiler.compile_world(config)
        bp = result["blueprint"]
        
        # Convert to protobuf response (using dict for now, will use generated classes)
        return {
            "blueprint_id": bp["blueprint_id"],
            "seed": bp["seed"],
            "scale_meters": bp["scale_meters"],
            "provenance_hash": result["provenance_hash"],
            "engine_bindings": bp["target_engine_bindings"],
            "mythos_validation": bp["mythos_validation"],
            "status": result["status"],
            "error_message": "",
        }

    def ValidatePrompt(self, request, context):
        config = ElitzeWorldSpecification(prompt=request.prompt)
        return {
            "valid": True,
            "sanitized_prompt": config.prompt,
            "warnings": [],
        }

    def GetEngineTargets(self, request, context):
        targets = []
        for key, info in self.engine_targets.items():
            targets.append({
                "target": key,
                "display_name": info["name"],
                "version": key.split("_")[-1],
                "supports_cpp": info["cpp"],
                "supports_csharp": info["csharp"],
            })
        return {"targets": targets}

    def CompileWorldStream(self, request, context):
        # For streaming, yield progress updates
        stages = [
            ("Parsing prompt", 10),
            ("Generating geological layer", 30),
            ("Generating cyber infrastructure", 50),
            ("Generating companion profile", 70),
            ("Compiling engine bindings", 90),
            ("Validating mythos", 100),
        ]
        for stage, pct in stages:
            yield {
                "stage": stage,
                "progress_percent": pct,
                "message": f"Compiling: {stage}",
                "done": pct == 100,
            }
        # Final result
        result = self.CompileWorld(request, context)
        yield {
            "stage": "Complete",
            "progress_percent": 100,
            "message": "Compilation successful",
            "partial_bindings": result.get("engine_bindings", {}),
            "done": True,
        }


# ─── Server Entry Point ──────────────────────────────────────
async def serve():
    server = grpc.aio.server()
    # health_pb2_grpc.add_HealthServicer_to_server(health_pb2_grpc.HealthServicer(), server)
    # gaming_compiler_pb2_grpc.add_GamingCompilerServicer_to_server(GamingCompilerServicer(), server)
    
    port = 8775
    server.add_insecure_port(f"[::]:{port}")
    await server.start()
    print(f"Gaming Compiler gRPC server listening on {port}")
    await server.wait_for_termination()


if __name__ == "__main__":
    asyncio.run(serve())