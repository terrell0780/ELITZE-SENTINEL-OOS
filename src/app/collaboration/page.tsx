"use client";

import { useState, useEffect } from "react";

export default function CollaborationPage() {
  const [isTeamMode, setIsTeamMode] = useState(false);
  const [cursors, setCursors] = useState<{ id: number; x: number; y: number; color: string; name: string }[]>([]);

  // Simulate remote cursors moving
  useEffect(() => {
    if (!isTeamMode) {
      setCursors([]);
      return;
    }

    const teamMembers = [
      { id: 1, color: "#D92A2A", name: "Sarah" },
      { id: 2, color: "#71717A", name: "David" }
    ];

    // Initial position
    setCursors(teamMembers.map(m => ({ ...m, x: Math.random() * 60 + 20, y: Math.random() * 60 + 20 })));

    const interval = setInterval(() => {
      setCursors(prev => prev.map(cursor => {
        // Move randomly slightly
        const dx = (Math.random() - 0.5) * 5;
        const dy = (Math.random() - 0.5) * 5;
        return {
          ...cursor,
          x: Math.max(10, Math.min(90, cursor.x + dx)),
          y: Math.max(10, Math.min(90, cursor.y + dy))
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isTeamMode]);

  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      {/* Header */}
      <header className="h-14 border-b border-[#27272A] flex items-center px-6 shrink-0 justify-between bg-[#111113]">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-white">Co-Build Workspace</h1>
          <span className="px-2 py-0.5 bg-[#09090B] border border-[#27272A] rounded text-[10px] font-semibold text-[#A1A1AA] tracking-widest uppercase">
            {isTeamMode ? "Multiplayer" : "Isolated"}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Presence avatars */}
          {isTeamMode && (
            <div className="flex -space-x-2 mr-2">
              <div className="w-7 h-7 rounded-full bg-[#09090B] border-2 border-[#111113] flex items-center justify-center text-[10px] text-[#A1A1AA] font-bold z-20">ME</div>
              <div className="w-7 h-7 rounded-full bg-[#27272A] border-2 border-[#111113] flex items-center justify-center text-[10px] text-[#A1A1AA] font-bold z-10">SJ</div>
              <div className="w-7 h-7 rounded-full bg-[#71717A] border-2 border-[#111113] flex items-center justify-center text-[10px] text-[#A1A1AA] font-bold z-0">DK</div>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#09090B] p-1 rounded-lg border border-[#27272A]">
            <button 
              onClick={() => setIsTeamMode(false)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${!isTeamMode ? 'bg-[#27272A] text-white' : 'text-[#A1A1AA] hover:text-white'}`}
            >
              Solo
            </button>
            <button 
              onClick={() => setIsTeamMode(true)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${isTeamMode ? 'bg-[#D92A2A] text-white' : 'text-[#A1A1AA] hover:text-white'}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Team
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left pane: Activity & Comm */}
        <aside className="w-80 border-r border-[#27272A] flex flex-col bg-[#111113] overflow-hidden shrink-0">
          <div className="p-5 border-b border-[#27272A]">
            <h2 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest">Live Activity</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {isTeamMode ? (
              <>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#09090B] border border-[#27272A] flex items-center justify-center text-[10px] text-[#A1A1AA] font-mono shrink-0">SJ</div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#A1A1AA]">Sarah updated the API manifest</span>
                    <span className="text-[10px] text-[#A1A1AA] mt-0.5 font-mono">2 mins ago</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#09090B] border border-[#27272A] flex items-center justify-center text-[10px] text-[#A1A1AA] font-mono shrink-0">DK</div>
                  <div className="flex flex-col">
                    <span className="text-xs text-[#A1A1AA]">David deployed Lindy Agent: &apos;Scraper&apos;</span>
                    <span className="text-[10px] text-[#A1A1AA] mt-0.5 font-mono">15 mins ago</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <img src="/logo.jpg" alt="Elitze Logo" className="w-6 h-6 rounded object-cover border border-[#27272A] shrink-0" />
                <div className="flex flex-col">
                  <span className="text-xs text-[#A1A1AA]">Elitze Agent completed deep-scan</span>
                  <span className="text-[10px] text-[#A1A1AA] mt-0.5 font-mono">Just now</span>
                </div>
              </div>
            )}
            
            <div className="flex gap-3 opacity-60">
              <div className="w-6 h-6 rounded-full bg-[#09090B] border border-[#27272A] flex items-center justify-center text-[10px] text-[#A1A1AA] font-mono shrink-0">ME</div>
              <div className="flex flex-col">
                <span className="text-xs text-[#A1A1AA]">You joined the workspace</span>
                <span className="text-[10px] text-[#71717A] mt-0.5 font-mono">1 hr ago</span>
              </div>
            </div>
          </div>

          {/* Team Chat box */}
          {isTeamMode && (
            <div className="p-5 border-t border-[#27272A] bg-[#111113]">
              <input 
                type="text" 
                placeholder="Message team..." 
                className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-white placeholder-[#71717A] outline-none focus:border-[#D92A2A]/50 transition-colors"
              />
            </div>
          )}
        </aside>

        {/* Right pane: Interactive Canvas */}
        <main className="flex-1 relative bg-[#09090B] p-6 overflow-hidden flex flex-col">
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#27272A 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          {/* Simulated remote cursors */}
          {cursors.map(c => (
            <div 
              key={c.id} 
              className="absolute pointer-events-none transition-all duration-1000 ease-out z-50 flex items-start"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <svg width="16" height="24" viewBox="0 0 24 24" fill={c.color} stroke="#09090B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                <polygon points="3 3 10 21 14 14 21 10 3 3"/>
              </svg>
              <div 
                className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold text-white shadow-md whitespace-nowrap"
                style={{ backgroundColor: c.color }}
              >
                {c.name}
              </div>
            </div>
          ))}

          {/* Canvas content */}
          <div className="relative z-10 w-full h-full border border-[#27272A] bg-[#111113] rounded-xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D92A2A]"></div>
                <h3 className="text-sm font-semibold text-white">Project Manifest Build</h3>
              </div>
              <span className="text-xs text-[#A1A1AA] font-mono">system.config.json</span>
            </div>
            
            <div className="flex-1 font-mono text-xs text-[#A1A1AA] leading-relaxed">
              <span className="text-[#D92A2A]">{"{"}</span><br/>
              &nbsp;&nbsp;<span className="text-white">&quot;project&quot;</span>: <span className="text-[#A1A1AA]">&quot;Elitze Sentinel Frontier&quot;</span>,<br/>
              &nbsp;&nbsp;<span className="text-white">&quot;collaborators&quot;</span>: <span className="text-[#D92A2A]">{"["}</span><br/>
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#A1A1AA]">&quot;Terrell&quot;</span>{isTeamMode && <><span className="text-[#A1A1AA]">,</span><br/>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#A1A1AA]">&quot;Sarah&quot;</span>,<br/>&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#A1A1AA]">&quot;David&quot;</span></>}<br/>
              &nbsp;&nbsp;<span className="text-[#D92A2A]">{"]"}</span>,<br/>
              &nbsp;&nbsp;<span className="text-white">&quot;status&quot;</span>: <span className="text-[#A1A1AA]">&quot;active_build&quot;</span><br/>
              <span className="text-[#D92A2A]">{"}"}</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
