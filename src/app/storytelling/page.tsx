"use client";

export default function StorytellingPage() {
  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto">
      <header className="px-6 py-5 border-b border-[#27272A] shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Storytelling Studio</h1>
          <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mt-0.5">
            AI Narrative & Script Engine
          </p>
        </div>
      </header>
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Generate */}
          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6">
            <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-2">Narrative Generator</p>
            <h2 className="text-base font-semibold text-white mb-4">AI Storyteller</h2>
            <textarea 
              placeholder="Describe your story — genre, characters, setting, plot..."
              className="w-full bg-[#09090B] border border-[#27272A] rounded-xl p-4 text-xs text-white placeholder-[#71717A] outline-none focus:border-[#D92A2A]/40 transition-all resize-none min-h-[100px] mb-4" 
            />
            <div className="flex flex-wrap items-center gap-3">
              <select className="bg-[#09090B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#A1A1AA] outline-none focus:border-[#D92A2A]/40">
                <option>Genre: Fantasy</option>
                <option>Genre: Sci-Fi</option>
                <option>Genre: Horror</option>
                <option>Genre: Drama</option>
              </select>
              <select className="bg-[#09090B] border border-[#27272A] rounded-xl px-3 py-2 text-xs text-[#A1A1AA] outline-none focus:border-[#D92A2A]/40">
                <option>Format: Short Story</option>
                <option>Format: Novel Chapter</option>
                <option>Format: Screenplay</option>
                <option>Format: Game Script</option>
              </select>
              <button className="px-4 py-2 bg-[#D92A2A] text-white text-xs font-semibold rounded-xl hover:bg-[#D92A2A]/90 transition-all ml-auto">
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
              <div key={t.name} className="bg-[#111113] border border-[#27272A] rounded-xl p-6 hover:border-[#D92A2A]/40 transition-all">
                <span className="text-xs font-mono font-bold text-[#D92A2A] mb-3 block">{t.icon}</span>
                <h3 className="text-base font-semibold text-white mb-2">{t.name}</h3>
                <p className="text-xs text-[#A1A1AA] mb-4">{t.desc}</p>
                <span className="text-[10px] font-semibold text-[#71717A] uppercase tracking-wider">{t.items}</span>
              </div>
            ))}
          </div>

          {/* Recent */}
          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6">
            <h2 className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-4">Recent Stories</h2>
            <div className="space-y-3">
              {[
                { name: "The Crystal Expanse", type: "Fantasy", status: "draft", words: 4500 },
                { name: "Neon Dreams", type: "Sci-Fi", status: "outline", words: 1200 },
                { name: "Whispers in the Dark", type: "Horror", status: "complete", words: 12000 },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between bg-[#09090B] border border-[#27272A] rounded-xl p-4">
                  <div>
                    <p className="text-xs font-semibold text-white">{s.name}</p>
                    <p className="text-xs text-[#A1A1AA] mt-0.5">{s.type} · {s.words.toLocaleString()} words</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    s.status === "complete" 
                      ? "bg-[#D92A2A]/10 text-[#D92A2A] border-[#D92A2A]/20" 
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