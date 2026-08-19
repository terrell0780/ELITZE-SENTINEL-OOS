"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

/* ─── Studio Data Model & Agent Hierarchy ──────────────────────────── */

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  status?: string;
  type?: string;
}

const STUDIO_TREE: { id: string; label: string; icon: string; accent: string; children: TreeNode[] }[] = [
  {
    id: "world",
    label: "WORLD",
    icon: "🌍",
    accent: "#10B981",
    children: [
      { id: "terrain", label: "Terrain", status: "Heightmap 8K", type: "generator" },
      { id: "environment", label: "Environment", status: "Dynamic Weather", type: "simulation" },
      { id: "locations", label: "Locations", status: "3 Settlements + Military Base", type: "placement" },
      { id: "biomes", label: "Biomes", status: "Coastal & Wasteland", type: "system" },
    ],
  },
  {
    id: "content",
    label: "CONTENT",
    icon: "🧙",
    accent: "#F59E0B",
    children: [
      { id: "characters", label: "Characters", status: "Faction Leads", type: "entity" },
      { id: "npcs", label: "NPCs", status: "42 Simulated", type: "entity" },
      { id: "creatures", label: "Creatures", status: "Hostile Wildlife", type: "entity" },
      { id: "items", label: "Items & Weapons", status: "Loot Tables Active", type: "system" },
    ],
  },
  {
    id: "gameplay",
    label: "GAMEPLAY",
    icon: "⚔️",
    accent: "#8B5CF6",
    children: [
      { id: "missions", label: "Missions", status: "Coastal Recon & Infiltration", type: "quest" },
      { id: "quests", label: "Quests", status: "24 Interconnected", type: "quest" },
      { id: "dialogue", label: "Dialogue", status: "Branching Trees", type: "narrative" },
      { id: "economy", label: "Economy", status: "Scavenger Trade", type: "simulation" },
    ],
  },
  {
    id: "agents",
    label: "AGENT HIERARCHY",
    icon: "🤖",
    accent: "#EC4899",
    children: [
      { id: "game-director", label: "Game Director Agent", status: "Active Orchestrator", type: "director" },
      { id: "world-director", label: "World Director Mesh", status: "Terrain / Biome / Env", type: "agent-group" },
      { id: "content-director", label: "Content Director Mesh", status: "Char / Creature / Asset", type: "agent-group" },
      { id: "gameplay-director", label: "Gameplay Director Mesh", status: "Quest / Mission / Econ", type: "agent-group" },
      { id: "ai-director", label: "AI Director Mesh", status: "NPC / Behavior / Faction", type: "agent-group" },
      { id: "qa-director", label: "QA & Build Director", status: "Test / Perf / Build", type: "agent-group" },
    ],
  },
];

/* ─── Inspector Content per Node ─────────────────────────────────── */

