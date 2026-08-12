# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""LLM interaction — talks to any provider via OpenAI-compatible API."""
from __future__ import annotations

import os
from typing import Any

import httpx

__all__ = ["LLMClient", "Message", "ToolCall"]


Message = dict[str, Any]          # {"role": "user"/"assistant"/"tool", "content": ...}
ToolCall = dict[str, Any]         # {"id": ..., "type": "function", "function": {"name": ..., "arguments": ...}}


class LLMClient:
    """Generic LLM client for any OpenAI-compatible API."""

    def __init__(self) -> None:
        self.provider = os.getenv("FRONTIER_PROVIDER", "ollama")
        self.model = os.getenv("FRONTIER_MODEL", "Fable 5")
        self.max_retries = int(os.getenv("FRONTIER_MAX_RETRIES", "3"))
        self.timeout = int(os.getenv("FRONTIER_TIMEOUT", "30"))

        # Resolve endpoint + API key
        if self.provider == "ollama":
            self.endpoint = os.getenv("OLLAMA_URL", "http://localhost:11434") + "/v1/chat/completions"
            self.api_key = "ollama"
        elif self.provider == "openrouter":
            self.endpoint = "https://openrouter.ai/api/v1/chat/completions"
            self.api_key = os.getenv("OPENROUTER_API_KEY", "")
        elif self.provider == "anthropic":
            self.endpoint = "https://api.anthropic.com/v1/messages"
            self.api_key = os.getenv("ANTHROPIC_API_KEY", "")
        elif self.provider in ("openai", "opencode"):
            self.endpoint = "https://api.openai.com/v1/chat/completions"
            self.api_key = os.getenv("OPENAI_API_KEY", "")
        else:
            self.endpoint = os.getenv("LLM_ENDPOINT", self.endpoint)
            self.api_key = os.getenv("LLM_API_KEY", "")

    def _build_headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.provider == "openrouter":
            headers["Authorization"] = f"Bearer {self.api_key}"
            headers["HTTP-Referer"] = "https://github.com/elitze-sentinel"
            headers["X-Title"] = "Frontier Code"
        elif self.provider == "anthropic":
            headers["x-api-key"] = self.api_key
            headers["anthropic-version"] = "2023-06-01"
        else:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def chat(self, messages: list[Message], tools: list[dict] | None = None,
             temperature: float = 0.7, max_tokens: int = 8192) -> dict[str, Any]:
        """Send a chat completion request. Returns the full response dict."""
        body: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }
        if tools:
            body["tools"] = tools

        for attempt in range(self.max_retries):
            try:
                resp = httpx.post(
                    self.endpoint, headers=self._build_headers(),
                    json=body, timeout=self.timeout
                )
                if resp.status_code == 200:
                    return resp.json()
                if attempt < self.max_retries - 1:
                    continue
                return {"error": f"HTTP {resp.status_code}: {resp.text[:200]}"}
            except Exception as e:
                if attempt < self.max_retries - 1:
                    continue
                return {"error": str(e)}
        return {"error": "max retries exceeded"}

    def extract_choice(self, response: dict) -> str | None:
        """Extract the assistant's text content from a response."""
        if "error" in response:
            return f"[Error: {response['error']}]"
        try:
            return response["choices"][0]["message"]["content"]
        except (KeyError, IndexError):
            try:
                return response["content"][0]["text"]
            except (KeyError, IndexError):
                return None

    def extract_tool_calls(self, response: dict) -> list[ToolCall]:
        """Extract tool calls from a response."""
        try:
            msg = response["choices"][0]["message"]
            return msg.get("tool_calls", [])
        except (KeyError, IndexError):
            return []

    def count_tokens(self, response: dict) -> dict:
        """Get token usage."""
        try:
            u = response["usage"]
            return {"input": u.get("prompt_tokens", 0), "output": u.get("completion_tokens", 0),
                    "total": u.get("total_tokens", 0)}
        except (KeyError, IndexError):
            return {"input": 0, "output": 0, "total": 0}


def _get_role_model(role: str) -> str:
    """Get the model override for a specific role (planner/worker/reviewer)."""
    key = f"FRONTIER_{role.upper()}_MODEL"
    return os.getenv(key, "")
