"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

const AGENT_TYPES = [
  { value: "security", label: "Security", model: "qwen/qwen3-235b" },
  { value: "coding", label: "Code & Development", model: "deepseek/deepseek-coder-v2" },
  { value: "research", label: "Data & Research", model: "qwen/qwen-2.5-72b-instruct" },
];

export default function StudioPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", type: "coding" });

  useEffect(() => {
    brain.find("agents").then(d => {
      if (d.data?.length) {
        setAgents(d.data);
        setSelectedId(d.data[0]._id);
      } else {
        const initial = [
          { _id: "ag-1", name: "Security Sentinel", type: "security", model: "qwen/qwen3-235b", status: "active", tasks: 0 },
          { _id: "ag-2", name: "Code Review Engine", type: "coding", model: "deepseek/deepseek-coder-v2", status: "active", tasks: 0 },
          { _id: "ag-3", name: "Research Analyst", type: "research", model: "qwen/qwen-2.5-72b-instruct", status: "idle", tasks: 0 },
        ];
        setAgents(initial);
        setSelectedId("ag-1");
      }
    });
  }, []);

  const selectedAgent = agents.find(a => a._id === selectedId);

  const buildAgent = () => {
    if (!newAgent.name.trim()) return;
    const typeObj = AGENT_TYPES.find(t => t.value === newAgent.type);
    const agent = {
      _id: `ag-${Date.now()}`,
      name: newAgent.name,
      type: newAgent.type,
      model: typeObj?.model || "qwen/qwen3-235b",
      status: "active",
      tasks: 0,
    };
    brain.insert("agents", agent);
    setAgents(prev => [agent, ...prev]);
    setSelectedId(agent._id);
    setShowBuildModal(false);
    setNewAgent({ name: "", type: "coding" });
  };

  return (
    <div className="flex h-full bg-[#09090B]">
      {/* Left Panel - Agent List */}
      <div className="w-72 border-r border-[#27272A] flex flex-col bg-[#111113]">
        <div className="h-14 px-5 border-b border-[#27272A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">Agents</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A] text-[#A1A1AA] font-mono">{agents.length}</span>
          </div>
          <button onClick={() => setShowBuildModal(true)} className="text-xs text-[#D92A2A] hover:text-white font-semibold transition-colors">
            + New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {agents.map(ag => {
            const isActive = ag._id === selectedId;
            return (
              <div
                key={ag._id}
                onClick={() => setSelectedId(ag._id)}
                className={`px-5 py-4 border-b border-[#27272A]/50 cursor-pointer transition-colors hover:bg-[#1A1A1D] ${
                  isActive ? "bg-[#09090B] border-l-2 border-l-[#D92A2A]" : "border-l-2 border-l-transparent"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white truncate">{ag.name}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${ag.status === "active" ? "bg-[#D92A2A]" : "bg-[#71717A]"}`} />
                </div>
                <div className="text-[10px] text-[#A1A1AA] font-mono truncate">{ag.model}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Workspace */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#09090B]">
        {selectedAgent ? (
          <>
            <div className="h-14 px-6 border-b border-[#27272A] flex items-center justify-between bg-[#111113] shrink-0">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-white">{selectedAgent.name}</h1>
                <span className="text-[#27272A]">|</span>
                <span className="text-xs text-[#A1A1AA] font-mono">{selectedAgent.model}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
                <div className={`w-2 h-2 rounded-full ${selectedAgent.status === "active" ? "bg-[#D92A2A]" : "bg-[#71717A]"}`} />
                <span>{selectedAgent.status === "active" ? "Active" : "Idle"}</span>
              </div>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <section>
                  <h3 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-3">Configuration</h3>
                  <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 space-y-5">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-2">Agent Name</label>
                      <input 
                        type="text" 
                        defaultValue={selectedAgent.name} 
                        className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#D92A2A]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-2">Model Selection</label>
                      <input 
                        type="text" 
                        readOnly 
                        value={selectedAgent.model} 
                        className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-4 py-2.5 text-xs text-[#A1A1AA] font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-2">System Prompt</label>
                      <textarea 
                        rows={4}
                        placeholder="Define agent behavior..."
                        className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-4 py-2.5 text-xs text-white placeholder-[#71717A] outline-none resize-none focus:border-[#D92A2A]/50 transition-colors"
                      ></textarea>
                    </div>
                  </div>
                </section>
                
                <section>
                  <h3 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-3">Activity</h3>
                  <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 flex items-center justify-center min-h-[140px]">
                    <span className="text-xs text-[#A1A1AA]">No tasks yet</span>
                  </div>
                </section>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-[#A1A1AA]">Select or create an agent</span>
          </div>
        )}
      </div>

      {/* Build Modal */}
      {showBuildModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs" onClick={() => setShowBuildModal(false)}>
          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-5">Create Agent</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-2">Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={e => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="e.g. Data Pipeline Optimizer"
                  autoFocus
                  className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-4 py-2.5 text-xs text-white placeholder-[#71717A] outline-none focus:border-[#D92A2A]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-2">Type</label>
                <select
                  value={newAgent.type}
                  onChange={e => setNewAgent({ ...newAgent, type: e.target.value })}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-[#D92A2A]/50 transition-colors"
                >
                  {AGENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowBuildModal(false)} className="px-4 py-2 text-xs text-[#A1A1AA] hover:text-white transition-colors">Cancel</button>
              <button onClick={buildAgent} className="px-4 py-2 bg-[#D92A2A] text-white text-xs font-semibold rounded-lg hover:bg-[#b82222] transition-colors">
                Deploy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}