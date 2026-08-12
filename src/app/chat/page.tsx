"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { brain } from "@/lib/brain";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

function MarkdownRenderer({ children }: { children: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      [&_pre]:bg-[#1A1A1F] [&_pre]:border [&_pre]:border-[#2A2A30] [&_pre]:rounded-xl [&_pre]:p-4
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
      const result = await brain.chat(query);
      const content = result.success ? result.content : `Error: ${result.error || "Failed to reach brain"}`;
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", content, timestamp: Date.now() }]);
    } catch {
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: "Error processing request.", timestamp: Date.now() }]);
    }
    setWaiting(false);
  }, [waiting]);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };
  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } };

  return (
    <div className="flex flex-col h-full bg-[#0E0E12] relative overflow-hidden text-white">

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col justify-center px-6">

          {messages.length === 0 ? (
            /* ── EMPTY STATE: Logo BG + Greeting (Matching LEFT screenshot) ── */
            <div className="flex flex-col items-center justify-center text-center my-auto relative py-12">
              {/* Background Logo Image */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  src="/chat-bg.jpg"
                  alt=""
                  className="w-[420px] h-[420px] object-cover rounded-full opacity-30"
                />
              </div>

              <div className="relative z-10 space-y-4">
                <p className="text-xs text-[#6B6B78] uppercase tracking-widest font-semibold">Frontier Core Engine</p>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  {getGreeting()}, Terrell
                </h1>
                <p className="text-sm text-[#6B6B78]">
                  How can Frontier OS help you today?
                </p>
              </div>
            </div>
          ) : (
            /* ── MESSAGE THREAD ── */
            <div className="space-y-6 pb-36 pt-8">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "user" ? (
                    <div className="bg-[#D92A2A] text-white rounded-2xl px-5 py-3 max-w-[80%] text-sm shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex gap-3 w-full">
                      <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-[#2A2A30]">
                        <img src="/chat-bg.jpg" alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 bg-[#1A1A1F] border border-[#2A2A30] p-5 rounded-2xl text-sm text-[#E0E0E0]">
                        <MarkdownRenderer>{msg.content}</MarkdownRenderer>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {waiting && (
                <div className="flex gap-3 items-center text-xs text-[#6B6B78]">
                  <span className="w-2 h-2 rounded-full bg-[#D92A2A] animate-ping" />
                  <span>Processing...</span>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>
      </div>

      {/* ── FLOATING INPUT BAR (Matching LEFT screenshot) ── */}
      <div className="absolute bottom-0 inset-x-0 px-6 pb-4 pt-2 bg-gradient-to-t from-[#0E0E12] via-[#0E0E12] to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <form onSubmit={handleSubmit} className="bg-[#1A1A1F] border border-[#2A2A30] rounded-2xl p-3 shadow-xl flex items-end gap-3">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Message Frontier..."
              className="flex-1 bg-transparent text-sm text-white placeholder-[#4A4A55] outline-none resize-none px-3 min-h-[24px] max-h-[120px]"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || waiting}
              className="w-8 h-8 rounded-full bg-[#D92A2A] hover:bg-[#B91C1C] disabled:opacity-30 text-white flex items-center justify-center shrink-0 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>

          {/* Action Bar Below Input */}
          <div className="flex items-center justify-between mt-2 px-2">
            <div className="flex items-center gap-5">
              <button className="flex items-center gap-1.5 text-xs text-[#6B6B78] hover:text-white transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                <span>Attach</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs text-[#6B6B78] hover:text-white transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <span>Search</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs text-[#6B6B78] hover:text-white transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <span>Workflow</span>
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#4A4A55] mt-2">
            Frontier can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}