# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""
Voice Agent System — VoiceAgentCore, personas, VoxMorph FX, WakeWordSystem.
Integrates with Fusion Core for stubbed intelligence responses.
"""

from typing import Any, Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class VoxMorphEffect(str, Enum):
    DEEP = "deep"
    SHARPEN = "sharpen"
    GLOW = "glow"
    DISTORT = "distort"
    NONE = "none"


@dataclass
class VoicePersona:
    persona_id: str
    name: str
    voice_profile: str
    description: str
    vox_morph_effect: VoxMorphEffect = VoxMorphEffect.NONE
    pitch: float = 1.0
    speed: float = 1.0
    emotion: str = "neutral"


VOICE_PERSONAS = [
    VoicePersona(persona_id="persona-oracle", name="Oracle", voice_profile="deep_resonant", description="Wise, measured, authoritative", vox_morph_effect=VoxMorphEffect.DEEP, pitch=0.8, speed=0.9, emotion="calm"),
    VoicePersona(persona_id="persona-lyra", name="Lyra", voice_profile="bright_warm", description="Energetic, friendly, approachable", vox_morph_effect=VoxMorphEffect.GLOW, pitch=1.1, speed=1.05, emotion="cheerful"),
    VoicePersona(persona_id="persona-noir", name="Noir", voice_profile="gravelly_low", description="Mysterious, gritty, detective-like", vox_morph_effect=VoxMorphEffect.DISTORT, pitch=0.7, speed=0.85, emotion="suspicious"),
    VoicePersona(persona_id="persona-echo", name="Echo", voice_profile="crisp_clear", description="Neutral, precise, professional", vox_morph_effect=VoxMorphEffect.SHARPEN, pitch=1.0, speed=1.0, emotion="neutral"),
    VoicePersona(persona_id="persona-titan", name="Titan", voice_profile="booming_large", description="Commanding, powerful, larger-than-life", vox_morph_effect=VoxMorphEffect.DEEP, pitch=0.6, speed=0.8, emotion="authoritative"),
]


class WakeWordSystem:
    """Wake word detection (stubbed for offline operation)."""

    def __init__(self):
        self.wake_words = ["hey sentinal", "elitze", "ok sentinal"]
        self.active = True
        self.last_trigger: Optional[str] = None

    def detect(self, audio_text: str) -> Optional[str]:
        audio_lower = audio_text.lower()
        for ww in self.wake_words:
            if ww in audio_lower:
                self.last_trigger = ww
                return ww
        return None

    def set_wake_words(self, words: List[str]):
        self.wake_words = words

    def toggle(self):
        self.active = not self.active


class VoiceAgentCore:
    """
    Elitze Sentinel Voice Agent Core.
    Manages personas, VoxMorph FX processing, wake word detection,
    and stubbed speech synthesis.
    """

    def __init__(self, fusion_core=None):
        self.name = "Elitze Voice Agent"
        self.fusion_core = fusion_core
        self.personas: Dict[str, VoicePersona] = {p.persona_id: p for p in VOICE_PERSONAS}
        self.current_persona: VoicePersona = self.personas["persona-oracle"]
        self.wake_word = WakeWordSystem()
        self.conversation_history: List[Dict[str, str]] = []
        self._initialized = False

    async def initialize(self):
        self._initialized = True

    def set_persona(self, persona_id: str) -> bool:
        if persona_id in self.personas:
            self.current_persona = self.personas[persona_id]
            return True
        return False

    def apply_vox_morph(self, text: str, effect: Optional[VoxMorphEffect] = None) -> Dict[str, Any]:
        effect = effect or self.current_persona.vox_morph_effect
        effects_map = {
            VoxMorphEffect.DEEP: {"pitch_shift": -3, "resonance": "chest", "eq": "low_pass"},
            VoxMorphEffect.SHARPEN: {"pitch_shift": 1, "resonance": "head", "eq": "high_shelf"},
            VoxMorphEffect.GLOW: {"pitch_shift": 2, "resonance": "mix", "eq": "presence_boost"},
            VoxMorphEffect.DISTORT: {"pitch_shift": -2, "resonance": "throat", "eq": "distortion"},
            VoxMorphEffect.NONE: {"pitch_shift": 0, "resonance": "natural", "eq": "flat"},
        }
        return {
            "original_text": text,
            "effect": effect.value,
            "params": effects_map[effect],
            "persona": self.current_persona.name,
            "processed_length": len(text),
        }

    async def process_voice_input(self, transcript: str) -> Dict[str, Any]:
        ww = self.wake_word.detect(transcript)
        if ww:
            transcript = transcript.replace(ww, "").strip()

        self.conversation_history.append({"role": "user", "content": transcript})

        stubbed_response = f"[{self.current_persona.name}] Received: '{transcript[:80]}...'. Processing through Elitze Sentinel voice pipeline."

        vox = self.apply_vox_morph(stubbed_response)

        result = {
            "wake_word_triggered": ww is not None,
            "wake_word": ww,
            "transcript": transcript,
            "persona": self.current_persona.name,
            "persona_id": self.current_persona.persona_id,
            "vox_morph": vox,
            "response_text": stubbed_response,
            "conversation_turn": len(self.conversation_history),
        }
        self.conversation_history.append({"role": "assistant", "content": stubbed_response})
        return result

    def list_personas(self) -> List[Dict[str, Any]]:
        return [{"persona_id": p.persona_id, "name": p.name, "description": p.description, "effect": p.vox_morph_effect.value} for p in self.personas.values()]

    def get_persona(self, persona_id: str) -> Optional[VoicePersona]:
        return self.personas.get(persona_id)

    def simulate_mic_input(self, text: str) -> Dict[str, Any]:
        """Simulate microphone input for UI testing."""
        import asyncio
        return asyncio.run(self.process_voice_input(text))
