# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
from fastapi import APIRouter, HTTPException
from ..core.voice_agent import VoiceAgentCore
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/voice", tags=["Voice"])

voice = VoiceAgentCore()


class PersonaRequest(BaseModel):
    persona_id: str


class VoiceProcessRequest(BaseModel):
    transcript: str


class SimulateRequest(BaseModel):
    text: str


@router.get("/personas")
async def list_personas():
    return {"personas": voice.list_personas()}


@router.post("/persona")
async def set_persona(body: PersonaRequest):
    success = voice.set_persona(body.persona_id)
    if not success:
        raise HTTPException(status_code=404, detail="Persona not found")
    persona = voice.get_persona(body.persona_id)
    return {"status": "active", "persona_id": persona.persona_id, "name": persona.name, "description": persona.description}


@router.post("/process")
async def process_voice(body: VoiceProcessRequest):
    result = await voice.process_voice_input(body.transcript)
    return result


@router.post("/simulate")
async def simulate_mic(body: SimulateRequest):
    result = await voice.process_voice_input(body.text)
    return result
