"use client";
import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function EnterprisePage() {
  const [dbStats, setDbStats] = useState<any>({});
  const [missionsList, setMissionsList] = useState<any[]>([]);

  useEffect(() => {
    brain.stats().then((d: any) => setDbStats(d || {}));
    brain.listMissions().then((d: any) => { if (Array.isArray(d)) setMissionsList(d); });
  }, []);

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto">
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">
            E
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">ENTERPRISE</span>
            <span className="text-[9px] font-semibold text-[#0066FF]/70 uppercase tracking-widest">Organization</span>
          </div>
        </div>
        <button className="bg-[#0066FF] text-white hover:opacity-90 text-[11px] font-semibold px-3 py-1.5 rounded-md">
          Invite Member
        </button>
      </header>

      <div className="p-6 max-w-6xl mx-auto w-full space-y-8">
        <section>
          <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Team Members</h2>
          <div className="bg-[#111115] border border-[#27272A] rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272A]">
                  <th className="py-3 px-4 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">User</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Role</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-[#52525B] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {['Alice (Admin)', 'Bob (Developer)', 'Charlie (Analyst)', 'Dave (Viewer)'].map((u, i) => (
                  <tr key={i} className="border-b border-[#27272A] hover:bg-[#18181B] transition-colors last:border-0">
                    <td className="py-3 px-4 text-[11px] text-white font-medium">{u.split(' ')[0]}</td>
                    <td className="py-3 px-4 text-[11px] text-[#A1A1AA]">{u.split(' ')[1].replace(/[()]/g, '')}</td>
                    <td className="py-3 px-4">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#10B981]"></span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-[11px] text-[#0066FF] hover:text-white">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section>
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">API Keys</h2>
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-[#27272A]">
                <div>
                  <p className="text-[12px] font-semibold text-white">Production Key</p>
                  <p className="text-[11px] text-[#71717A]">Created 2 days ago</p>
                </div>
                <button className="bg-[#141418] border border-[#27272A] text-[#A1A1AA] hover:text-white text-[11px] font-semibold px-3 py-1.5 rounded-md">
                  Revoke
                </button>
              </div>
              <button className="text-[11px] text-[#0066FF] hover:text-white font-semibold">
                + Generate New Key
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Audit Log (Recent Missions)</h2>
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-3">
              {missionsList.slice(0, 5).map((m, i) => (
                <div key={i} className="flex justify-between items-start text-[11px]">
                  <div>
                    <p className="text-white font-medium">{m.title || "Mission Executed"}</p>
                    <p className="text-[#71717A] mt-0.5">{m.id || "Unknown ID"}</p>
                  </div>
                  <span className="text-[#A1A1AA]">{new Date().toLocaleDateString()}</span>
                </div>
              ))}
              {missionsList.length === 0 && (
                <p className="text-[11px] text-[#71717A]">No audit logs available.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
