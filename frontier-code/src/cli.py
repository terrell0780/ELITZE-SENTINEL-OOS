# Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
"""Frontier Code CLI — terminal coding agent entry point."""
from __future__ import annotations

import os
import sys

from .agent import CodingAgent

TITLE = """
╔══════════════════════════════════════════════╗
║       FRONTIER CODE — Terminal Agent         ║
║    Elitze Sentinel Frontier OOS              ║
╚══════════════════════════════════════════════╝
"""


def main() -> None:
    args = sys.argv[1:]

    workdir = os.getcwd()

    print(TITLE)
    print(f"Provider: {os.getenv('FRONTIER_PROVIDER', 'ollama')}")
    print(f"Model:    {os.getenv('FRONTIER_MODEL', 'Fable 5')}")
    print(f"Workdir:  {workdir}")
    print()

    if not args:
        # Interactive REPL
        print("Interactive mode. Type 'exit' to quit, '/summary' for stats.")
        print()
        agent = CodingAgent(workdir=workdir)
        while True:
            try:
                task = input(">>> ").strip()
            except (EOFError, KeyboardInterrupt):
                print()
                break
            if not task:
                continue
            if task.lower() in ("exit", "quit", "q"):
                break
            if task.startswith("/summary"):
                print(agent.summary())
                continue

            result = agent.run(task)
            print(f"\n{result}\n")

        print(agent.summary())
        return

    # One-shot mode
    task = " ".join(args)
    agent = CodingAgent(workdir=workdir)
    result = agent.run(task)
    print(result)
    print()
    print(agent.summary())


if __name__ == "__main__":
    main()
