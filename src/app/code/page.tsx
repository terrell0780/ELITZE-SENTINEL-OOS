"use client";

import { useState } from "react";
import { brain } from "@/lib/brain";

export default function CodePage() {
  const [activeRepo, setActiveRepo] = useState("elitze-sentinel-frontier-os");
  const [activeBranch, setActiveBranch] = useState("main");
  const [activeTab, setActiveTab] = useState<"editor" | "prs" | "review">("editor");

  const repos = ["elitze-sentinel-frontier-os", "frontier-runtime", "frontier-console", "elitze-sentinel"];
  const branches = ["main", "develop", "feature/sovereign-ai"];

  return (
    <div className="h-full bg-[#09090B] overflow-y-auto flex flex-col select-none">
      {/* Top Compact Option Header */}
      <header className="border-b border-[#27272A] bg-[#09090B] p-6 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-lg font-semibold text-white">Frontier Code</h1>
          
          <select
            value={activeRepo}
            onChange={e => setActiveRepo(e.target.value)}
            className="bg-[#111113] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] font-mono outline-none focus:border-[#D92A2A] transition-colors"
          >
            {repos.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={activeBranch}
            onChange={e => setActiveBranch(e.target.value)}
            className="bg-[#111113] border border-[#27272A] rounded-xl px-3 py-1.5 text-xs text-[#A1A1AA] font-mono outline-none focus:border-[#D92A2A] transition-colors"
          >
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {/* Mode Pills */}
        <div className="flex items-center gap-1.5 bg-[#111113] border border-[#27272A] rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "editor" ? "bg-[#D92A2A] text-white" : "text-[#A1A1AA] hover:text-[#A1A1AA]"
            }`}
          >
            Editor Monitor
          </button>
          <button
            onClick={() => setActiveTab("prs")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "prs" ? "bg-[#D92A2A] text-white" : "text-[#A1A1AA] hover:text-[#A1A1AA]"
            }`}
          >
            Pull Requests (2)
          </button>
          <button
            onClick={() => setActiveTab("review")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === "review" ? "bg-[#D92A2A] text-white" : "text-[#A1A1AA] hover:text-[#A1A1AA]"
            }`}
          >
            AI Review Mesh
          </button>
        </div>
      </header>

      {/* Main Split Code Monitor Canvas */}
      <div className="p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left File Tree Panel */}
        <aside className="lg:col-span-3 bg-[#111113] border border-[#27272A] rounded-xl p-5 flex flex-col gap-4">
          <h2 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">
            Explorer — {activeRepo}
          </h2>
          <div className="space-y-1 font-mono text-xs">
            <div className="text-white font-medium px-3 py-2 bg-[#09090B] rounded-lg border border-[#27272A]">src/main.py</div>
            <div className="text-[#A1A1AA] hover:text-[#A1A1AA] px-3 py-2 cursor-pointer transition-colors">src/auth.py</div>
            <div className="text-[#A1A1AA] hover:text-[#A1A1AA] px-3 py-2 cursor-pointer transition-colors">src/database.py</div>
            <div className="text-[#A1A1AA] hover:text-[#A1A1AA] px-3 py-2 cursor-pointer transition-colors">tests/test_auth.py</div>
            <div className="text-[#A1A1AA] hover:text-[#A1A1AA] px-3 py-2 cursor-pointer transition-colors">Dockerfile</div>
            <div className="text-[#A1A1AA] hover:text-[#A1A1AA] px-3 py-2 cursor-pointer transition-colors">pyproject.toml</div>
          </div>
        </aside>

        {/* Main Full-Height Code Viewer Canvas */}
        <main className="lg:col-span-6 bg-[#111113] border border-[#27272A] rounded-xl p-6 flex flex-col gap-4 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3 text-xs">
            <span className="text-white font-mono font-medium">src/main.py</span>
            <span className="text-[#D92A2A] font-medium tracking-wide">READ-ONLY • SYNCHRONIZED</span>
          </div>

          <div className="flex-1 font-mono text-xs text-[#A1A1AA] leading-relaxed select-text space-y-1">
            <p className="text-[#71717A]"># Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.</p>
            <p className="text-[#A1A1AA]">from fastapi import FastAPI, HTTPException</p>
            <p className="text-[#A1A1AA]">from pydantic import BaseModel</p>
            <br />
            <p className="text-white font-semibold">app = FastAPI(title="Frontier Runtime", version="1.0.0")</p>
            <br />
            <p className="text-[#A1A1AA]">@app.get("/health")</p>
            <p className="text-[#D92A2A]">async def health():</p>
            <p className="text-[#A1A1AA] pl-4">return {"{"}"status": "healthy", "domain": "elitze.org"{"}"}</p>
          </div>
        </main>

        {/* Right Telemetry / Review Monitor Panel */}
        <aside className="lg:col-span-3 bg-[#111113] border border-[#27272A] rounded-xl p-5 flex flex-col gap-4 font-mono text-xs">
          <h2 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">Static Analysis</h2>
          <div className="p-4 bg-[#09090B] border border-[#27272A] rounded-xl space-y-3">
            <div className="flex justify-between text-[#A1A1AA]"><span>Pytest Suite</span><span className="text-[#D92A2A] font-semibold">195/195</span></div>
            <div className="flex justify-between text-[#A1A1AA]"><span>Type Errors</span><span className="text-[#D92A2A] font-semibold">0 Errors</span></div>
            <div className="flex justify-between text-[#A1A1AA]"><span>Security Scan</span><span className="text-[#D92A2A] font-semibold">PASSED</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
