# Frontier Gaming Studio
## Elitze Sentinel Frontier OOS

`Frontier Gaming Studio` is a product line under **Elitze Sentinel Frontier OOS**.
Product position: **Frontier Autonomous World Engine™** — a platform for building:

- survival worlds
- MMOs
- strategy simulations
- military simulations
- training environments
- AI NPC ecosystems
- persistent digital worlds

Not "an AI game maker." Too small.

## Architecture

```
ELITZE SENTINEL FRONTIER OOS
│
└── Frontier Gaming Studio
      ├── C++ Engine Layer   PRIMARY        (/frontier-gaming-engine  cpp/)
      │     ├── Unreal Engine 5 Integration
      │     ├── Rendering Pipeline
      │     ├── Physics (Chaos)
      │     ├── World Streaming (World Partition)
      │     ├── Networking (Replication)
      │     ├── AI Runtime Hooks
      │     ├── ECS (Mass Entity)
      │     ├── Terrain Systems
      │     ├── Weather Simulation
      │     └── Massive World Management
      ├── Frontier AI Runtime
      │     ├── Agent Brain
      │     ├── NPC Decision Systems
      │     ├── Economy Simulation
      │     ├── Faction Logic
      │     └── World Events
      ├── Frontier Studio Tools
      │     ├── Editor
      │     ├── World Builder
      │     ├── Quest Designer
      │     ├── Asset Pipeline
      │     └── AI Scenario Builder
      └── Frontier Cloud Services
            ├── Matchmaking
            ├── Persistence
            ├── Telemetry
            ├── Player Accounts
            └── Live Operations
```

## The Five Kingdoms (final rule)

| Layer | Role |
|---|---|
| **C++** | Kingdom — engine core, frame, physics, streaming |
| **Unreal** | Castle — flagship runtime (Nanite/Lumen/World Partition/Chaos/Mass) |
| **Frontier Runtime** | Intelligence — autonomous AI worlds |
| **Elitze Sentinel** | Security — governance across all layers |
| **Cloud Platform** | Empire — matchmaking, persistence, liveops |

For a serious AAA gaming division, **C++ is the foundation**. The rest of Frontier
connects INTO it; it does not replace it.

## Critical rule: never run LLMs in the frame loop

```
BAD (too slow):
  Every frame -> Ask AI -> Generate decision -> Render

CORRECT:
  Game Thread
       |
  AI Worker Threads
       |
  Frontier Runtime
       |
  LLM / Models
```

Example NPC flow:
```
C++ NPC Controller
   -> Frontier Agent API
   -> Qwen / Llama / Custom Model (worker thread)
   -> Decision Returned
   -> C++ Executes
```

## Recommended Stack

**Game Runtime**
| Layer | Technology |
|---|---|
| Engine | C++ |
| AAA Engine | Unreal Engine 5 |
| Physics | Chaos |
| Rendering | Nanite / Lumen |
| ECS | Unreal Mass |
| Networking | Unreal Replication |
| Platform | Windows / Linux / Console |

**AI Layer**
| Layer | Technology |
|---|---|
| Agent Runtime | Python / C++ |
| Orchestration | LangGraph / custom |
| Inference | vLLM / Ollama |
| Models | Qwen / Llama / DeepSeek |
| Memory | Qdrant / Postgres |
| Events | Redis / NATS |

**Tools**
| Tool | Language |
|---|---|
| World Editor | C++ + Qt / Unreal Editor |
| Web Dashboard | TypeScript |
| AI Pipeline | Python |
| Backend Services | Rust / Python / Go |
| Engine | C++ |

## Layout in this repo

- `frontier-gaming-studio/` — Python side: AI Runtime, Studio Tools, Cloud Services, engine contract.
- `frontier-gaming-engine/cpp/` — C++ Engine Layer (`Core, Rendering, Physics, World, AI, Networking, Animation, Audio, Terrain, Streaming`).

See `ARCHITECTURE.md` for the full tree and ownership boundaries.
