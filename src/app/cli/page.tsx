"use client";
import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function CliPage() {
  const [dbStats, setDbStats] = useState<any>({});
  const [missions, setMissions] = useState(0);

  useEffect(() => {
    brain.stats().then((d: any) => setDbStats(d || {}));
    brain.listMissions().then((d: any) => { if (Array.isArray(d)) setMissions(d.length); });
  }, []);

  const totalRecords = Object.values(dbStats).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);

  return (
    <div className="h-full bg-[#09090B] flex flex-col">
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">
            &gt;_
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">COMMAND LINE</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-4">
          <div className="flex-1 bg-[#111115] border border-[#27272A] rounded-lg p-4 font-mono text-[11px] text-[#A1A1AA] overflow-y-auto">
            <div className="mb-2 text-white">System initialized. Awaiting commands.</div>
            <div className="mb-2">Type "help" for a list of commands.</div>
            {/* Command history would go here */}
          </div>
          <div className="mt-4 bg-[#141418] border border-[#27272A] rounded-lg px-4 py-3 flex items-center gap-2">
            <span className="font-mono text-[11px] text-[#0066FF] font-bold">frontier $</span>
            <input 
              type="text" 
              className="flex-1 bg-transparent border-none outline-none text-white font-mono text-[11px]"
              placeholder="Enter command..."
            />
          </div>
        </div>

        <div className="w-64 border-l border-[#27272A] bg-[#09090B] p-4 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h3 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-3">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#71717A]">Collections</span>
                <span className="text-[11px] font-mono text-white">{Object.keys(dbStats).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#71717A]">Missions</span>
                <span className="text-[11px] font-mono text-white">{missions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#71717A]">Records</span>
                <span className="text-[11px] font-mono text-white">{String(totalRecords)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#71717A]">Status</span>
                <span className="text-[11px] text-[#10B981] font-medium">Online</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-3">Command Suggestions</h3>
            <div className="flex flex-wrap gap-2">
              {['help', 'status', 'missions list', 'db stats', 'clear'].map(cmd => (
                <button key={cmd} className="bg-[#141418] border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-[#18181B] text-[10px] px-2 py-1 rounded">
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
