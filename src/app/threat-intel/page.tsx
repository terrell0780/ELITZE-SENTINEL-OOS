"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function ThreatIntelPage() {
  const [stats, setStats] = useState({ critical: 24, high: 183, exploited: 17, exposure: 42 });
  const [synced, setSynced] = useState(true);

  useEffect(() => {
    brain.stats().then((d: any) => {
      if (d) setStats((prev) => ({ ...prev, ...d }));
    });
  }, []);

  const cveRows = [
    { cve: "CVE-2026-21849", severity: "Critical", epss: "98%", kev: "YES", assets: 14, status: "Open" },
    { cve: "CVE-2026-10482", severity: "High", epss: "91%", kev: "NO", assets: 7, status: "Open" },
    { cve: "CVE-2025-9921", severity: "High", epss: "87%", kev: "YES", assets: 21, status: "Fixing" },
    { cve: "CVE-2025-8830", severity: "Medium", epss: "45%", kev: "NO", assets: 3, status: "Resolved" },
    { cve: "CVE-2025-7140", severity: "High", epss: "82%", kev: "YES", assets: 11, status: "Fixing" },
  ];

  return (
    <div className="h-full bg-[#08090c] text-[#f5f7fa] flex flex-col font-sans overflow-y-auto selection:bg-[#1677ff] selection:text-white">
      
      {/* ── Header ── */}
      <header className="h-[52px] border-b border-[#ffffff14] bg-[#0d0f13] px-5 flex items-center justify-between shrink-0 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#f5f7fa] tracking-wider">CVE INTELLIGENCE</span>
          <span className="text-[#687180] text-[10px]">| Sentinel Threat Telemetry</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSynced(!synced)}
            className="px-3 py-1 rounded bg-[#11141a] hover:bg-[#161a21] border border-[#ffffff14] text-xs font-semibold text-[#a7adb8] hover:text-white transition-colors"
          >
            {synced ? "Synced ✓" : "Syncing..."}
          </button>
          <button className="px-3 py-1 rounded bg-[#11141a] hover:bg-[#161a21] border border-[#ffffff14] text-xs font-semibold text-[#a7adb8] hover:text-white transition-colors">
            Filters
          </button>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">

        {/* ── Stat Cards Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0d0f13] border border-[#ffffff14] p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#ef4444] uppercase tracking-wider block">Critical</span>
            <p className="text-2xl font-mono font-bold text-[#f5f7fa]">{stats.critical}</p>
          </div>
          <div className="bg-[#0d0f13] border border-[#ffffff14] p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#f97316] uppercase tracking-wider block">High</span>
            <p className="text-2xl font-mono font-bold text-[#f5f7fa]">{stats.high}</p>
          </div>
          <div className="bg-[#0d0f13] border border-[#ffffff14] p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-wider block">Exploited</span>
            <p className="text-2xl font-mono font-bold text-[#f5f7fa]">{stats.exploited}</p>
          </div>
          <div className="bg-[#0d0f13] border border-[#ffffff14] p-4 rounded-lg space-y-1">
            <span className="text-[10px] font-mono font-bold text-[#38bdf8] uppercase tracking-wider block">Exposure</span>
            <p className="text-2xl font-mono font-bold text-[#f5f7fa]">{stats.exposure}</p>
          </div>
        </div>

        {/* ── CVE Data Table ── */}
        <div className="bg-[#0d0f13] border border-[#ffffff14] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#ffffff14] flex items-center justify-between font-mono text-[10px]">
            <span className="font-bold text-[#687180] uppercase tracking-widest">Active Vulnerability Register</span>
            <span className="text-[#a7adb8]">Live Feed</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-[#ffffff14] bg-[#11141a] text-[#687180] text-[10px] uppercase tracking-wider">
                  <th className="py-3 px-4">CVE</th>
                  <th className="py-3 px-4">SEVERITY</th>
                  <th className="py-3 px-4">EPSS</th>
                  <th className="py-3 px-4">KEV</th>
                  <th className="py-3 px-4">ASSETS</th>
                  <th className="py-3 px-4">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffffff0f]">
                {cveRows.map((row) => (
                  <tr key={row.cve} className="hover:bg-[#161a21] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1677ff]">{row.cve}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.severity === "Critical" ? "bg-[#ef4444]/15 text-[#ef4444]" :
                        row.severity === "High" ? "bg-[#f97316]/15 text-[#f97316]" :
                        "bg-[#eab308]/15 text-[#eab308]"
                      }`}>
                        {row.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#f5f7fa]">{row.epss}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold ${row.kev === "YES" ? "text-[#ef4444]" : "text-[#687180]"}`}>
                        {row.kev}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#a7adb8]">{row.assets}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        row.status === "Open" ? "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30" :
                        row.status === "Fixing" ? "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30" :
                        "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
