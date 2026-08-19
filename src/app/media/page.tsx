"use client";

import { useState, useRef } from "react";

interface ThreeDAsset {
  id: string;
  name: string;
  category: "character" | "vehicle" | "camera" | "light" | "fx" | "text";
  icon: string;
  color: string;
}

const THREE_D_ASSETS: ThreeDAsset[] = [
  { id: "ast-1", name: "Cyber Avatar 3D", category: "character", icon: "", color: "bg-indigo-600" },
  { id: "ast-2", name: "Sci-Fi Hovercraft", category: "vehicle", icon: "", color: "bg-cyan-600" },
  { id: "ast-3", name: "Cinematic Orbit Cam", category: "camera", icon: "", color: "bg-[#8B5CF6]" },
  { id: "ast-4", name: "Neon Volumetric Light", category: "light", icon: "", color: "bg-amber-500" },
  { id: "ast-5", name: "Quantum Particle FX", category: "fx", icon: "", color: "bg-purple-600" },
  { id: "ast-6", name: "3D Kinetic Title", category: "text", icon: "", color: "bg-emerald-600" },
];

interface FacelessPreset {
  id: string;
  niche: string;
  voice: string;
  broll: string;
  music: string;
  sampleScript: string;
}

const FACELESS_PRESETS: FacelessPreset[] = [
  {
    id: "yt-1",
    niche: "Reddit Confessions & Drama",
    voice: "ElevenLabs Adam (Deep Male)",
    broll: "Subway Surfers / Minecraft Gameplay 4K",
    music: "Lo-Fi Beats (Copyright Free)",
    sampleScript: "AITA for exposing my boss's secret offshore company live during a company-wide Zoom call? So I worked at this mid-sized tech firm..."
  },
  {
    id: "yt-2",
    niche: "True Crime & Dark Mysteries",
    voice: "Marcus (Cinematic Dark Narrator)",
    broll: "Atmospheric Rain & Dark City Drone",
    music: "Dark Tension Ambient Drone",
    sampleScript: "In November 1994, a lone signal broadcasted across midnight television towers. No agency ever traced its origin..."
  },
  {
    id: "yt-3",
    niche: "AI & Tech Breakdown",
    voice: "British Documentary Narrator",
    broll: "Cyberpunk Server Room & Quantum Loops",
    music: "Synthwave Pulse 120BPM",
    sampleScript: "OpenAI just unveiled their sovereign autonomous neural network. Here is how it will reshape software engineering in the next 12 months..."
  },
  {
    id: "yt-4",
    niche: "Wealth & Stoic Motivation",
    voice: "Stoic Philosopher AI Voice",
    broll: "Luxury Mansions & Cinematic Ocean Waves",
    music: "Orchestral Triumph Score",
    sampleScript: "Seneca once wrote: 'We suffer more often in imagination than in reality.' If you want to build true leverage in 2026..."
  }
];

