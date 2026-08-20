"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function StudioPage() {
  const [agents, setAgents] = useState<any[]>([
    { id: "director", name: "Director Agent", model: "qwen/qwen3-235b", tools: ["SwarmOrchestrator", "TaskPlanner"], memory: "Vector (Chroma)", permissions: "Full Execution", status: "Active" },
    { id: "security", name: "Security Sentinel", model: "deepseek/deepseek-r1", tools: ["CVEIntelligence", "PatchEngine"], memory: "Persistent Log", permissions: "SecOps Lead", status: "Active" },
    { id: "builder", name: "Builder Agent", model: "deepseek/deepseek-coder-v2", tools: ["CodeInterpreter", "DockerSandbox"], memory: "Repository AST", permissions: "Write Access", status: "Active" },
    { id: "research", name: "Research Agent", model: "qwen/qwen-2.5-72b", tools: ["WebSearch", "DocumentScraper"], memory: "STM Cache", permissions: "Read Only", status: "Idle" },
  ]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("director");
  const [activeBottomTab, setActiveBottomTab] = useState<string>("Events");

  useEffect(() => {
    brain.find("agents").then((d) => {
      if (d.data?.length) {
        setAgents((prev) => [...d.data, ...prev]);
      }
    });
  }, []);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId || a._id === selectedAgentId) || agents[0];

  return (
    <div className="h-full bg-[#08090c] text-[#f5f7fa] flex flex-col font-sans overflow-hidden select-none">
      
      {/* ── Header ── */}
      <header className="h-[52px] border-b border-[#ffffff14] bg-[#0d0f13] px-4 flex items-center justify-between shrink-0 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#f5f7fa]">AGENT STUDIO</span>
          <span className="text-[#687180] text-[10px]">| Multi-Agent Graph Visualizer</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded bg-[#11141a] hover:bg-[#161a21] border border-[#ffffff14] text-xs font-semibold text-[#a7adb8] hover:text-white transition-colors">
            Run
          </button>
          <button className="px-3 py-1 rounded bg-[#11141a] hover:bg-[#161a21] border border-[#ffffff14] text-xs font-semibold text-[#a7adb8] hover:text-white transition-colors">
            Save
          </button>
          <button className="px-3 py-1 rounded bg-[#1677ff] hover:bg-[#1677ff]/90 text-xs font-bold text-white transition-colors shadow-sm">
            Deploy
          </button>
        </div>
      </header>

      {/* ── Main Workspace 3-Pane Layout ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* Left: AGENTS LIST */}
        <aside className="w-[200px] border-r border-[#ffffff14] bg-[#0d0f13] flex flex-col shrink-0 overflow-y-auto p-3 space-y-3">
          <span className="text-[9px] font-mono font-bold text-[#687180] uppercase tracking-widest block">AGENTS</span>
          <div className="space-y-1">
            {agents.map((ag) => {
              const active = (ag.id || ag._id) === selectedAgentId;
              return (
                <button
                  key={ag.id || ag._id}
                  onClick={() => setSelectedAgentId(ag.id || ag._id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors font-medium ${
                    active
                      ? "bg-[#1677ff]/15 text-[#1677ff] font-semibold border-l-2 border-[#1677ff]"
                      : "text-[#a7adb8] hover:bg-[#161a21] hover:text-[#f5f7fa]"
                  }`}
                >
                  <p className="truncate">{ag.name}</p>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center: AGENT CANVAS (nodes / edges) */}
        <main className="flex-1 bg-[#08090c] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />

          {/* Simulated Node Edge Graph Canvas */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="p-3 bg-[#11141a] border border-[#1677ff] rounded-lg text-center shadow-lg font-mono text-xs space-y-1">
              <span className="text-[10px] text-[#1677ff] font-bold uppercase">Root Node</span>
              <p className="font-bold text-[#f5f7fa]">{selectedAgent.name}</p>
              <p className="text-[10px] text-[#687180]">{selectedAgent.model}</p>
            </div>

            <div className="w-0.5 h-8 bg-[#1677ff]/50" />

            <div className="flex items-center gap-4 font-mono text-xs">
              <div className="p-2.5 bg-[#0d0f13] border border-[#ffffff14] rounded-md text-center text-[11px] text-[#a7adb8]">
                Tool: {selectedAgent.tools?.[0] || "CodeInterpreter"}
              </div>
              <div className="p-2.5 bg-[#0d0f13] border border-[#ffffff14] rounded-md text-center text-[11px] text-[#a7adb8]">
                Tool: {selectedAgent.tools?.[1] || "DockerSandbox"}
              </div>
            </div>
          </div>
        </main>

        {/* Right: CONFIGURATION */}
        <aside className="w-[240px] border-l border-[#ffffff14] bg-[#0d0f13] flex flex-col shrink-0 p-3 space-y-4 overflow-y-auto font-mono text-xs">
          <span className="text-[9px] font-bold text-[#687180] uppercase tracking-widest block">CONFIGURATION</span>
          
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-[#687180] uppercase block">Model</span>
              <p className="font-bold text-[#f5f7fa] mt-0.5">{selectedAgent.model || "qwen/qwen3-235b"}</p>
            </div>

            <div className="pt-2 border-t border-[#ffffff0f] space-y-1">
              <span className="text-[10px] text-[#687180] uppercase block">Tools Enabled</span>
              <div className="space-y-1">
                {(selectedAgent.tools || ["WebSearch", "CodeInterpreter"]).map((t: string) => (
                  <div key={t} className="bg-[#11141a] px-2 py-1 rounded border border-[#ffffff0f] text-[10px] text-[#a7adb8]">
                    {t}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#ffffff0f]">
              <span className="text-[10px] text-[#687180] uppercase block">Memory Architecture</span>
              <p className="text-[11px] text-[#f5f7fa] mt-0.5">{selectedAgent.memory || "Vector (Chroma)"}</p>
            </div>

            <div className="pt-2 border-t border-[#ffffff0f]">
              <span className="text-[10px] text-[#687180] uppercase block">Permissions</span>
              <p className="text-[11px] text-[#10b981] font-semibold mt-0.5">{selectedAgent.permissions || "Full Execution"}</p>
            </div>

            <div className="pt-2 border-t border-[#ffffff0f]">
              <span className="text-[10px] text-[#687180] uppercase block">Runtime State</span>
              <p className="text-[11px] text-[#38bdf8] mt-0.5">{selectedAgent.status || "Active"}</p>
            </div>
          </div>
        </aside>

      </div>

      {/* ── Bottom Dock ── */}
      <footer className="h-9 border-t border-[#ffffff14] bg-[#0d0f13] px-3 flex items-center justify-between shrink-0 font-mono text-[10px]">
        <div className="flex items-center gap-1">
          {["Events", "Logs", "Runs", "Output"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveBottomTab(tab)}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeBottomTab === tab
                  ? "bg-[#161a21] text-[#f5f7fa] font-bold"
                  : "text-[#687180] hover:text-[#a7adb8]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="text-[#687180]">
          Swarm Orchestrator v2.4.0
        </div>
      </footer>

    </div>
  );
}