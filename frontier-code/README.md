# Frontier Code — Terminal Coding Agent

Our answer to Claude Code / Codex. Runs on your own infrastructure.

## Usage

```bash
# Interactive REPL
frontier-code

# One-shot mode
frontier-code "add input validation to the login function"

# Or via Python module
python -m src.cli "refactor the router to use dependency injection"
```

## Config

Uses the same env vars as the rest of Frontier:

| Env Var | Default | Purpose |
|---------|---------|---------|
| `FRONTIER_PROVIDER` | `ollama` | Model provider |
| `FRONTIER_MODEL` | `Fable 5` | Default model |
| `FRONTIER_PLANNER_MODEL` | *(empty)* | Planner model override |
| `FRONTIER_WORKER_MODEL` | *(empty)* | Worker model override |
| `FRONTIER_REVIEWER_MODEL` | *(empty)* | Reviewer model override |
| `FRONTIER_ENABLE_REVIEW` | `true` | Enable quality gate |
| `FRONTIER_MAX_RETRIES` | `3` | Retry on failure |
| `FRONTIER_TIMEOUT` | `30` | Seconds before timeout |
| `OPENROUTER_API_KEY` | — | For OpenRouter provider |

## Tools

- `read_file` — Read files with line numbers
- `write_file` — Write/create files
- `patch` — Targeted find-and-replace edits
- `search_files` — Regex search across codebase
- `terminal` — Run shell commands
- `git_status` / `git_diff` — Git operations
- `list_dir` — List directory contents
