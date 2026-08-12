"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function GamingPage() {
  const [games, setGames] = useState<any[]>([]);
  useEffect(() => { brain.find("games").then(d => { if (d.data?.length) setGames(d.data); }); }, []);

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto">
      <header className="px-6 py-5 border-b border-[#27272A] shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Game Engine</h1>
          <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mt-1">
            {games.length} Active Projects
          </p>
        </div>
      </header>
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6">
              <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-1">Engine</p>
              <p className="text-base font-semibold text-white">Unreal Engine 5.6</p>
              <p className="text-xs text-[#A1A1AA] mt-1">C++ runtime active</p>
            </div>
            <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6">
              <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-1">Compiler</p>
              <p className="text-base font-semibold text-white">C++20 / C++23</p>
              <p className="text-xs text-[#A1A1AA] mt-1">frontier-gaming-compiler</p>
            </div>
          </div>
          {games.length === 0 ? (
            <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 text-center">
              <p className="text-xs text-[#A1A1AA]">No projects yet. Create one via the Game Studio page or API.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((g: any, i: number) => (
                <div key={i} className="bg-[#111113] border border-[#27272A] rounded-xl p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-white">{g.name}</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#D92A2A]/10 text-[#D92A2A] border border-[#D92A2A]/20">
                      {g.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA]">{g.engine} · build v{g.build}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}