# Elitze Sentinel Frontier OOS — Multi-Stack Architecture
## "Right tool for the job" — each service in its optimal language

```
┌──────────────────────────────────────────────────────────────────────┐
│                    ELITZE SENTINEL FRONTIER OOS                      │
│      Multi-Stack · Sovereign · 5 Divisions · Open Source            │
└──────────────────────────────────────────────────────────────────────┘
```

## Stack Assignment

| Language | Domain | Packages | Why |
|----------|--------|----------|-----|
| **C++** | Engine Core | `frontier-gaming-engine/` | Frame perf, GPU, physics — real-time simulation |
| **Rust** *(future)* | Gateway, Data pipelines | *(planned)* | Memory safety, async I/O |
| **Python** | AI Runtime, API, Studio, Security | `frontier-*` (12 pkgs) | ML/AI ecosystem, fast prototyping |
| **TypeScript** | Web Dashboard | `elitze-sentinel-frontier-overview/` | Interactive UI, SSR via Next.js |
| **Dart** | Mobile/Desktop | `elitze_sentinel/frontend/` | Cross-platform Flutter |
| **Go** *(future)* | Cloud Services | *(planned)* | High-concurrency networking |

## The 5 Divisions

```
                        CORE PLATFORM (Python / TS / Dart)
                        ┌───────────────────────────────────┐
                        │  Elitze Sentinel · Core · Gateway  │
                        │  General-purpose platform services  │
                        └───────────────────────────────────┘
                                   ▲
            ┌──────────────────────┼──────────────────────┐
            │                      │                      │
     ┌──────┴──────┐       ┌──────┴──────┐       ┌──────┴──────┐
     │  SECURITY   │       │ INTELLIGENCE│       │   STUDIO    │
     │  Division   │       │  Division   │       │  Division   │
     │             │       │             │       │             │
     │ Elitze      │       │ Runtime     │       │ Agent       │
     │ Sentinel    │       │ Agent Mesh  │       │ Builder     │
     │ XDR · SIEM  │       │ Model       │       │ Workflows   │
     │ Policy ·    │       │ Router      │       │ Voice · KB  │
     │ Compliance  │       │ Maps · RAG  │       │ Code CLI    │
     └─────────────┘       └─────────────┘       └─────────────┘

     ┌───────────────────────────────────────────────────────────┐
     │              SPECIALIZED DIVISIONS                         │
     │                                                           │
     │  ┌──────────────┐          ┌──────────────────────┐       │
     │  │   GAMING  │          │  ️ GEOSPATIAL     │       │
     │  │  Division   │          │  Division           │       │
     │  │             │          │                     │       │
     │  │ C++ Engine  │          │ Maps Analytics      │       │
     │  │ Unreal 5    │          │ MCP Grounding       │       │
     │  │ World Sim   │          │ Web Search          │       │
     │  │ Runtime     │          │ Agentic UI          │       │
     │  └──────────────┘          └──────────────────────┘       │
     └───────────────────────────────────────────────────────────┘
```

## Service Topology

```
                    ┌──────────────────────────────────────┐
                    │   TypeScript (Next.js)               │
                    │  Overview App · Console              │
                    │  elitze-sentinel-frontier-overview   │
                    └────────────┬─────────────────────────┘
                                 │ HTTP/SSE
                    ┌────────────▼─────────────────────────┐
                    │   Python / Rust (future)              │
                    │  API Gateway (8001)                   │
                    │  frontier-api                         │
                    └────────────┬─────────────────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │                           │                           │
┌────▼────────────┐    ┌─────────▼──────────┐    ┌─────────▼──────────┐
│  Python         │    │  Python            │    │  Python            │
│  Intelligence   │    │  Security          │    │  Studio            │
│  Runtime (8768) │    │  Sentinel (8000)   │    │  Studio (8766)     │
│  Maps           │    │  Enterprise (8767) │    │  Code CLI          │
│  Core (8765)    │    │                    │    │                    │
└─────────────────┘    └────────────────────┘    └────────────────────┘

     ┌──────────────────────────────────────────────────────────────┐
     │  C++                       │  Dart (future)                  │
     │  Gaming Engine             │  Sentinel Frontend              │
     │  frontier-gaming-engine    │  elitze_sentinel/frontend      │
     └────────────────────────────┴─────────────────────────────────┘

     ┌──────────────────────────────────────────────────────────────┐
     │  Infrastructure                                              │
     │  PostgreSQL · Redis · Docker · K8s                           │
     └──────────────────────────────────────────────────────────────┘
```

## Deployment Profiles

### Full Stack (Docker Compose)
| Service | Lang | Port | Docker |
|---------|------|------|--------|
| Sentinel | Python | 8000 | `elitze-sentinel` |
| Core Gateway | Python | 8765 | `frontier-core` |
| Studio | Python | 8766 | `frontier-studio` |
| Enterprise | Python | 8767 | `frontier-enterprise` |
| Runtime | Python | 8768 | `frontier-runtime` |
| API Gateway | Python | 8001 | `frontier-api` |
| Overview App | TypeScript | 3000 | *(npm run dev)* |
| PostgreSQL | SQL/C | 5432 | `postgres:16-alpine` |
| Redis | C | 6379 | `redis:7-alpine` |
| Game Engine | C++ | *(native)* | *(native)* |

## Ownership Boundaries (the 5 Divisions)

```
  ️ Security   = Elitze Sentinel   (governance, XDR, compliance, audit)
   Intelligence = Frontier          (AI runtime, agents, model routing, maps)
   Gaming     = Kingdom + Castle   (C++ engine, Unreal 5, world simulation)
  ️ Geospatial = Frontier Maps      (analytics, MCP, web search, imagery)
   Studio     = Frontier Studio     (agent builder, workflows, voice, code CLI)
```

## Current vs Target Stack Coverage

| Area | Current | Target | Gap |
|------|---------|--------|-----|
| Security | Python  | Python + Rust | Sentinel engine rewrite |
| AI Runtime | Python  | Python / C++ | Worker thread bridge |
| Gateway | Python  | Rust / Go | Rewrite |
| Web UI | TS / Next.js  | TS / Next.js | None |
| Mobile | Dart skeleton | Dart / Flutter | Full UI |
| Gaming Engine | C++ skeleton | C++ / Unreal 5 | Full implementation |
| Geospatial | Python  | Python | Scaling |
| Cloud | Python  | Go | Rewrite |

## See Also

- [TIERED_ARCHITECTURE.md](TIERED_ARCHITECTURE.md) — Full 5-tier stack with capability comparison vs Claude/OpenAI
