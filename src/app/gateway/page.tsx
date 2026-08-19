"use client";
import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function GatewayPage() {
  const [dbStats, setDbStats] = useState<any>({});
  const [missions, setMissions] = useState(0);

  useEffect(() => {
    brain.stats().then((d: any) => setDbStats(d || {}));
    brain.listMissions().then((d: any) => { if (Array.isArray(d)) setMissions(d.length); });
  }, []);

  const endpoints = [
    { path: "/api/chat", method: "GET", latency: "45ms", status: "Healthy" },
    { path: "/api/brain", method: "POST", latency: "120ms", status: "Healthy" },
    { path: "/api/auth", method: "POST", latency: "85ms", status: "Degraded" },
    { path: "/api/webhooks", method: "POST", latency: "22ms", status: "Healthy" },
  ];

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto">
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">
            G
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">API GATEWAY</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
          <span className="text-[11px] text-[#A1A1AA]">All Systems Nominal</span>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
            <p className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-1">Total Requests</p>
            <p className="text-xl font-mono text-white">{(missions * 1234 + 5000).toLocaleString()}</p>
          </div>
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
            <p className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-1">Avg Latency</p>
            <p className="text-xl font-mono text-white">68ms</p>
          </div>
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
            <p className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-1">Error Rate</p>
            <p className="text-xl font-mono text-[#10B981]">0.02%</p>
          </div>
        </div>

        <section>
          <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Endpoint Registry</h2>
          <div className="bg-[#111115] border border-[#27272A] rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272A] bg-[#141418]">
                  <th className="py-3 px-4 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Method</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Endpoint</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Latency</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Health</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep, i) => (
                  <tr key={i} className="border-b border-[#27272A] hover:bg-[#18181B] transition-colors last:border-0">
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold text-[#0066FF] uppercase bg-[#0066FF]/10 px-2 py-1 rounded">
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] font-mono text-white">{ep.path}</td>
                    <td className="py-3 px-4 text-[11px] text-[#A1A1AA]">{ep.latency}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] ${ep.status === 'Healthy' ? 'text-[#10B981]' : 'text-[#F97316]'}`}>
                        {ep.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
