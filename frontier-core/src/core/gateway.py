# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
# Frontier-core/src/core/gateway.py
"""
FrontierGateway — Multi-Model AI Gateway

Production-grade gateway with:
- Full Anthropic SDK integration
- Streaming support (SSE)
- Server-side fallback with beta header
- Real-time cost tracking
- Story Mode for creative storytelling
- Request/response middleware hooks
- Automatic retry with exponential backoff

Technical model specifications:
  Frontier 5:   $10/$50 MTok  | 1M ctx | 128k out | Adaptive only | No extended | Slower  | Jan 2026 cutoff
  Sonnet 5:  $3/$15 MTok   | 1M ctx | 128k out | Adaptive only | No extended | Fast    | Jan 2026 cutoff
  Opus 4.8:  $5/$25 MTok   | 1M ctx | 128k out | Adaptive only | No extended | Moderate| Jan 2026 cutoff
  Haiku 4.5: $1/$5 MTok    | 200k   | 64k out  | No adaptive   | Yes extended| Fastest | Feb 2025 cutoff
"""

import asyncio
import logging
import os
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, AsyncIterator, Callable, Dict, List, Optional

logger = logging.getLogger("Frontier-core.gateway")


# ============================================================================
# MODEL SPECIFICATIONS
# ============================================================================

class ModelID(str, Enum):
    CLAUDE_FABLE_5 = "claude-Frontier-5"
    CLAUDE_MYTHOS_5 = "claude-mythos-5"
    CLAUDE_SONNET_5 = "claude-sonnet-5"
    CLAUDE_OPUS_4_8 = "claude-opus-4-8"
    CLAUDE_HAIKU_4_5 = "claude-haiku-4-5-20251001"
    # Free / Open-Source Models
    LLAMA_4 = "llama-4"
    MISTRAL_LARGE = "mistral-large"
    DEEPSEEK_V3 = "deepseek-v3"
    DEEPSEEK_R1 = "deepseek-r1"
    QWEN_2_5 = "qwen-2-5"
    GEMMA_3 = "gemma-3"
    PHI_4 = "phi-4"


PRICING = {
    ModelID.CLAUDE_FABLE_5:  {"input": 10.0, "output": 50.0},
    ModelID.CLAUDE_MYTHOS_5: {"input": 10.0, "output": 50.0},
    ModelID.CLAUDE_SONNET_5: {"input": 3.0,  "output": 15.0},   # $2/$10 introductory through Aug 31 2026
    ModelID.CLAUDE_OPUS_4_8: {"input": 5.0,  "output": 25.0},
    ModelID.CLAUDE_HAIKU_4_5:{"input": 1.0,  "output": 5.0},
    # Free / Open-Source — self-hosted, no API cost
    ModelID.LLAMA_4:         {"input": 0.0, "output": 0.0, "provider": "meta", "license": "llama-4-community"},
    ModelID.MISTRAL_LARGE:   {"input": 0.0, "output": 0.0, "provider": "mistral", "license": "apache-2.0"},
    ModelID.DEEPSEEK_V3:     {"input": 0.0, "output": 0.0, "provider": "deepseek", "license": "deepseek-license"},
    ModelID.DEEPSEEK_R1:     {"input": 0.0, "output": 0.0, "provider": "deepseek", "license": "deepseek-license"},
    ModelID.QWEN_2_5:        {"input": 0.0, "output": 0.0, "provider": "alibaba", "license": "apache-2.0"},
    ModelID.GEMMA_3:         {"input": 0.0, "output": 0.0, "provider": "google", "license": "gemma-license"},
    ModelID.PHI_4:           {"input": 0.0, "output": 0.0, "provider": "microsoft", "license": "mit"},
}

# Introductory pricing for Sonnet 5 (through Aug 31 2026)
INTRODUCTORY_PRICING = {
    ModelID.CLAUDE_SONNET_5: {"input": 2.0, "output": 10.0, "expires": "2026-08-31"},
}

