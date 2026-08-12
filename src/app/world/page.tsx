"use client";

export default function WorldBuilderPage() {
  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto">
      <header className="px-6 py-5 border-b border-[#27272A] shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">World Builder</h1>
          <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mt-1">
            Procedural World & NPC Simulation
          </p>
        </div>
      </header>
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Terrain */}
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: "Terrain Generation", icon: "TRN", desc: "Procedural heightmaps, biomes, erosion simulation — C++ backend via frontier-gaming-engine" },
              { name: "NPC AI System", icon: "NPC", desc: "Behavior trees, LLM-driven dialogue, faction relationships, settlement simulation" },
              { name: "Weather & Climate", icon: "WTH", desc: "Dynamic weather, day/night cycles, seasonal changes affecting gameplay" },
            ].map(t => (
              <div key={t.name} className="bg-[#111113] border border-[#27272A] rounded-xl p-6 hover:border-[#D92A2A]/40 transition-all">
                <span className="text-xs font-mono font-bold text-[#D92A2A] mb-3 block">{t.icon}</span>
                <h3 className="text-sm font-semibold text-white mb-2">{t.name}</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Active Worlds */}
          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6">
            <h2 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-4">Active Worlds</h2>
            <div className="space-y-3">
              {[
                { name: "Elderwood Realm", type: "Fantasy", size: "64 km²", npcs: 1240, status: "active" },
                { name: "Neo Tokyo 2087", type: "Cyberpunk", size: "32 km²", npcs: 890, status: "active" },
                { name: "Arid Expanse", type: "Desert Survival", size: "128 km²", npcs: 456, status: "building" },
              ].map(w => (
                <div key={w.name} className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{w.name}</p>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">{w.type} · {w.size} · {w.npcs} NPCs</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    w.status === "active"
                      ? "bg-[#D92A2A]/10 text-[#D92A2A] border-[#D92A2A]/20"
                      : "bg-[#27272A]/40 text-[#A1A1AA] border-[#27272A]"
                  }`}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulation Systems */}
          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6">
            <h2 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-4">C++ Simulation Systems</h2>
            <div className="flex flex-wrap gap-2">
              {["Behavior Tree","Combat AI","Dialogue","Ecology","Economy","Military","Quest Gen","Settlement AI","Skills","Story Director","Terrain Gen","Voice AI","Weather","World Director","Persistence","Memory Graph"].map(sys => (
                <span key={sys} className="px-3 py-1 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-[#A1A1AA] hover:border-[#D92A2A]/40 transition-all">
                  {sys}
                </span>
              ))}
            </div>
            <p className="text-xs text-[#A1A1AA] mt-4">All systems run as C++ modules via the frontier-runtime simulation engine.</p>
          </div>
        </div>
      </div>
    </div>
  );
}