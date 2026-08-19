"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function IntelligencePage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brain.listMissions().then((d) => {
      setMissions(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">
            I
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">INTELLIGENCE</span>
            <span className="text-[9px] font-semibold text-[#0066FF]/70 uppercase tracking-widest">Mission History</span>
          </div>
        </div>
        <span className="text-[11px] text-[#A1A1AA] font-mono">{missions.length} missions</span>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {loading ? (
            <p className="text-[11px] text-[#A1A1AA] text-center py-12">Loading missions...</p>
          ) : missions.length === 0 ? (
            <div className="text-center py-12 bg-[#111115] border border-[#27272A] rounded-lg p-6">
              <p className="text-[12px] font-semibold text-white">No missions yet</p>
              <p className="text-[11px] text-[#71717A] mt-1">Submit a mission from the chat page.</p>
            </div>
          ) : (
            missions.map((m: any) => (
              <div key={m.mission_id} className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.status === "completed" ? "bg-[#0066FF]" : "bg-[#71717A]"
                      }`}
                    />
                    <span className="text-[12px] font-semibold text-white">{m.goal}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                      m.status === "completed"
                        ? "bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/30"
                        : "bg-[#141418] text-[#A1A1AA] border-[#27272A]"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                {m.plan?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {m.plan.map((step: string, i: number) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono px-2 py-1 bg-[#141418] border border-[#27272A] rounded-md text-[#A1A1AA]"
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-[11px] text-[#A1A1AA]">
                  <span>{m.subtasks?.length || 0} subtasks</span>
                  {m.duration && <span>{m.duration.toFixed(2)}s</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
