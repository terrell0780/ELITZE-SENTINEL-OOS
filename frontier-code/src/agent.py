# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""Coding agent — the core loop that plans, executes, and reviews."""
from __future__ import annotations

import json
import os

from . import model as llm
from .tools import ToolRegistry, tools_spec

__all__ = ["CodingAgent"]


SYSTEM_PROMPT = """You are Frontier Code, a terminal-based coding agent for the Elitze Sentinel Frontier OOS platform.

You help users write, debug, refactor, and understand code. You have access to tools that let you:
- Read and write files
- Search across the codebase
- Run shell commands (build, test, git)
- Make targeted edits via find-and-replace

**Rules:**
1. Always read the relevant files first before making changes.
2. Run tests/linters after changes to verify correctness.
3. Use git_status/git_diff to track what's changed.
4. Think step by step. Explain your plan before executing.
5. Prefer targeted edits (patch) over full file rewrites when possible.
6. If a command fails, diagnose and retry.
7. Be concise — show the user what matters.

Available tools: read_file, write_file, patch, search_files, terminal, git_status, git_diff, list_dir"""


class CodingAgent:
    """The agent loop: plan -> execute (tool calls) -> review -> repeat."""

    def __init__(self, workdir: str | None = None, enable_review: bool = True) -> None:
        self.client = llm.LLMClient()
        self.tools = ToolRegistry(workdir)
        self.tool_specs = tools_spec()
        self.messages: list[llm.Message] = [{"role": "system", "content": SYSTEM_PROMPT}]
        self.enable_review = enable_review and os.getenv("FRONTIER_ENABLE_REVIEW", "true").lower() == "true"
        self.max_iterations = 20
        self.iteration = 0
        self.total_input_tokens = 0
        self.total_output_tokens = 0

    def _add_tool_results(self, calls: list[llm.ToolCall]) -> list[llm.Message]:
        """Execute tool calls and return result messages."""
        results = []
        for call in calls:
            name = call["function"]["name"]
            try:
                args = json.loads(call["function"]["arguments"])
            except json.JSONDecodeError:
                args = {}

            tool_fn = getattr(self.tools, name, None)
            if not tool_fn:
                result = {"error": f"Unknown tool: {name}"}
            else:
                result = tool_fn(**args)

            results.append({
                "role": "tool",
                "tool_call_id": call.get("id", ""),
                "content": json.dumps(result, default=str),
            })
        return results

    def run(self, task: str) -> str:
        """Run the agent loop on a task. Returns the final response."""
        self.messages.append({"role": "user", "content": task})

        while self.iteration < self.max_iterations:
            self.iteration += 1

            # --- PLANNER (direct model call) ---
            response = self.client.chat(self.messages, tools=self.tool_specs)
            usage = self.client.count_tokens(response)
            self.total_input_tokens += usage.get("input", 0)
            self.total_output_tokens += usage.get("output", 0)

            if "error" in response:
                return f"[Agent Error] {response['error']}"

            tool_calls = self.client.extract_tool_calls(response)
            content = self.client.extract_choice(response)

            if not tool_calls:
                # No tool calls = final answer
                if content:
                    self.messages.append({"role": "assistant", "content": content})
                return content or "(no response)"

            # Add assistant message with tool calls
            msg = {"role": "assistant", "content": content}
            if tool_calls:
                msg["tool_calls"] = tool_calls
            self.messages.append(msg)

            # --- WORKER: Execute tools ---
            tool_results = self._add_tool_results(tool_calls)
            self.messages.extend(tool_results)

            # --- REVIEWER (optional quality gate) ---
            if self.enable_review and self.iteration > 1:
                review_result = self._review()
                if review_result:
                    self.messages.append({"role": "user", "content": review_result})

        return "[Agent] Max iterations reached. Task may be incomplete."

    def _review(self) -> str | None:
        """Optional review pass on the agent's work so far."""
        review_prompt = (
            "Review the changes made so far. Check for:\n"
            "1. Correctness — does the code work?\n"
            "2. Completeness — is the task fully addressed?\n"
            "3. Consistency — does it match project style?\n"
            "If anything needs fixing, describe what and why. "
            "If everything looks good, say 'REVIEW: PASS'."
        )
        rev_client = llm.LLMClient()
        rev_client.model = os.getenv("FRONTIER_REVIEWER_MODEL", "") or self.client.model
        response = rev_client.chat(
            [{"role": "system", "content": "You are a code reviewer. Be critical but constructive."},
             {"role": "user", "content": review_prompt + "\n\nRecent context:\n" + json.dumps(self.messages[-6:], default=str)[:3000]}]
        )
        content = rev_client.extract_choice(response)
        if content and "REVIEW: PASS" not in content.upper():
            return f"[Reviewer Feedback]\n{content}\n\nAddress the feedback above."
        return None

    def summary(self) -> str:
        return f"Tokens: {self.total_input_tokens} in / {self.total_output_tokens} out · {self.iteration} iterations"
