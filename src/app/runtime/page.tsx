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
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">
            R
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">RUNTIME</span>
            <span className="text-[9px] font-semibold text-[#0066FF]/70 uppercase tracking-widest">Execution Monitor</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#141418] rounded-md p-1 border border-[#27272A]">
          {(["tasks", "workers", "memory", "models"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-[4px] capitalize text-[11px] font-semibold transition-all ${
                tab === t ? "bg-[#18181B] text-white shadow-sm" : "text-[#A1A1AA] hover:text-white"
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
              <div key={s.label} className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
                <p className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-2">{s.label}</p>
                <p className="text-xl font-bold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {tab === "tasks" && (
            <div className="space-y-4">
              {missions.length === 0 ? (
                <div className="text-center py-12 bg-[#111115] border border-[#27272A] rounded-lg p-6">
                  <p className="text-[11px] text-[#A1A1AA]">No missions yet. Send a message in chat.</p>
                </div>
              ) : (
                missions.map((m: any) => (
                  <div key={m.mission_id} className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${m.status === "completed" ? "bg-[#0066FF]" : m.status === "failed" ? "bg-[#71717A]" : "bg-[#0066FF] animate-pulse"}`} />
                        <span className="text-[11px] text-[#A1A1AA] font-mono">{m.goal?.slice(0, 60)}</span>
                      </div>
                      <span className="text-[11px] text-[#A1A1AA] font-mono">{m.subtasks?.length || 0} tasks</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-[#09090B] border border-[#27272A] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#0066FF]" style={{ width: `${m.duration ? 100 : 30}%` }} />
                      </div>
                      <span className="text-[11px] text-[#A1A1AA] capitalize font-mono">{m.status}</span>
                      {m.duration && <span className="text-[11px] text-[#A1A1AA] font-mono">{m.duration.toFixed(1)}s</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "workers" && (
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 text-center space-y-2">
              <p className="text-[12px] font-semibold text-white">{missions.length > 0 ? `${missions.length} mission(s) processed` : "Ready for tasks"}</p>
              <p className="text-[11px] text-[#71717A]">Agent orchestrator manages 4 agent types</p>
            </div>
          )}

          {tab === "memory" && (
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 text-center space-y-2">
              <p className="text-[12px] font-semibold text-white">STM → LTM → Vector memory active</p>
              <p className="text-[11px] text-[#71717A]">Auto-promotes frequently accessed memories</p>
            </div>
          )}

          {tab === "models" && (
            <div className="space-y-4">
              {modelStats.map((m: any) => (
                <div key={m.model_id} className="bg-[#111115] border border-[#27272A] rounded-lg p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold text-white">{m.model_id}</p>
                    <p className="text-[11px] text-[#71717A] mt-1">{m.provider} · {m.latency_p50_ms}ms</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-3 py-1 rounded-md border ${m.available ? "bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/30" : "bg-[#141418] text-[#A1A1AA] border-[#27272A]"}`}>
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