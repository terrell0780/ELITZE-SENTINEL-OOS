"use client";

export default function WorldBuilderPage() {
  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto">
      <header className="h-12 border-b border-[#1F1F28] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-md bg-[#8B5CF6] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#8B5CF6]/20">
      W
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-white tracking-tight">WORLD BUILDER</span>
      <span className="text-[9px] font-semibold text-[#8B5CF6]/70 uppercase tracking-widest">Procedural Generation</span>
    </div>
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
              <div key={t.name} className="bg-[#111115] border border-[#27272A] rounded-lg p-4 hover:border-[#8B5CF6]/40 transition-all">
                <span className="text-xs font-mono font-bold text-[#8B5CF6] mb-3 block">{t.icon}</span>
                <h3 className="text-[12px] font-semibold text-white mb-2">{t.name}</h3>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Active Worlds */}
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Active Worlds</h2>
            <div className="space-y-3">
              {[
                { name: "Elderwood Realm", type: "Fantasy", size: "64 km²", npcs: 1240, status: "active" },
                { name: "Neo Tokyo 2087", type: "Cyberpunk", size: "32 km²", npcs: 890, status: "active" },
                { name: "Arid Expanse", type: "Desert Survival", size: "128 km²", npcs: 456, status: "building" },
              ].map(w => (
                <div key={w.name} className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-semibold text-white">{w.name}</p>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">{w.type} · {w.size} · {w.npcs} NPCs</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    w.status === "active"
                      ? "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20"
                      : "bg-[#27272A]/40 text-[#A1A1AA] border-[#27272A]"
                  }`}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Simulation Systems */}
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">C++ Simulation Systems</h2>
            <div className="flex flex-wrap gap-2">
              {["Behavior Tree","Combat AI","Dialogue","Ecology","Economy","Military","Quest Gen","Settlement AI","Skills","Story Director","Terrain Gen","Voice AI","Weather","World Director","Persistence","Memory Graph"].map(sys => (
                <span key={sys} className="px-3 py-1 rounded-xl bg-[#09090B] border border-[#27272A] text-xs text-[#A1A1AA] hover:border-[#8B5CF6]/40 transition-all">
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