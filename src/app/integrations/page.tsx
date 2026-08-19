"use client";
import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function IntegrationsPage() {
  const [dbStats, setDbStats] = useState<any>({});
  const [missions, setMissions] = useState(0);

  useEffect(() => {
    brain.stats().then((d: any) => setDbStats(d || {}));
    brain.listMissions().then((d: any) => { if (Array.isArray(d)) setMissions(d.length); });
  }, []);

  const integrations = [
    { name: "Slack", category: "Communication", connected: true },
    { name: "GitHub", category: "Development", connected: true },
    { name: "Jira", category: "Development", connected: false },
    { name: "Salesforce", category: "CRM", connected: false },
    { name: "HubSpot", category: "CRM", connected: false },
    { name: "Google Workspace", category: "Cloud", connected: true },
    { name: "AWS", category: "Cloud", connected: true },
    { name: "Docker", category: "DevOps", connected: false },
  ];

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto">
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">
            I
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">INTEGRATIONS</span>
            <span className="text-[9px] font-semibold text-[#0066FF]/70 uppercase tracking-widest">Connected Services</span>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {integrations.map((svc) => (
            <div key={svc.name} className="bg-[#111115] border border-[#27272A] rounded-lg p-5 flex flex-col items-start hover:bg-[#18181B] transition-colors">
              <div className="flex justify-between items-start w-full mb-4">
                <div className="w-10 h-10 rounded-md bg-[#141418] border border-[#27272A] flex items-center justify-center text-[14px] font-bold text-white">
                  {svc.name.charAt(0)}
                </div>
                <div className={`w-2 h-2 rounded-full ${svc.connected ? 'bg-[#10B981]' : 'bg-[#52525B]'}`}></div>
              </div>
              <h3 className="text-[13px] font-bold text-white mb-1">{svc.name}</h3>
              <p className="text-[11px] text-[#71717A] mb-4">{svc.category}</p>
              
              <div className="mt-auto w-full">
                {svc.connected ? (
                  <button className="w-full bg-[#141418] border border-[#27272A] text-[#A1A1AA] hover:text-white text-[11px] font-semibold px-3 py-1.5 rounded-md">
                    Configure
                  </button>
                ) : (
                  <button className="w-full bg-[#0066FF] text-white hover:opacity-90 text-[11px] font-semibold px-3 py-1.5 rounded-md">
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