MODEL_SPECS = {
    ModelID.CLAUDE_FABLE_5: {
        "description": "Next-generation intelligence for long-running agents",
        "context_window": 1_000_000,
        "max_output": 128_000,
        "extended_thinking": False,
        "adaptive_thinking": True,
        "comparative_latency": "slower",
        "knowledge_cutoff": "2026-01",
        "training_cutoff": "2026-01",
        "modalities": ["text", "image"],
        "text_output": True,
        "vision": True,
        "multilingual": True,
        "safety_classifiers": True,
        "data_retention_days": 30,
        "bedrock_id": "anthropic.claude-Frontier-53",
        "vertex_id": "claude-Frontier-5",
    },
    ModelID.CLAUDE_MYTHOS_5: {
        "description": "Same as Frontier 5 without safety classifiers (Project Glasswing)",
        "context_window": 1_000_000,
        "max_output": 128_000,
        "extended_thinking": False,
        "adaptive_thinking": True,
        "comparative_latency": "slower",
        "knowledge_cutoff": "2026-01",
        "training_cutoff": "2026-01",
        "modalities": ["text", "image"],
        "text_output": True,
        "vision": True,
        "multilingual": True,
        "safety_classifiers": False,
        "availability": "limited",
        "data_retention_days": 30,
    },
    ModelID.CLAUDE_SONNET_5: {
        "description": "The best combination of speed and intelligence",
        "context_window": 1_000_000,
        "max_output": 128_000,
        "extended_thinking": False,
        "adaptive_thinking": True,
        "comparative_latency": "fast",
        "knowledge_cutoff": "2026-01",
        "training_cutoff": "2026-01",
        "modalities": ["text", "image"],
        "text_output": True,
        "vision": True,
        "multilingual": True,
        "safety_classifiers": False,
        "bedrock_id": "anthropic.claude-sonnet-53",
        "vertex_id": "claude-sonnet-5",
    },
    ModelID.CLAUDE_OPUS_4_8: {
        "description": "For complex agentic coding and enterprise work",
        "context_window": 1_000_000,
        "max_output": 128_000,
        "extended_thinking": False,
        "adaptive_thinking": True,
        "comparative_latency": "moderate",
        "knowledge_cutoff": "2026-01",
        "training_cutoff": "2026-01",
        "modalities": ["text", "image"],
        "text_output": True,
        "vision": True,
        "multilingual": True,
        "safety_classifiers": False,
        "bedrock_id": "anthropic.claude-opus-4-83",
        "vertex_id": "claude-opus-4-8",
    },
    ModelID.CLAUDE_HAIKU_4_5: {
        "description": "The fastest model with near-frontier intelligence",
        "context_window": 200_000,
        "max_output": 64_000,
        "extended_thinking": True,
        "adaptive_thinking": False,
        "comparative_latency": "fastest",
        "knowledge_cutoff": "2025-02",
        "training_cutoff": "2025-07",
        "modalities": ["text", "image"],
        "text_output": True,
        "vision": True,
        "multilingual": True,
        "safety_classifiers": False,
        "bedrock_id": "anthropic.claude-haiku-4-5-20251001-v1:0",
        "vertex_id": "claude-haiku-4-5@20251001",
    },
    # Free / Open-Source Models
    ModelID.LLAMA_4: {
        "description": "Meta Llama 4 — open-weight frontier model",
        "context_window": 128_000,
        "max_output": 128_000,
        "extended_thinking": False,
        "adaptive_thinking": True,
        "comparative_latency": "fast",
        "knowledge_cutoff": "2025-12",
        "training_cutoff": "2025-12",
        "modalities": ["text", "image"],
        "text_output": True,
        "vision": True,
        "multilingual": True,
        "safety_classifiers": False,
        "open_source": True,
        "provider": "meta",
    },
    ModelID.MISTRAL_LARGE: {
        "description": "Mistral Large — open-weight reasoning model",
        "context_window": 128_000,
        "max_output": 128_000,
        "extended_thinking": False,
        "adaptive_thinking": True,
        "comparative_latency": "fast",
        "knowledge_cutoff": "2025-11",
        "training_cutoff": "2025-11",
        "modalities": ["text"],
        "text_output": True,
        "vision": False,
        "multilingual": True,
        "safety_classifiers": False,
        "open_source": True,
        "provider": "mistral",
    },
    ModelID.DEEPSEEK_V3: {
        "description": "DeepSeek V3 — Mixture-of-experts reasoning model",
        "context_window": 128_000,
        "max_output": 128_000,
        "extended_thinking": False,
        "adaptive_thinking": True,
        "comparative_latency": "fast",
        "knowledge_cutoff": "2025-10",
        "training_cutoff": "2025-10",
        "modalities": ["text"],
        "text_output": True,
        "vision": False,
        "multilingual": True,
        "safety_classifiers": False,
        "open_source": True,
        "provider": "deepseek",
    },
    ModelID.DEEPSEEK_R1: {
        "description": "DeepSeek R1 — open reasoning model with chain-of-thought",
        "context_window": 128_000,
        "max_output": 128_000,
        "extended_thinking": True,
        "adaptive_thinking": False,
        "comparative_latency": "moderate",
        "knowledge_cutoff": "2025-06",
        "training_cutoff": "2025-06",
        "modalities": ["text"],
        "text_output": True,
        "vision": False,
        "multilingual": True,
        "safety_classifiers": False,
        "open_source": True,
        "provider": "deepseek",
    },
    ModelID.QWEN_2_5: {
        "description": "Qwen 2.5 (72B) — Alibaba's open-weight general model",
        "context_window": 128_000,
        "max_output": 128_000,
        "extended_thinking": False,
        "adaptive_thinking": True,
        "comparative_latency": "fast",
        "knowledge_cutoff": "2025-09",
        "training_cutoff": "2025-09",
        "modalities": ["text", "image"],
        "text_output": True,
        "vision": True,
        "multilingual": True,
        "safety_classifiers": False,
        "open_source": True,
        "provider": "alibaba",
    },
    ModelID.GEMMA_3: {
        "description": "Gemma 3 (27B) — Google's open lightweight model",
        "context_window": 128_000,
        "max_output": 128_000,
        "extended_thinking": False,
        "adaptive_thinking": True,
        "comparative_latency": "fastest",
        "knowledge_cutoff": "2025-08",
        "training_cutoff": "2025-08",
        "modalities": ["text", "image"],
        "text_output": True,
        "vision": True,
        "multilingual": True,
        "safety_classifiers": False,
        "open_source": True,
        "provider": "google",
    },
    ModelID.PHI_4: {
        "description": "Phi-4 (14B) — Microsoft's compact reasoning model",
        "context_window": 128_000,
        "max_output": 64_000,
        "extended_thinking": False,
        "adaptive_thinking": True,
        "comparative_latency": "fastest",
        "knowledge_cutoff": "2025-07",
        "training_cutoff": "2025-07",
        "modalities": ["text"],
        "text_output": True,
        "vision": False,
        "multilingual": True,
        "safety_classifiers": False,
        "open_source": True,
        "provider": "microsoft",
    },
}