export default function MediaStudioPage() {
  const [activeStudio, setActiveStudio] = useState<"movies" | "shorts" | "faceless-yt" | "3d-creator">("movies");
  
  // Movies & Longs State
  const [moviePrompt, setMoviePrompt] = useState("Sci-fi cinematic epic, deep space obsidian mothership, anamorphic lens flare");
  const [movieResolution, setMovieResolution] = useState("4K (3840x2160)");
  const [movieIsPlaying, setMovieIsPlaying] = useState(true);
  const [movieScrub, setMovieScrub] = useState(24);

  // Shorts State (9:16)
  const [shortsPrompt, setShortsPrompt] = useState("Viral AI news breakdown, fast cuts, bold kinetic captions");
  const [captionStyle, setCaptionStyle] = useState("Yellow Bold Glow");
  const [shortsIsPlaying, setShortsIsPlaying] = useState(true);

  // Faceless YouTube Generator State
  const [selectedYtPreset, setSelectedYtPreset] = useState<FacelessPreset>(FACELESS_PRESETS[0]);
  const [ytScript, setYtScript] = useState(FACELESS_PRESETS[0].sampleScript);
  const [ytVoice, setYtVoice] = useState(FACELESS_PRESETS[0].voice);
  const [ytBroll, setYtBroll] = useState(FACELESS_PRESETS[0].broll);
  const [ytIsGenerating, setYtIsGenerating] = useState(false);
  const [ytVideoReady, setYtVideoReady] = useState(true);

  // 3D Drag & Drop Creator State
  const [stageObjects, setStageObjects] = useState<Array<{ id: string; name: string; x: number; y: number; color: string; icon: string }>>([
    { id: "obj-1", name: "Cinematic Orbit Cam", x: 25, y: 35, color: "bg-[#8B5CF6]", icon: "" },
    { id: "obj-2", name: "Cyber Avatar 3D", x: 50, y: 55, color: "bg-indigo-600", icon: "" },
    { id: "obj-3", name: "Neon Volumetric Light", x: 70, y: 30, color: "bg-amber-500", icon: "" },
  ]);
  const [draggingAsset, setDraggingAsset] = useState<ThreeDAsset | null>(null);
  const [selectedStageObj, setSelectedStageObj] = useState<string | null>("obj-2");
  const [renderProgress, setRenderProgress] = useState<number | null>(null);

  const handleDropOnStage = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingAsset) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newObj = {
      id: `obj-${Date.now()}`,
      name: draggingAsset.name,
      x: Math.min(Math.max(x, 10), 90),
      y: Math.min(Math.max(y, 10), 90),
      color: draggingAsset.color,
      icon: draggingAsset.icon,
    };

    setStageObjects(prev => [...prev, newObj]);
    setSelectedStageObj(newObj.id);
    setDraggingAsset(null);
  };

  const handleRender3DVideo = () => {
    setRenderProgress(0);
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const handleGenerateFacelessYt = () => {
    setYtIsGenerating(true);
    setTimeout(() => {
      setYtIsGenerating(false);
      setYtVideoReady(true);
    }, 2500);
  };

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-hidden">
      {/* Studio Mode Header Switcher */}
      <header className="h-12 border-b border-[#1F1F28] bg-[#09090B] px-5 flex items-center justify-between shrink-0">
  <div className="flex items-center gap-3">
    <div className="w-6 h-6 rounded-md bg-[#8B5CF6] flex items-center justify-center text-[10px] font-black text-white shadow-sm shadow-[#8B5CF6]/20">
      M
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-bold text-white tracking-tight">MEDIA STUDIO</span>
      <span className="text-[9px] font-semibold text-[#8B5CF6]/70 uppercase tracking-widest">Content Creation</span>
    </div>
  </div>
  {/* Studio Mode Selector */}
        <div className="flex items-center gap-1 bg-[#111115] border border-[#27272A] p-1.5 rounded-lg flex-wrap">
          <button
            onClick={() => setActiveStudio("movies")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeStudio === "movies" ? "bg-[#8B5CF6] text-white shadow-lg" : "text-[#A1A1AA] hover:text-white"
            }`}
          >
             Movies & Longs
          </button>
          <button
            onClick={() => setActiveStudio("shorts")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeStudio === "shorts" ? "bg-[#8B5CF6] text-white shadow-lg" : "text-[#A1A1AA] hover:text-white"
            }`}
          >
             Shorts & Reels
          </button>
          <button
            onClick={() => setActiveStudio("faceless-yt")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeStudio === "faceless-yt" ? "bg-[#8B5CF6] text-white shadow-lg" : "text-[#A1A1AA] hover:text-white"
            }`}
          >
             Faceless YouTube Generator
          </button>
          <button
            onClick={() => setActiveStudio("3d-creator")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeStudio === "3d-creator" ? "bg-[#8B5CF6] text-white shadow-lg" : "text-[#A1A1AA] hover:text-white"
            }`}
          >
             3D Drag & Drop Creator
          </button>
        </div>
