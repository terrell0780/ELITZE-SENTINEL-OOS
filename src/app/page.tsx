"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { brain } from "@/lib/brain";

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [recentMissions, setRecentMissions] = useState<any[]>([]);

  useEffect(() => {
    brain.listMissions().then((missions: any) => {
      if (Array.isArray(missions)) {
        setRecentMissions(missions.slice(0, 3));
      }
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(prompt.trim())}`);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 lg:p-12 overflow-y-auto bg-[#08090c] text-[#f5f7fa] selection:bg-[#1677ff] selection:text-white">
      
      <div className="w-full max-w-[760px] mx-auto space-y-10 my-auto py-4">

        {/* ── Header Branding & Greeting ── */}
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-bold text-[#687180] tracking-widest uppercase block">
            {getGreeting()}, Terrell
          </span>
          <h1 className="text-3xl font-extrabold text-[#f5f7fa] tracking-tight uppercase">
            FRONTIER
          </h1>
          <p className="text-sm text-[#a7adb8] font-normal">
            What are you working on?
          </p>
        </div>

        {/* ── Command Input Box ── */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="bg-[#0d0f13] border border-[#ffffff14] focus-within:border-[#1677ff] rounded-xl p-3 shadow-xl transition-all flex flex-col gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask Frontier to investigate, build, analyze or execute..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#f5f7fa] placeholder-[#687180] outline-none resize-none min-h-[52px] max-h-[120px] font-sans"
              rows={2}
            />
            <div className="flex items-center justify-between border-t border-[#ffffff0f] pt-2">
              <span className="text-[10px] text-[#687180] font-mono">
                Press Enter to execute query
              </span>
              <button
                type="submit"
                className="w-7 h-7 rounded-md bg-[#1677ff] hover:bg-[#1677ff]/90 text-white flex items-center justify-center font-bold shadow-sm transition-all"
                title="Execute Prompt"
              >
                ↑
              </button>
            </div>
          </div>
        </form>

        {/* ── Quick Access Cards ── */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-mono font-bold text-[#687180] uppercase tracking-widest">
            QUICK ACCESS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Security */}
            <button
              onClick={() => router.push("/security")}
              className="text-left p-4 rounded-lg bg-[#0d0f13] border border-[#ffffff14] hover:border-[#1677ff]/50 hover:bg-[#11141a] transition-all group space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#1677ff]">SECOPS</span>
                <span className="text-xs text-[#687180] group-hover:text-white transition-colors">→</span>
              </div>
              <p className="text-xs font-bold text-[#f5f7fa] group-hover:text-[#1677ff] transition-colors">
                Security
              </p>
              <p className="text-[11px] text-[#a7adb8]">Investigate →</p>
            </button>

            {/* Game Project */}
            <button
              onClick={() => router.push("/gaming")}
              className="text-left p-4 rounded-lg bg-[#0d0f13] border border-[#ffffff14] hover:border-[#1677ff]/50 hover:bg-[#11141a] transition-all group space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#10b981]">STUDIO</span>
                <span className="text-xs text-[#687180] group-hover:text-white transition-colors">→</span>
              </div>
              <p className="text-xs font-bold text-[#f5f7fa] group-hover:text-[#1677ff] transition-colors">
                Game Project
              </p>
              <p className="text-[11px] text-[#a7adb8]">Open Studio →</p>
            </button>

            {/* Agent Runtime */}
            <button
              onClick={() => router.push("/runtime")}
              className="text-left p-4 rounded-lg bg-[#0d0f13] border border-[#ffffff14] hover:border-[#1677ff]/50 hover:bg-[#11141a] transition-all group space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#38bdf8]">RUNTIME</span>
                <span className="text-xs text-[#687180] group-hover:text-white transition-colors">→</span>
              </div>
              <p className="text-xs font-bold text-[#f5f7fa] group-hover:text-[#1677ff] transition-colors">
                Agent Runtime
              </p>
              <p className="text-[11px] text-[#a7adb8]">View Runs →</p>
            </button>

          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-mono font-bold text-[#687180] uppercase tracking-widest">
            RECENT ACTIVITY
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Card 1: CVE Investigation */}
            <div
              onClick={() => router.push("/threat-intel")}
              className="p-3.5 rounded-lg bg-[#0d0f13] border border-[#ffffff14] hover:border-[#ffffff24] transition-all cursor-pointer space-y-1.5"
            >
              <p className="text-xs font-bold text-[#f5f7fa]">CVE Investigation</p>
              <p className="text-[10px] font-mono text-[#ef4444]">Critical Exposure</p>
            </div>

            {/* Card 2: World Builder */}
            <div
              onClick={() => router.push("/world")}
              className="p-3.5 rounded-lg bg-[#0d0f13] border border-[#ffffff14] hover:border-[#ffffff24] transition-all cursor-pointer space-y-1.5"
            >
              <p className="text-xs font-bold text-[#f5f7fa]">World Builder</p>
              <p className="text-[10px] font-mono text-[#10b981]">Project Atlas</p>
            </div>

            {/* Card 3: Agent Run */}
            <div
              onClick={() => router.push("/runtime")}
              className="p-3.5 rounded-lg bg-[#0d0f13] border border-[#ffffff14] hover:border-[#ffffff24] transition-all cursor-pointer space-y-1.5"
            >
              <p className="text-xs font-bold text-[#f5f7fa]">Agent Run</p>
              <p className="text-[10px] font-mono text-[#38bdf8]">Completed</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
