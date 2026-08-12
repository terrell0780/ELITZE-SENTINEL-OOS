# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""Frontier AI Runtime — intelligence off the game thread.

NPC/agent decisions are computed on AI worker threads and returned to the C++
game thread. LLMs are NEVER called inside the frame loop.

Flow (correct):
    C++ NPC Controller
        -> Frontier Agent API
        -> Qwen / Llama / Custom Model (worker thread)
        -> Decision returned
        -> C++ executes

Bad: every frame -> ask AI -> generate -> render  (too slow).
"""

from __future__ import annotations

import asyncio
import threading
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import Any

DecisionFn = Callable[[str, dict], Awaitable[dict]]


@dataclass
class AgentBrain:
    """One autonomous agent's reasoning handle.

    The brain does NOT run on the game thread. Call :meth:`decide` from a worker;
    the C++ side polls/awaits the returned decision.
    """

    agent_id: str
    model: str = "qwen"  # qwen | llama | deepseek | custom
    context: dict[str, Any] = field(default_factory=dict)
    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    async def decide(self, situation: str, model_fn: DecisionFn | None = None) -> dict:
        """Compute a decision off-thread. No frame-loop LLM calls."""
        fn = model_fn or _default_inference
        decision = await fn(situation, {"agent_id": self.agent_id, "model": self.model, **self.context})
        decision.setdefault("meta", {}).update(
            agent_id=self.agent_id, model=self.model
        )
        with self._lock:
            self.context.setdefault("history", []).append(decision)
        return decision


@dataclass
class NPCController:
    """Bridge between a C++ NPC controller and the Frontier Agent API.

    The game thread calls :meth:`request_decision` (non-blocking enqueue) and later
    consumes the result via :meth:`collect`. No synchronous LLM wait on the frame.
    """

    agent: AgentBrain
    _pending: dict[str, asyncio.Future] = field(default_factory=dict, repr=False)

    async def request_decision(self, situation: str, req_id: str) -> dict:
        fut: asyncio.Future = asyncio.get_event_loop().create_future()
        self._pending[req_id] = fut
        result = await self.agent.decide(situation)
        fut.set_result(result)
        return result

    def collect(self, req_id: str) -> dict | None:
        fut = self._pending.pop(req_id, None)
        return fut.result() if fut and fut.done() else None


@dataclass
class FactionLogic:
    faction_id: str
    loyalty: float = 0.5
    allies: list[str] = field(default_factory=list)
    enemies: list[str] = field(default_factory=list)


@dataclass
class EconomySimulation:
    currency: str = "credit"
    prices: dict[str, float] = field(default_factory=dict)

    def tick(self, demand: dict[str, float]) -> None:
        for item, d in demand.items():
            base = self.prices.get(item, 1.0)
            self.prices[item] = max(0.01, base * (1.0 + 0.05 * (d - 0.5)))


@dataclass
class WorldEvent:
    event_id: str
    kind: str
    payload: dict[str, Any] = field(default_factory=dict)


async def _default_inference(situation: str, meta: dict) -> dict:
    """Placeholder inference — replaced by vLLM/Ollama in production."""
    await asyncio.sleep(0)  # yields; never blocks the frame
    return {"action": "idle", "confidence": 0.0, "situation": situation, "meta": meta}
