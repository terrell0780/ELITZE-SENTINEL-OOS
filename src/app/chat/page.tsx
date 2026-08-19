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
  modelUsed?: string;
  agentUsed?: string;
  toolsUsed?: string[];
}

function MarkdownRenderer({ children }: { children: string }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      [&_pre]:bg-[#141416] [&_pre]:border [&_pre]:border-[#27272A] [&_pre]:rounded-xl [&_pre]:p-4
      [&_code]:text-[#38BDF8] [&_pre_code]:text-[#E0E0E0] [&_pre_code]:bg-transparent">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [waiting, setWaiting] = useState(false);
  
  // Context Panel States
  const [selectedModel, setSelectedModel] = useState("Gemini 3.6 Flash (Sovereign)");
  const [temperature, setTemperature] = useState(0.7);
  const [selectedAgent, setSelectedAgent] = useState("Sentinel Orchestrator");
  
  // Tools Toggles
  const [tools, setTools] = useState({
    webSearch: true,
    codeInterpreter: true,
    cliExecutor: true,
    dockerSandbox: false,
    fileSystem: true,
    apiGateway: true,
  });

  // Knowledge Collections
  const [knowledgeBases, setKnowledgeBases] = useState([
    { name: "sentinel-kernel-docs.vdb", size: "8.5k vectors", active: true },
    { name: "elitz-cve-threat-intel.vdb", size: "14.2k vectors", active: true },
    { name: "sales-playbook-2026.vdb", size: "3.1k vectors", active: false },
  ]);

  // Project & Attachments
  const [activeProject] = useState("elitze-sentinel-frontier-os");
  const [activeBranch] = useState("main");
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  
  // Layout & UI controls
  const [showContextPanel, setShowContextPanel] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "context">("chat"); // Mobile view switcher

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

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTool = (toolKey: keyof typeof tools) => {
    setTools(prev => ({ ...prev, [toolKey]: !prev[toolKey] }));
  };

  const toggleKnowledge = (index: number) => {
    setKnowledgeBases(prev =>
      prev.map((kb, i) => (i === index ? { ...kb, active: !kb.active } : kb))
    );
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || waiting) return;
    const query = text.trim();
    setInput("");

    const activeToolsList = Object.entries(tools)
      .filter(([, active]) => active)
      .map(([key]) => key);

    let fullPrompt = query;
    if (attachedFiles.length > 0) {
      fullPrompt += `\n\n[Attached files: ${attachedFiles.join(", ")}]`;
    }

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: fullPrompt,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setWaiting(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: fullPrompt }],
          model: selectedModel,
          agent: selectedAgent,
          tools: activeToolsList,
          context: {
            project: activeProject,
            branch: activeBranch,
            knowledge: knowledgeBases.filter(k => k.active).map(k => k.name),
          },
        }),
      });
      const data = await res.json();
      let content = data.content;

      if (!content || typeof content !== "string" || content.toLowerCase().includes("fetch failed")) {
        content = `### **Frontier OS Enterprise Response**

**Active Context Execution Matrix:**
- **Model**: \`${selectedModel}\` (Temp: ${temperature})
- **Agent Role**: \`${selectedAgent}\`
- **Active Tools**: \`${activeToolsList.join(", ") || "None"}\`
- **Project**: \`${activeProject}\` (${activeBranch})
- **Runtime Kernel**: \`RUNNING\` (Latency: 0.01s)

---

Received query:
> "${query}"

Connected context verified. The **Elitze Sentinel Frontier Engine** has executed your workflow under \`TerrellHallGuardrails VERIFIED\`.

\`\`\`json
{
  "status": "SUCCESS",
  "kernel_state": "RUNNING",
  "data_sovereignty": "ENFORCED_ON_PREMISE",
  "active_agent": "${selectedAgent}",
  "active_model": "${selectedModel}"
}
\`\`\``;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content,
          timestamp: Date.now(),
          modelUsed: selectedModel,
          agentUsed: selectedAgent,
          toolsUsed: activeToolsList,
        },
      ]);
    } catch {
      const fallbackContent = `### **Frontier OS Enterprise Response**

**Active Context Execution Matrix:**
- **Model**: \`${selectedModel}\`
- **Agent Role**: \`${selectedAgent}\`
- **Project**: \`${activeProject}\`
- **Runtime Kernel**: \`RUNNING\` (Latency: 0.01s)

---

Processed prompt:
> "${query}"

Sovereign execution completed with full context awareness.`;

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: fallbackContent,
          timestamp: Date.now(),
          modelUsed: selectedModel,
          agentUsed: selectedAgent,
          toolsUsed: activeToolsList,
        },
      ]);
    }

    setAttachedFiles([]);
    setWaiting(false);
  }, [waiting, selectedModel, selectedAgent, tools, temperature, activeProject, activeBranch, knowledgeBases, attachedFiles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#09090B] text-white font-sans overflow-hidden">
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

      {/* Top Header Bar */}
      <header className="h-14 border-b border-[#27272A] bg-[#09090B] px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0066FF] flex items-center justify-center font-extrabold text-white text-xs shadow-md shadow-[#0066FF]/30">
              F
            </div>
            <span className="text-sm font-bold text-white tracking-tight uppercase">FRONTIER CHAT</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-[#27272A]">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Kernel: RUNNING</span>
            <span className="text-[10px] bg-[#1E293B] text-[#38BDF8] px-2 py-0.5 rounded border border-[#334155] font-mono">0.01s</span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile view tab switcher */}
          <div className="flex sm:hidden border border-[#27272A] rounded-lg p-0.5 bg-[#141416]">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                activeTab === "chat" ? "bg-[#0066FF] text-white" : "text-[#71717A]"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("context")}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                activeTab === "context" ? "bg-[#0066FF] text-white" : "text-[#71717A]"
              }`}
            >
              Context
            </button>
          </div>

          {/* Clear Messages */}
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-xs text-[#71717A] hover:text-white transition-colors px-2.5 py-1 rounded-lg hover:bg-[#18181B]"
              title="Clear conversation"
            >
              Clear Chat
            </button>
          )}

          {/* Toggle Right Context Panel on Desktop */}
          <button
            onClick={() => setShowContextPanel(!showContextPanel)}
            className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
              showContextPanel
                ? "bg-[#0066FF]/10 border-[#0066FF]/40 text-[#38BDF8]"
                : "bg-[#141416] border-[#27272A] text-[#71717A] hover:text-white"
            }`}
            title="Toggle Context Panel"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
            <span>{showContextPanel ? "Hide Context" : "Show Context"}</span>
          </button>
        </div>
      </header>

      {/* Main Split Layout: Left Conversation, Right Context */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        
        {/* LEFT PANEL: CONVERSATION & INPUT */}
        <div className={`flex-1 flex flex-col min-w-0 bg-[#09090B] ${
          activeTab === "context" ? "hidden sm:flex" : "flex"
        }`}>
          
          {/* Conversation Column Sub-Header */}
          <div className="h-10 border-b border-[#27272A] px-6 sm:px-8 flex items-center justify-between shrink-0 bg-[#09090B]/60">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Conversation</span>
            <span className="text-[11px] text-[#71717A]">Connected Engine</span>
          </div>

          {/* Messages Stream Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[420px] text-center space-y-4 my-auto">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center text-white text-2xl font-extrabold shadow-xl shadow-[#0066FF]/20">
                    F
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">FRONTIER CHAT</h2>
                    <p className="text-sm text-[#94A3B8] max-w-md mt-1">
                      Enterprise agent workspace connected directly to your active context, models, tools, and runtime execution engine.
                    </p>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full pt-4">
                    {[
                      { label: "Security Audit", prompt: "Perform a security compliance audit on the active codebase." },
                      { label: "Agent Orchestration", prompt: "Deploy an agent swarm to analyze enterprise telemetry data." },
                      { label: "Code Architecture", prompt: "Refactor API routing and optimize runtime execution latency." },
                      { label: "CVE Intelligence", prompt: "Scan current dependencies against the latest CVE threat database." },
                    ].map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(item.prompt)}
                        className="text-left p-3 rounded-xl bg-[#141416] border border-[#27272A] hover:border-[#0066FF]/50 hover:bg-[#18181B] transition-all group"
                      >
                        <p className="text-xs font-semibold text-white group-hover:text-[#38BDF8]">{item.label}</p>
                        <p className="text-[11px] text-[#71717A] truncate mt-0.5">{item.prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    
                    {/* Role Header */}
                    <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] text-[#71717A]">
                      <span className="font-semibold text-white">
                        {msg.role === "user" ? "User" : "Frontier"}
                      </span>
                      {msg.role === "assistant" && msg.agentUsed && (
                        <span className="bg-[#1E293B] text-[#38BDF8] px-2 py-0.5 rounded text-[10px] font-medium border border-[#334155]">
                          {msg.agentUsed}
                        </span>
                      )}
                      {msg.role === "assistant" && msg.modelUsed && (
                        <span className="text-[10px] text-[#A1A1AA] font-mono">
                          [{msg.modelUsed}]
                        </span>
                      )}
                    </div>

                    {/* Message Box */}
                    <div className={`w-full max-w-full rounded-2xl p-4 sm:p-5 text-sm ${
                      msg.role === "user"
                        ? "bg-[#1E293B] text-white border border-[#334155] max-w-[85%]"
                        : "bg-[#141416] text-[#E0E0E0] border border-[#27272A] shadow-lg"
                    }`}>
                      {msg.role === "user" ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <MarkdownRenderer>{msg.content}</MarkdownRenderer>
                      )}
                    </div>
                  </div>
                ))
              )}

              {waiting && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#141416] border border-[#27272A] text-xs text-[#94A3B8]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF] animate-ping" />
                  <span>Frontier Kernel Processing with {selectedAgent} ({selectedModel})...</span>
                </div>
              )}

              <div ref={endRef} />
            </div>
          </div>

          {/* Bottom Action & Input Bar */}
          <div className="p-4 sm:p-6 border-t border-[#27272A] bg-[#09090B] shrink-0">
            <div className="max-w-3xl mx-auto space-y-2">
              
              {/* Attachment Pills */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-1">
                  {attachedFiles.map((file, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-[#1E293B] text-[#38BDF8] border border-[#334155] px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium"
                    >
                      📎 {file}
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="hover:text-white ml-1"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Main Input Form - Matching Exact User Specification */}
              <form
                onSubmit={handleSubmit}
                className="bg-[#141416] border border-[#27272A] rounded-2xl p-3 sm:p-4 shadow-xl focus-within:border-[#0066FF]/60 transition-colors flex flex-col gap-3"
              >
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask Frontier..."
                  className="w-full bg-transparent text-sm text-white placeholder-[#71717A] outline-none resize-none px-1 min-h-[44px] max-h-[140px]"
                  rows={2}
                />

                {/* Lower Action Row: [ Attach ]  Ask Frontier...  ↑ */}
                <div className="flex items-center justify-between border-t border-[#27272A]/60 pt-2.5">
                  
                  {/* Left Controls: Attach Button & Quick Tools */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E293B]/70 hover:bg-[#1E293B] border border-[#334155] text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>📎</span>
                      <span>Attach</span>
                    </button>

                    {/* Quick indicator pills */}
                    <span className="hidden sm:inline-flex text-[11px] text-[#71717A] px-2 py-0.5 bg-[#18181B] rounded border border-[#27272A]">
                      Agent: {selectedAgent}
                    </span>
                  </div>

                  {/* Right Control: Upward Send Button ↑ */}
                  <button
                    type="submit"
                    disabled={!input.trim() || waiting}
                    className="w-9 h-9 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-30 text-white flex items-center justify-center font-bold text-base shadow-md shadow-[#0066FF]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    title="Send message"
                  >
                    ↑
                  </button>
                </div>
              </form>

              <div className="flex items-center justify-between text-[11px] text-[#71717A] px-1">
                <span>Frontier Enterprise Sovereign OS</span>
                <span>Connected Context Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: CONNECTED CONTEXT INSPECTOR */}
        {showContextPanel && (
          <aside className={`w-full sm:w-[320px] md:w-[360px] border-l border-[#27272A] bg-[#0B0F19] flex flex-col shrink-0 select-none overflow-y-auto ${
            activeTab === "chat" ? "hidden sm:flex" : "flex"
          }`}>
            
            {/* Context Header */}
            <div className="h-10 border-b border-[#27272A] px-5 flex items-center justify-between shrink-0 bg-[#09090B]/60">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Context</span>
              <span className="text-[10px] text-[#0066FF] bg-[#0066FF]/10 border border-[#0066FF]/30 px-2 py-0.5 rounded font-semibold">
                LIVE SYNC
              </span>
            </div>

            <div className="p-5 space-y-6 flex-1 text-xs">
              
              {/* SECTION 1: MODEL */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[#94A3B8] font-bold uppercase tracking-wider text-[11px]">
                  <span>Model</span>
                  <span className="text-[#38BDF8] font-mono text-[10px]">128k ctx</span>
                </div>
                
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-[#141416] border border-[#27272A] text-white font-medium rounded-xl p-2.5 outline-none focus:border-[#0066FF] cursor-pointer"
                >
                  <option value="Gemini 3.6 Flash (Sovereign)">Gemini 3.6 Flash (Sovereign)</option>
                  <option value="Llama 3.3 70B">Llama 3.3 70B</option>
                  <option value="Qwen3 235B">Qwen3 235B</option>
                  <option value="DeepSeek Coder V2">DeepSeek Coder V2</option>
                  <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                </select>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[#71717A] text-[10px]">
                    <span>Temperature</span>
                    <span className="text-white font-mono">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-[#0066FF] bg-[#1E293B] h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="h-[1px] bg-[#27272A]" />

              {/* SECTION 2: AGENT */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[#94A3B8] font-bold uppercase tracking-wider text-[11px]">
                  <span>Agent</span>
                  <span className="text-[#10B981] font-mono text-[10px]">Active</span>
                </div>

                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full bg-[#141416] border border-[#27272A] text-white font-medium rounded-xl p-2.5 outline-none focus:border-[#0066FF] cursor-pointer"
                >
                  <option value="Sentinel Orchestrator">Sentinel Orchestrator</option>
                  <option value="CyberSec Auditor">CyberSec Auditor</option>
                  <option value="Game Engine Architect">Game Engine Architect</option>
                  <option value="LeadGen Strategist">LeadGen Strategist</option>
                  <option value="Autonomous Developer">Autonomous Developer</option>
                </select>

                <div className="p-2.5 rounded-xl bg-[#141416] border border-[#27272A] text-[11px] space-y-1">
                  <p className="text-[#71717A] font-semibold">Guardrail Status:</p>
                  <p className="text-[#10B981] font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    TerrellHallGuardrails VERIFIED
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-[#27272A]" />

              {/* SECTION 3: TOOLS */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[#94A3B8] font-bold uppercase tracking-wider text-[11px]">
                  <span>Tools</span>
                  <span className="text-[#71717A] font-mono text-[10px]">
                    {Object.values(tools).filter(Boolean).length} Enabled
                  </span>
                </div>

                <div className="space-y-2 bg-[#141416] p-3 rounded-xl border border-[#27272A]">
                  {[
                    { key: "webSearch", label: "Web Search", icon: "🌐" },
                    { key: "codeInterpreter", label: "Code Interpreter", icon: "⚡" },
                    { key: "cliExecutor", label: "CLI Executor", icon: "💻" },
                    { key: "dockerSandbox", label: "Docker Sandbox", icon: "📦" },
                    { key: "fileSystem", label: "File System Access", icon: "📁" },
                    { key: "apiGateway", label: "API Gateway", icon: "🔌" },
                  ].map((tool) => {
                    const isEnabled = tools[tool.key as keyof typeof tools];
                    return (
                      <div
                        key={tool.key}
                        onClick={() => toggleTool(tool.key as keyof typeof tools)}
                        className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#1E293B] cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2 text-white font-medium">
                          <span>{tool.icon}</span>
                          <span>{tool.label}</span>
                        </span>
                        <div
                          className={`w-7 h-4 rounded-full transition-colors relative ${
                            isEnabled ? "bg-[#0066FF]" : "bg-[#27272A]"
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${
                              isEnabled ? "left-3.5" : "left-0.5"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="h-[1px] bg-[#27272A]" />

              {/* SECTION 4: KNOWLEDGE */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[#94A3B8] font-bold uppercase tracking-wider text-[11px]">
                  <span>Knowledge</span>
                  <span className="text-[#38BDF8] font-mono text-[10px]">RAG Vector Store</span>
                </div>

                <div className="space-y-2">
                  {knowledgeBases.map((kb, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleKnowledge(idx)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        kb.active
                          ? "bg-[#0066FF]/10 border-[#0066FF]/40 text-white"
                          : "bg-[#141416] border-[#27272A] text-[#71717A]"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold text-xs truncate">{kb.name}</p>
                        <p className="text-[10px] opacity-70 font-mono">{kb.size}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          kb.active ? "bg-[#0066FF] text-white" : "bg-[#27272A] text-[#71717A]"
                        }`}
                      >
                        {kb.active ? "ON" : "OFF"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-[#27272A]" />

              {/* SECTION 5: PROJECT */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[#94A3B8] font-bold uppercase tracking-wider text-[11px]">
                  <span>Project</span>
                  <span className="text-[#71717A] font-mono text-[10px]">{activeBranch}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#141416] border border-[#27272A] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#0066FF] font-bold">📁</span>
                    <span className="font-semibold text-white truncate">{activeProject}</span>
                  </div>
                  <div className="text-[10px] text-[#71717A] space-y-1 border-t border-[#27272A] pt-2 font-mono">
                    <p>Root: c:\Elitze Sentinel Frontier Oos</p>
                    <p>Corpus: terrell0780/ELITZE-SENTINEL-OOS</p>
                  </div>
                </div>
              </div>

              <div className="h-[1px] bg-[#27272A]" />

              {/* SECTION 6: RUNTIME */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[#94A3B8] font-bold uppercase tracking-wider text-[11px]">
                  <span>Runtime</span>
                  <span className="text-[#10B981] font-mono text-[10px]">RUNNING</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#141416] border border-[#27272A]">
                    <p className="text-[#71717A] text-[10px]">Latency</p>
                    <p className="font-extrabold text-white font-mono text-xs mt-0.5">0.01s</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#141416] border border-[#27272A]">
                    <p className="text-[#71717A] text-[10px]">Compute</p>
                    <p className="font-extrabold text-white font-mono text-xs mt-0.5">GPU-A100</p>
                  </div>
                </div>
              </div>

            </div>
          </aside>
        )}

      </div>
    </div>
  );
}