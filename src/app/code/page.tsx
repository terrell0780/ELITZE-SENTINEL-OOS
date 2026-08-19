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
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">
            C
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">SOURCE CODE</span>
            <span className="text-[9px] font-semibold text-[#0066FF]/70 uppercase tracking-widest">Review & Analysis</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={activeRepo}
            onChange={e => setActiveRepo(e.target.value)}
            className="bg-[#141418] border border-[#27272A] rounded-md px-3 py-1.5 text-[11px] text-[#A1A1AA] font-mono outline-none focus:border-[#0066FF] transition-colors"
          >
            {repos.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={activeBranch}
            onChange={e => setActiveBranch(e.target.value)}
            className="bg-[#141418] border border-[#27272A] rounded-md px-3 py-1.5 text-[11px] text-[#A1A1AA] font-mono outline-none focus:border-[#0066FF] transition-colors"
          >
            {branches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <div className="flex items-center gap-1 bg-[#141418] border border-[#27272A] rounded-md p-1">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1 rounded-[4px] text-[11px] font-semibold transition-all ${
                activeTab === "editor" ? "bg-[#18181B] text-white shadow-sm" : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              Editor Monitor
            </button>
            <button
              onClick={() => setActiveTab("prs")}
              className={`px-3 py-1 rounded-[4px] text-[11px] font-semibold transition-all ${
                activeTab === "prs" ? "bg-[#18181B] text-white shadow-sm" : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              Pull Requests (2)
            </button>
            <button
              onClick={() => setActiveTab("review")}
              className={`px-3 py-1 rounded-[4px] text-[11px] font-semibold transition-all ${
                activeTab === "review" ? "bg-[#18181B] text-white shadow-sm" : "text-[#A1A1AA] hover:text-white"
              }`}
            >
              AI Review Mesh
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Code Monitor Canvas */}
      <div className="p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left File Tree Panel */}
        <aside className="lg:col-span-3 bg-[#111115] border border-[#27272A] rounded-lg p-4 flex flex-col gap-4">
          <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">
            Explorer — {activeRepo}
          </h2>
          <div className="space-y-1 font-mono text-[11px]">
            <div className="text-white font-medium px-3 py-2 bg-[#18181B] rounded-md border border-[#27272A]">src/main.py</div>
            <div className="text-[#A1A1AA] hover:bg-[#18181B] hover:text-white px-3 py-2 rounded-md cursor-pointer transition-colors">src/auth.py</div>
            <div className="text-[#A1A1AA] hover:bg-[#18181B] hover:text-white px-3 py-2 rounded-md cursor-pointer transition-colors">src/database.py</div>
            <div className="text-[#A1A1AA] hover:bg-[#18181B] hover:text-white px-3 py-2 rounded-md cursor-pointer transition-colors">tests/test_auth.py</div>
            <div className="text-[#A1A1AA] hover:bg-[#18181B] hover:text-white px-3 py-2 rounded-md cursor-pointer transition-colors">Dockerfile</div>
            <div className="text-[#A1A1AA] hover:bg-[#18181B] hover:text-white px-3 py-2 rounded-md cursor-pointer transition-colors">pyproject.toml</div>
          </div>
        </aside>

        {/* Main Full-Height Code Viewer Canvas */}
        <main className="lg:col-span-6 bg-[#111115] border border-[#27272A] rounded-lg p-4 flex flex-col gap-4 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <span className="text-[12px] text-white font-mono font-semibold">src/main.py</span>
            <span className="text-[11px] text-[#0066FF] font-medium tracking-wide uppercase">Read-Only • Synchronized</span>
          </div>

          <div className="flex-1 font-mono text-[11px] text-[#A1A1AA] leading-relaxed select-text space-y-1">
            <p className="text-[#71717A]"># Copyright (c) 2026 Terrell Hall / TrueElitze Digital. All rights reserved.</p>
            <p className="text-[#A1A1AA]">from fastapi import FastAPI, HTTPException</p>
            <p className="text-[#A1A1AA]">from pydantic import BaseModel</p>
            <br />
            <p className="text-white font-semibold">app = FastAPI(title="Frontier Runtime", version="1.0.0")</p>
            <br />
            <p className="text-[#A1A1AA]">@app.get("/health")</p>
            <p className="text-[#0066FF]">async def health():</p>
            <p className="text-[#A1A1AA] pl-4">return {"{"}"status": "healthy", "domain": "elitze.org"{"}"}</p>
          </div>
        </main>

        {/* Right Telemetry / Review Monitor Panel */}
        <aside className="lg:col-span-3 bg-[#111115] border border-[#27272A] rounded-lg p-4 flex flex-col gap-4 font-mono">
          <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Static Analysis</h2>
          <div className="p-4 bg-[#141418] border border-[#27272A] rounded-md space-y-3">
            <div className="flex justify-between text-[11px] text-[#A1A1AA]"><span>Pytest Suite</span><span className="text-[#0066FF] font-semibold">195/195</span></div>
            <div className="flex justify-between text-[11px] text-[#A1A1AA]"><span>Type Errors</span><span className="text-[#0066FF] font-semibold">0 Errors</span></div>
            <div className="flex justify-between text-[11px] text-[#A1A1AA]"><span>Security Scan</span><span className="text-[#0066FF] font-semibold">PASSED</span></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
