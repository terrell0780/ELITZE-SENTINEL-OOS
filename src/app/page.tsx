"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(prompt.trim())}`);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning.";
    if (h < 17) return "Good afternoon.";
    return "Good evening.";
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white font-sans flex flex-col">

      {/* ─── Top ──────────────────────────────────────────────── */}
      <header className="px-8 py-6 flex items-center gap-3">
        <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center font-extrabold text-white text-[10px] shadow-sm shadow-[#0066FF]/25">
          E
        </div>
        <span className="text-[11px] font-bold text-[#A1A1AA] tracking-widest uppercase">ELITZE SENTINEL</span>
      </header>

      {/* ─── Center ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-16">
        <div className="w-full max-w-[640px] space-y-10">

          {/* Greeting */}
          <div>
            <h1 className="text-[28px] font-semibold text-white tracking-tight leading-tight">
              {getGreeting()}
            </h1>
            <p className="text-[15px] text-[#71717A] mt-2">
              What are you working on?
            </p>
          </div>

          {/* Command Input */}
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask Frontier to investigate, build, analyze or execute..."
                className="w-full bg-[#111113] border border-[#27272A] rounded-xl px-4 py-3.5 text-[13px] text-white placeholder-[#3F3F46] outline-none focus:border-[#27272A] focus:ring-1 focus:ring-[#0066FF]/30 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
          </form>

          {/* Recent Work */}
          <div>
            <h2 className="text-[11px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Recent Work</h2>

            <div className="grid grid-cols-3 gap-3">

              {/* Security Investigation */}
              <button
                onClick={() => router.push("/security")}
                className="text-left p-4 rounded-lg bg-[#111113] border border-[#1F1F28] hover:border-[#27272A] transition-all group"
              >
                <p className="text-[12px] font-semibold text-white group-hover:text-[#38BDF8] transition-colors">
                  Security Investigation
                </p>
                <p className="text-[11px] text-[#52525B] font-mono mt-1.5">CVE-2026-21849</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                  <span className="text-[10px] text-[#52525B]">Critical Exposure</span>
                </div>
              </button>

              {/* World Project */}
              <button
                onClick={() => router.push("/gaming")}
                className="text-left p-4 rounded-lg bg-[#111113] border border-[#1F1F28] hover:border-[#27272A] transition-all group"
              >
                <p className="text-[12px] font-semibold text-white group-hover:text-[#38BDF8] transition-colors">
                  World Project
                </p>
                <p className="text-[11px] text-[#52525B] font-mono mt-1.5">Project Atlas</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                  <span className="text-[10px] text-[#52525B]">World Generation</span>
                </div>
              </button>

              {/* Agent Run */}
              <button
                onClick={() => router.push("/chat")}
                className="text-left p-4 rounded-lg bg-[#111113] border border-[#1F1F28] hover:border-[#27272A] transition-all group"
              >
                <p className="text-[12px] font-semibold text-white group-hover:text-[#38BDF8] transition-colors">
                  Agent Run
                </p>
                <p className="text-[11px] text-[#52525B] font-mono mt-1.5">Threat Analyst</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span className="text-[10px] text-[#52525B]">Completed</span>
                </div>
              </button>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