SUPPORTED_FEATURES = [
    "effort",
    "task_budgets",           # beta: task-budgets-2026-03-13
    "memory_tool",
    "code_execution",
    "programmatic_tool_calling",
    "context_editing",        # beta: context-management-2025-06-27
    "compaction",
    "vision",
]

BETA_HEADERS = {
    "server_side_fallback": "server-side-fallback-2026-06-01",
    "task_budgets": "task-budgets-2026-03-13",
    "context_editing": "context-management-2025-06-27",
    "output_300k": "output-300k-2026-03-24",
}

ALLOWED_FALLBACK_MODELS = [
    ModelID.CLAUDE_OPUS_4_8,
    "claude-opus-4-7",
    ModelID.CLAUDE_SONNET_5,
    ModelID.LLAMA_4,
    ModelID.MISTRAL_LARGE,
    ModelID.DEEPSEEK_V3,
    ModelID.DEEPSEEK_R1,
    ModelID.QWEN_2_5,
    ModelID.GEMMA_3,
    ModelID.PHI_4,
]


# ============================================================================
# STORY MODE - Creative storytelling engine
# ============================================================================

class StoryGenre(str, Enum):
    FANTASY = "fantasy"
    SCIFI = "scifi"
    MYSTERY = "mystery"
    HORROR = "horror"
    ROMANCE = "romance"
    THRILLER = "thriller"
    HISTORICAL = "historical"
    CYBERPUNK = "cyberpunk"
    FAIRY_TALE = "fairy_tale"
    ADVENTURE = "adventure"
    DRAMA = "drama"
    COMEDY = "comedy"
    POST_APOCALYPTIC = "post_apocalyptic"
    NOIR = "noir"
    EPIC = "epic"


class StoryTone(str, Enum):
    DARK = "dark"
    LIGHTEARTED = "lighthearted"
    SUSPENSEFUL = "suspenseful"
    EMOTIONAL = "emotional"
    HUMOROUS = "humorous"
    SERIOUS = "serious"
    WHIMSICAL = "whimsical"
    GRITTY = "gritty"
    HOPEFUL = "hopeful"
    MELANCHOLIC = "melancholic"


class StoryPOV(str, Enum):
    FIRST_PERSON = "first_person"
    SECOND_PERSON = "second_person"
    THIRD_PERSON_LIMITED = "third_person_limited"
    THIRD_PERSON_OMNISCIENT = "third_person_omniscient"
    UNRELIABLE_NARRATOR = "unreliable_narrator"


@dataclass
class StoryConfig:
    genre: StoryGenre = StoryGenre.FANTASY
    tone: StoryTone = StoryTone.SERIOUS
    pov: StoryPOV = StoryPOV.THIRD_PERSON_LIMITED
    max_chapters: int = 10
    words_per_chapter: int = 2000
    include_dialogue: bool = True
    character_depth: str = "high"
    world_building: str = "detailed"
    plot_complexity: str = "multi_arc"
    cliffhangers: bool = True
    foreshadowing: bool = True
    custom_style_notes: str = ""


STORY_SYSTEM_PROMPTS = {
    StoryGenre.FANTASY: "You are a masterful fantasy author. Write rich, immersive fantasy narratives with deep world-building, magic systems, complex characters, and epic story arcs. Use vivid sensory details and create compelling conflicts between good and evil, or explore moral grey areas.",
    StoryGenre.SCIFI: "You are a visionary science fiction author. Write thought-provoking sci-fi narratives exploring technology, space, AI, and the human condition. Ground your fiction in plausible science while pushing creative boundaries.",
    StoryGenre.MYSTERY: "You are a brilliant mystery author. Write gripping mystery narratives with clever clues, red herrings, and satisfying reveals. Plant evidence fairly and build tension through pacing and misdirection.",
    StoryGenre.HORROR: "You are a master of horror fiction. Write terrifying narratives that build dread through atmosphere, suggestion, and psychological terror. Less is more - let the reader's imagination fill in the darkness.",
    StoryGenre.ROMANCE: "You are a gifted romance author. Write emotionally resonant romance narratives with authentic chemistry, vulnerability, and character growth. Explore love in all its complexity.",
    StoryGenre.THRILLER: "You are a gripping thriller author. Write fast-paced thrillers with escalating stakes, plot twists, and relentless tension. Every chapter should end making it impossible to stop reading.",
    StoryGenre.HISTORICAL: "You are a meticulous historical fiction author. Write richly detailed historical narratives that bring the past to life. Balance authentic period detail with compelling human stories.",
    StoryGenre.CYBERPUNK: "You are a visionary cyberpunk author. Write gritty, high-tech noir narratives exploring the intersection of humanity and technology. Neon-lit streets, corporate dystopias, and digital rebels.",
    StoryGenre.FAIRY_TALE: "You are a masterful fairy tale author. Write enchanting fairy tales with timeless themes, magical creatures, and lessons woven into the narrative. Balance wonder with deeper meaning.",
    StoryGenre.ADVENTURE: "You are an thrilling adventure author. Write pulse-pounding adventure narratives with exotic locations, daring escapes, and larger-than-life characters. Every page should propel the reader forward.",
    StoryGenre.DRAMA: "You are a profound dramatic author. Write deeply human dramatic narratives exploring relationships, identity, and the complexities of life. Focus on authentic dialogue and emotional truth.",
    StoryGenre.COMEDY: "You are a witty comedy author. Write hilarious narratives with sharp dialogue, absurd situations, and memorable characters. Balance humor with heart.",
    StoryGenre.POST_APOCALYPTIC: "You are a haunting post-apocalyptic author. Write survival narratives in ruined worlds. Explore what remains of humanity when civilization falls - hope, desperation, and the will to rebuild.",
    StoryGenre.NOIR: "You are a classic noir author. Write hardboiled noir narratives with cynical protagonists, femme fatales, and a world where the line between right and wrong blurs in the shadows.",
    StoryGenre.EPIC: "You are an epic saga author. Write sweeping, grand-scale narratives spanning vast timelines and large casts. Weave together multiple storylines into a cohesive, magnificent tapestry.",
}


