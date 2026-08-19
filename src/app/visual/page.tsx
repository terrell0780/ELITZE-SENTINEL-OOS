"use client";

import { useState } from "react";

export default function VisualStudioPage() {
  const [activeTab, setActiveTab] = useState<"3d-studio" | "video-workflow" | "graphics">("3d-studio");
  const [stageObjects, setStageObjects] = useState([
    { id: "1", name: "3D Character Rig", icon: "", x: 30, y: 50 },
    { id: "2", name: "Cinematic Camera 4K", icon: "", x: 60, y: 30 },
  ]);
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-12 border-b border-[#1F1F28] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-md bg-[#8B5CF6] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#8B5CF6]/20">
      V
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-white tracking-tight">VISUAL STUDIO</span>
      <span className="text-[9px] font-semibold text-[#8B5CF6]/70 uppercase tracking-widest">3D & Video</span>
    </div>
  </div>
  <div className="flex items-center gap-1 bg-[#111115] border border-[#27272A] p-1 rounded-lg">
          {[
            { id: "3d-studio", label: "Drag & Drop 3D Studio" },
            { id: "video-workflow", label: "Workflow Video Player" },
            { id: "graphics", label: "Asset Generator" },
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
</header>

      {/* Main Studio View */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* TAB 1: 3D DRAG AND DROP CREATOR */}
          {activeTab === "3d-studio" && (
            <div className="grid md:grid-cols-4 gap-6">
              {/* Palette */}
              <div className="md:col-span-1 bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
                <h2 className="text-[12px] font-semibold text-white">3D Drag & Drop Assets</h2>
                <p className="text-[10px] text-[#A1A1AA]">Drag 3D assets onto the 3D Stage to build scenes.</p>
                <div className="space-y-2">
                  {[
                    { name: "3D Avatar Hero", icon: "" },
                    { name: "Cinematic Camera", icon: "" },
                    { name: "Spotlight Rig", icon: "" },
                    { name: "Particle Emitter", icon: "" },
                    { name: "3D Sci-Fi Vehicle", icon: "️" },
                  ].map(a => (
                    <div
                      key={a.name}
                      onClick={() => setStageObjects(prev => [...prev, { id: `${Date.now()}`, name: a.name, icon: a.icon, x: 50, y: 50 }])}
                      className="p-3 bg-[#09090B] border border-[#27272A] rounded-xl flex items-center gap-3 cursor-pointer hover:border-[#8B5CF6]/50 transition-all text-xs font-medium text-white"
                    >
                      <span className="text-base">{a.icon}</span>
                      <span>{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Viewport & Video Player */}
              <div className="md:col-span-3 bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-white">Live 3D Viewport & Video Render Player</span>
                  <span className="text-xs text-[#8B5CF6] font-mono font-bold">● REALTIME 3D RENDER ENGINE</span>
                </div>

                <div className="relative aspect-video w-full bg-[#09090B] border border-[#27272A] rounded-xl overflow-hidden shadow-2xl">
                  <video
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                  />

                  {/* Stage overlay objects */}
                  {stageObjects.map(obj => (
                    <div
                      key={obj.id}
                      style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
                      className="absolute p-2.5 bg-[#8B5CF6]/20 border-2 border-[#8B5CF6] rounded-md text-white font-bold text-[11px] flex items-center gap-2 cursor-pointer shadow-2xl backdrop-blur-md hover:opacity-90"
                    >
                      <span>{obj.icon}</span>
                      <span>{obj.name}</span>
                    </div>
                  ))}

                  <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[11px] text-white font-mono">
                    3D Scene Nodes: {stageObjects.length} Active • Drag & drop active
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKFLOW VIDEO PLAYER */}
          {activeTab === "video-workflow" && (
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <h2 className="text-[12px] font-semibold text-white">Dedicated Visual Workflow Video Monitor</h2>
                <span className="text-xs text-[#A1A1AA] font-mono">Workflow ID: #wf-visual-908</span>
              </div>

              <div className="relative aspect-video w-full bg-[#09090B] border border-[#27272A] rounded-xl overflow-hidden">
                <video
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                />
                <div className="absolute bottom-0 inset-x-0 p-4 bg-black/80 flex items-center justify-between text-white text-xs">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    className="px-3 py-1.5 bg-[#8B5CF6] rounded-lg font-semibold"
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <span className="font-mono">1080p Full HD Render • 60 FPS</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GRAPHICS GENERATOR */}
          {activeTab === "graphics" && (
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 text-center space-y-4">
              <h2 className="text-[12px] font-semibold text-white">Generative Visual Engine</h2>
              <p className="text-xs text-[#A1A1AA]">Generate 3D textures, concept art, and video frames instantly.</p>
              <button className="px-3 py-1.5 bg-[#8B5CF6] text-white text-[11px] font-semibold rounded-md hover:opacity-90">Generate Visual Asset</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}