</header>

      {/* Main Studio Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#09090B]">
        
        {/* ============================================================ */}
        {/* MODE 1: MOVIES & LONGS WORKFLOW STUDIO (16:9 CINEMATIC PLAYER) */}
        {/* ============================================================ */}
        {activeStudio === "movies" && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Cinematic Movies & Long-Form Video Workflow Page</h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">16:9 Widescreen Render Engine • Scene Timeline • Anamorphic Lighting</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={movieResolution}
                  onChange={e => setMovieResolution(e.target.value)}
                  className="bg-[#09090B] border border-[#27272A] text-xs text-[#A1A1AA] rounded-lg px-3 py-1.5 outline-none"
                >
                  <option>4K (3840x2160)</option>
                  <option>1080p Full HD</option>
                  <option>8K Ultra Cinematic</option>
                </select>
                <button className="px-3 py-1.5 bg-[#8B5CF6] text-white text-[11px] font-semibold rounded-md hover:opacity-90 transition-all">
                  Render Movie
                </button>
              </div>
            </div>

            {/* DEDICATED 16:9 CINEMATIC VIDEO PLAYER */}
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <span className="text-[12px] font-semibold text-white">16:9 Cinematic Video Preview Player</span>
                <span className="text-xs font-mono text-[#8B5CF6]">● LIVE MONITOR (60 FPS)</span>
              </div>

              <div className="relative aspect-video w-full bg-[#09090B] border border-[#27272A] rounded-xl overflow-hidden shadow-2xl group">
                <video
                  src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                />

                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 text-[11px] font-mono text-white">
                  <div className="text-[#8B5CF6] font-bold">CINEMATIC MOVIE ENGINE</div>
                  <div>SCENE: 04 / 12 • ANAMORPHIC PASS</div>
                  <div>PROMPT: {moviePrompt.slice(0, 45)}...</div>
                </div>

                {/* Video Controls Bar */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setMovieIsPlaying(!movieIsPlaying)}
                      className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center font-bold"
                    >
                      {movieIsPlaying ? "" : "▶"}
                    </button>
                    <span className="text-xs font-mono">00:{movieScrub < 10 ? `0${movieScrub}` : movieScrub} / 05:00</span>
                  </div>

                  <div className="flex-1 max-w-lg mx-6">
                    <input 
                      type="range" 
                      min="0" 
                      max="60" 
                      value={movieScrub}
                      onChange={e => setMovieScrub(Number(e.target.value))}
                      className="w-full accent-[#8B5CF6] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#A1A1AA]">{movieResolution}</span>
                  </div>
                </div>
              </div>

              {/* Prompt Controls */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest block">Cinematic Scene Prompt</label>
                <textarea
                  value={moviePrompt}
                  onChange={e => setMoviePrompt(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded-xl p-4 text-xs text-white placeholder-[#71717A] outline-none focus:border-[#8B5CF6]/40 transition-all min-h-[70px] resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 2: SHORTS & REELS WORKFLOW STUDIO (9:16 VERTICAL PLAYER) */}
        {/* ============================================================ */}
        {activeStudio === "shorts" && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Shorts & Viral Reels Workflow Page</h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">9:16 Vertical Video Render Engine • Kinetic Subtitles • Auto-Hook Optimizer</p>
              </div>
              <button className="px-3 py-1.5 bg-[#8B5CF6] text-white text-[11px] font-semibold rounded-md hover:opacity-90 transition-all">
                Export Short (1080x1920)
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 items-start">
              {/* Left Config */}
              <div className="md:col-span-1 bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
                <h3 className="text-[12px] font-semibold text-white">Shorts Script & Voiceover</h3>
                <textarea
                  value={shortsPrompt}
                  onChange={e => setShortsPrompt(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded-xl p-3 text-xs text-white outline-none focus:border-[#8B5CF6]/40 min-h-[120px] resize-none"
                />
                
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest block">Caption Style</label>
                  <select
                    value={captionStyle}
                    onChange={e => setCaptionStyle(e.target.value)}
                    className="w-full bg-[#09090B] border border-[#27272A] text-xs text-[#A1A1AA] rounded-xl p-2.5 outline-none"
                  >
                    <option>Yellow Bold Glow</option>
                    <option>TikTok Kinetic White</option>
                    <option>Neon Red Pulse</option>
                  </select>
                </div>
              </div>

              {/* Center: DEDICATED 9:16 VERTICAL VIDEO PLAYER */}
              <div className="md:col-span-2 bg-[#111115] border border-[#27272A] rounded-lg p-4 flex flex-col items-center justify-center">
                <span className="text-[12px] font-semibold text-white mb-4">Dedicated 9:16 Vertical Video Player</span>
                
                {/* 9:16 Phone Frame Video Player */}
                <div className="relative w-[280px] h-[500px] bg-[#09090B] border-2 border-[#27272A] rounded-3xl overflow-hidden shadow-2xl group">
                  <video
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                  />

                  {/* Kinetic Subtitle Overlay */}
                  <div className="absolute bottom-20 inset-x-4 text-center">
                    <span className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-yellow-400 font-extrabold text-sm uppercase tracking-wider drop-shadow-md border border-yellow-400/30">
                       SOVEREIGN AI OPERATING SYSTEM
                    </span>
                  </div>

                  {/* Player controls overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-white text-xs">
                    <button 
                      onClick={() => setShortsIsPlaying(!shortsIsPlaying)}
                      className="w-7 h-7 rounded-full bg-[#8B5CF6] flex items-center justify-center font-bold"
                    >
                      {shortsIsPlaying ? "" : "▶"}
                    </button>
                    <span className="font-mono text-[10px]">9:16 • 1080x1920</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 3: FACELESS YOUTUBE CHANNEL & VIDEO GENERATOR WORKFLOW */}
        {/* ============================================================ */}
        {activeStudio === "faceless-yt" && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Faceless YouTube Video Generator Workflow Page</h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Auto-script, Neural AI Voiceover, B-Roll Stock Footage Matcher & YouTube Export
                </p>
              </div>
              <button 
                onClick={handleGenerateFacelessYt}
                disabled={ytIsGenerating}
                className="px-3 py-1.5 bg-[#8B5CF6] text-white text-[11px] font-semibold rounded-md hover:opacity-90 transition-all disabled:opacity-40 flex items-center gap-2"
              >
                {ytIsGenerating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Rendering Faceless Video...</span>
                  </>
                ) : (
                  <span> Generate Faceless YouTube Video</span>
                )}
              </button>
            </div>

            {/* Niche Presets Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FACELESS_PRESETS.map(preset => {
                const isSelected = selectedYtPreset.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedYtPreset(preset);
                      setYtScript(preset.sampleScript);
                      setYtVoice(preset.voice);
                      setYtBroll(preset.broll);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? "bg-[#111115] border-[#8B5CF6] shadow-lg" 
                        : "bg-[#09090B] border-[#27272A] hover:border-[#27272A]/80"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-[#8B5CF6] uppercase block mb-1">Preset Channel</span>
                    <h3 className="text-xs font-bold text-white mb-1.5">{preset.niche}</h3>
                    <p className="text-[10px] text-[#A1A1AA] truncate">{preset.broll}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Config Panel */}
              <div className="md:col-span-1 bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
                <h3 className="text-[12px] font-semibold text-white">Channel Setup & Script Engine</h3>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest block">AI Voice Narrator</label>
                  <select
                    value={ytVoice}
                    onChange={e => setYtVoice(e.target.value)}
                    className="w-full bg-[#09090B] border border-[#27272A] text-xs text-[#A1A1AA] rounded-xl p-2.5 outline-none"
                  >
                    <option>ElevenLabs Adam (Deep Male)</option>
                    <option>Marcus (Cinematic Dark Narrator)</option>
                    <option>British Documentary Narrator</option>
                    <option>Stoic Philosopher AI Voice</option>
                    <option>Soft Female Storyteller</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest block">B-Roll Footage Source</label>
                  <select
                    value={ytBroll}
                    onChange={e => setYtBroll(e.target.value)}
                    className="w-full bg-[#09090B] border border-[#27272A] text-xs text-[#A1A1AA] rounded-xl p-2.5 outline-none"
                  >
                    <option>Subway Surfers / Minecraft Gameplay 4K</option>
                    <option>Atmospheric Rain & Dark City Drone</option>
                    <option>Cyberpunk Server Room & Quantum Loops</option>
                    <option>Luxury Mansions & Cinematic Ocean Waves</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest block">YouTube Script</label>
                  <textarea
                    value={ytScript}
                    onChange={e => setYtScript(e.target.value)}
                    className="w-full bg-[#09090B] border border-[#27272A] rounded-xl p-3 text-xs text-white outline-none focus:border-[#8B5CF6]/40 min-h-[140px] resize-none"
                  />
                </div>
              </div>

              {/* Center: DEDICATED FACELESS YOUTUBE VIDEO PLAYER MONITOR */}
              <div className="md:col-span-2 bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-pulse" />
                    <span className="text-[12px] font-semibold text-white">Dedicated Faceless YouTube Video Player</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">1080p 60FPS • Ready for Upload</span>
                </div>

                {/* Video Player Display */}
                <div className="relative aspect-video w-full bg-[#09090B] border border-[#27272A] rounded-xl overflow-hidden shadow-2xl">
                  {ytIsGenerating ? (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center space-y-3">
                      <div className="w-10 h-10 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono text-[#8B5CF6] font-bold">SYNTHESIZING VOICE & MATCHING B-ROLL...</p>
                    </div>
                  ) : (
                    <video
                      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      controls
                    />
                  )}

                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-mono text-white">
                    <span>YOUTUBE CHANNEL ENGINE: {selectedYtPreset.niche}</span>
                  </div>
                </div>

                {/* Subtitle & Audio Waveform Preview */}
                <div className="p-4 bg-[#09090B] border border-[#27272A] rounded-xl space-y-2">
                  <div className="flex justify-between text-xs text-[#A1A1AA]">
                    <span>Neural Voiceover Waveform Sync</span>
                    <span>100% Synced</span>
                  </div>
                  <div className="h-6 bg-[#111115] rounded-lg border border-[#27272A] flex items-center px-3 gap-1 overflow-hidden">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#8B5CF6] rounded-full transition-all"
                        style={{ height: `${Math.max(20, Math.sin(i) * 100)}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 4: DRAG AND DROP 3D VIDEO CREATOR STUDIO */}
        {/* ============================================================ */}
        {activeStudio === "3d-creator" && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-[#111115] border border-[#27272A] rounded-lg p-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Drag & Drop 3D Video Creator Studio</h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Drag 3D Characters, Vehicles, Cameras & Lights into the 3D Viewport to record & render 3D video.
                </p>
              </div>
              <button 
                onClick={handleRender3DVideo}
                className="px-3 py-1.5 bg-[#8B5CF6] text-white text-[11px] font-semibold rounded-md hover:opacity-90 transition-all flex items-center gap-2"
              >
                <span>Render 3D Video</span>
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Left: 3D Asset Shelf */}
              <div className="md:col-span-1 bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
                <h3 className="text-[12px] font-semibold text-white">3D Asset Palette (Drag from here)</h3>
                <p className="text-[10px] text-[#A1A1AA]">Drag any 3D asset onto the 3D Stage on the right.</p>

                <div className="space-y-2">
                  {THREE_D_ASSETS.map(asset => (
                    <div
                      key={asset.id}
                      draggable
                      onDragStart={() => setDraggingAsset(asset)}
                      className="flex items-center gap-3 p-3 bg-[#09090B] border border-[#27272A] rounded-xl cursor-grab active:cursor-grabbing hover:border-[#8B5CF6]/40 transition-all group"
                    >
                      <span className={`w-7 h-7 rounded-lg ${asset.color} flex items-center justify-center text-xs text-white`}>
                        {asset.icon}
                      </span>
                      <div>
                        <p className="text-[12px] font-semibold text-white group-hover:text-[#8B5CF6] transition-colors">{asset.name}</p>
                        <p className="text-[10px] text-[#A1A1AA] capitalize">{asset.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Interactive 3D Stage / Dropzone & 3D Video Player */}
              <div className="md:col-span-3 bg-[#111115] border border-[#27272A] rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-white">Interactive 3D Stage & Render Viewport</span>
                  <span className="text-xs text-[#A1A1AA] font-mono">{stageObjects.length} 3D Scene Objects Active</span>
                </div>

                {/* 3D DROPZONE STAGE CANVAS */}
                <div 
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDropOnStage}
                  className="relative aspect-video w-full bg-[#09090B] border border-dashed border-[#27272A] rounded-xl overflow-hidden shadow-2xl flex items-center justify-center group"
                >
                  {/* 3D Grid Overlay */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#8B5CF6_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Render Loading HUD */}
                  {renderProgress !== null && renderProgress < 100 && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center text-white space-y-3">
                      <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono font-bold text-[#8B5CF6]">RENDERING 3D SCENE VIDEO... {renderProgress}%</p>
                    </div>
                  )}

                  {renderProgress === 100 && (
                    <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-4">
                      <video
                        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
                        className="w-full h-full object-cover rounded-xl border border-[#27272A]"
                        autoPlay
                        loop
                        controls
                      />
                      <button 
                        onClick={() => setRenderProgress(null)} 
                        className="absolute top-4 right-4 bg-[#8B5CF6] text-white text-[11px] px-3 py-1.5 rounded-md hover:opacity-90"
                      >
                        Close Video Player
                      </button>
                    </div>
                  )}

                  {/* Dropped 3D Scene Objects */}
                  {stageObjects.map(obj => {
                    const isSelected = selectedStageObj === obj.id;
                    return (
                      <div
                        key={obj.id}
                        onClick={() => setSelectedStageObj(obj.id)}
                        style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl border-2 cursor-pointer transition-transform hover:scale-110 flex items-center gap-2 shadow-2xl ${
                          isSelected ? "border-[#8B5CF6] bg-[#8B5CF6]/20 text-white scale-105" : "border-[#27272A] bg-[#111115] text-[#A1A1AA]"
                        }`}
                      >
                        <span className="text-base">{obj.icon}</span>
                        <span className="text-[12px] font-semibold text-white whitespace-nowrap">{obj.name}</span>
                      </div>
                    );
                  })}

                  <div className="absolute bottom-4 left-4 text-[11px] font-mono text-[#A1A1AA] bg-black/70 px-3 py-1.5 rounded-lg border border-white/10">
                     Drop 3D elements anywhere on canvas • Click object to inspect transform
                  </div>
                </div>

                {/* 3D Keyframe Timeline */}
                <div className="bg-[#09090B] border border-[#27272A] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs text-[#A1A1AA]">
                    <span>3D Keyframe Sequence Timeline</span>
                    <span>0.0s — 10.0s (300 Frames)</span>
                  </div>
                  <div className="h-8 bg-[#111115] border border-[#27272A] rounded-lg relative overflow-hidden flex items-center px-3">
                    <div className="h-full bg-[#8B5CF6]/20 border-r-2 border-[#8B5CF6] w-[40%]" />
                    <span className="absolute left-3 text-[10px] font-mono text-[#8B5CF6] font-bold">Keyframe 120 (Camera Orbit Sweep)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}