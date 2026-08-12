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
      <header className="h-14 border-b border-[#27272A] flex items-center px-6 shrink-0 bg-[#09090B]">
        <h1 className="text-lg font-semibold text-white">Executive Intelligence</h1>
        <span className="text-xs text-[#A1A1AA] ml-3">{missions.length} missions</span>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {loading ? (
            <p className="text-xs text-[#A1A1AA] text-center py-12">Loading missions...</p>
          ) : missions.length === 0 ? (
            <div className="text-center py-12 bg-[#111113] border border-[#27272A] rounded-xl p-6">
              <p className="text-sm text-[#A1A1AA]">No missions yet</p>
              <p className="text-xs text-[#A1A1AA] mt-2">Submit a mission from the chat page.</p>
            </div>
          ) : (
            missions.map((m: any) => (
              <div key={m.mission_id} className="bg-[#111113] border border-[#27272A] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.status === "completed" ? "bg-[#D92A2A]" : "bg-[#71717A]"
                      }`}
                    />
                    <span className="text-sm font-semibold text-white">{m.goal}</span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      m.status === "completed"
                        ? "bg-[#D92A2A]/10 text-[#D92A2A] border-[#D92A2A]/30"
                        : "bg-[#09090B] text-[#A1A1AA] border-[#27272A]"
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
                        className="text-[10px] font-mono px-2 py-1 bg-[#09090B] border border-[#27272A] rounded text-[#A1A1AA]"
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-[10px] text-[#A1A1AA]">
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
