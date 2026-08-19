"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

interface Deal {
  _id?: string;
  title: string;
  company: string;
  value: number;
  stage: string;
  contact: string;
}

const STAGES = [
  { key: "lead", label: "Leads", color: "bg-[#71717A]" },
  { key: "qualified", label: "Qualified", color: "bg-[#A1A1AA]" },
  { key: "proposal", label: "Proposal", color: "bg-[#A1A1AA]" },
  { key: "negotiation", label: "Negotiation", color: "bg-[#0066FF]/70" },
  { key: "closed", label: "Closed Won", color: "bg-[#0066FF]" },
];

export default function SalesPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [view, setView] = useState<"kanban" | "list" | "contacts">("kanban");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brain.find("deals").then(d => {
      if (d.data?.length) setDeals(d.data);
      setLoading(false);
    });
  }, []);

  const totalPipeline = deals.reduce((s, d) => s + d.value, 0);

  const moveDeal = (id: string, newStage: string) => {
    brain.update("deals", { _id: id }, { stage: newStage });
    setDeals(prev => prev.map(d => (d._id === id || d.title === id) ? { ...d, stage: newStage } : d));
  };

  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      {/* Header */}
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">
      S
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-white tracking-tight">SALES</span>
      <span className="text-[9px] font-semibold text-[#0066FF]/70 uppercase tracking-widest">Pipeline & CRM</span>
    </div>
    <span className="text-[11px] text-[#A1A1AA] font-mono ml-3">${totalPipeline.toLocaleString()} total pipeline</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-1 bg-[#141418] rounded-md p-1 border border-[#27272A]">
      {(["kanban", "list", "contacts"] as const).map(v => (
        <button key={v}
          onClick={() => setView(v)}
          className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors ${view === v ? "bg-[#0066FF] text-white hover:opacity-90" : "text-[#A1A1AA] hover:text-white bg-[#141418]"}`}
        >{v.charAt(0).toUpperCase() + v.slice(1)}</button>
      ))}
    </div>
  </div>
</header>

      <div className="flex-1 overflow-y-auto p-6">
        {view === "kanban" && (
          <div className="flex gap-4 h-full min-h-[500px] overflow-x-auto">
            {STAGES.map(stage => {
              const stageDeals = deals.filter(d => d.stage === stage.key);
              const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0);
              return (
                <div key={stage.key} className="flex-1 min-w-[220px] bg-[#111115] border border-[#27272A] rounded-lg p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                      <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider">{stage.label}</span>
                    </div>
                    <span className="text-[10px] text-[#A1A1AA] font-mono">{stageDeals.length} · ${stageTotal.toLocaleString()}</span>
                  </div>
                  <div className="space-y-3 flex-1">
                    {stageDeals.map(deal => (
                      <div key={deal._id || deal.title}
                        className="bg-[#09090B] rounded-lg border border-[#27272A] p-4 hover:border-[#0066FF]/50 transition-all cursor-pointer group">
                        <p className="text-xs font-semibold text-white mb-1">{deal.title}</p>
                        <p className="text-[10px] text-[#A1A1AA]">{deal.company}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-[#0066FF] font-mono font-semibold">${deal.value.toLocaleString()}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {stage.key !== "lead" && (
                              <button onClick={() => moveDeal(deal.title, STAGES[STAGES.findIndex(s => s.key === stage.key) - 1].key)}
                                className="text-[11px] text-[#A1A1AA] hover:text-white px-1">←</button>
                            )}
                            {stage.key !== "closed" && (
                              <button onClick={() => moveDeal(deal.title, STAGES[STAGES.findIndex(s => s.key === stage.key) + 1].key)}
                                className="text-[11px] text-[#A1A1AA] hover:text-white px-1">→</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {view === "list" && (
          <div className="bg-[#111115] rounded-xl border border-[#27272A] overflow-hidden max-w-5xl mx-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272A] bg-[#111115]">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Deal</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Company</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Value</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]/50">
                {deals.map(deal => (
                  <tr key={deal._id || deal.title} className="hover:bg-[#18181B] transition-colors">
                    <td className="px-5 py-4 text-xs font-semibold text-white">{deal.title}</td>
                    <td className="px-5 py-4 text-[11px] text-[#A1A1AA]">{deal.company}</td>
                    <td className="px-5 py-4 text-[11px] text-[#A1A1AA]">{deal.contact}</td>
                    <td className="px-5 py-4 text-xs font-mono font-semibold text-[#0066FF]">${deal.value.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        deal.stage === "closed"
                          ? "bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/30"
                          : "bg-[#09090B] text-[#A1A1AA] border-[#27272A]"
                      }`}>{deal.stage}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {view === "contacts" && (
          <div className="bg-[#111115] border border-[#27272A] rounded-xl p-8 max-w-xl mx-auto text-center mt-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl border border-[#0066FF]/30 bg-[#0066FF]/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Contacts</h2>
            <p className="text-[11px] text-[#A1A1AA]">Contact management coming soon — sync with Salesforce, HubSpot, HighLevel.</p>
          </div>
        )}
      </div>
    </div>
  );
}