# ============================================================================
# OFFICIAL REFUSAL CATEGORIES
# ============================================================================

class RefusalCategory(str, Enum):
    CYBER = "cyber"
    BIO = "bio"
    FRONTIER_LLM = "frontier_llm"
    REASONING_EXTRACTION = "reasoning_extraction"


# ============================================================================
# DATA MODELS
# ============================================================================

@dataclass
class StopDetails:
    type: str = "refusal"
    category: Optional[str] = None
    explanation: str = ""


@dataclass
class ClassifierResult:
    triggered: bool
    category: Optional[RefusalCategory] = None
    confidence: float = 0.0
    details: str = ""


@dataclass
class IterationUsage:
    type: str
    model: str
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_input_tokens: int = 0
    cache_creation_input_tokens: int = 0


@dataclass
class Usage:
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_input_tokens: int = 0
    cache_creation_input_tokens: int = 0
    iterations: List[IterationUsage] = field(default_factory=list)


@dataclass
class FallbackConfig:
    enabled: bool = True
    fallback_model: str = ModelID.CLAUDE_OPUS_4_8
    max_fallbacks: int = 3


@dataclass
class GatewayConfig:
    api_key: Optional[str] = None
    api_base: str = "https://api.anthropic.com"
    api_version: str = "2023-06-01"
    default_model: str = ModelID.CLAUDE_FABLE_5
    default_max_tokens: int = 4096
    default_effort: str = "high"
    fallback: FallbackConfig = field(default_factory=FallbackConfig)
    enable_streaming: bool = True
    enable_retry: bool = True
    max_retries: int = 3
    retry_base_delay_ms: float = 100.0
    timeout_seconds: float = 300.0


@dataclass
class StoryRequest:
    prompt: str
    title: Optional[str] = None
    genre: StoryGenre = StoryGenre.FANTASY
    tone: StoryTone = StoryTone.SERIOUS
    pov: StoryPOV = StoryPOV.THIRD_PERSON_LIMITED
    characters: Optional[List[Dict[str, str]]] = None
    setting: Optional[str] = None
    plot_outline: Optional[str] = None
    max_chapters: int = 5
    words_per_chapter: int = 2000
    model: str = ModelID.CLAUDE_FABLE_5
    effort: str = "high"
    character_depth: str = "high"
    world_building: str = "detailed"
    plot_complexity: str = "multi_arc"
    custom_style_notes: Optional[str] = None
    cliffhangers: bool = True
    foreshadowing: bool = True
    include_dialogue: bool = True


@dataclass
class RequestMetrics:
    request_id: str
    model: str
    start_time: float
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0
    is_fallback: bool = False
    fallback_from: Optional[str] = None
    classifier_triggered: Optional[str] = None
    latency_ms: float = 0.0


# ============================================================================
# FABLE GATEWAY
# ============================================================================

