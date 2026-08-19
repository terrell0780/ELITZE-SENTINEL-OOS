"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full bg-[#09090B] overflow-y-auto flex flex-col">
      <header className="h-12 border-b border-[#27272A] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-[#0066FF] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#0066FF]/20">
            S
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">SETTINGS</span>
            <span className="text-[9px] font-semibold text-[#0066FF]/70 uppercase tracking-widest">Configuration</span>
          </div>
        </div>
      </header>

      <div className="p-6 flex-1">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* API Keys */}
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
            <div>
              <p className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-1">Security</p>
              <h2 className="text-[12px] font-semibold text-white">API Keys</h2>
              <p className="text-[11px] text-[#71717A] mt-1">Connect to AI providers. Keys stored locally — never sent to our servers.</p>
            </div>
            <div className="space-y-3 pt-2">
              {[
                { label: "OpenRouter", key: "sk-or-...", placeholder: "sk-or-v1-..." },
                { label: "OpenAI", key: "", placeholder: "sk-proj-..." },
                { label: "Anthropic", key: "", placeholder: "sk-ant-..." },
                { label: "Google AI", key: "", placeholder: "AIza..." },
              ].map(provider => (
                <div key={provider.label} className="flex items-center gap-4">
                  <label className="text-[11px] text-[#A1A1AA] w-28 shrink-0 font-medium">{provider.label}</label>
                  <input
                    type="password"
                    defaultValue={provider.key}
                    placeholder={provider.placeholder}
                    className="flex-1 bg-[#09090B] border border-[#27272A] rounded-md px-3 py-1.5 text-[11px] text-white placeholder-[#71717A] outline-none focus:border-[#0066FF] transition-colors"
                  />
                  <button className="bg-[#141418] border border-[#27272A] text-[#A1A1AA] hover:text-white text-[11px] font-semibold px-3 py-1.5 rounded-md">Test</button>
                </div>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
            <div>
              <p className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-1">Model Selection</p>
              <h2 className="text-[12px] font-semibold text-white">Default Model</h2>
              <p className="text-[11px] text-[#71717A] mt-1">Choose the model for general chat and tasks.</p>
            </div>
            <select className="w-full bg-[#09090B] border border-[#27272A] rounded-md px-3 py-1.5 text-[11px] text-white outline-none focus:border-[#0066FF] transition-colors">
              <option>Qwen3 235B — Planning / Reasoning</option>
              <option selected>Llama 3.3 70B — General Chat</option>
              <option>Qwen 2.5 14B — Fast / Routine</option>
              <option>DeepSeek Coder V2 — Coding</option>
              <option>Qwen 2.5 VL 72B — Vision</option>
              <option>Qwen 2.5 72B — Long Context</option>
            </select>
          </div>

          {/* Theme */}
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
            <div>
              <p className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest mb-1">Preferences</p>
              <h2 className="text-[12px] font-semibold text-white">Appearance</h2>
              <p className="text-[11px] text-[#71717A] mt-1">Toggle the theme from the top-right corner of any page.</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="w-10 h-10 rounded-md bg-[#09090B] border border-[#27272A] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#A1A1AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="w-10 h-10 rounded-md bg-[#18181B] border border-[#0066FF] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#0066FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <span className="text-[11px] text-[#A1A1AA]">Click the sun/moon icon in the top-right corner</span>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSave}
              className="bg-[#0066FF] text-white hover:opacity-90 text-[11px] font-semibold px-4 py-2 rounded-md transition-all"
            >
              {saved ? "Saved!" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}