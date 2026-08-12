"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function Page() {
  const [dbStats, setDbStats] = useState<any>({});
  const [missions, setMissions] = useState(0);
  const title = "Enterprise";

  useEffect(() => {
    brain.stats().then((d: any) => setDbStats(d || {}));
    brain.listMissions().then((d: any) => { if (Array.isArray(d)) setMissions(d.length); });
  }, []);

  const statItems = [
    { label: "Collections", value: Object.keys(dbStats).length },
    { label: "Missions", value: missions },
    { label: "Records", value: Object.values(dbStats).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0) },
    { label: "Status", value: "Online" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      <header className="h-16 border-b border-[#27272A] flex items-center px-6 shrink-0 bg-[#09090B]">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statItems.map((s: any) => (
              <div key={s.label} className="bg-[#111113] border border-[#27272A] rounded-xl p-5 flex flex-col">
                <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-1">{s.label}</span>
                <span className="text-xl font-semibold text-white">{s.value}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 text-center">
            <p className="text-sm text-[#A1A1AA]">System operational — connected to brain API</p>
            <p className="text-xs text-[#A1A1AA] mt-2">Active collections: {Object.keys(dbStats).join(", ") || "none"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
