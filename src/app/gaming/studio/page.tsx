"use client";

import { useState } from "react";

interface GameProject {
  id: string;
  name: string;
  genre: string;
  engine: string;
  status: string;
  progress: number;
  videoPreview: string;
  buildVersion: string;
  fps: number;
}

const PROJECTS: GameProject[] = [
  {
    id: "g-1",
    name: "Elderwood Chronicles",
    genre: "Open World RPG",
    engine: "Unreal Engine 5.6",
    status: "Active Build",
    progress: 65,
    videoPreview: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    buildVersion: "0.5.2",
    fps: 60
  },
  {
    id: "g-2",
    name: "Neon Drift 2088",
    genre: "Cyberpunk Racing",
    engine: "Unreal Engine 5.6",
    status: "Rendering Shaders",
    progress: 40,
    videoPreview: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    buildVersion: "0.2.8",
    fps: 120
  },
  {
    id: "g-3",
    name: "Survival: Arid Expanse",
    genre: "Survival Sandbox",
    engine: "Unity 6 Pro",
    status: "Physics Test",
    progress: 25,
    videoPreview: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    buildVersion: "0.1.4",
    fps: 90
  }
];

export default function GameStudioPage() {
  const [selectedProject, setSelectedProject] = useState<GameProject>(PROJECTS[0]);
  const [activeTab, setActiveTab] = useState<"viewport" | "assets" | "nodes" | "build">("viewport");
  const [cameraAngle, setCameraAngle] = useState("Cinematic Orbit");
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-12 border-b border-[#1F1F28] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-md bg-[#8B5CF6] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#8B5CF6]/20">
      G
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-white tracking-tight">GAME STUDIO</span>
      <span className="text-[9px] font-semibold text-[#8B5CF6]/70 uppercase tracking-widest">Production</span>
    </div>
  </div>
  <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 bg-[#8B5CF6] text-white text-[11px] font-semibold rounded-md hover:opacity-90 transition-all">
            + New Game Project
          </button>
        </div>
</header>

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Project Selector Sidebar */}
        <aside className="w-80 border-r border-[#27272A] bg-[#09090B] flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-[#27272A]">
            <h2 className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Active Game Projects</h2>
          </div>
          <div className="p-3 space-y-2">
            {PROJECTS.map(proj => {
              const isSelected = selectedProject.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProject(proj)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-[#111115] border-[#8B5CF6]/60 shadow-lg" 
                      : "bg-[#09090B] border-[#27272A] hover:border-[#27272A]/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{proj.name}</span>
                    <span className="text-[10px] text-[#8B5CF6] font-mono font-semibold">v{proj.buildVersion}</span>
                  </div>
                  <p className="text-[11px] text-[#A1A1AA] mb-2">{proj.genre} • {proj.engine}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#A1A1AA]">
                    <span>{proj.status}</span>
                    <span>{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-[#09090B] h-1.5 rounded-full overflow-hidden border border-[#27272A] mt-1.5">
                    <div className="bg-[#8B5CF6] h-full" style={{ width: `${proj.progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right: Dedicated Game Studio Workflow Workspace */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#09090B] p-6 space-y-6">
          
          {/* Game Workflow Header */}
          <div className="flex flex-wrap items-center justify-between bg-[#111115] border border-[#27272A] rounded-lg p-4 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-white">{selectedProject.name} Workflow Studio</h2>
                <span className="text-xs text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-2.5 py-0.5 rounded font-mono font-semibold">
                  {selectedProject.engine}
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Genre: {selectedProject.genre} • Build v{selectedProject.buildVersion} • Target FPS: {selectedProject.fps} FPS
              </p>
            </div>

            {/* Viewport Tabs */}
            <div className="flex items-center gap-1 bg-[#09090B] border border-[#27272A] p-1 rounded-xl">
              {[
                { id: "viewport", label: "3D Video Viewport" },
                { id: "assets", label: "3D Asset Library" },
                { id: "nodes", label: "Scene Graph" },
                { id: "build", label: "Engine Compiler" },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === t.id ? "bg-[#8B5CF6] text-white" : "text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* DEDICATED GAME BUILDING VIDEO VIEWPORT PLAYER */}
          <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[12px] font-semibold text-white">Live 3D Game Viewport & Render Player</span>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={cameraAngle}
                  onChange={e => setCameraAngle(e.target.value)}
                  className="bg-[#09090B] border border-[#27272A] text-xs text-[#A1A1AA] rounded-lg px-2.5 py-1 outline-none"
                >
                  <option>Cinematic Orbit Camera</option>
                  <option>Main Character View (FPS)</option>
                  <option>Top-Down Tactical View</option>
                  <option>Free Fly Camera</option>
                </select>
                <span className="text-xs text-emerald-400 font-mono font-bold">{selectedProject.fps} FPS</span>
              </div>
            </div>

            {/* Video / 3D Canvas Container */}
            <div className="relative aspect-video w-full bg-[#09090B] border border-[#27272A] rounded-xl overflow-hidden shadow-2xl group">
              <video
                src={selectedProject.videoPreview}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
              />

              {/* Viewport 3D Overlay HUD */}
              <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 text-[11px] font-mono text-white space-y-1">
                <div className="text-[#8B5CF6] font-bold">GAME ENGINE VIEWPORT</div>
                <div>PROJECT: {selectedProject.name}</div>
                <div>CAMERA: {cameraAngle}</div>
                <div>TRIANGLES: 1.4M • DRAW CALLS: 142</div>
              </div>

              {/* Player Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center font-bold"
                  >
                    {isPlaying ? "" : "▶"}
                  </button>
                  <span className="text-xs font-mono">00:18 / 01:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-[#111115]/10 rounded-lg text-xs font-semibold hover:bg-[#111115]/20">Re-compile Shaders</button>
                  <button className="px-3 py-1.5 bg-[#8B5CF6] rounded-lg text-xs font-semibold hover:bg-[#8B5CF6]/90">Deploy Build</button>
                </div>
              </div>
            </div>
          </div>

          {/* Game Dev Inspector Tools */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-3">
              <h3 className="text-[12px] font-semibold text-white">3D Lighting & Physics Grid</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#A1A1AA]"><span>Global Illumination</span><span className="text-white">Lumen 2.0</span></div>
                <div className="flex justify-between text-[#A1A1AA]"><span>Physics Engine</span><span className="text-white">Chaos Physics</span></div>
                <div className="flex justify-between text-[#A1A1AA]"><span>Raytracing</span><span className="text-emerald-400">Enabled</span></div>
              </div>
            </div>

            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-3">
              <h3 className="text-[12px] font-semibold text-white">C++ Game Logic Modules</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#A1A1AA]"><span>Player Character Controller</span><span className="text-emerald-400 font-mono">OK</span></div>
                <div className="flex justify-between text-[#A1A1AA]"><span>NPC AI Behavior Trees</span><span className="text-emerald-400 font-mono">OK</span></div>
                <div className="flex justify-between text-[#A1A1AA]"><span>Procedural Terrain Generator</span><span className="text-emerald-400 font-mono">OK</span></div>
              </div>
            </div>

            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-3">
              <h3 className="text-[12px] font-semibold text-white">Build Pipeline Output</h3>
              <div className="text-xs text-[#A1A1AA] space-y-1 font-mono">
                <p> Compiled 14 Unreal C++ Modules</p>
                <p> Baked 8K Texture Atlases</p>
                <p className="text-white font-semibold">Build Status: Ready to Play</p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}