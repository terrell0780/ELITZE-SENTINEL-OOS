# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
# Frontier-core/src/workbench.py
"""
Frontier Core Workbench - API Playground & Analytics Dashboard

Enhanced with:
- Multi-model testing (Frontier 5, Sonnet 5, Opus 4.8, Haiku 4.5)
- Real-time token usage & cost tracking
- Story Mode for creative writing
- Raw API request/response viewer
- Code export (Python, TypeScript, cURL)
- Tool use testing
- Structured output schemas
- Session history & analytics
- Streaming support

Based on usage analytics:
- Sessions, lines of code, commits, PRs
- Tool acceptance rates
- Cost breakdown by model
- User activity tracking
"""

import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from .core.gateway import (
    FrontierGateway, GatewayConfig, StoryRequest,
    StoryGenre, StoryTone, StoryPOV, MODEL_SPECS, PRICING,
    SUPPORTED_FEATURES, BETA_HEADERS,
)
from .core.firewall import TerrellHallGuardrails, GuardrailsConfig


router = APIRouter(prefix="/api/v1/workbench", tags=["workbench"])

gateway = FrontierGateway(GatewayConfig())
firewall = TerrellHallGuardrails(GuardrailsConfig())

sessions: Dict[str, Dict[str, Any]] = {}


# ============================================================================
# REQUEST MODELS
# ============================================================================

class CompletionRequest(BaseModel):
    model: str = Field(default="claude-Frontier-5", description="Model ID")
    prompt: str = Field(..., description="User prompt")
    system: Optional[str] = Field(default=None, description="System prompt")
    max_tokens: int = Field(default=4096, ge=1, le=128000)
    temperature: float = Field(default=1.0, ge=0.0, le=2.0)
    effort: Optional[str] = Field(default="high", description="low, medium, high, xhigh")
    stream: bool = Field(default=False)
    tools: Optional[List[Dict[str, Any]]] = Field(default=None)
    fallbacks: Optional[List[Dict[str, str]]] = Field(default=None)


class StoryRequestModel(BaseModel):
    title: Optional[str] = None
    prompt: str
    genre: str = "fantasy"
    tone: str = "serious"
    pov: str = "third_person_limited"
    characters: Optional[List[Dict[str, str]]] = None
    setting: Optional[str] = None
    plot_outline: Optional[str] = None
    max_chapters: int = Field(default=5, ge=1, le=50)
    words_per_chapter: int = Field(default=2000, ge=500, le=10000)
    model: str = "claude-Frontier-5"
    effort: str = "high"
    character_depth: str = "high"
    world_building: str = "detailed"
    plot_complexity: str = "multi_arc"
    custom_style_notes: Optional[str] = None
    cliffhangers: bool = True
    foreshadowing: bool = True
    include_dialogue: bool = True


class ToolDefinition(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]


class StructuredOutputRequest(BaseModel):
    model: str = "claude-Frontier-5"
    prompt: str
    output_schema: Dict[str, Any]
    max_tokens: int = 4096


# ============================================================================
# WORKSPACE INFO
# ============================================================================

@router.get("/")
async def workbench_info():
    return {
        "name": "Frontier Core Workbench",
        "version": "1.0.0",
        "description": "API Playground & Analytics - Test models, track usage, export code",
        "models": {k.value: v for k, v in MODEL_SPECS.items()},
        "pricing": {k.value: v for k, v in PRICING.items()},
        "features": SUPPORTED_FEATURES,
        "beta_headers": BETA_HEADERS,
        "story_modes": {
            "genres": [g.value for g in StoryGenre],
            "tones": [t.value for t in StoryTone],
            "povs": [p.value for p in StoryPOV],
        },
    }


# ============================================================================
# COMPLETION ENDPOINT
# ============================================================================

@router.post("/completions")
async def create_completion(request: CompletionRequest):
    session_id = str(uuid.uuid4())

    if request.model not in MODEL_SPECS:
        raise HTTPException(status_code=400, detail=f"Invalid model: {request.model}")

    messages = [{"role": "user", "content": request.prompt}]

    result = await gateway.process_request(
        query=request.prompt,
        model=request.model,
        system_prompt=request.system,
        max_tokens=request.max_tokens,
        effort=request.effort,
        temperature=request.temperature,
        messages=messages,
        fallbacks=request.fallbacks,
    )

    usage = result.get("usage", {})
    input_tokens = usage.get("input_tokens", 0)
    output_tokens = usage.get("output_tokens", 0)
    cost = gateway.calculate_cost(request.model, input_tokens, output_tokens)

    await firewall.log_orchestration(
        session_id=session_id,
        action="completion",
        path="/completions",
        tool="workbench",
        user_request=request.prompt[:500],
        tokens_used=input_tokens + output_tokens,
        cost_usd=cost,
        model=result.get("model", request.model),
        latency_ms=result.get("response_time_ms", 0),
    )

    return {
        "id": result.get("id"),
        "model": result.get("model", request.model),
        "requested_model": request.model,
        "content": result.get("content", []),
        "stop_reason": result.get("stop_reason"),
        "stop_details": result.get("stop_details"),
        "usage": {
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "total_tokens": input_tokens + output_tokens,
            "cache_read": usage.get("cache_read_input_tokens", 0),
            "cache_creation": usage.get("cache_creation_input_tokens", 0),
        },
        "cost_usd": round(cost, 6),
        "is_fallback": result.get("is_fallback", False),
        "fallback_from": result.get("fallback_from"),
        "latency_ms": result.get("response_time_ms", 0),
        "session_id": session_id,
    }


