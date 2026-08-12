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
      <header className="h-16 border-b border-[#27272A] flex items-center px-6 shrink-0 bg-[#09090B]">
        <h1 className="text-lg font-semibold text-white">Marketplace</h1>
        <div className="flex-1" />
        <button className="px-4 py-2 bg-[#D92A2A] text-white text-xs font-semibold rounded-lg hover:bg-[#D92A2A]/90 transition-colors">Publish</button>
      </header>
      <div className="flex gap-2 px-6 py-3 border-b border-[#27272A] overflow-x-auto bg-[#09090B]">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
              category === c
                ? "bg-[#111113] border border-[#27272A] text-white font-medium"
                : "text-[#A1A1AA] hover:text-[#A1A1AA]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-4">
          {filtered.map(item => (
            <div key={item.name} className="bg-[#111113] border border-[#27272A] rounded-xl p-5 hover:border-[#D92A2A]/40 transition-colors group flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest px-2 py-0.5 rounded bg-[#09090B] border border-[#27272A]">{item.type}</span>
                  <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">{item.category}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{item.name}</h3>
                <p className="text-xs text-[#A1A1AA] mb-4">{item.desc}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#27272A]/50">
                <div className="flex items-center gap-3 text-[10px] text-[#A1A1AA]">
                  <span>{item.rating} stars</span>
                  <span>{item.downloads} downloads</span>
                </div>
                <button className="px-3 py-1 bg-[#D92A2A]/10 border border-[#D92A2A]/30 text-xs font-medium text-[#D92A2A] rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-[#D92A2A]/20">Install</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}