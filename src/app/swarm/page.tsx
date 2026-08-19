"use client";
import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function SwarmPage() {
  const [dbStats, setDbStats] = useState<any>({});
  const [missionsList, setMissionsList] = useState<any[]>([]);

  useEffect(() => {
    brain.stats().then((d: any) => setDbStats(d || {}));
    brain.listMissions().then((d: any) => { if (Array.isArray(d)) setMissionsList(d); });
  }, []);

  const agents = [
    { name: "Alpha", role: "Coordinator", status: "active", tasks: 42 },
    { name: "Beta", role: "Analyzer", status: "active", tasks: 128 },
    { name: "Gamma", role: "Executor", status: "idle", tasks: 56 },
    { name: "Delta", role: "Researcher", status: "error", tasks: 14 },
  ];

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto">
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">
            S
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">AGENT SWARM</span>
            <span className="text-[9px] font-semibold text-[#0066FF]/70 uppercase tracking-widest">Coordination</span>
          </div>
        </div>
        <button className="bg-[#141418] border border-[#27272A] text-[#A1A1AA] hover:text-white text-[11px] font-semibold px-3 py-1.5 rounded-md">
          Deploy Agent
        </button>
      </header>

      <div className="p-6 max-w-6xl mx-auto w-full space-y-8">
        <section>
          <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Agent Fleet</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {agents.map(a => (
              <div key={a.name} className="bg-[#111115] border border-[#27272A] rounded-lg p-4 hover:bg-[#18181B] transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-[12px] font-bold text-white">{a.name}</h3>
                  <span className={`w-2 h-2 rounded-full ${a.status === 'active' ? 'bg-[#10B981]' : a.status === 'idle' ? 'bg-[#F97316]' : 'bg-[#EF4444]'}`}></span>
                </div>
                <p className="text-[11px] text-[#A1A1AA] mb-4">{a.role}</p>
                <div className="flex justify-between items-center border-t border-[#27272A] pt-3">
                  <span className="text-[10px] text-[#71717A] uppercase">Tasks</span>
                  <span className="text-[11px] font-mono text-white">{a.tasks}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Swarm Topology</h2>
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-8 flex items-center justify-center min-h-[200px]">
              <div className="flex items-center justify-center relative w-full h-full">
                <div className="w-12 h-12 rounded-full border-2 border-[#0066FF] flex items-center justify-center text-[10px] text-white z-10 bg-[#111115]">Alpha</div>
                <div className="absolute top-0 right-10 w-10 h-10 rounded-full border border-[#27272A] flex items-center justify-center text-[9px] text-[#A1A1AA] bg-[#141418]">Beta</div>
                <div className="absolute bottom-0 right-20 w-10 h-10 rounded-full border border-[#27272A] flex items-center justify-center text-[9px] text-[#A1A1AA] bg-[#141418]">Gamma</div>
                <div className="absolute bottom-4 left-10 w-10 h-10 rounded-full border border-[#27272A] flex items-center justify-center text-[9px] text-[#EF4444] bg-[#141418]">Delta</div>
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                  <line x1="50%" y1="50%" x2="70%" y2="20%" stroke="#27272A" strokeWidth="1" />
                  <line x1="50%" y1="50%" x2="70%" y2="80%" stroke="#27272A" strokeWidth="1" />
                  <line x1="50%" y1="50%" x2="30%" y2="70%" stroke="#27272A" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Real-time Coordination (Missions)</h2>
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-3 h-[200px] overflow-y-auto">
              {missionsList.length > 0 ? (
                missionsList.slice(0, 10).map((m, i) => (
                  <div key={i} className="text-[11px] font-mono">
                    <span className="text-[#0066FF] mr-2">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-[#A1A1AA]">Mission spawned:</span>
                    <span className="text-white ml-2">{m.id || "Unknown"}</span>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-[#71717A] text-center mt-8">No active missions in swarm.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