# ============================================================================
# STREAMING ENDPOINT
# ============================================================================

@router.post("/completions/stream")
async def create_streaming_completion(request: CompletionRequest):
    if not request.stream:
        return await create_completion(request)

    async def event_generator():
        async for event in gateway.process_stream(
            query=request.prompt,
            model=request.model,
            system_prompt=request.system,
            max_tokens=request.max_tokens,
            effort=request.effort,
        ):
            yield f"data: {json.dumps(event, default=str)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ============================================================================
# STORY MODE
# ============================================================================

@router.post("/story")
async def generate_story(request: StoryRequestModel):
    try:
        genre = StoryGenre(request.genre)
        tone = StoryTone(request.tone)
        pov = StoryPOV(request.pov)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    story_request = StoryRequest(
        prompt=request.prompt,
        title=request.title,
        genre=genre,
        tone=tone,
        pov=pov,
        characters=request.characters,
        setting=request.setting,
        plot_outline=request.plot_outline,
        max_chapters=request.max_chapters,
        words_per_chapter=request.words_per_chapter,
        model=request.model,
        effort=request.effort,
        character_depth=request.character_depth,
        world_building=request.world_building,
        plot_complexity=request.plot_complexity,
        custom_style_notes=request.custom_style_notes,
        cliffhangers=request.cliffhangers,
        foreshadowing=request.foreshadowing,
        include_dialogue=request.include_dialogue,
    )

    result = await gateway.generate_story(story_request)
    return result


# ============================================================================
# MODEL INFO
# ============================================================================

@router.get("/models")
async def list_models():
    return {
        "models": gateway.get_all_model_specs(),
        "pricing": {k.value: v for k, v in PRICING.items()},
        "introductory_pricing": gateway.get_introductory_pricing(),
        "features": SUPPORTED_FEATURES,
        "beta_headers": BETA_HEADERS,
    }


@router.get("/models/{model_id}")
async def get_model(model_id: str):
    specs = gateway.get_model_specs(model_id)
    if not specs:
        raise HTTPException(status_code=404, detail=f"Model not found: {model_id}")

    pricing = PRICING.get(model_id, {})
    return {"model_id": model_id, "specs": specs, "pricing": pricing}


# ============================================================================
# TOOL USE TESTING
# ============================================================================

@router.post("/tools/test")
async def test_tool_use(
    prompt: str,
    tools: List[ToolDefinition],
    model: str = "claude-Frontier-5",
    max_tokens: int = 4096,
):
    tool_dicts = [
        {
            "name": t.name,
            "description": t.description,
            "input_schema": t.input_schema,
        }
        for t in tools
    ]

    result = await gateway.process_request(
        query=prompt,
        model=model,
        max_tokens=max_tokens,
        tools=tool_dicts,
    )

    return {
        "model": result.get("model"),
        "content": result.get("content", []),
        "stop_reason": result.get("stop_reason"),
        "usage": result.get("usage"),
        "tool_calls": [
            block for block in result.get("content", [])
            if block.get("type") == "tool_use"
        ],
    }


# ============================================================================
# STRUCTURED OUTPUTS
# ============================================================================

@router.post("/structured")
async def structured_output(request: StructuredOutputRequest):
    system_prompt = (
        "You must respond with valid JSON that matches the provided schema. "
        "Do not include any text outside the JSON object."
    )

    full_prompt = (
        f"{request.prompt}\n\n"
        f"Response must match this JSON schema:\n{json.dumps(request.output_schema, indent=2)}"
    )

    result = await gateway.process_request(
        query=full_prompt,
        model=request.model,
        system_prompt=system_prompt,
        max_tokens=request.max_tokens,
    )

    content = result.get("content", [])
    text = ""
    for block in content:
        if block.get("type") == "text":
            text += block["text"]

    try:
        parsed = json.loads(text)
        valid = True
    except json.JSONDecodeError:
        parsed = None
        valid = False

    return {
        "model": result.get("model"),
        "raw_output": text,
        "parsed": parsed,
        "valid_json": valid,
        "usage": result.get("usage"),
    }


# ============================================================================
# CODE EXPORT
# ============================================================================

@router.post("/export/python")
async def export_python(request: CompletionRequest):
    model = request.model
    prompt = request.prompt.replace("\\", "\\\\").replace('"', '\\"')
    system = f', system="{request.system}"' if request.system else ""
    max_tokens = request.max_tokens
    effort = f', effort="{request.effort}"' if request.effort else ""

    code = f'''from anthropic import Anthropic

client = Anthropic()

response = client.messages.create(
    model="{model}",
    max_tokens={max_tokens},{effort}{system}
    messages=[
        {{"role": "user", "content": "{prompt}"}}
    ],
)

print(response.content[0].text)
print(f"\\nTokens: {{response.usage.input_tokens}} in / {{response.usage.output_tokens}} out")
'''
    return {"language": "python", "code": code}


