# Frontier Core — Open-Source AI Gateway & Workbench

**Frontier Core** is an open-source AI platform for building, deploying, and governing intelligent agents.

## Features

- **Multi-model gateway** — Anthropic models (Frontier 5, Sonnet 5, Opus 4.8, Haiku 4.5) + local open-source models (Llama 4, Mistral, DeepSeek, Qwen, Gemma, Phi-4)
- **Workbench** — API playground with streaming, code export (Python/TypeScript/cURL), tool use testing, structured outputs
- **Terrell Hall Guardrails** — Security policies, prompt injection detection, PII redaction, tamper-evident audit logging
- **Story Mode** — Cinematic narrative generation with genre-specific prompts, character development, and chapter-by-chapter output
- **Audit logging** — Hash-chained, immutable audit trail for compliance (EU AI Act, NIST AI RMF, SOC2)

## Quick Start

```bash
pip install Frontier-core
uvicorn src.main:app --reload
```

## API Docs

Open `/docs` after starting the server for interactive Swagger documentation.

## License

MIT
