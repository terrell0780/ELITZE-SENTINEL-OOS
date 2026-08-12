"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function SecurityPage() {
  const [stats, setStats] = useState({ users: 0, missions: 0 });
  useEffect(() => {
    brain.stats().then((d: any) => setStats(s => ({ ...s, ...d })));
    brain.find("users").then((d: any) => setStats(s => ({ ...s, users: d.data?.length || 0 })));
    brain.listMissions().then((d: any) => setStats(s => ({ ...s, missions: Array.isArray(d) ? d.length : 0 })));
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      <header className="h-14 border-b border-[#27272A] flex items-center px-6 shrink-0 bg-[#09090B]">
        <h1 className="text-lg font-semibold text-white">Elitze Sentinel</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Users", value: stats.users },
              { label: "Missions", value: stats.missions },
              { label: "Collections", value: Object.keys(stats).filter(k => !["users", "missions"].includes(k)).length },
              { label: "Status", value: "Secure" },
            ].map(s => (
              <div key={s.label} className="bg-[#111113] border border-[#27272A] rounded-xl p-5">
                <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-2xl font-semibold text-white">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6">
            <h2 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-4">Guardrails Active</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {["Prompt Injection Detection", "PII Redaction", "Rate Limiting", "Policy Enforcement", "Output Validation", "Input Sanitization"].map(g => (
                <div key={g} className="flex items-center gap-3 text-xs text-[#A1A1AA] bg-[#09090B] border border-[#27272A] rounded-lg p-4">
                  <span className="w-2 h-2 rounded-full bg-[#D92A2A]" />
                  <span>{g}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-[#71717A] text-center font-mono uppercase tracking-widest">All requests pass through Sentinel before reaching the brain.</p>
        </div>
      </div>
    </div>
  );
}