@router.post("/export/typescript")
async def export_typescript(request: CompletionRequest):
    model = request.model
    prompt = request.prompt.replace("\\", "\\\\").replace('"', '\\"')
    system = f'\n    system: "{request.system}",' if request.system else ""
    max_tokens = request.max_tokens

    code = f'''import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const response = await client.messages.create({{
  model: "{model}",
  max_tokens: {max_tokens},{system}
  messages: [
    {{ role: "user", content: "{prompt}" }},
  ],
}});

console.log(response.content[0].text);
console.log(`\\nTokens: ${{response.usage.input_tokens}} in / ${{response.usage.output_tokens}} out`);
'''
    return {"language": "typescript", "code": code}


@router.post("/export/curl")
async def export_curl(request: CompletionRequest):
    model = request.model
    messages = json.dumps([{"role": "user", "content": request.prompt}])

    cmd = f'''curl --fail-with-body -sS https://api.anthropic.com/v1/messages \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{{
    "model": "{model}",
    "max_tokens": {request.max_tokens},
    "messages": {messages}
  }}' | jq'''
    return {"language": "bash", "code": cmd}


# ============================================================================
# ANALYTICS & STATS
# ============================================================================

@router.get("/analytics")
async def get_analytics():
    gw_metrics = gateway.get_metrics()
    fw_stats = firewall.get_stats()

    return {
        "gateway": gw_metrics,
        "firewall": fw_stats,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/analytics/cost")
async def get_cost_analytics():
    metrics = gateway.get_metrics()
    return {
        "total_cost_usd": round(metrics.get("total_cost_usd", 0), 4),
        "total_input_tokens": metrics.get("total_input_tokens", 0),
        "total_output_tokens": metrics.get("total_output_tokens", 0),
        "total_requests": metrics.get("total_requests", 0),
        "avg_latency_ms": round(metrics.get("avg_latency_ms", 0), 2),
        "cost_by_model": _calculate_cost_by_model(metrics),
    }


def _calculate_cost_by_model(metrics: Dict) -> Dict[str, float]:
    cost_by_model = {}
    for entry in metrics.get("request_history", []):
        model = entry.get("model", "unknown")
        if model not in cost_by_model:
            cost_by_model[model] = 0.0
        cost_by_model[model] += entry.get("cost_usd", 0)
    return {k: round(v, 4) for k, v in cost_by_model.items()}


# ============================================================================
# SESSION MANAGEMENT
# ============================================================================

@router.get("/sessions")
async def list_sessions():
    return {"sessions": list(sessions.keys()), "count": len(sessions)}


@router.post("/sessions")
async def create_session():
    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "id": session_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "messages": [],
        "total_tokens": 0,
        "total_cost": 0.0,
    }
    return {"session_id": session_id}


@router.post("/sessions/{session_id}/messages")
async def add_message(session_id: str, request: CompletionRequest):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    session = sessions[session_id]
    session["messages"].append({"role": "user", "content": request.prompt})

    all_messages = session["messages"].copy()

    result = await gateway.process_request(
        query=request.prompt,
        model=request.model,
        system_prompt=request.system,
        max_tokens=request.max_tokens,
        messages=all_messages,
    )

    assistant_content = ""
    for block in result.get("content", []):
        if block.get("type") == "text":
            assistant_content += block["text"]

    session["messages"].append({"role": "assistant", "content": assistant_content})

    usage = result.get("usage", {})
    tokens = usage.get("input_tokens", 0) + usage.get("output_tokens", 0)
    cost = gateway.calculate_cost(request.model, usage.get("input_tokens", 0), usage.get("output_tokens", 0))

    session["total_tokens"] += tokens
    session["total_cost"] += cost

    return {
        "session_id": session_id,
        "model": result.get("model"),
        "content": result.get("content", []),
        "usage": usage,
        "cost_usd": cost,
        "total_session_tokens": session["total_tokens"],
        "total_session_cost": session["total_cost"],
        "message_count": len(session["messages"]),
    }


# ============================================================================
# GUARDRAILS
# ============================================================================

@router.post("/evaluate")
async def evaluate_request(prompt: str, session_id: Optional[str] = None):
    sid = session_id or str(uuid.uuid4())
    action, details = await firewall.evaluate_request(sid, prompt)
    return {
        "action": action.value,
        "details": details,
        "session_id": sid,
    }


@router.get("/guardrails/stats")
async def guardrails_stats():
    return firewall.get_stats()


@router.get("/guardrails/chain")
async def verify_chain():
    valid, message = firewall.verify_chain_integrity()
    return {"valid": valid, "message": message}


@router.get("/guardrails/export")
async def export_audit(format: str = "json"):
    try:
        data = firewall.export_audit_log(format)
        return {"format": format, "data": data}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