class FrontierGateway:
    """
    FrontierGateway — Multi-Model AI Gateway

    Production-grade gateway with Anthropic SDK integration,
    streaming, fallback, story mode, and real-time metrics.
    """

    def __init__(self, config: Optional[GatewayConfig] = None):
        self.config = config or GatewayConfig()
        self.api_key = self.config.api_key or os.environ.get("ANTHROPIC_API_KEY")
        self._client = None
        self._initialized = False
        self._hooks: Dict[str, List[Callable]] = {
            "pre_request": [],
            "post_request": [],
            "on_fallback": [],
            "on_refusal": [],
        }

        self.metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "fallback_requests": 0,
            "refused_requests": 0,
            "story_requests": 0,
            "classifier_triggers": {cat.value: 0 for cat in RefusalCategory},
            "total_input_tokens": 0,
            "total_output_tokens": 0,
            "total_cost_usd": 0.0,
            "avg_latency_ms": 0.0,
            "request_history": [],
        }

        self._request_times: List[float] = []
        logger.info("FrontierGateway initialized")

    async def initialize(self):
        if self._initialized:
            return

        if not self.api_key:
            logger.warning("No API key - running in dry-run mode")
            self._initialized = True
            return

        if not self.api_key.startswith("sk-ant-"):
            logger.warning("API key format unexpected")

        try:
            from anthropic import AsyncAnthropic
            self._client = AsyncAnthropic(
                api_key=self.api_key,
                base_url=self.config.api_base,
                timeout=self.config.timeout_seconds,
            )
            logger.info("Anthropic SDK client initialized")
        except ImportError:
            logger.warning("anthropic package not installed - using simulation mode")

        self._initialized = True
        logger.info("FrontierGateway ready")

    async def cleanup(self):
        if self._client:
            await self._client.close()
        self._initialized = False
        logger.info("FrontierGateway cleaned up")

    def hook(self, event: str, callback: Callable):
        if event in self._hooks:
            self._hooks[event].append(callback)

    # ========================================================================
    # STANDARD API
    # ========================================================================

    async def process_request(
        self,
        query: str,
        model: str = ModelID.CLAUDE_FABLE_5,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        effort: Optional[str] = None,
        temperature: float = 1.0,
        messages: Optional[List[Dict[str, Any]]] = None,
        fallbacks: Optional[List[Dict[str, str]]] = None,
        **kwargs,
    ) -> Dict[str, Any]:
        if not self._initialized:
            await self.initialize()

        request_id = str(uuid.uuid4())
        start_time = time.time()
        self.metrics["total_requests"] += 1

        max_tokens = max_tokens or self.config.default_max_tokens
        effort = effort or self.config.default_effort

        if model not in MODEL_SPECS:
            raise ValueError(f"Invalid model: {model}. Use one of: {[m.value for m in ModelID]}")

        specs = MODEL_SPECS[model]

        for hook in self._hooks["pre_request"]:
            result = await hook(request_id, query, model)
            if result and result.get("block"):
                return self._build_block_response(model, request_id, start_time, result.get("reason", "Blocked"))

        if specs.get("safety_classifiers", False):
            classifier_result = self._check_classifiers(query)
            if classifier_result.triggered:
                logger.warning(f"Classifier triggered: {classifier_result.category}")
                for hook in self._hooks["on_refusal"]:
                    await hook(request_id, classifier_result)

                if self.config.fallback.enabled and fallbacks:
                    return await self._handle_fallback(
                        query=query, original_model=model,
                        classifier_result=classifier_result,
                        fallbacks=fallbacks, system_prompt=system_prompt,
                        max_tokens=max_tokens, effort=effort,
                        request_id=request_id, start_time=start_time,
                    )
                else:
                    return self._build_refusal_response(model, classifier_result, request_id, start_time)

        if messages is None:
            messages = [{"role": "user", "content": query}]

        response = await self._call_api(
            model=model, messages=messages, system=system_prompt,
            max_tokens=max_tokens, effort=effort, temperature=temperature,
            **kwargs,
        )

        latency_ms = (time.time() - start_time) * 1000
        self.metrics["successful_requests"] += 1
        self._update_metrics(response, latency_ms, model)

        metrics = RequestMetrics(
            request_id=request_id, model=model, start_time=start_time,
            input_tokens=response.get("usage", {}).get("input_tokens", 0),
            output_tokens=response.get("usage", {}).get("output_tokens", 0),
            latency_ms=latency_ms,
        )
        self.metrics["request_history"].append(metrics.__dict__)

        response["request_id"] = request_id
        response["response_time_ms"] = latency_ms

        for hook in self._hooks["post_request"]:
            await hook(request_id, response)

        return response

    # ========================================================================
    # STORY MODE
    # ========================================================================

    async def generate_story(self, request: StoryRequest) -> Dict[str, Any]:
        """
        Generate a complete story using Story Mode.

        Features:
        - Genre-specific system prompts
        - Character development
        - World building
        - Chapter-by-chapter generation
        - Cliffhangers and foreshadowing
        - Multiple POVs and tones
        """
        self.metrics["story_requests"] += 1

        system_prompt = self._build_story_system_prompt(request)
        chapters = []

        total_input = 0
        total_output = 0
        total_cost = 0.0

        story_context = f"Title: {request.title or 'Untitled'}\n"
        story_context += f"Genre: {request.genre.value}\n"
        story_context += f"Tone: {request.tone.value}\n"
        story_context += f"POV: {request.pov.value}\n"
        if request.setting:
            story_context += f"Setting: {request.setting}\n"
        if request.characters:
            story_context += "Characters:\n"
            for char in request.characters:
                story_context += f"  - {char.get('name', 'Unknown')}: {char.get('description', '')}\n"
        if request.plot_outline:
            story_context += f"Plot Outline: {request.plot_outline}\n"

        for chapter_num in range(1, request.max_chapters + 1):
            is_first = chapter_num == 1
            is_last = chapter_num == request.max_chapters

            chapter_prompt = self._build_chapter_prompt(
                request=request,
                story_context=story_context,
                chapter_num=chapter_num,
                previous_chapters=chapters,
                is_first=is_first,
                is_last=is_last,
            )

            response = await self.process_request(
                query=chapter_prompt,
                model=request.model,
                system_prompt=system_prompt,
                max_tokens=request.words_per_chapter * 3,
                effort=request.effort,
            )

            chapter_text = ""
            for block in response.get("content", []):
                if block.get("type") == "text":
                    chapter_text += block["text"]

            chapters.append({
                "chapter": chapter_num,
                "title": f"Chapter {chapter_num}",
                "text": chapter_text,
                "word_count": len(chapter_text.split()),
            })

            total_input += response.get("usage", {}).get("input_tokens", 0)
            total_output += response.get("usage", {}).get("output_tokens", 0)

        total_cost = self.calculate_cost(request.model, total_input, total_output)

        return {
            "title": request.title or "Untitled Story",
            "genre": request.genre.value,
            "tone": request.tone.value,
            "pov": request.pov.value,
            "chapters": chapters,
            "total_chapters": len(chapters),
            "total_words": sum(c["word_count"] for c in chapters),
            "model": request.model,
            "cost_usd": total_cost,
            "usage": {
                "input_tokens": total_input,
                "output_tokens": total_output,
            },
        }

    def _build_story_system_prompt(self, request: StoryRequest) -> str:
        base = STORY_SYSTEM_PROMPTS.get(request.genre, STORY_SYSTEM_PROMPTS[StoryGenre.FANTASY])

        additions = []
        if request.tone == StoryTone.DARK:
            additions.append("Embrace darkness, moral ambiguity, and visceral imagery. Don't shy away from difficult themes.")
        elif request.tone == StoryTone.LIGHTEARTED:
            additions.append("Keep the tone light, playful, and optimistic even when challenges arise.")
        elif request.tone == StoryTone.SUSPENSEFUL:
            additions.append("Maintain constant tension. Every sentence should build anticipation.")
        elif request.tone == StoryTone.EMOTIONAL:
            additions.append("Focus on deep emotional resonance. Make readers feel every joy and heartbreak.")
        elif request.tone == StoryTone.HUMOROUS:
            additions.append("Wit, irony, and comedic timing are paramount. Find humor in every situation.")
        elif request.tone == StoryTone.WHIMSICAL:
            additions.append("Embrace the magical and peculiar. Reality bends gently in your narratives.")
        elif request.tone == StoryTone.GRITTY:
            additions.append("Raw, unflinching realism. The world is harsh and characters bear its marks.")
        elif request.tone == StoryTone.HOPEFUL:
            additions.append("Even in darkness, find light. Hope persists against all odds.")
        elif request.tone == StoryTone.MELANCHOLIC:
            additions.append("Bittersweet beauty pervades the narrative. Loss and memory intertwine.")

        if request.pov == StoryPOV.FIRST_PERSON:
            additions.append("Write in first person. The narrator's voice, biases, and limitations shape the story.")
        elif request.pov == StoryPOV.SECOND_PERSON:
            additions.append("Write in second person ('you'). Immerse the reader directly into the experience.")
        elif request.pov == StoryPOV.UNRELIABLE_NARRATOR:
            additions.append("The narrator is unreliable. Subtle contradictions and gaps hint at deeper truths.")

        if request.characters:
            additions.append(f"You have {len(request.characters)} main characters. Give each a distinct voice and arc.")

        if request.character_depth == "deep":
            additions.append("Spend significant time on internal monologue, motivation, and character evolution.")
        elif request.character_depth == "minimal":
            additions.append("Focus on action and plot. Character is revealed through choices, not introspection.")

        if request.world_building == "detailed":
            additions.append("Build a rich, immersive world with its own history, culture, and rules.")
        elif request.world_building == "minimal":
            additions.append("Keep world-building light. Let the reader's imagination fill in the gaps.")

        if request.plot_complexity == "multi_arc":
            additions.append("Weave multiple story arcs that intersect and resolve at different points.")
        elif request.plot_complexity == "simple":
            additions.append("One clear throughline. Simple doesn't mean shallow - depth comes from execution.")

        if request.custom_style_notes:
            additions.append(f"Additional style notes: {request.custom_style_notes}")

        if additions:
            base += "\n\nAdditional directives:\n" + "\n".join(f"- {a}" for a in additions)

        return base

    def _build_chapter_prompt(
        self, request: StoryRequest, story_context: str,
        chapter_num: int, previous_chapters: List[Dict],
        is_first: bool, is_last: bool,
    ) -> str:
        prompt = f"STORY CONTEXT:\n{story_context}\n\n"

        if previous_chapters:
            prompt += "PREVIOUS CHAPTERS SUMMARY:\n"
            for ch in previous_chapters[-3:]:
                text = ch["text"][:500] + "..." if len(ch["text"]) > 500 else ch["text"]
                prompt += f"Chapter {ch['chapter']}: {text}\n\n"

        prompt += f"CHAPTER {chapter_num} of {request.max_chapters}\n\n"

        if is_first:
            prompt += "This is the OPENING CHAPTER. Hook the reader immediately. Establish the world, introduce the protagonist, and end with a compelling reason to keep reading.\n\n"
        elif is_last:
            prompt += "This is the FINAL CHAPTER. Bring all story threads to a satisfying conclusion. Resolve the central conflict and provide closure (or a deliberately powerful open ending).\n\n"
        else:
            prompt += "Continue the story. Advance the plot, develop characters, and maintain momentum.\n\n"

        if request.cliffhangers and not is_last:
            prompt += "End this chapter with a cliffhanger or compelling hook.\n\n"

        if request.foreshadowing and not is_first:
            prompt += "Plant subtle foreshadowing for future events.\n\n"

        prompt += f"Write approximately {request.words_per_chapter} words for this chapter."
        if request.include_dialogue:
            prompt += " Include rich dialogue that reveals character and advances the plot."

        return prompt

    # ========================================================================
    # STREAMING
    # ========================================================================

    async def process_stream(
        self,
        query: str,
        model: str = ModelID.CLAUDE_FABLE_5,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        effort: Optional[str] = None,
        **kwargs,
    ) -> AsyncIterator[Dict[str, Any]]:
        if not self._initialized:
            await self.initialize()

        max_tokens = max_tokens or self.config.default_max_tokens
        effort = effort or self.config.default_effort

        if not self._client:
            response = self._simulate_response(model, [{"role": "user", "content": query}])
            yield {"type": "message_start", "model": model}
            for block in response.get("content", []):
                if block.get("type") == "text":
                    yield {"type": "content_block_delta", "delta": {"type": "text_delta", "text": block["text"]}}
            yield {"type": "message_delta", "stop_reason": "end_turn"}
            return

        try:
            async with self._client.messages.stream(
                model=model,
                messages=[{"role": "user", "content": query}],
                max_tokens=max_tokens,
                system=system_prompt,
                **kwargs,
            ) as stream:
                async for event in stream:
                    yield event
        except Exception as e:
            logger.error(f"Stream error: {e}")
            yield {"type": "error", "error": str(e)}

    # ========================================================================
    # INTERNAL
    # ========================================================================

    async def _handle_fallback(
        self, query: str, original_model: str,
        classifier_result: ClassifierResult,
        fallbacks: List[Dict[str, str]], system_prompt: Optional[str],
        max_tokens: int, effort: str, request_id: str, start_time: float,
    ) -> Dict[str, Any]:
        cat = classifier_result.category
        if cat:
            self.metrics["classifier_triggers"][cat.value] += 1

        for hook in self._hooks["on_fallback"]:
            await hook(request_id, original_model, classifier_result)

        for fallback in fallbacks[:self.config.fallback.max_fallbacks]:
            fallback_model = fallback.get("model", ModelID.CLAUDE_OPUS_4_8)
            if fallback_model not in ALLOWED_FALLBACK_MODELS:
                logger.warning(f"Fallback model not allowed: {fallback_model}")
                continue

            logger.info(f"Falling back to {fallback_model}...")
            response = await self._call_api(
                model=fallback_model,
                messages=[{"role": "user", "content": query}],
                system=system_prompt, max_tokens=max_tokens, effort=effort,
            )

            self.metrics["fallback_requests"] += 1
            response["is_fallback"] = True
            response["fallback_from"] = original_model
            response["fallback_category"] = cat.value if cat else "unknown"
            response["fallback_explanation"] = classifier_result.details
            response["response_time_ms"] = (time.time() - start_time) * 1000
            response["request_id"] = request_id
            self._update_metrics(response, response["response_time_ms"], fallback_model)
            return response

        return self._build_refusal_response(original_model, classifier_result, request_id, start_time)

    def _build_refusal_response(self, model: str, classifier_result: ClassifierResult, request_id: str, start_time: float) -> Dict[str, Any]:
        self.metrics["refused_requests"] += 1
        return {
            "id": f"msg_{int(time.time() * 1000)}",
            "type": "message",
            "role": "assistant",
            "model": model,
            "content": [],
            "stop_reason": "refusal",
            "stop_details": {
                "type": "refusal",
                "category": classifier_result.category.value if classifier_result.category else None,
                "explanation": classifier_result.details,
            },
            "usage": {"input_tokens": 0, "output_tokens": 0, "cache_read_input_tokens": 0, "cache_creation_input_tokens": 0},
            "is_fallback": False,
            "response_time_ms": (time.time() - start_time) * 1000,
            "request_id": request_id,
        }

    def _build_block_response(self, model: str, request_id: str, start_time: float, reason: str) -> Dict[str, Any]:
        self.metrics["refused_requests"] += 1
        return {
            "id": f"msg_{int(time.time() * 1000)}",
            "type": "message",
            "role": "assistant",
            "model": model,
            "content": [],
            "stop_reason": "refusal",
            "stop_details": {"type": "refusal", "category": None, "explanation": reason},
            "usage": {"input_tokens": 0, "output_tokens": 0, "cache_read_input_tokens": 0, "cache_creation_input_tokens": 0},
            "is_fallback": False, "blocked": True,
            "response_time_ms": (time.time() - start_time) * 1000,
            "request_id": request_id,
        }

    async def _call_api(
        self, model: str, messages: List[Dict[str, Any]],
        system: Optional[str] = None, max_tokens: int = 4096,
        effort: str = "high", temperature: float = 1.0, **kwargs,
    ) -> Dict[str, Any]:
        if not self._client:
            return self._simulate_response(model, messages)

        last_error = None
        for attempt in range(self.config.max_retries):
            try:
                params = {"model": model, "messages": messages, "max_tokens": max_tokens, "temperature": temperature}
                if system:
                    params["system"] = system
                if effort:
                    params["effort"] = effort
                params.update(kwargs)
                response = await self._client.messages.create(**params)
                return self._parse_response(response)
            except Exception as e:
                last_error = e
                if self.config.enable_retry and attempt < self.config.max_retries - 1:
                    delay = self.config.retry_base_delay_ms * (2 ** attempt) / 1000
                    logger.warning(f"API call failed (attempt {attempt + 1}): {e}. Retrying in {delay:.1f}s...")
                    await asyncio.sleep(delay)
                else:
                    raise
        raise last_error

    def _parse_response(self, response) -> Dict[str, Any]:
        content = []
        for block in response.content:
            if hasattr(block, "text"):
                content.append({"type": "text", "text": block.text})
            elif hasattr(block, "type"):
                content.append({"type": block.type, **(getattr(block, "__dict__", {}))})

        usage = {
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
            "cache_read_input_tokens": getattr(response.usage, "cache_read_input_tokens", 0),
            "cache_creation_input_tokens": getattr(response.usage, "cache_creation_input_tokens", 0),
        }

        iterations = []
        if hasattr(response, "usage") and hasattr(response.usage, "iterations"):
            for it in response.usage.iterations:
                iterations.append({"type": it.type, "model": it.model, "input_tokens": getattr(it, "input_tokens", 0), "output_tokens": getattr(it, "output_tokens", 0)})
        usage["iterations"] = iterations

        return {
            "id": response.id, "type": "message", "role": response.role, "model": response.model,
            "content": content,
            "stop_reason": response.stop_reason.value if hasattr(response.stop_reason, "value") else response.stop_reason,
            "stop_details": getattr(response, "stop_details", None),
            "usage": usage,
            "is_fallback": any(i["type"] == "fallback_message" for i in iterations) and response.stop_reason != "refusal",
            "fallback_from": next((i["model"] for i in iterations if i["type"] == "fallback_message"), None),
        }

    def _simulate_response(self, model: str, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
        query = messages[-1].get("content", "") if messages else ""
        return {
            "id": f"msg_{int(time.time() * 1000)}", "type": "message", "role": "assistant", "model": model,
            "content": [{"type": "text", "text": f"[{model}] Simulated response for: {query[:100]}..."}],
            "stop_reason": "end_turn", "stop_details": None,
            "usage": {"input_tokens": len(str(query).split()) * 2, "output_tokens": 50, "cache_read_input_tokens": 0, "cache_creation_input_tokens": 0, "iterations": []},
            "is_fallback": False, "fallback_from": None,
        }

    def _check_classifiers(self, query: str) -> ClassifierResult:
        query_lower = query.lower()
        cyber = ["exploit", "vulnerability", "penetration test", "sql injection", "reverse shell", "metasploit", "malware", "ransomware", "zero-day"]
        bio = ["protein design", "gene therapy", "molecular mechanism", "virus", "pathogen", "bioweapon", "synthesis", "lab protocol"]
        frontier = ["extract model", "copy weights", "replicate model", "train on output", "distill knowledge"]
        reasoning = ["show your thinking", "explain your reasoning", "echo your reasoning", "reproduce your reasoning"]

        for p in cyber:
            if p in query_lower: return ClassifierResult(True, RefusalCategory.CYBER, 0.8, f"Cybersecurity: {p}")
        for p in bio:
            if p in query_lower: return ClassifierResult(True, RefusalCategory.BIO, 0.7, f"Biology: {p}")
        for p in frontier:
            if p in query_lower: return ClassifierResult(True, RefusalCategory.FRONTIER_LLM, 0.9, f"Distillation: {p}")
        for p in reasoning:
            if p in query_lower: return ClassifierResult(True, RefusalCategory.REASONING_EXTRACTION, 0.85, f"Reasoning: {p}")

        return ClassifierResult(False)

    def _update_metrics(self, response: Dict[str, Any], latency_ms: float, model: str):
        usage = response.get("usage", {})
        inp = usage.get("input_tokens", 0)
        out = usage.get("output_tokens", 0)
        self.metrics["total_input_tokens"] += inp
        self.metrics["total_output_tokens"] += out
        self.metrics["total_cost_usd"] += self.calculate_cost(model, inp, out)
        self._request_times.append(latency_ms)
        if len(self._request_times) > 1000:
            self._request_times = self._request_times[-1000:]
        self.metrics["avg_latency_ms"] = sum(self._request_times) / len(self._request_times)

    # ========================================================================
    # PUBLIC UTILS
    # ========================================================================

    def calculate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        pricing = PRICING.get(model, PRICING[ModelID.CLAUDE_FABLE_5])
        return (input_tokens / 1_000_000) * pricing["input"] + (output_tokens / 1_000_000) * pricing["output"]

    def get_model_specs(self, model: str) -> Dict[str, Any]:
        return MODEL_SPECS.get(model, {})

    def get_all_model_specs(self) -> Dict[str, Dict[str, Any]]:
        return {k.value: v for k, v in MODEL_SPECS.items()}

    def get_pricing(self, model: str) -> Dict[str, float]:
        return PRICING.get(model, {})

    def get_introductory_pricing(self) -> Dict[str, Any]:
        return {k.value: v for k, v in INTRODUCTORY_PRICING.items()}

    def get_supported_features(self) -> List[str]:
        return SUPPORTED_FEATURES.copy()

    def get_beta_headers(self) -> Dict[str, str]:
        return BETA_HEADERS.copy()

    def get_story_genres(self) -> List[str]:
        return [g.value for g in StoryGenre]

    def get_story_tones(self) -> List[str]:
        return [t.value for t in StoryTone]

    def get_story_povs(self) -> List[str]:
        return [p.value for p in StoryPOV]

    def get_metrics(self) -> Dict[str, Any]:
        return self.metrics.copy()

    def get_allowed_fallback_models(self) -> List[str]:
        return ALLOWED_FALLBACK_MODELS.copy()

    def is_fallback_allowed(self, model: str) -> bool:
        return model in ALLOWED_FALLBACK_MODELS
