# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
import pytest
from src.core.gateway import (
    FrontierGateway, GatewayConfig, ModelID, StoryRequest, StoryGenre, StoryTone, StoryPOV,
    MODEL_SPECS, PRICING,
)


@pytest.fixture
def gw():
    return FrontierGateway(GatewayConfig())


@pytest.mark.asyncio
async def test_process_request_simulated(gw):
    result = await gw.process_request(
        query="Hello world",
        model=ModelID.CLAUDE_FABLE_5,
    )
    assert result["model"] == "claude-Frontier-5"
    assert len(result.get("content", [])) > 0
    assert "usage" in result
    assert result["usage"]["input_tokens"] > 0


@pytest.mark.asyncio
async def test_process_request_invalid_model(gw):
    with pytest.raises(ValueError):
        await gw.process_request(query="test", model="invalid-model")


@pytest.mark.asyncio
async def test_process_request_with_system_prompt(gw):
    result = await gw.process_request(
        query="test",
        model=ModelID.CLAUDE_SONNET_5,
        system_prompt="You are a helpful assistant.",
    )
    assert result["model"] == "claude-sonnet-5"


@pytest.mark.asyncio
async def test_process_request_with_fallbacks(gw):
    result = await gw.process_request(
        query="test",
        model=ModelID.CLAUDE_FABLE_5,
        fallbacks=[{"model": "claude-sonnet-5"}],
    )
    assert result is not None


@pytest.mark.asyncio
async def test_calculate_cost(gw):
    cost = gw.calculate_cost(ModelID.CLAUDE_FABLE_5, 1000, 500)
    expected = (1000 / 1_000_000) * 10.0 + (500 / 1_000_000) * 50.0
    assert cost == pytest.approx(expected)


@pytest.mark.asyncio
async def test_generate_story(gw):
    request = StoryRequest(
        prompt="A brave knight discovers a hidden cave beneath an ancient tree.",
        title="The Hidden Cave",
        genre=StoryGenre.FANTASY,
        tone=StoryTone.DARK,
        pov=StoryPOV.THIRD_PERSON_LIMITED,
        max_chapters=2,
        words_per_chapter=200,
    )
    result = await gw.generate_story(request)
    assert result["total_chapters"] == 2
    assert result["total_words"] >= 0
    assert result["genre"] == "fantasy"
    assert result["tone"] == "dark"
    assert result["model"] == "claude-Frontier-5"
    assert len(result["chapters"]) == 2
    for ch in result["chapters"]:
        assert "chapter" in ch
        assert "text" in ch
        assert "word_count" in ch


@pytest.mark.asyncio
async def test_get_model_specs(gw):
    specs = gw.get_model_specs("claude-Frontier-5")
    assert specs is not None
    assert specs["context_window"] == 1000000
    assert specs["max_output"] == 128000


@pytest.mark.asyncio
async def test_get_all_model_specs(gw):
    all_specs = gw.get_all_model_specs()
    assert len(all_specs) == 12
    for model_id in ["claude-Frontier-5", "claude-sonnet-5", "claude-opus-4-8", "claude-haiku-4-5-20251001", "llama-4", "mistral-large", "deepseek-v3", "deepseek-r1", "qwen-2-5", "gemma-3", "phi-4"]:
        assert model_id in all_specs


@pytest.mark.asyncio
async def test_get_introductory_pricing(gw):
    pricing = gw.get_introductory_pricing()
    assert "claude-sonnet-5" in pricing


@pytest.mark.asyncio
async def test_get_metrics(gw):
    metrics = gw.get_metrics()
    assert "total_requests" in metrics
    assert "total_cost_usd" in metrics


@pytest.mark.asyncio
async def test_model_specs_contain_required_fields():
    for model_id, spec in MODEL_SPECS.items():
        assert "context_window" in spec
        assert "max_output" in spec
        assert "comparative_latency" in spec
        assert "knowledge_cutoff" in spec

    Frontier = MODEL_SPECS["claude-Frontier-5"]
    assert Frontier["context_window"] == 1000000
    assert Frontier["max_output"] == 128000
    assert Frontier["comparative_latency"] == "slower"
    assert Frontier["knowledge_cutoff"] == "2026-01"

    sonnet = MODEL_SPECS["claude-sonnet-5"]
    assert sonnet["context_window"] == 1000000
    assert sonnet["comparative_latency"] == "fast"

    haiku = MODEL_SPECS["claude-haiku-4-5-20251001"]
    assert haiku["context_window"] == 200000
    assert haiku["max_output"] == 64000
    assert haiku["knowledge_cutoff"] == "2025-02"

    llama4 = MODEL_SPECS["llama-4"]
    assert llama4["context_window"] == 128000
    assert llama4.get("open_source") is True


@pytest.mark.asyncio
async def test_model_pricing():
    assert PRICING[ModelID.CLAUDE_FABLE_5] == {"input": 10.0, "output": 50.0}
    assert PRICING[ModelID.CLAUDE_SONNET_5] == {"input": 3.0, "output": 15.0}
    assert PRICING[ModelID.CLAUDE_OPUS_4_8] == {"input": 5.0, "output": 25.0}
    assert PRICING[ModelID.CLAUDE_HAIKU_4_5] == {"input": 1.0, "output": 5.0}
    for model in [ModelID.LLAMA_4, ModelID.MISTRAL_LARGE, ModelID.DEEPSEEK_V3, ModelID.DEEPSEEK_R1, ModelID.QWEN_2_5, ModelID.GEMMA_3, ModelID.PHI_4]:
        assert PRICING[model]["input"] == 0.0
        assert PRICING[model]["output"] == 0.0


@pytest.mark.asyncio
async def test_process_stream_simulated(gw):
    events = []
    async for event in gw.process_stream(query="test", model=ModelID.CLAUDE_FABLE_5):
        events.append(event)
    assert len(events) > 0
    assert events[0]["type"] == "message_start"
