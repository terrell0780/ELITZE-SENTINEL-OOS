"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Terrell");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("frontier-user");
      if (stored) setUserName(JSON.parse(stored).name || "Terrell");
    } catch {}
  }, []);

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto p-8 space-y-8">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA]">Welcome back, {userName}</h1>
          <p className="text-xs text-[#A1A1AA] mt-1">Elitze Sentinel Frontier Enterprise Creative Platform</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/media")}
            className="px-4 py-2 bg-[#D92A2A] hover:bg-[#B91C1C] text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* ── RECENT PROJECTS (Clean White 16px Rounded Cards with Professional SVG Badges) ── */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Recent Creative Projects</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Movie Studio",
              desc: "Create cinematic videos & 16:9 films",
              meta: "Last render: 2 minutes ago",
              href: "/media",
              icon: (
                <svg className="w-5 h-5 text-[#D92A2A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
                </svg>
              )
            },
            {
              title: "Image Studio",
              desc: "AI visual asset & graphics generation",
              meta: "Active models: FLUX & SDXL",
              href: "/visual",
              icon: (
                <svg className="w-5 h-5 text-[#D92A2A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              )
            },
            {
              title: "Audio Studio",
              desc: "Neural voiceovers & speech sync",
              meta: "ElevenLabs Neural Engine",
              href: "/voice",
              icon: (
                <svg className="w-5 h-5 text-[#D92A2A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                </svg>
              )
            },
            {
              title: "Automation",
              desc: "Autonomous agent pipelines & workflows",
              meta: "12 Active Workflows",
              href: "/workflows",
              icon: (
                <svg className="w-5 h-5 text-[#D92A2A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              )
            },
          ].map(p => (
            <div 
              key={p.title} 
              className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#1A1A1D] flex items-center justify-center mb-4">
                  {p.icon}
                </div>
                <h3 className="text-base font-bold text-[#FAFAFA] group-hover:text-[#D92A2A] transition-colors">{p.title}</h3>
                <p className="text-xs text-[#A1A1AA] mt-1">{p.desc}</p>
                <p className="text-[11px] text-[#71717A] mt-3 font-medium">{p.meta}</p>
              </div>

              <button 
                onClick={() => router.push(p.href)}
                className="mt-6 w-full py-2 bg-[#1A1A1D] hover:bg-[#D92A2A] text-[#D92A2A] hover:text-white font-semibold text-xs rounded-xl transition-all shadow-none"
              >
                Open Studio
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── ACTIVITY & METRICS GRID ── */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Activity Status */}
        <div className="md:col-span-2 bg-[#111113] border border-[#27272A] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Live System Activity</h2>
          
          <div className="space-y-3">
            {[
              { title: "Cinematic Sci-Fi Movie Scene 4", status: "Rendering...", type: "rendering", time: "Just now" },
              { title: "Faceless YouTube Viral Video #842", status: "Completed", type: "completed", time: "12m ago" },
              { title: "Automated Lead Gen Pipeline Sweep", status: "Published", type: "published", time: "1h ago" },
            ].map(act => (
              <div key={act.title} className="flex items-center justify-between p-4 bg-[#09090B] rounded-xl border border-[#27272A]">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    act.type === "rendering" ? "bg-[#D92A2A] animate-pulse" :
                    act.type === "completed" ? "bg-[#10B981]" : "bg-[#00BCD4]"
                  }`} />
                  <div>
                    <p className="text-xs font-semibold text-[#FAFAFA]">{act.title}</p>
                    <p className="text-[10px] text-[#A1A1AA]">{act.time}</p>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                  act.type === "rendering" ? "bg-[#1A1A1D] text-[#D92A2A]" :
                  act.type === "completed" ? "bg-emerald-50 text-[#10B981]" : "bg-cyan-50 text-[#00BCD4]"
                }`}>{act.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Storage, GPU, Credits Telemetry */}
        <div className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-xs font-bold text-[#71717A] uppercase tracking-wider">Platform Resources</h2>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#FAFAFA] mb-1.5">
                <span>Storage</span>
                <span>14.2 GB / 100 GB</span>
              </div>
              <div className="w-full bg-[#09090B] h-2 rounded-full overflow-hidden border border-[#27272A]">
                <div className="bg-[#D92A2A] h-full rounded-full" style={{ width: "14%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#FAFAFA] mb-1.5">
                <span>GPU Cluster Usage</span>
                <span>42% Active</span>
              </div>
              <div className="w-full bg-[#09090B] h-2 rounded-full overflow-hidden border border-[#27272A]">
                <div className="bg-[#00BCD4] h-full rounded-full" style={{ width: "42%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-[#FAFAFA] mb-1.5">
                <span>AI Credits</span>
                <span>9,450 / 10,000</span>
              </div>
              <div className="w-full bg-[#09090B] h-2 rounded-full overflow-hidden border border-[#27272A]">
                <div className="bg-[#10B981] h-full rounded-full" style={{ width: "94%" }} />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
