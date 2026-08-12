# Frontier Gaming Studio — Architecture (detailed)

Part of **Elitze Sentinel Frontier OOS**. Product: **Frontier Autonomous World Engine™**.

## Ownership boundaries

### C++ Owns (Kingdom)
Path: `/frontier-gaming-engine/` → `cpp/`
```
cpp/
├── Core/         engine core, frame, memory
├── Rendering/    Nanite/Lumen pipeline
├── Physics/      Chaos
├── World/        World Partition, streaming state
├── AI/           runtime hooks (bridge to Frontier Runtime)
├── Networking/   Unreal Replication
├── Animation/
├── Audio/        MetaSounds
├── Terrain/
└── Streaming/    massive world management
```
Responsibilities: frame performance, GPU communication, memory management,
physics simulation, real-time worlds, multiplayer synchronization.

### Unreal Engine position (Castle)
Flagship path. Unreal gives: Nanite, Lumen, World Partition, MetaSounds,
Chaos Physics, Mass Entity System. Frontier adds: autonomous AI worlds, agent
populations, persistent economies, security layer, simulation intelligence.

### Frontier Runtime (Intelligence)
- Agent Brain
- NPC Decision Systems
- Economy Simulation
- Faction Logic
- World Events

### Elitze Sentinel (Security)
Governance/compliance for all gaming layers.

### Cloud Platform (Empire)
Matchmaking, persistence, telemetry, player accounts, live operations.

## AI threading contract

LLMs run on AI worker threads, NEVER in the frame loop. The C++ game thread
enqueues `AgentRequest` and later executes the returned `AgentDecision`.

```
C++ NPC Controller
   -> Frontier Agent API      (worker thread)
   -> Qwen / Llama / Custom
   -> Decision Returned
   -> C++ Executes
```

Python reference impl: `frontier-gaming-studio/src/runtime/` (`AgentBrain`,
`NPCController`, `FactionLogic`, `EconomySimulation`, `WorldEvent`).
C++ bridge: `frontier-gaming-engine/cpp/Core/EngineLayer.h` (`AgentDecideFn`).
