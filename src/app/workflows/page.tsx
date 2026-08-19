"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

interface Workflow {
  id: string;
  name: string;
  category: "Video Render" | "AI Pipeline" | "3D Scene Build" | "Shorts Reel Automation";
  status: "idle" | "running" | "completed" | "error";
  progress: number;
  duration: string;
  nodesCount: number;
  videoPreview: string; // URL or canvas video state
  logs: string[];
}

const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: "wf-1",
    name: "Cinematic Movie Render & FX Pass",
    category: "Video Render",
    status: "running",
    progress: 68,
    duration: "2m 14s",
    nodesCount: 8,
    videoPreview: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    logs: [
      "00:01 - Initializing fal.ai Hunyuan 3D Video Model",
      "00:04 - Ingesting camera keyframes & lighting grid",
      "00:12 - Generating 60 FPS motion vectors",
      "00:45 - Applying raytraced subsurface scattering",
      "01:10 - Compositing audio & voiceover tracks..."
    ]
  },
  {
    id: "wf-2",
    name: "9:16 Shorts Viral Reel Generation",
    category: "Shorts Reel Automation",
    status: "completed",
    progress: 100,
    duration: "45s",
    nodesCount: 5,
    videoPreview: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    logs: [
      "00:01 - Analyzing trending viral audio beats",
      "00:05 - Auto-cutting speech highlights with whisper-ai",
      "00:15 - Rendering kinetic animated captions",
      "00:45 - Render complete! Exported 1080x1920 MP4"
    ]
  },
  {
    id: "wf-3",
    name: "Game Scene Procedural World Build",
    category: "3D Scene Build",
    status: "idle",
    progress: 0,
    duration: "0s",
    nodesCount: 12,
    videoPreview: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    logs: ["Ready to initialize Unreal Engine 5.6 scene build pipeline."]
  },
  {
    id: "wf-4",
    name: "Autonomous Lead Generation Sweep",
    category: "AI Pipeline",
    status: "completed",
    progress: 100,
    duration: "1m 30s",
    nodesCount: 6,
    videoPreview: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    logs: ["Extracted 1,420 verified B2B leads."]
  }
];

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(INITIAL_WORKFLOWS[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(14);
  const [videoResolution, setVideoResolution] = useState("4K (3840x2160)");

  const handleRunWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id === id) {
        return {
          ...w,
          status: "running",
          progress: 5,
          logs: [...w.logs, `[${new Date().toLocaleTimeString()}] Pipeline started...`]
        };
      }
      return w;
    }));
  };

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-[#1F1F28] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-md bg-[#8B5CF6] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#8B5CF6]/20">
      W
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-white tracking-tight">WORKFLOWS</span>
      <span className="text-[9px] font-semibold text-[#8B5CF6]/70 uppercase tracking-widest">Pipeline Monitor</span>
    </div>
  </div>
  <div className="flex items-center gap-3">
          <span className="text-xs text-[#8B5CF6] font-mono font-semibold bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-3 py-1.5 rounded-xl">
            {workflows.filter(w => w.status === "running").length} Active Executions
          </span>
        </div>
</header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Workflow Selection Panel */}
        <aside className="w-80 border-r border-[#27272A] bg-[#09090B] flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-[#27272A]">
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Select Workflow</h2>
          </div>
          <div className="p-3 space-y-2">
            {workflows.map(wf => {
              const isSelected = activeWorkflow?.id === wf.id;
              return (
                <div
                  key={wf.id}
                  onClick={() => setActiveWorkflow(wf)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-[#111115] border-[#8B5CF6]/60 shadow-lg" 
                      : "bg-[#09090B] border-[#27272A] hover:border-[#27272A]/80 hover:bg-[#111115]/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#52525B] bg-[#8B5CF6]/10 px-2 py-0.5 rounded border border-[#8B5CF6]/20">
                      {wf.category}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase ${
                      wf.status === "running" ? "text-[#8B5CF6] animate-pulse" : "text-[#A1A1AA]"
                    }`}>
                      {wf.status}
                    </span>
                  </div>
                  <h3 className="text-[12px] font-semibold text-white mb-2">{wf.name}</h3>
                  <div className="w-full bg-[#09090B] h-1.5 rounded-full overflow-hidden border border-[#27272A]">
                    <div className="bg-[#8B5CF6] h-full transition-all" style={{ width: `${wf.progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right: Dedicated Workflow Page View with Video Player */}
        {activeWorkflow ? (
          <main className="flex-1 flex flex-col overflow-y-auto bg-[#09090B] p-6">
            <div className="max-w-5xl w-full mx-auto space-y-6">
              
              {/* Workflow Page Title & Controls */}
              <div className="flex items-center justify-between bg-[#111115] border border-[#27272A] rounded-lg p-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-white">{activeWorkflow.name}</h2>
                    <span className="text-xs text-[#A1A1AA] font-mono">ID: {activeWorkflow.id}</span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    Category: {activeWorkflow.category} • {activeWorkflow.nodesCount} Pipeline Nodes
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleRunWorkflow(activeWorkflow.id)}
                    className="px-3 py-1.5 bg-[#8B5CF6] text-white text-[11px] font-semibold rounded-md hover:opacity-90 transition-all"
                  >
                    Execute Workflow
                  </button>
                </div>
              </div>

              {/* DEDICATED EMBEDDED VIDEO PLAYER FOR WORKFLOW */}
              <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-ping" />
                    <span className="text-[12px] font-semibold text-white">Dedicated Workflow Live Video Monitor</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      value={videoResolution}
                      onChange={e => setVideoResolution(e.target.value)}
                      className="bg-[#09090B] border border-[#27272A] text-xs text-[#A1A1AA] rounded-lg px-2.5 py-1 outline-none"
                    >
                      <option>4K (3840x2160)</option>
                      <option>1080p Full HD</option>
                      <option>9:16 Vertical Reel</option>
                    </select>
                    <span className="text-xs text-[#A1A1AA] font-mono">60 FPS • Realtime Output</span>
                  </div>
                </div>

                {/* HTML5 Video Player Frame */}
                <div className="relative aspect-video w-full bg-[#09090B] border border-[#27272A] rounded-xl overflow-hidden group shadow-2xl">
                  <video 
                    src={activeWorkflow.videoPreview} 
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                  />
                  
                  {/* Overlay Video Telemetry HUD */}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-mono text-white flex items-center gap-3">
                    <span className="text-[#8B5CF6] font-bold">● RENDER MONITOR</span>
                    <span>FRAME: 0842 / 1200</span>
                    <span>GPU: 98%</span>
                  </div>

                  {/* Video Control Bar */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white hover:scale-105 transition-all"
                      >
                        {isPlaying ? "" : "▶"}
                      </button>
                      <span className="text-xs font-mono">00:{currentTime < 10 ? `0${currentTime}` : currentTime} / 02:30</span>
                    </div>

                    <div className="flex-1 max-w-md mx-6">
                      <input 
                        type="range" 
                        min="0" 
                        max="60" 
                        value={currentTime}
                        onChange={e => setCurrentTime(Number(e.target.value))}
                        className="w-full accent-[#8B5CF6] cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <button className="px-2 py-1 bg-[#111115]/10 rounded hover:bg-[#111115]/20">Snapshot</button>
                      <button className="px-2 py-1 bg-[#111115]/10 rounded hover:bg-[#111115]/20">Fullscreen</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Execution Node Pipeline & Logs */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
                  <h3 className="text-[12px] font-semibold text-white mb-4">Pipeline Execution Nodes</h3>
                  <div className="space-y-3">
                    {[
                      { node: "Node 1: Source Asset Ingestion", status: "Done", time: "0.4s" },
                      { node: "Node 2: fal.ai Diffusion Render Engine", status: "Active", time: "In Progress" },
                      { node: "Node 3: Audio Waveform Sync", status: "Pending", time: "—" },
                      { node: "Node 4: Final MP4 Export & Delivery", status: "Pending", time: "—" },
                    ].map((n, idx) => (
                      <div key={n.node} className="flex items-center justify-between p-3 bg-[#09090B] border border-[#27272A] rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-medium text-white">{n.node}</span>
                        </div>
                        <span className="text-[10px] text-[#A1A1AA] font-mono">{n.status} ({n.time})</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4">
                  <h3 className="text-[12px] font-semibold text-white mb-4">Live Execution Logs</h3>
                  <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 font-mono text-[11px] text-[#A1A1AA] h-48 overflow-y-auto space-y-1">
                    {activeWorkflow.logs.map((log, i) => (
                      <p key={i} className="text-emerald-400/90">{log}</p>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </main>
        ) : null}
      </div>
    </div>
  );
}
