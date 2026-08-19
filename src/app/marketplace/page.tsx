"use client";

import { useState } from "react";

const LISTINGS = [
  { name: "Quote Responder", type: "Agent", downloads: 1234, rating: 4.8, category: "Sales", desc: "Generates personalized quotes from incoming sales emails" },
  { name: "Inventory Snapshot", type: "Agent", downloads: 892, rating: 4.6, category: "Operations", desc: "Cross-references suppliers every 4 hours" },
  { name: "SEO Brief Writer", type: "Agent", downloads: 2156, rating: 4.9, category: "Marketing", desc: "Drafts full SEO content briefs on keyword trigger" },
  { name: "Code Reviewer", type: "Agent", downloads: 3421, rating: 4.7, category: "Dev", desc: "Auto-review PRs for security, style, performance" },
  { name: "Sales Pitch Template", type: "Template", downloads: 567, rating: 4.5, category: "Sales", desc: "Enterprise SaaS pitch deck with ROI calculator" },
  { name: "Incident Response", type: "Workflow", downloads: 789, rating: 4.8, category: "Security", desc: "Automated incident detection and response pipeline" },
];

const CATEGORIES = ["All", "Sales", "Marketing", "Dev", "Security", "Operations"];

export default function MarketplacePage() {
  const [category, setCategory] = useState("All");
  const filtered = category === "All" ? LISTINGS : LISTINGS.filter(l => l.category === category);

  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">
            M
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">MARKETPLACE</span>
            <span className="text-[9px] font-semibold text-[#0066FF]/70 uppercase tracking-widest">Extensions</span>
          </div>
        </div>
        <button className="bg-[#0066FF] text-white hover:opacity-90 text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors">Publish</button>
      </header>
      <div className="flex gap-2 px-5 py-3 border-b border-[#27272A] overflow-x-auto bg-[#09090B]">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 text-[11px] font-semibold rounded-[4px] whitespace-nowrap transition-colors ${
              category === c
                ? "bg-[#141418] border border-[#27272A] text-white"
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-4">
          {filtered.map(item => (
            <div key={item.name} className="bg-[#111115] border border-[#27272A] rounded-lg p-4 hover:border-[#0066FF]/40 transition-colors group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest px-2 py-0.5 rounded-sm bg-[#141418] border border-[#27272A]">{item.type}</span>
                  <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">{item.category}</span>
                </div>
                <h3 className="text-[12px] font-semibold text-white mb-1">{item.name}</h3>
                <p className="text-[11px] text-[#A1A1AA] mb-4">{item.desc}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#27272A]/50">
                <div className="flex items-center gap-3 text-[11px] text-[#A1A1AA] font-mono">
                  <span>{item.rating} stars</span>
                  <span>{item.downloads} downloads</span>
                </div>
                <button className="px-3 py-1.5 bg-[#0066FF]/10 border border-[#0066FF]/30 text-[11px] font-semibold text-[#0066FF] rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-[#0066FF]/20">Install</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}