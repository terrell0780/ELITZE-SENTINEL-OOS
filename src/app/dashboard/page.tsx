"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Terrell Hall");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("frontier-user");
      if (stored) setUserName(JSON.parse(stored).name || "Terrell Hall");
    } catch {}
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("frontier_authenticated");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#F8FAFC] flex flex-col font-sans select-none relative overflow-hidden">
      
      {/* Top Navigation Header (Exact Match to Mockup 2 Header) */}
      <header className="h-16 border-b border-[#27272A] bg-[#09090B]/80 backdrop-blur-md flex items-center justify-between px-8 max-w-7xl w-full mx-auto relative z-10 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/dashboard")}>
          <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center font-extrabold text-white text-sm shadow-md shadow-[#0066FF]/30">
            E
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Elitze Sentinel</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#94A3B8]">
          <Link href="/dashboard" className="text-white font-semibold border-b-2 border-[#0066FF] pb-4 pt-4">Dashboard</Link>
          <Link href="/chat" className="hover:text-white transition-colors">Frontier Chat</Link>
          <Link href="/swarm" className="hover:text-white transition-colors">Agents</Link>
          <Link href="/studio" className="hover:text-white transition-colors">Studio</Link>
          <Link href="/intelligence" className="hover:text-white transition-colors">Knowledge</Link>
          <Link href="/security" className="hover:text-white transition-colors">SecOps</Link>
          <Link href="/workflows" className="hover:text-white transition-colors">Workflows</Link>
          <Link href="/settings" className="hover:text-white transition-colors">Settings</Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-xs font-bold shadow-sm">
              TH
            </div>
            <span className="text-xs font-medium text-white hidden sm:block">{userName}</span>
          </div>

          <button
            onClick={handleSignOut}
            className="text-xs font-semibold text-[#94A3B8] hover:text-white px-3 py-1.5 rounded-lg border border-[#27272A] hover:bg-[#18181B] transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Dashboard Content Area (Exact Match to Mockup 2 Layout) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8 relative z-10 overflow-y-auto">
        
        {/* Top Header Title & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
            <p className="text-xs text-[#94A3B8] mt-1">Real-time system metrics, kernel activity, and agent workflows</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/chat")}
              className="px-4 py-2 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold text-xs shadow-md shadow-[#0066FF]/25 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Launch Agent Workflow</span>
            </button>
          </div>
        </div>

        {/* ── TOP METRIC CARDS ROW (4 Cards Across - Exact Match to Mockup 2) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-[#111115] border border-[#27272A] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] font-medium mb-3">
              <span>Total Value / Revenue</span>
              <span className="text-[#10B981] font-semibold bg-[#10B981]/10 px-2 py-0.5 rounded-full">+14.2%</span>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-white">$12,450.00</p>
            <p className="text-[11px] text-[#64748B] mt-2 font-normal">Compared to last period</p>
          </div>

          <div className="bg-[#111115] border border-[#27272A] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] font-medium mb-3">
              <span>Active Agent Workflows</span>
              <span className="text-[#10B981] font-semibold bg-[#10B981]/10 px-2 py-0.5 rounded-full">+8.4%</span>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-white">1,280</p>
            <p className="text-[11px] text-[#64748B] mt-2 font-normal">Running across 6 microservices</p>
          </div>

          <div className="bg-[#111115] border border-[#27272A] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] font-medium mb-3">
              <span>Kernel Uptime</span>
              <span className="text-[#38BDF8] font-semibold bg-[#38BDF8]/10 px-2 py-0.5 rounded-full">0 Failures</span>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-white">99.98%</p>
            <p className="text-[11px] text-[#64748B] mt-2 font-normal">16-Plane OS Kernel active</p>
          </div>

          <div className="bg-[#111115] border border-[#27272A] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-xs text-[#94A3B8] font-medium mb-3">
              <span>Response Latency</span>
              <span className="text-[#0066FF] font-semibold bg-[#0066FF]/10 px-2 py-0.5 rounded-full">Optimized</span>
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-white">0.01s</p>
            <p className="text-[11px] text-[#64748B] mt-2 font-normal">FastAPI Redis execution mesh</p>
          </div>

        </div>

        {/* ── MAIN DASHBOARD ANALYTICS GRID (Exact Match to Mockup 2) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Card (Left 2 Columns) */}
          <div className="lg:col-span-2 bg-[#111115] border border-[#27272A] rounded-2xl p-6 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div>
                <h2 className="text-base font-bold text-white">Real-Time Execution Analytics</h2>
                <p className="text-xs text-[#94A3B8]">Agent process operations and system throughput</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF]" />
                <span>Active Throughput</span>
              </div>
            </div>

            {/* SVG Visual Graph (Exact Match to Mockup 2 Analytics Chart) */}
            <div className="h-64 w-full bg-[#09090B] rounded-xl border border-[#27272A] p-4 flex flex-col justify-between relative overflow-hidden">
              
              {/* Subtle Grid Lines */}
              <div className="absolute inset-0 grid grid-rows-4 divide-y divide-[#27272A]/40 pointer-events-none" />

              {/* Line Graph SVG */}
              <svg className="w-full h-full relative z-10" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066FF" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0066FF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0,120 Q 50,40 100,70 T 200,30 T 300,90 T 400,20 T 500,50 L 500,150 L 0,150 Z"
                  fill="url(#gradient)"
                />
                <path
                  d="M 0,120 Q 50,40 100,70 T 200,30 T 300,90 T 400,20 T 500,50"
                  fill="none"
                  stroke="#0066FF"
                  strokeWidth="3"
                />
              </svg>

              <div className="flex justify-between text-[11px] text-[#64748B] pt-2 relative z-10">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
              </div>
            </div>

            {/* Quick Status Sub-grid */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-[#09090B] border border-[#27272A] rounded-xl">
                <span className="text-[11px] text-[#64748B] block">Pytest Status</span>
                <span className="text-xs font-bold text-[#10B981]">311 / 311 PASSED</span>
              </div>
              <div className="p-3 bg-[#09090B] border border-[#27272A] rounded-xl">
                <span className="text-[11px] text-[#64748B] block">App Router</span>
                <span className="text-xs font-bold text-[#38BDF8]">43 Routes Active</span>
              </div>
              <div className="p-3 bg-[#09090B] border border-[#27272A] rounded-xl">
                <span className="text-[11px] text-[#64748B] block">Data Sovereignty</span>
                <span className="text-xs font-bold text-white">100% Enforced</span>
              </div>
            </div>

          </div>

          {/* Right Column Feed (Exact Match to Mockup 2 Right Column) */}
          <div className="bg-[#111115] border border-[#27272A] rounded-2xl p-6 shadow-lg space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#27272A] pb-4 mb-4">
                <h2 className="text-base font-bold text-white">Live Kernel Audit Feed</h2>
                <span className="text-[10px] bg-[#0066FF]/20 text-[#38BDF8] px-2 py-0.5 rounded-full font-bold uppercase">Real-Time</span>
              </div>

              <div className="space-y-4">
                {[
                  { title: "TerrellHallGuardrails PII Check", status: "VERIFIED", time: "Just now", color: "text-[#10B981]" },
                  { title: "SHA-256 Audit Hash Chained", status: "SUCCESS", time: "2m ago", color: "text-[#0066FF]" },
                  { title: "OpenRouter Qwen3 Model Switch", status: "EXECUTED", time: "14m ago", color: "text-[#38BDF8]" },
                  { title: "UE5 / Unity NPC State Tree Sync", status: "COMPILED", time: "1h ago", color: "text-[#10B981]" },
                  { title: "Outbound SMTP Delivery Gate", status: "COMPLETED", time: "2h ago", color: "text-[#38BDF8]" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#09090B] border border-[#27272A]/80 text-xs">
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-[10px] text-[#64748B] mt-0.5">{item.time}</p>
                    </div>
                    <span className={`text-[10px] font-bold ${item.color}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push("/security")}
              className="w-full py-2.5 rounded-xl border border-[#27272A] bg-[#09090B] hover:bg-[#18181B] text-white text-xs font-semibold transition-all mt-4"
            >
              View Full SecOps Logs →
            </button>
          </div>

        </div>

      </main>

    </div>
  );
}
