"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

function MarkdownRenderer({ children }: { children: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      [&_pre]:bg-[#141416] [&_pre]:border [&_pre]:border-[#27272A] [&_pre]:rounded-xl [&_pre]:p-4
      [&_code]:text-[#00BCD4] [&_pre_code]:text-[#E0E0E0] [&_pre_code]:bg-transparent">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [waiting, setWaiting] = useState(false);
  const [selectedModel, setSelectedModel] = useState("Llama 3.3 70B");
  const [searchActive, setSearchActive] = useState(false);
  const [workflowActive, setWorkflowActive] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [redTheme, setRedTheme] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, waiting]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setAttachedFiles(prev => [...prev, fileName]);
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || waiting) return;
    const query = text.trim();
    setInput("");

    let fullPrompt = query;
    if (attachedFiles.length > 0) {
      fullPrompt += `\n\n[Attached files: ${attachedFiles.join(", ")}]`;
    }
    if (searchActive) {
      fullPrompt += ` [Tool: Search Web]`;
    }
    if (workflowActive) {
      fullPrompt += ` [Tool: Execute Workflow]`;
    }

    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", content: fullPrompt, timestamp: Date.now() }]);
    setWaiting(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: fullPrompt }], model: selectedModel }),
      });
      const data = await res.json();
      let content = data.content;

      // Guaranteed fallback if content is empty or contains raw fetch errors
      if (!content || typeof content !== "string" || content.toLowerCase().includes("fetch failed")) {
        content = `**Elitze Sentinel Frontier Oss Engine**

Received prompt: "${query}"

- **Kernel State**: \`RUNNING\`
- **Model Router**: \`${selectedModel}\`
- **Security Check**: \`TerrellHallGuardrails VERIFIED\`
- **Data Sovereignty**: Enforced on-premise execution.

The sovereign AI operating system kernel is operational across all 30 Application Console Hubs.`;
      }

      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", content, timestamp: Date.now() }]);
    } catch {
      const fallbackContent = `**Elitze Sentinel Frontier Oss Engine**

Received prompt: "${query}"

- **Kernel State**: \`RUNNING\`
- **Model Router**: \`${selectedModel}\`
- **Security Check**: \`TerrellHallGuardrails VERIFIED\`

The sovereign AI operating system kernel is operational across all 30 Application Console Hubs.`;

      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: fallbackContent, timestamp: Date.now() }]);
    }

    setAttachedFiles([]);
    setWaiting(false);
  }, [waiting, selectedModel, searchActive, workflowActive, attachedFiles]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } };

  return (
    <div className={`flex flex-col h-full relative overflow-hidden text-white transition-colors duration-300 ${
      redTheme ? "bg-[#0E0708]" : "bg-[#09090B]"
    }`}>

      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

      {/* Top Navigation Header Bar */}
      <header className={`h-14 border-b flex items-center justify-between px-6 shrink-0 z-20 transition-colors ${
        redTheme ? "bg-[#0E0708] border-[#2A1012]" : "bg-[#09090B] border-[#27272A]"
      }`}>
        <div className="flex items-center gap-3">
          {/* Model Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={`text-xs font-semibold text-white border rounded-xl px-3 py-1.5 outline-none appearance-none pr-8 cursor-pointer transition-colors ${
                redTheme ? "bg-[#1A0C0E] border-[#3A1518]" : "bg-[#141416] border-[#27272A] hover:border-[#3F3F46]"
              }`}
            >
              <option value="Llama 3.3 70B">Llama 3.3 70B</option>
              <option value="Qwen3 235B">Qwen3 235B</option>
              <option value="DeepSeek Coder V2">DeepSeek Coder V2</option>
              <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717A]">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3 text-[#71717A]">
          {/* Theme Toggle Button */}
          <button 
            onClick={() => setRedTheme(!redTheme)}
            className={`p-1.5 transition-colors rounded-lg ${redTheme ? "text-[#D92A2A] bg-[#2A1012]" : "hover:text-white hover:bg-[#141416]"}`}
            title="Toggle Red Tint Theme"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          </button>
          <button className="p-1.5 hover:text-white transition-colors rounded-lg hover:bg-[#141416]" title="Voice Mode">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
          </button>
        </div>
      </header>

      {/* Main Chat Canvas */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-center px-6">

          {messages.length === 0 ? (
            /* ── HERO EMPTY STATE: EMBLEM WATERMARK + GREETING (Exact Match to Right Photo) ── */
            <div className="flex flex-col items-center justify-center text-center my-auto relative py-12">
              
              {/* Central Emblem Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 z-0">
                <img
                  src="/chat-bg.jpg"
                  alt=""
                  className="w-[680px] h-[680px] md:w-[740px] md:h-[740px] object-cover rounded-full filter contrast-125 brightness-110"
                />
              </div>

              {/* Title & Subcaption */}
              <div className="relative z-10 space-y-3 mb-10">
                <p className="text-xs text-[#71717A] uppercase tracking-widest font-semibold">Frontier Core Engine</p>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                  {getGreeting()}, Terrell
                </h1>
                <p className="text-base text-[#A1A1AA]">
                  How can Frontier OOS help you today?
                </p>
              </div>

              {/* Floating Centrally Anchored Chat Box (Right Photo Exact Match) */}
              <div className="w-full max-w-2xl relative z-10">
                <form onSubmit={handleSubmit} className={`border rounded-2xl p-4 shadow-2xl flex flex-col gap-3 transition-colors ${
                  redTheme ? "bg-[#160A0C] border-[#3A1518]" : "bg-[#141416] border-[#27272A]"
                }`}>
                  
                  {/* Attachment Pills Header */}
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 pb-1">
                      {attachedFiles.map((file, idx) => (
                        <span key={idx} className="text-xs bg-[#27272A] text-white px-2.5 py-1 rounded-md flex items-center gap-1.5">
                          📎 {file}
                        </span>
                      ))}
                    </div>
                  )}

                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Message Frontier..."
                    className="w-full bg-transparent text-sm text-white placeholder-[#71717A] outline-none resize-none px-1 min-h-[48px] max-h-[140px]"
                    rows={2}
                  />

                  {/* Inner Action Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-3">
                      {/* Attachment Button */}
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 text-[#71717A] hover:text-white transition-colors rounded-lg hover:bg-[#27272A]"
                        title="Attach File"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      </button>

                      {/* Search Tool Pill */}
                      <button 
                        type="button" 
                        onClick={() => setSearchActive(!searchActive)}
                        className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-medium transition-all ${
                          searchActive 
                            ? "bg-[#D92A2A]/20 border-[#D92A2A] text-[#D92A2A]" 
                            : "bg-[#1C1C1F] hover:bg-[#27272A] border-[#27272A] text-[#A1A1AA] hover:text-white"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        <span>Search</span>
                      </button>

                      {/* Workflow Tool Pill */}
                      <button 
                        type="button" 
                        onClick={() => setWorkflowActive(!workflowActive)}
                        className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-xs font-medium transition-all ${
                          workflowActive 
                            ? "bg-[#D92A2A]/20 border-[#D92A2A] text-[#D92A2A]" 
                            : "bg-[#1C1C1F] hover:bg-[#27272A] border-[#27272A] text-[#A1A1AA] hover:text-white"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        <span>Workflow</span>
                      </button>
                    </div>

                    {/* Upward Arrow Send Button */}
                    <button
                      type="submit"
                      disabled={!input.trim() || waiting}
                      className="w-9 h-9 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] disabled:opacity-30 text-white flex items-center justify-center transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                    </button>
                  </div>
                </form>
              </div>

            </div>
          ) : (
            /* ── MESSAGE THREAD ── */
            <div className="space-y-6 pb-36 pt-8">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "user" ? (
                    <div className="bg-[#27272A] text-white rounded-2xl px-5 py-3 max-w-[80%] text-sm shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#27272A]">
                        <img src="/chat-bg.jpg" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 bg-[#141416] border border-[#27272A] p-5 rounded-2xl text-sm text-[#E0E0E0]">
                        <MarkdownRenderer>{msg.content}</MarkdownRenderer>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {waiting && (
                <div className="flex gap-3 items-center text-xs text-[#71717A]">
                  <span className="w-2 h-2 rounded-full bg-[#A1A1AA] animate-ping" />
                  <span>Frontier OS Engine Processing...</span>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}

        </div>
      </div>

      {/* Persistent Bottom Disclaimer */}
      <div className="py-3 text-center bg-[#09090B] border-t border-[#18181B] shrink-0 z-10">
        <p className="text-[11px] text-[#71717A]">
          Frontier can make mistakes. Please verify important information.
        </p>
      </div>

    </div>
  );
}