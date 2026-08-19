"use client";
import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function ThreatIntelPage() {
  const [dbStats, setDbStats] = useState<any>({});
  const [missions, setMissions] = useState(0);

  useEffect(() => {
    brain.stats().then((d: any) => setDbStats(d || {}));
    brain.listMissions().then((d: any) => { if (Array.isArray(d)) setMissions(d.length); });
  }, []);

  const mitreData = [
    { tactic: "Initial Access", id: "T1190", name: "Exploit Public-Facing Application", severity: "High" },
    { tactic: "Execution", id: "T1059", name: "Command and Scripting Interpreter", severity: "Medium" },
    { tactic: "Persistence", id: "T1098", name: "Account Manipulation", severity: "High" },
  ];

  const iocs = ["192.168.1.100", "malicious-domain.com", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"];

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto">
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#EF4444] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#EF4444]/20">
            T
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">THREAT INTELLIGENCE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#A1A1AA]">Sources:</span>
          <span className="text-[9px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded uppercase">Synced</span>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-3">IOC Indicators</h2>
            <div className="space-y-2">
              {iocs.map((ioc, i) => (
                <div key={i} className="text-[11px] font-mono text-[#EF4444] bg-[#EF4444]/5 px-2 py-1 rounded border border-[#EF4444]/10 truncate">
                  {ioc}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-3">Feed Sources</h2>
            <div className="space-y-3">
              {['CISA', 'NVD', 'MITRE', 'VirusTotal'].map(source => (
                <div key={source} className="flex justify-between items-center">
                  <span className="text-[11px] text-white">{source}</span>
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-3">Threat Actor Profiles</h2>
            <div className="text-[11px] text-[#A1A1AA] mb-2">Analyzing current mission telemetry...</div>
            <div className="flex items-center justify-between border-t border-[#27272A] pt-2">
              <span className="text-[11px] text-[#71717A]">Active Profiles</span>
              <span className="text-[12px] font-mono text-white">{missions}</span>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">MITRE ATT&CK Mapping</h2>
          <div className="bg-[#111115] border border-[#27272A] rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272A] bg-[#141418]">
                  <th className="py-3 px-4 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Tactic</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">ID</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Severity</th>
                </tr>
              </thead>
              <tbody>
                {mitreData.map((row, i) => (
                  <tr key={i} className="border-b border-[#27272A] hover:bg-[#18181B] transition-colors last:border-0">
                    <td className="py-3 px-4 text-[11px] text-[#A1A1AA]">{row.tactic}</td>
                    <td className="py-3 px-4 text-[11px] font-mono text-white">{row.id}</td>
                    <td className="py-3 px-4 text-[11px] text-white">{row.name}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${row.severity === 'High' ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#F97316]/10 text-[#F97316]'}`}>
                        {row.severity}
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
