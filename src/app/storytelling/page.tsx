"use client";

export default function StorytellingPage() {
  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto">
      <header className="h-12 border-b border-[#1F1F28] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-md bg-[#8B5CF6] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#8B5CF6]/20">
      S
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-white tracking-tight">STORYTELLING</span>
      <span className="text-[9px] font-semibold text-[#8B5CF6]/70 uppercase tracking-widest">Narrative Engine</span>
    </div>
  </div>

</header>
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Generate */}
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
            <p className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-2">Narrative Generator</p>
            <h2 className="text-[12px] font-semibold text-white mb-4">AI Storyteller</h2>
            <textarea 
              placeholder="Describe your story — genre, characters, setting, plot..."
              className="w-full bg-[#09090B] border border-[#27272A] rounded-xl p-4 text-xs text-white placeholder-[#71717A] outline-none focus:border-[#8B5CF6]/40 transition-all resize-none min-h-[100px] mb-4" 
            />
            <div className="flex flex-wrap items-center gap-3">
              <select className="bg-[#09090B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#A1A1AA] outline-none focus:border-[#8B5CF6]/40">
                <option>Genre: Fantasy</option>
                <option>Genre: Sci-Fi</option>
                <option>Genre: Horror</option>
                <option>Genre: Drama</option>
              </select>
              <select className="bg-[#09090B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#A1A1AA] outline-none focus:border-[#8B5CF6]/40">
                <option>Format: Short Story</option>
                <option>Format: Novel Chapter</option>
                <option>Format: Screenplay</option>
                <option>Format: Game Script</option>
              </select>
              <button className="px-3 py-1.5 bg-[#8B5CF6] text-white text-[11px] font-semibold rounded-md hover:opacity-90 transition-all ml-auto">
                Generate Story
              </button>
            </div>
          </div>

          {/* Elements */}
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: "Characters", icon: "CH", desc: "AI-generated character profiles with backstories, arcs, and relationships", items: "12 characters" },
              { name: "World Building", icon: "WB", desc: "Geography, cultures, history, magic systems, technology trees", items: "8 worlds" },
              { name: "Plot Generator", icon: "PG", desc: "Three-act structure, plot twists, subplots, and narrative pacing", items: "15 plots" },
            ].map(t => (
              <div key={t.name} className="bg-[#111115] border border-[#27272A] rounded-lg p-4 hover:border-[#8B5CF6]/40 transition-all">
                <span className="text-xs font-mono font-bold text-[#8B5CF6] mb-3 block">{t.icon}</span>
                <h3 className="text-[12px] font-semibold text-white mb-2">{t.name}</h3>
                <p className="text-xs text-[#A1A1AA] mb-4">{t.desc}</p>
                <span className="text-[10px] font-semibold text-[#52525B] uppercase tracking-wider">{t.items}</span>
              </div>
            ))}
          </div>

          {/* Recent */}
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Recent Stories</h2>
            <div className="space-y-3">
              {[
                { name: "The Crystal Expanse", type: "Fantasy", status: "draft", words: 4500 },
                { name: "Neon Dreams", type: "Sci-Fi", status: "outline", words: 1200 },
                { name: "Whispers in the Dark", type: "Horror", status: "complete", words: 12000 },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between bg-[#09090B] border border-[#27272A] rounded-xl p-4">
                  <div>
                    <p className="text-[12px] font-semibold text-white">{s.name}</p>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">{s.type} · {s.words.toLocaleString()} words</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    s.status === "complete" 
                      ? "bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20" 
                      : "bg-[#27272A]/40 text-[#A1A1AA] border-[#27272A]"
                  }`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}