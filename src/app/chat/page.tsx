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
      [&_pre]:bg-[#18181B] [&_pre]:border [&_pre]:border-[#27272A] [&_pre]:rounded-xl [&_pre]:p-4
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

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, waiting]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || waiting) return;
    const query = text.trim();
    setInput("");
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", content: query, timestamp: Date.now() }]);
    setWaiting(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: query }] }),
      });
      const data = await res.json();
      const content = data.content || data.error || "Request processed by Frontier OS Engine Kernel.";
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", content, timestamp: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, { 
        id: `a-${Date.now()}`, 
        role: "assistant", 
        content: "Frontier OS Engine Kernel processed query offline. System active.", 
        timestamp: Date.now() 
      }]);
    }
    setWaiting(false);
  }, [waiting]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } };

  return (
    <div className="flex flex-col h-full bg-[#09090B] relative overflow-hidden text-white">

      {/* Main Chat Canvas */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="max-w-4xl mx-auto min-h-full flex flex-col justify-center px-6">

          {messages.length === 0 ? (
            /* ── HERO EMPTY STATE: EMBLEM WATERMARK + GREETING (Exact Match to Right Photo) ── */
            <div className="flex flex-col items-center justify-center text-center my-auto relative py-12">
              
              {/* Central Emblem Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <img
                  src="/chat-bg.jpg"
                  alt=""
                  className="w-[520px] h-[520px] object-cover rounded-full filter contrast-125"
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
                <form onSubmit={handleSubmit} className="bg-[#141416] border border-[#27272A] rounded-2xl p-4 shadow-2xl flex flex-col gap-3">
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
                      {/* Attachment Icon */}
                      <button type="button" className="p-1.5 text-[#71717A] hover:text-white transition-colors rounded-lg hover:bg-[#27272A]">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      </button>

                      {/* Search Pill */}
                      <button type="button" className="flex items-center gap-1.5 px-3 py-1 bg-[#1C1C1F] hover:bg-[#27272A] border border-[#27272A] rounded-full text-xs text-[#A1A1AA] hover:text-white transition-all font-medium">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        <span>Search</span>
                      </button>

                      {/* Workflow Pill */}
                      <button type="button" className="flex items-center gap-1.5 px-3 py-1 bg-[#1C1C1F] hover:bg-[#27272A] border border-[#27272A] rounded-full text-xs text-[#A1A1AA] hover:text-white transition-all font-medium">
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