const INSPECTOR_DATA: Record<string, { title: string; description: string; properties: { key: string; value: string }[]; actions?: string[] }> = {
  terrain: {
    title: "Coastal Region Heightmap",
    description: "Post-apocalyptic coastal cliffside terrain generated via Procedural Erosion & Coastal Splatmaps.",
    properties: [
      { key: "Resolution", value: "8192 × 8192 (8K Mesh)" },
      { key: "Height Range", value: "-50m Coastal to 1,200m Ridge" },
      { key: "Erosion Passes", value: "Hydraulic + Tidal Erosion" },
      { key: "Material Layers", value: "Rust Rock, Wet Sand, Dead Grass" },
    ],
    actions: ["Regenerate Coastline", "Sculpt Cliffs", "Export Heightmap"],
  },
  environment: {
    title: "Atmosphere & Dynamic Weather",
    description: "Volumetric fog, toxic dust storms, acid rain cycles, and coastal raytraced lighting.",
    properties: [
      { key: "Active Weather", value: "Coastal Fog / Toxic Acid Rain" },
      { key: "Day/Night Cycle", value: "48min Dynamic" },
      { key: "Atmosphere", value: "Volumetric Dust Particles" },
    ],
    actions: ["Force Storm State", "Adjust Fog Density"],
  },
  locations: {
    title: "World Locations & POIs",
    description: "Generated post-apocalyptic points of interest: 3 survivor settlements and 1 abandoned military bunker.",
    properties: [
      { key: "Settlement Alpha", value: "Port Haven (Allied)" },
      { key: "Settlement Beta", value: "Iron Ridge (Hostile)" },
      { key: "Settlement Gamma", value: "Sunken Wharf (Neutral)" },
      { key: "Military Compound", value: "Bunker 09 (Infected Zone)" },
    ],
    actions: ["Re-route Trade Roads", "Place Defense Turrets"],
  },
  biomes: {
    title: "Coastal Wasteland Biome",
    description: "Desolate shoreline, dead pine forest, and rusted industrial ruin zones.",
    properties: [
      { key: "Active Zones", value: "4 Distinct Biomes" },
      { key: "Vegetation", value: "Dead Pines & Kelp" },
    ],
    actions: ["Paint Biome", "Preview Density"],
  },
  characters: {
    title: "Faction Leaders & Key Figures",
    description: "Autonomous high-tier NPCs governing Settlement relationships.",
    properties: [
      { key: "Commander Vance", value: "Port Haven Militia Leader" },
      { key: "Warlord Kael", value: "Iron Ridge Raider King" },
    ],
    actions: ["Inspect Memory Tree", "Edit Relations"],
  },
  npcs: {
    title: "Autonomous NPC Agents",
    description: "42 active background NPCs executing utility AI goals, scavenging, and defending settlements.",
    properties: [
      { key: "Active NPCs", value: "42 Simulated" },
      { key: "Logic Engine", value: "Goal-Oriented Action Planning (GOAP)" },
    ],
    actions: ["Debug GOAP State", "Trigger Raid Event"],
  },
  creatures: {
    title: "Hostile Wildlife Catalog",
    description: "Mutated coastal fauna with dynamic pack behavior trees.",
    properties: [
      { key: "Coastal Lurkers", value: "Pack AI (Active Hostile)" },
      { key: "Ash Stalkers", value: "Solitary Predator" },
    ],
    actions: ["Spawn Creature", "Tune Aggro Radius"],
  },
  items: {
    title: "Loot & Weapon Tables",
    description: "Procedural weapon variants, scrap resources, and military tech ammo.",
    properties: [
      { key: "Scrap Value Curve", value: "Dynamic Rarity" },
      { key: "Weapon Templates", value: "Pipe Guns, Rail Rifles" },
    ],
    actions: ["Edit Drop Rates", "Bake Item Prefabs"],
  },
  missions: {
    title: "Interconnected Coastal Missions",
    description: "Branching storyline linking the 3 settlements and the infiltration of Bunker 09.",
    properties: [
      { key: "Primary Quest", value: "The Coastal Signal" },
      { key: "Infiltration Mission", value: "Bunker 09 Vault Key" },
    ],
    actions: ["Simulate Quest Flow", "Edit Rewards"],
  },
  quests: {
    title: "Quest Graph & Dependencies",
    description: "Prerequisite and consequence graph connecting all 24 sub-quests.",
    properties: [
      { key: "Total Quests", value: "24" },
      { key: "Faction Triggers", value: "Allied / Enemy Multiplier" },
    ],
    actions: ["New Quest Node", "Check Graph Deadlocks"],
  },
  dialogue: {
    title: "LLM Narrative & Voice Trees",
    description: "Real-time AI voice dialogue trees with faction memory hooks.",
    properties: [
      { key: "Voice Provider", value: "Synthesized ElevenLabs" },
      { key: "Memory Depth", value: "Persistent History" },
    ],
    actions: ["Generate Dialogue", "Test Synth Voice"],
  },
  economy: {
    title: "Scavenger Trade Economy",
    description: "Item barter system driven by settlement resource scarcity.",
    properties: [
      { key: "Water Scarcity", value: "High Value (+40%)" },
      { key: "Ammo Scarcity", value: "Critical (+85%)" },
    ],
    actions: ["Adjust Market Supply", "Simulate Trade Cycle"],
  },
  "game-director": {
    title: "Game Director Agent",
    description: "Root agent orchestrating all sub-directors for procedural game generation.",
    properties: [
      { key: "Status", value: "Active Orchestration" },
      { key: "Generation Pipeline", value: "Prompt → World → Content → Gameplay → Build" },
    ],
    actions: ["Trigger Full Generation", "View Pipeline Tree"],
  },
  "world-director": {
    title: "World Director Mesh",
    description: "Coordinates Terrain Agent, Biome Agent, and Environment Agent.",
    properties: [
      { key: "Sub-Agents", value: "Terrain, Biome, Environment" },
      { key: "Output Artifacts", value: "Heightmap, Weather Curve, POI Placement" },
    ],
    actions: ["Re-run World Mesh"],
  },
  "content-director": {
    title: "Content Director Mesh",
    description: "Coordinates Character Agent, Creature Agent, and Asset Agent.",
    properties: [
      { key: "Sub-Agents", value: "Character, Creature, Asset" },
      { key: "Output Artifacts", value: "Skeletal Meshes, GOAP Rigs, Loot Tables" },
    ],
    actions: ["Re-run Content Mesh"],
  },
  "gameplay-director": {
    title: "Gameplay Director Mesh",
    description: "Coordinates Quest Agent, Mission Agent, Dialogue Agent, and Economy Agent.",
    properties: [
      { key: "Sub-Agents", value: "Quest, Mission, Dialogue, Economy" },
      { key: "Output Artifacts", value: "Quest DAG, Voice Buffers, Market Graph" },
    ],
    actions: ["Re-run Gameplay Mesh"],
  },
  "ai-director": {
    title: "AI Director Mesh",
    description: "Coordinates NPC Agent, Behavior Agent, and Faction Agent.",
    properties: [
      { key: "Sub-Agents", value: "NPC, Behavior, Faction" },
      { key: "Output Artifacts", value: "Behavior Trees, Faction Reputation Matrix" },
    ],
    actions: ["Re-run AI Mesh"],
  },
  "qa-director": {
    title: "QA & Build Director",
    description: "Coordinates Test Agent, Performance Agent, and Build Agent.",
    properties: [
      { key: "Sub-Agents", value: "Test, Performance, Build" },
      { key: "Build Output", value: "Executable Game Package (Win64/UE5.6)" },
    ],
    actions: ["Run Automated QA", "Cook Playable Build"],
  },
};

