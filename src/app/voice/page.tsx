"use client";
import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

export default function VoicePage() {
  const [dbStats, setDbStats] = useState<any>({});
  const [missions, setMissions] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    brain.stats().then((d: any) => setDbStats(d || {}));
    brain.listMissions().then((d: any) => { if (Array.isArray(d)) setMissions(d.length); });
  }, []);

  const models = [
    { name: "Natural", desc: "Standard TTS" },
    { name: "Cinematic", desc: "Dramatic tone" },
    { name: "Narrator", desc: "Audiobook style" },
    { name: "Character", desc: "Game dialog" },
  ];

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto">
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#8B5CF6] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#8B5CF6]/20">
            V
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">VOICE STUDIO</span>
            <span className="text-[9px] font-semibold text-[#8B5CF6]/70 uppercase tracking-widest">Synthesis</span>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <section>
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Voice Models</h2>
            <div className="grid grid-cols-2 gap-3">
              {models.map(m => (
                <div key={m.name} className="bg-[#111115] border border-[#27272A] rounded-lg p-3 hover:bg-[#18181B] cursor-pointer transition-colors group">
                  <h3 className="text-[12px] font-semibold text-white group-hover:text-[#8B5CF6] transition-colors">{m.name}</h3>
                  <p className="text-[11px] text-[#71717A]">{m.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Synthesis Input</h2>
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-1">
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to synthesize..."
                className="w-full h-32 bg-transparent border-none outline-none text-white text-[13px] p-3 resize-none"
              />
              <div className="flex justify-between items-center p-3 border-t border-[#27272A]">
                <span className="text-[11px] text-[#52525B]">{text.length} characters</span>
                <button className="bg-[#8B5CF6] text-white hover:opacity-90 text-[11px] font-semibold px-4 py-1.5 rounded-md">
                  Synthesize
                </button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Waveform Preview</h2>
            <div className="bg-[#111115] border border-[#27272A] rounded-lg h-24 flex items-end justify-center gap-1 p-4 overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="w-1.5 bg-[#8B5CF6]/40 rounded-t-sm" style={{ height: `${Math.max(10, Math.random() * 100)}%` }}></div>
              ))}
            </div>
          </section>
        </div>

        <div className="w-full lg:w-72 space-y-6">
          <section>
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Output Controls</h2>
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-5 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] text-[#A1A1AA]">Speed</label>
                  <span className="text-[11px] font-mono text-white">1.0x</span>
                </div>
                <input type="range" min="0.5" max="2" step="0.1" defaultValue="1" className="w-full accent-[#8B5CF6]" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[11px] text-[#A1A1AA]">Pitch</label>
                  <span className="text-[11px] font-mono text-white">0</span>
                </div>
                <input type="range" min="-10" max="10" step="1" defaultValue="0" className="w-full accent-[#8B5CF6]" />
              </div>
              <div>
                <label className="text-[11px] text-[#A1A1AA] block mb-2">Voice Style</label>
                <select className="w-full bg-[#141418] border border-[#27272A] text-white text-[11px] p-2 rounded outline-none">
                  <option>Default</option>
                  <option>Whisper</option>
                  <option>Shout</option>
                </select>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-4">Recent Generations</h2>
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-3">
              {['Welcome to the system', 'Alert: Intrusion detected', 'Processing task data'].map((gen, i) => (
                <div key={i} className="flex justify-between items-center text-[11px]">
                  <span className="text-white truncate pr-2">"{gen}"</span>
                  <span className="text-[#8B5CF6] hover:text-white cursor-pointer whitespace-nowrap">Play</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
