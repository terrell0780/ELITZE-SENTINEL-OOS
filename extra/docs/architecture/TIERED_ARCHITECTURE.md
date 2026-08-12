# Frontier — Tiered Architecture
## "Full-stack AI platform, not just a model API"

```
                           FRONTIER ECOSYSTEM
                    ─────────────────────────────────
                    Sovereign · Multi-Stack · Open
                    ─────────────────────────────────
```

## The Five Tiers

```
TIER 5: EXPERIENCE      ┌─────────────────────────────────────────────┐
(User Interface)        │  TypeScript (Next.js) · Dart (Flutter)      │
                        │  Frontier Console · Overview App · Mobile   │
                        └─────────────────────────────────────────────┘
                                    │
TIER 4: DEVELOPER       ┌─────────────────────────────────────────────┐
& CREATOR TOOLS         │  Python · TypeScript                        │
                        │  Frontier Studio · Workbench · Voice        │
                        │  Frontier Code CLI · Knowledge Base         │
                        │  Prompt Library · Workflow Builder          │
                        └─────────────────────────────────────────────┘
                                    │
TIER 3: AI &            ┌─────────────────────────────────────────────┐
INTELLIGENCE            │  Python · Rust (planned)                    │
                        │  Frontier Runtime · Agent Mesh              │
                        │  Model Router · Planner/Worker/Reviewer     │
                        │  RAG · Knowledge Engine · Embeddings        │
                        │  Grounding Lite (MCP) · Web Search          │
                        │  Frontier Maps · Geospatial Analytics       │
                        └─────────────────────────────────────────────┘
                                    │
TIER 2: SECURITY        ┌─────────────────────────────────────────────┐
& GOVERNANCE            │  Python · Dart                              │
                        │  ELITZE SENTINEL — Sovereign AI OS          │
                        │  Identity · XDR · Policy Engine             │
                        │  Compliance · Audit · RBAC · SSO            │
                        │  Multi-Tenancy · Secret Management          │
                        └─────────────────────────────────────────────┘
                                    │
TIER 1: ENGINE &        ┌─────────────────────────────────────────────┐
INFRASTRUCTURE          │  C++ · Rust (future) · Go (future)          │
                        │  PostgreSQL · Redis · Docker · K8s          │
                        │  API Gateway · Service Registry             │
                        │  Telemetry · Event Bus · State Manager      │
                        └─────────────────────────────────────────────┘
```

## Platform Divisions

The five tiers above are the **vertical stack**. Across them run the **horizontal divisions**:

| Division | Core | Key Services |
|----------|------|-------------|
| **️ Security** | Elitze Sentinel | XDR, SIEM, policy engine, compliance, RBAC, SSO, multi-tenancy |
| ** Intelligence** | Frontier Runtime | Agent mesh, model router, planner/worker/reviewer, RAG, embeddings |
| ** Gaming** | Frontier Gaming Engine | C++ engine, Unreal 5, world sim, economy, ecology, combat, quests |
| **️ Geospatial** | Frontier Maps | MCP grounding, analytics, web search, imagery, Google Maps |
| ** Studio** | Frontier Studio | Agent builder, workflows, prompts, voice, knowledge, Code CLI |

## Capability Comparison — Full Coverage

| Capability | Claude | OpenAI | **Frontier** |
|---|---|---|---|
| **Coding** | Claude Code CLI | Codex CLI | **Frontier Code CLI + Studio Agents** |
| **Analysis** | Document analysis | GPT-5 reasoning | **Runtime + Planner/Worker/Reviewer** |
| **Writing** | Best prose | Strong writing | **Studio Prompts + Knowledge Base** |
| **Multimodal** | Vision, docs | Vision, audio, DALL-E | **Vision via models + Voice** |
| **Web Search** | Via tools | Built-in browsing | **Frontier Maps Web Search + MCP** |
| **Agents** | Claude Code, MCP | Codex, GPT Actions | **Agent Mesh + Workflows** |
| **Voice** | Basic | Advanced (voice mode) | **Frontier Studio Voice** |
| **Images** | No generation | DALL-E 3/4 | **Via external API (FAL, etc.)** |
| **Security** | Constitutional AI | Moderation | **Elitze Sentinel (XDR, SIEM, RBAC)** |
| **Gaming/Sim** | None | None | **C++ Engine + Unreal + Runtime (1 division)** |
| **Geospatial** | None | Limited | **Frontier Maps — full suite** |
| **Local/Sovereign** | No | No | **YES — 100% self-hosted** |

## Where We Stack Up

### Already Strong
```
[Security]    Elitze Sentinel (full suite)            ──  OUR MOAT
[Local]       100% self-hosted, open source           ──  OUR MOAT
[Geospatial]  Maps + MCP + Analytics                  ──  OUR MOAT
[Gaming]      C++ Engine + Unreal + Runtime           ──  Unique (1 of 5 divisions)
[Analysis]    Runtime + Planner/Worker/Reviewer       ──  Good, needs RAG
[Writing]     Studio Prompts + Knowledge Base         ──  Good
[Coding]      Code CLI + Studio Agents                ──  New (P1 just built)
```

### Needs Strengthening
```
[Multimodal]  Vision works via provider, no native image gen  →  Add FAL/DALL-E
[Web Search]  stub in Maps, needs runtime hookup               →  Wire into agent tools
[Ecosystem]   No plugin marketplace, no community SDK docs     →  Build registry + docs
[RAG]         Knowledge engine exists, no vector pipeline      →  Wire Qdrant/Pgvector
[Voice]       Wake word + TTS works, no streaming conv         →  Add real-time voice
```

## Immediate Build Targets

| Priority | Feature | Tier | Division |
|----------|---------|------|----------|
| **P1** | Runtime Web Search — wire Maps into agent tools | T3 | Intelligence |
| **P1** | RAG Pipeline — Qdrant/Pgvector for knowledge | T3 | Intelligence |
| **P2** | Plugin Registry — community marketplace | T4 | Studio |
| **P2** | Real-time Voice — streaming conversation | T4 | Studio |
| **P3** | Native Image Gen — FAL/DALL-E integration | T4 | Studio |

## Summary

```
Claude wins:  Coding, writing, agentic reasoning
OpenAI wins:  Multimodal, ecosystem, scale
We win:       Security, local/sovereign, gaming, geospatial, open source

Goal:         Take their strengths AND ours → full-stack AI platform.
              Where you never leave your own infrastructure.
              5 divisions, one platform, all self-hosted.
```