/* ─── Component ──────────────────────────────────────────────────── */

export default function GamingPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["world", "content", "gameplay", "agents"]));
  const [selectedNode, setSelectedNode] = useState<string>("terrain");
  const [activeDockTab, setActiveDockTab] = useState<string>("ASSETS");
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [genStep, setGenStep] = useState<string>("");

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAgentBuild = (customPrompt?: string) => {
    const textToRun = customPrompt || prompt || "Create a post-apocalyptic coastal region with three settlements, dynamic weather, hostile wildlife, two factions, an abandoned military facility and interconnected missions.";
    setIsGenerating(true);
    setGenStep("Game Director initializing pipeline...");

    setTimeout(() => setGenStep("World Director: Sculpting Coastal Heightmap & Biomes..."), 800);
    setTimeout(() => setGenStep("Environment Agent: Baking Dynamic Weather & Atmospheric Fog..."), 1600);
    setTimeout(() => setGenStep("Content Director: Spawning 3 Settlements, Bunker 09, & Mutant Wildlife..."), 2400);
    setTimeout(() => setGenStep("Gameplay Director: Constructing Quest Graph & Dialogue Trees..."), 3200);
    setTimeout(() => setGenStep("QA & Build Director: Compiling Playable UE5.6 Package..."), 4000);
    setTimeout(() => {
      setIsGenerating(false);
      setGenStep("");
      setSelectedNode("locations");
    }, 4800);
  };

  const activeSection = STUDIO_TREE.find((s) =>
    s.children.some((c) => c.id === selectedNode)
  );
  const activeNode = activeSection?.children.find((c) => c.id === selectedNode);
  const inspector = INSPECTOR_DATA[selectedNode] || INSPECTOR_DATA["terrain"];

  return (
    <div className="flex flex-col h-full bg-[#0C0C0F] text-white font-sans overflow-hidden">

      {/* ─── Studio Top Bar ─────────────────────────────────────── */}
      <header className="h-12 border-b border-[#1F1F28] bg-[#0C0C0F] px-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-[10px] font-black text-white shadow-md shadow-[#8B5CF6]/20">
            F
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">PROJECT: ELITZE WORLD</span>
            <span className="text-[9px] font-semibold text-[#8B5CF6]/70 uppercase tracking-widest">FRONTIER GAME ENGINE</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleAgentBuild()}
            className="px-3 py-1 rounded-md bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-[#10B981]/20 transition-all"
          >
            <span>▶</span> PLAY
          </button>
          <button 
            onClick={() => handleAgentBuild()}
            className="px-3 py-1 rounded-md bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-[#8B5CF6]/20 transition-all"
          >
            <span>⚡</span> BUILD
          </button>
          <button className="px-3 py-1 rounded-md bg-[#141418] border border-[#1F1F28] hover:bg-[#1C1C24] text-[#A1A1AA] hover:text-white font-semibold text-xs transition-all">
            EXPORT
          </button>
        </div>
      </header>

      {/* ─── AI Prompt Build Input Bar ─────────────────────────── */}
      <div className="bg-[#111115] border-b border-[#1F1F28] px-5 py-2 flex items-center gap-3 shrink-0">
        <span className="text-sm">🤖</span>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Tell Frontier's Game Director to build a world (e.g. 'Create a post-apocalyptic coastal region with 3 settlements, dynamic weather...')"
          className="flex-1 bg-[#09090B] border border-[#1F1F28] rounded-md px-3 py-1.5 text-xs text-white placeholder-[#52525B] outline-none focus:border-[#8B5CF6]"
        />
        <button
          onClick={() => handleAgentBuild()}
          disabled={isGenerating}
          className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:bg-[#3F3F46] text-white font-bold text-xs rounded-md shadow-sm transition-all flex items-center gap-1.5 shrink-0"
        >
          {isGenerating ? "BUILDING WORLD..." : "GENERATE PROJECT"}
        </button>
      </div>

      {/* ─── Agent Pipeline Generation Overlay Banner ─────────────── */}
      {isGenerating && (
        <div className="bg-[#8B5CF6]/20 border-b border-[#8B5CF6]/40 px-5 py-2 flex items-center gap-3 text-xs text-[#A78BFA] font-mono shrink-0 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-ping" />
          <span>{genStep}</span>
        </div>
      )}

      {/* ─── Main Studio Layout: Tree | Canvas | Inspector ─────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* ─── Left: Project Tree ─────────────────────────────── */}
        <div className="w-[220px] border-r border-[#1F1F28] bg-[#0E0E12] flex flex-col shrink-0 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[#1F1F28] flex items-center justify-between">
            <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Project Hierarchy</span>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            {STUDIO_TREE.map((section) => (
              <div key={section.id}>
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-[#16161D] transition-colors group"
                >
                  <svg
                    className={`w-2.5 h-2.5 text-[#52525B] transition-transform ${expandedSections.has(section.id) ? "rotate-90" : ""}`}
                    viewBox="0 0 24 24" fill="currentColor"
                  >
                    <path d="M8 5l8 7-8 7z" />
                  </svg>
                  <span className="text-xs">{section.icon}</span>
                  <span className="text-[10px] font-extrabold text-[#A1A1AA] tracking-wider group-hover:text-white transition-colors">
                    {section.label}
                  </span>
                </button>

                {/* Children */}
                {expandedSections.has(section.id) && (
                  <div className="ml-3">
                    {section.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedNode(child.id)}
                        className={`w-full flex items-center gap-2 pl-5 pr-3 py-[5px] text-left transition-all ${
                          selectedNode === child.id
                            ? "bg-[#8B5CF6]/10 border-l-2 border-[#8B5CF6]"
                            : "border-l-2 border-transparent hover:bg-[#16161D]"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          selectedNode === child.id ? "bg-[#8B5CF6]" : "bg-[#3F3F46]"
                        }`} />
                        <span className={`text-[11px] ${
                          selectedNode === child.id ? "text-white font-semibold" : "text-[#71717A]"
                        }`}>
                          {child.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── Center: 3D World Viewport & Canvas Workspace ──── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Breadcrumb bar */}
          <div className="h-9 border-b border-[#1F1F28] bg-[#0C0C0F] px-5 flex items-center gap-2 shrink-0">
            {activeSection && (
              <>
                <span className="text-sm">{activeSection.icon}</span>
                <span className="text-[11px] font-semibold text-[#52525B]">{activeSection.label}</span>
                <span className="text-[#3F3F46] text-[10px]">/</span>
                <span className="text-[11px] font-semibold text-white">{activeNode?.label}</span>
                {activeNode?.status && (
                  <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded bg-[#141418] border border-[#1F1F28] text-[#71717A]">
                    {activeNode.status}
                  </span>
                )}
              </>
            )}
          </div>

          {/* 3D World Canvas & Inspector Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Main 3D World Viewport */}
            <div className="bg-[#111115] border border-[#1F1F28] rounded-xl overflow-hidden shadow-2xl">
              <div className="px-4 py-2.5 border-b border-[#1F1F28] flex items-center justify-between bg-[#0E0E12]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-widest">3D WORLD VIEWPORT</span>
                  <span className="text-[10px] text-[#52525B] font-mono">| UE 5.6 Native Runtime</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-[10px] text-[#10B981] font-mono font-bold">60 FPS</span>
                </div>
              </div>

              {/* Viewport Render Canvas Simulation */}
              <div className="h-[320px] bg-gradient-to-br from-[#090D16] via-[#101524] to-[#0A0D14] flex flex-col items-center justify-center relative overflow-hidden group">
                
                {/* Simulated 3D Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.08]" style={{
                  backgroundImage: "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }} />

                {/* Simulated Procedural World Horizon */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#10B981]/10 via-transparent to-transparent pointer-events-none" />

                {/* Viewport Overlay Content */}
                <div className="relative z-10 flex flex-col items-center gap-3 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-2xl shadow-lg">
                    {activeSection?.icon || "🌍"}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">{inspector.title}</h3>
                    <p className="text-[11px] text-[#71717A] max-w-md mt-1">{inspector.description}</p>
                  </div>
                </div>

                {/* Viewport Corner HUD Controls */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-[10px] font-mono bg-[#09090B]/80 border border-[#1F1F28] px-2.5 py-1 rounded-md text-[#71717A]">
                  <span>Camera: Orbit</span>
                  <span>FOV: 90°</span>
                  <span>Light: Raytraced Lumen</span>
                </div>
              </div>
            </div>

            {/* Entity Properties Table */}
            <div className="bg-[#111115] border border-[#1F1F28] rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#1F1F28] flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Entity & Component Properties</span>
                {inspector.actions && (
                  <div className="flex items-center gap-2">
                    {inspector.actions.map((action, idx) => (
                      <button
                        key={action}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                          idx === 0
                            ? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
                            : "bg-[#141418] border border-[#1F1F28] text-[#A1A1AA] hover:text-white"
                        }`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="divide-y divide-[#1F1F28]">
                {inspector.properties.map((prop) => (
                  <div key={prop.key} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#16161D] transition-colors">
                    <span className="text-[11px] text-[#71717A] font-medium">{prop.key}</span>
                    <span className="text-[11px] font-mono text-white font-semibold">{prop.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ─── Right: Inspector Panel ─────────────────────────── */}
        <div className="w-[240px] border-l border-[#1F1F28] bg-[#0E0E12] flex flex-col shrink-0 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[#1F1F28]">
            <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">INSPECTOR</span>
          </div>

          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
            {/* Selected Node Identity */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Selected Object</span>
              <p className="text-[13px] font-bold text-white">{inspector.title}</p>
              {activeNode?.type && (
                <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
                  {activeNode.type}
                </span>
              )}
            </div>

            <div className="h-px bg-[#1F1F28]" />

            {/* Transform Properties */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Transform</span>
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between px-2 py-1 bg-[#141418] rounded border border-[#1F1F28]">
                  <span className="text-[#EF4444]">X: 1,420.5</span>
                  <span className="text-[#10B981]">Y: -320.0</span>
                  <span className="text-[#38BDF8]">Z: 85.4</span>
                </div>
                <div className="flex justify-between px-2 py-1 bg-[#141418] rounded border border-[#1F1F28]">
                  <span className="text-[#71717A]">Rot: 0° / 45° / 0°</span>
                </div>
                <div className="flex justify-between px-2 py-1 bg-[#141418] rounded border border-[#1F1F28]">
                  <span className="text-[#71717A]">Scale: 1.0 / 1.0 / 1.0</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-[#1F1F28]" />

            {/* Component Stack */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Components</span>
              <div className="space-y-1 text-[10px]">
                {["StaticMeshComponent", "ProceduralTerrainGraph", "AtmosphericLighting", "AIAgentController"].map((comp) => (
                  <div key={comp} className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#141418] border border-[#1F1F28] text-[#A1A1AA]">
                    <span className="text-[#8B5CF6]">⚙</span>
                    <span>{comp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#1F1F28]" />

            {/* Agent Hierarchy Quick Status */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Managing Agent</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[11px] text-[#10B981] font-mono font-semibold">Game Director Active</span>
              </div>
            </div>

          </div>

          {/* Inspector footer */}
          <div className="px-3 py-2 border-t border-[#1F1F28] text-[10px] text-[#3F3F46] font-mono">
            frontier-engine v2.4.0
          </div>
        </div>

      </div>

      {/* ─── Bottom Studio Dock ─────────────────────────────────── */}
      <footer className="h-9 border-t border-[#1F1F28] bg-[#0C0C0F] px-4 flex items-center justify-between shrink-0 z-20 select-none">
        <div className="flex items-center gap-1 font-mono text-[10px]">
          {["ASSETS", "AGENTS", "CONSOLE", "LOGS", "SIMULATION", "BUILD"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveDockTab(tab)}
              className={`px-3 py-1 rounded transition-colors ${
                activeDockTab === tab
                  ? "bg-[#8B5CF6] text-white font-bold shadow-sm"
                  : "text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#141418]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-[#52525B] font-mono">
          <span className="flex items-center gap-1 text-[#10B981]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Agent Director Mesh: ONLINE
          </span>
          <span>UE 5.6 Runtime</span>
          <span>FPS: 60</span>
        </div>
      </footer>

    </div>
  );
}