"use client";

export default function LindyPage() {
  const agents = [
    { id: 1, name: "Inbox Triage", status: "active", runs: 1432, icon: "mail" },
    { id: 2, name: "Meeting Scheduler", status: "active", runs: 856, icon: "calendar" },
    { id: 3, name: "Sales Outreach", status: "paused", runs: 342, icon: "briefcase" },
    { id: 4, name: "Data Scraper", status: "idle", runs: 12, icon: "database" }
  ];

  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">
      L
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-white tracking-tight">LINDY</span>
      <span className="text-[9px] font-semibold text-[#0066FF]/70 uppercase tracking-widest">Agent Automation</span>
    </div>
    
  </div>
  <div className="flex items-center gap-2">
    <button className="bg-[#0066FF] text-white hover:opacity-90 text-[11px] font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Create Agent
    </button>
  </div>
</header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Active Agents", value: "3" },
              { label: "Tasks Completed", value: "2,642" },
              { label: "Hours Saved", value: "184h" },
              { label: "Success Rate", value: "99.2%" }
            ].map(stat => (
              <div key={stat.label} className="bg-[#111115] border border-[#27272A] rounded-lg p-4 flex flex-col">
                <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider">{stat.label}</span>
                <span className="text-xl font-semibold text-white mt-1">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-6">
            {/* Left: Agent List */}
            <div className="flex-1 space-y-4">
              <h2 className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider pl-1">Deployed Agents</h2>
              
              <div className="grid grid-cols-1 gap-4">
                {agents.map(agent => (
                  <div key={agent.id} className="bg-[#111115] border border-[#27272A] hover:border-[#0066FF]/40 rounded-xl p-5 flex items-center justify-between cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center justify-center group-hover:border-[#0066FF]/50 group-hover:text-[#0066FF] transition-colors text-[#A1A1AA]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          {agent.icon === 'mail' && <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>}
                          {agent.icon === 'calendar' && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
                          {agent.icon === 'briefcase' && <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>}
                          {agent.icon === 'database' && <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>}
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-[12px] font-semibold text-white">{agent.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-[#A1A1AA]">{agent.runs} runs</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#09090B] border border-[#27272A]">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          agent.status === 'active' ? 'bg-[#0066FF]' : 'bg-[#71717A]'
                        }`}></span>
                        <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-medium">{agent.status}</span>
                      </div>
                      <button className="text-[#A1A1AA] hover:text-white p-1">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Activity Feed */}
            <div className="w-80 space-y-4">
              <h2 className="text-[10px] font-bold text-[#52525B] uppercase tracking-wider pl-1">Live Activity</h2>
              <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 flex flex-col gap-4">
                {[
                  { agent: "Inbox Triage", action: "Drafted reply to client", time: "2 min ago" },
                  { agent: "Meeting Scheduler", action: "Booked sync for Friday", time: "14 min ago" },
                  { agent: "Inbox Triage", action: "Archived 12 newsletters", time: "1 hour ago" },
                  { agent: "Data Scraper", action: "Extracted 45 leads", time: "3 hours ago" }
                ].map((log, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0066FF] mt-1.5 shrink-0"></div>
                    <div className="flex flex-col">
                      <span className="text-xs text-white font-medium">{log.agent}</span>
                      <span className="text-[11px] text-[#A1A1AA]">{log.action}</span>
                      <span className="text-[10px] text-[#A1A1AA] mt-0.5">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
