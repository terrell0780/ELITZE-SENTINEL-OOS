// Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
// Frontier Gaming Engine — C++ Engine Layer (PRIMARY / Kingdom).
//
// This is the engine core. C++ owns frame performance, GPU comms, memory,
// physics (Chaos), world streaming (World Partition), and multiplayer
// synchronization (Unreal Replication). The Frontier AI Runtime calls into this
// via module hooks — it never runs LLMs on the game thread.

#pragma once
#include <string>
#include <vector>

namespace frontier::gaming {

// cpp/ module ownership (mirrors cpp/ folder):
//   Core, Rendering, Physics, World, AI, Networking,
//   Animation, Audio, Terrain, Streaming
struct EngineLayer {
    static constexpr char const* name = "C++ Engine Layer";
    static constexpr char const* role = "PRIMARY";
    static constexpr char const* flagship = "Unreal Engine 5";

    // Responsibilities owned by C++ (never by Python/LLM in the frame loop).
    static std::vector<std::string> const& owns() {
        static std::vector<std::string> const r{
            "Engine Core", "Frame Performance", "GPU Communication",
            "Memory Management", "Physics Simulation", "Real-time Worlds",
            "Multiplayer Synchronization"};
        return r;
    }
};

// Hook the Frontier AI Runtime calls from an AI worker thread.
// The game thread enqueues a request; the result is returned, NOT awaited inline.
struct AgentRequest {
    std::string agent_id;
    std::string situation;
};

struct AgentDecision {
    std::string action;
    double confidence = 0.0;
};

// Implemented by the Frontier Agent API binding (Python/C++ bridge).
// Must be invoked off the game thread.
using AgentDecideFn = AgentDecision(*)(AgentRequest const&);

}  // namespace frontier::gaming
