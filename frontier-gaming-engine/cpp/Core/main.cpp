// Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.
// Frontier Gaming Engine — Core module entry. C++ owns the frame.
//
// NOTE: The AI Runtime is invoked on a worker thread only. Never call an LLM
// from GameThread / Tick. See EngineLayer.h (AgentDecideFn) for the bridge.

#include "Core/EngineLayer.h"
#include <iostream>

namespace frontier::gaming {

// Example: a C++ NPC controller asks the Frontier Agent API on a worker thread,
// then executes the returned decision on the game thread.
class NPCController {
public:
    explicit NPCController(AgentDecideFn decide) : decide_(decide) {}

    // Called from an AI worker thread (NOT the frame loop).
    AgentDecision RequestDecision(AgentRequest const& req) const {
        return decide_ ? decide_(req) : AgentDecision{};
    }

    // Called on the game thread once a decision is available.
    void Execute(AgentDecision const& d) const {
        std::cout << "[NPC] execute: " << d.action
                  << " (conf=" << d.confidence << ")\n";
    }

private:
    AgentDecideFn decide_ = nullptr;
};

}  // namespace frontier::gaming

int main() {
    using namespace frontier::gaming;
    std::cout << EngineLayer::name << " [" << EngineLayer::role
              << "] -> " << EngineLayer::flagship << "\n";
    return 0;
}
