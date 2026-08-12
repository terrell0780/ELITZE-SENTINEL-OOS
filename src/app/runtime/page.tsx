"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function RuntimePage() {
  const [tab, setTab] = useState<"tasks" | "workers" | "memory" | "models">("tasks");
  const [missions, setMissions] = useState<any[]>([]);
  const [modelStats, setModelStats] = useState<any[]>([]);

  useEffect(() => {
    brain.listMissions().then(d => { if (Array.isArray(d)) setMissions(d); });
    fetch(`${process.env.NEXT_PUBLIC_RUNTIME_API || "http://localhost:8052"}/v1/models`)
      .then(r => r.json()).then(d => { if (d.models) setModelStats(d.models); }).catch(() => {});
  }, []);

  const running = missions.filter((m: any) => m.status === "dispatching" || m.status === "running" || m.status === "executing");
  const completed = missions.filter((m: any) => m.status === "completed");

  return (
    <div className="h-full bg-[#09090B] overflow-y-auto flex flex-col">
      <header className="border-b border-[#27272A] bg-[#09090B] p-6 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <h1 className="text-lg font-semibold text-white">Frontier Runtime</h1>
        <div className="flex items-center gap-1.5 bg-[#111113] rounded-xl p-1 border border-[#27272A] text-xs">
          {(["tasks", "workers", "memory", "models"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                tab === t ? "bg-[#D92A2A] text-white" : "text-[#A1A1AA] hover:text-[#A1A1AA]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className="p-6 flex-1">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Active", value: running.length },
              { label: "Completed", value: completed.length },
              { label: "Total Missions", value: missions.length },
              { label: "Models", value: modelStats.length },
            ].map(s => (
              <div key={s.label} className="bg-[#111113] rounded-xl border border-[#27272A] p-5">
                <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-2">{s.label}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {tab === "tasks" && (
            <div className="space-y-4">
              {missions.length === 0 ? (
                <div className="text-center py-12 bg-[#111113] border border-[#27272A] rounded-xl p-6">
                  <p className="text-xs text-[#A1A1AA]">No missions yet. Send a message in chat.</p>
                </div>
              ) : (
                missions.map((m: any) => (
                  <div key={m.mission_id} className="bg-[#111113] border border-[#27272A] rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${m.status === "completed" ? "bg-[#D92A2A]" : m.status === "failed" ? "bg-[#A1A1AA]" : "bg-[#D92A2A] animate-pulse"}`} />
                        <span className="text-xs text-[#A1A1AA] font-medium">{m.goal?.slice(0, 60)}</span>
                      </div>
                      <span className="text-xs text-[#A1A1AA]">{m.subtasks?.length || 0} tasks</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-[#09090B] border border-[#27272A] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#D92A2A]" style={{ width: `${m.duration ? 100 : 30}%` }} />
                      </div>
                      <span className="text-xs text-[#A1A1AA] capitalize">{m.status}</span>
                      {m.duration && <span className="text-xs text-[#A1A1AA]">{m.duration.toFixed(1)}s</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "workers" && (
            <div className="bg-[#111113] rounded-xl border border-[#27272A] p-6 text-center space-y-2">
              <p className="text-sm text-[#A1A1AA]">{missions.length > 0 ? `${missions.length} mission(s) processed` : "Ready for tasks"}</p>
              <p className="text-xs text-[#A1A1AA]">Agent orchestrator manages 4 agent types</p>
            </div>
          )}

          {tab === "memory" && (
            <div className="bg-[#111113] rounded-xl border border-[#27272A] p-6 text-center space-y-2">
              <p className="text-sm text-[#A1A1AA]">STM → LTM → Vector memory active</p>
              <p className="text-xs text-[#A1A1AA]">Auto-promotes frequently accessed memories</p>
            </div>
          )}

          {tab === "models" && (
            <div className="space-y-4">
              {modelStats.map((m: any) => (
                <div key={m.model_id} className="bg-[#111113] border border-[#27272A] rounded-xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-white font-medium">{m.model_id}</p>
                    <p className="text-xs text-[#A1A1AA] mt-1">{m.provider} · {m.latency_p50_ms}ms</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-xl border ${m.available ? "bg-[#D92A2A]/10 text-[#D92A2A] border-[#D92A2A]/30" : "bg-[#09090B] text-[#A1A1AA] border-[#27272A]"}`}>
                    {m.available ? "Available" : "Unavailable"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}