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
      <header className="border-b border-[#27272A] bg-[#09090B] p-6 flex items-center shrink-0">
        <h1 className="text-lg font-semibold text-white">Settings</h1>
      </header>

      <div className="p-6 flex-1">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* API Keys */}
          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-1">Security</p>
              <h2 className="text-sm font-semibold text-white">API Keys</h2>
              <p className="text-xs text-[#A1A1AA] mt-1">Connect to AI providers. Keys stored locally — never sent to our servers.</p>
            </div>
            <div className="space-y-3 pt-2">
              {[
                { label: "OpenRouter", key: "sk-or-...", placeholder: "sk-or-v1-..." },
                { label: "OpenAI", key: "", placeholder: "sk-proj-..." },
                { label: "Anthropic", key: "", placeholder: "sk-ant-..." },
                { label: "Google AI", key: "", placeholder: "AIza..." },
              ].map(provider => (
                <div key={provider.label} className="flex items-center gap-4">
                  <label className="text-xs text-[#A1A1AA] w-28 shrink-0 font-medium">{provider.label}</label>
                  <input
                    type="password"
                    defaultValue={provider.key}
                    placeholder={provider.placeholder}
                    className="flex-1 bg-[#09090B] border border-[#27272A] rounded-xl px-4 py-2 text-xs text-white placeholder-[#A1A1AA] outline-none focus:border-[#D92A2A] transition-colors"
                  />
                  <button className="px-3 py-2 text-xs text-[#A1A1AA] hover:text-white transition-colors">Test</button>
                </div>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-1">Model Selection</p>
              <h2 className="text-sm font-semibold text-white">Default Model</h2>
              <p className="text-xs text-[#A1A1AA] mt-1">Choose the model for general chat and tasks.</p>
            </div>
            <select className="w-full bg-[#09090B] border border-[#27272A] rounded-xl px-4 py-2.5 text-xs text-[#A1A1AA] outline-none focus:border-[#D92A2A] transition-colors">
              <option>Qwen3 235B — Planning / Reasoning</option>
              <option selected>Llama 3.3 70B — General Chat</option>
              <option>Qwen 2.5 14B — Fast / Routine</option>
              <option>DeepSeek Coder V2 — Coding</option>
              <option>Qwen 2.5 VL 72B — Vision</option>
              <option>Qwen 2.5 72B — Long Context</option>
            </select>
          </div>

          {/* Theme */}
          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mb-1">Preferences</p>
              <h2 className="text-sm font-semibold text-white">Appearance</h2>
              <p className="text-xs text-[#A1A1AA] mt-1">Toggle the theme from the top-right corner of any page.</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="w-12 h-12 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#A1A1AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#27272A] border border-[#71717A] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#A1A1AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <span className="text-xs text-[#A1A1AA]">Click the sun/moon icon in the top-right corner</span>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#D92A2A] hover:bg-[#D92A2A]/90 text-white transition-all"
            >
              {saved ? "Saved!" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}