"use client";

import { useState, useEffect } from "react";
import { brain } from "@/lib/brain";

/* ─── Studio Data Model ──────────────────────────────────────────── */

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
    label: "World",
    icon: "🌍",
    accent: "#10B981",
    children: [
      { id: "terrain", label: "Terrain", status: "Heightmap 8K", type: "generator" },
      { id: "biomes", label: "Biomes", status: "16 Active", type: "system" },
      { id: "climate", label: "Climate", status: "Dynamic Weather", type: "simulation" },
      { id: "ecology", label: "Ecology", status: "Flora & Fauna Graph", type: "system" },
      { id: "settlements", label: "Settlements", status: "8 Towns, 2 Castles", type: "placement" },
    ],
  },
  {
    id: "characters",
    label: "Characters",
    icon: "🧙",
    accent: "#F59E0B",
    children: [
      { id: "npcs", label: "NPCs", status: "42 Active", type: "entity" },
      { id: "creatures", label: "Creatures", status: "18 Species", type: "entity" },
      { id: "factions", label: "Factions", status: "6 Factions", type: "relationship" },
      { id: "behaviors", label: "Behaviors", status: "Behavior Trees", type: "ai" },
    ],
  },
  {
    id: "gameplay",
    label: "Gameplay",
    icon: "⚔️",
    accent: "#8B5CF6",
    children: [
      { id: "missions", label: "Missions", status: "12 Active Chains", type: "quest" },
      { id: "quests", label: "Quests", status: "24 Total", type: "quest" },
      { id: "dialogue", label: "Dialogue", status: "1,420 Lines", type: "narrative" },
      { id: "economy", label: "Economy", status: "Dynamic Trade", type: "simulation" },
      { id: "simulation", label: "Simulation", status: "Physics Active", type: "simulation" },
    ],
  },
  {
    id: "production",
    label: "Production",
    icon: "🏗️",
    accent: "#06B6D4",
    children: [
      { id: "asset-factory", label: "Asset Factory", status: "312 Assets", type: "pipeline" },
      { id: "world-builder", label: "World Builder", status: "Active Session", type: "tool" },
      { id: "generation", label: "Generation", status: "Procedural v2.4", type: "pipeline" },
      { id: "review", label: "Review", status: "3 Pending", type: "workflow" },
      { id: "export", label: "Export", status: "Win64 / Linux", type: "build" },
    ],
  },
  {
    id: "ai",
    label: "AI",
    icon: "🤖",
    accent: "#EC4899",
    children: [
      { id: "world-director", label: "World Director", status: "Monitoring", type: "agent" },
      { id: "story-director", label: "Story Director", status: "Narrative Active", type: "agent" },
      { id: "npc-agents", label: "NPC Agents", status: "42 Running", type: "agent" },
      { id: "simulation-agents", label: "Simulation Agents", status: "Physics + Economy", type: "agent" },
    ],
  },
];

/* ─── Inspector Content per Node ─────────────────────────────────── */

const INSPECTOR_DATA: Record<string, { title: string; description: string; properties: { key: string; value: string }[]; actions?: string[] }> = {
  terrain: {
    title: "Terrain Engine",
    description: "Procedural heightmap generation with erosion simulation, LOD streaming, and real-time tessellation.",
    properties: [
      { key: "Resolution", value: "8192 × 8192" },
      { key: "Height Range", value: "-200m to 4,800m" },
      { key: "LOD Levels", value: "6 (auto-streaming)" },
      { key: "Erosion Passes", value: "Hydraulic + Thermal" },
      { key: "Material Layers", value: "12 PBR Splatmaps" },
    ],
    actions: ["Regenerate", "Paint Layer", "Export Heightmap"],
  },
  biomes: {
    title: "Biome System",
    description: "Climate-driven biome placement with transition blending, vegetation density rules, and wildlife spawn zones.",
    properties: [
      { key: "Active Biomes", value: "16" },
      { key: "Transition Width", value: "64m blend zones" },
      { key: "Vegetation Density", value: "Per-biome rules" },
      { key: "Temperature Range", value: "-40°C to 52°C" },
    ],
    actions: ["Edit Biome Map", "Preview Transitions"],
  },
  climate: {
    title: "Climate Simulation",
    description: "Dynamic weather system with wind patterns, precipitation, seasonal cycles, and atmospheric scattering.",
    properties: [
      { key: "Weather States", value: "Clear / Rain / Storm / Snow / Fog" },
      { key: "Cycle Length", value: "24min real-time day" },
      { key: "Seasons", value: "4 (each 6 in-game days)" },
      { key: "Wind System", value: "Volumetric directional" },
    ],
    actions: ["Force Weather", "Edit Season Curve"],
  },
  ecology: {
    title: "Ecology Systems",
    description: "Interconnected flora and fauna simulation with predator-prey dynamics, growth cycles, and resource distribution.",
    properties: [
      { key: "Flora Species", value: "84 procedural variants" },
      { key: "Fauna Species", value: "18 behavioral" },
      { key: "Food Chain Depth", value: "4 trophic levels" },
      { key: "Growth Sim", value: "Real-time per-tick" },
    ],
    actions: ["Inspect Food Web", "Spawn Species"],
  },
  settlements: {
    title: "Settlement Placement",
    description: "Procedural town generation with road networks, building archetypes, population simulation, and trade routes.",
    properties: [
      { key: "Towns", value: "8 generated" },
      { key: "Castles", value: "2 hand-placed" },
      { key: "Road Network", value: "A* pathfinding mesh" },
      { key: "Population", value: "~2,400 simulated NPCs" },
    ],
    actions: ["Place Settlement", "Edit Roads", "Sim Population"],
  },
  npcs: {
    title: "NPC Registry",
    description: "Autonomous NPC entities with state machines, daily schedules, relationship matrices, and dialogue hooks.",
    properties: [
      { key: "Total NPCs", value: "42 active" },
      { key: "Named Characters", value: "14" },
      { key: "Generic Townsfolk", value: "28" },
      { key: "Schedule System", value: "24-hour tick cycle" },
      { key: "Voice Lines", value: "680 synthesized" },
    ],
    actions: ["Create NPC", "Edit Schedule", "Preview Dialogue"],
  },
  creatures: {
    title: "Creature Catalog",
    description: "Hostile and passive fauna with skeletal animation trees, AI behavior, loot tables, and spawn distribution.",
    properties: [
      { key: "Species Count", value: "18" },
      { key: "Boss Variants", value: "3 (multi-phase)" },
      { key: "Loot Tables", value: "Per-creature weighted" },
      { key: "Animation Rigs", value: "IK + Ragdoll blend" },
    ],
    actions: ["New Creature", "Edit Loot Table", "Preview Anim"],
  },
  factions: {
    title: "Faction Graph",
    description: "Multi-axis relationship system with reputation, trade privileges, territory control, and war declarations.",
    properties: [
      { key: "Factions", value: "6 active" },
      { key: "Sentinel Order", value: "ALLIED (+85)" },
      { key: "Shadow Syndicate", value: "HOSTILE (-90)" },
      { key: "Iron Collective", value: "NEUTRAL (+12)" },
      { key: "War State", value: "Syndicate vs Order" },
    ],
    actions: ["Edit Relations", "Declare War", "Trade Treaty"],
  },
  behaviors: {
    title: "Behavior Trees",
    description: "Visual behavior tree editor for NPC and creature AI. Supports composites, decorators, and blackboard variables.",
    properties: [
      { key: "Tree Templates", value: "8 archetypes" },
      { key: "Node Types", value: "Sequence / Selector / Parallel" },
      { key: "Blackboard Vars", value: "Per-entity scoped" },
      { key: "Hot Reload", value: "Live in-game preview" },
    ],
    actions: ["Open Editor", "New Tree", "Debug Entity"],
  },
  missions: {
    title: "Mission Chains",
    description: "Multi-step mission sequences with branching objectives, failure states, and faction reputation consequences.",
    properties: [
      { key: "Active Chains", value: "12" },
      { key: "Total Objectives", value: "67" },
      { key: "Branch Points", value: "23 decision nodes" },
      { key: "Fail States", value: "Per-objective fallback" },
    ],
    actions: ["New Mission", "Edit Chain", "Preview Flow"],
  },
  quests: {
    title: "Quest Graph",
    description: "Full quest dependency graph with prerequisites, rewards, unlock conditions, and journal entries.",
    properties: [
      { key: "Total Quests", value: "24" },
      { key: "Main Story", value: "8 quests" },
      { key: "Side Quests", value: "16 quests" },
      { key: "Reward Types", value: "XP / Gold / Items / Rep" },
    ],
    actions: ["New Quest", "Edit Rewards", "Link Prerequisite"],
  },
  dialogue: {
    title: "Dialogue Editor",
    description: "Branching dialogue tree editor with condition nodes, voice synthesis integration, and localization hooks.",
    properties: [
      { key: "Total Lines", value: "1,420" },
      { key: "Voice Synthesized", value: "100%" },
      { key: "Branch Depth", value: "Up to 8 levels" },
      { key: "Conditions", value: "Faction / Quest / Item" },
    ],
    actions: ["New Conversation", "Re-synthesize Voice", "Export Loc"],
  },
  economy: {
    title: "Economy Simulation",
    description: "Dynamic market system with supply/demand curves, trade routes, currency inflation, and merchant inventories.",
    properties: [
      { key: "Currencies", value: "Gold / Trade Tokens" },
      { key: "Trade Routes", value: "12 active routes" },
      { key: "Inflation Rate", value: "0.3% per game-day" },
      { key: "Merchant Count", value: "18 persistent shops" },
    ],
    actions: ["Edit Prices", "Inspect Supply Graph", "Reset Market"],
  },
  simulation: {
    title: "Physics & Simulation",
    description: "Real-time physics simulation layer for destruction, fluids, cloth, and environmental interactions.",
    properties: [
      { key: "Physics Engine", value: "Custom Verlet + PhysX" },
      { key: "Destruction", value: "Voxel fracture system" },
      { key: "Cloth Sim", value: "GPU-accelerated" },
      { key: "Fluid Sim", value: "SPH particle-based" },
    ],
    actions: ["Run Benchmark", "Toggle Debug Vis"],
  },
  "asset-factory": {
    title: "Asset Factory",
    description: "Procedural and manual asset creation pipeline with 3D mesh generation, texture baking, and material authoring.",
    properties: [
      { key: "Total Assets", value: "312" },
      { key: "Meshes", value: "189 (LOD 0-3)" },
      { key: "Textures", value: "84 PBR sets" },
      { key: "Materials", value: "39 shader graphs" },
    ],
    actions: ["Generate Asset", "Import FBX", "Batch Bake"],
  },
  "world-builder": {
    title: "World Builder",
    description: "Interactive 3D placement tool for composing world scenes, placing props, and painting terrain details.",
    properties: [
      { key: "Session", value: "Active" },
      { key: "Brush Mode", value: "Paint / Scatter / Stamp" },
      { key: "Undo Stack", value: "128 steps" },
      { key: "Snap Grid", value: "0.25m / 1m / 4m" },
    ],
    actions: ["Open 3D Viewport", "Save Scene", "Export Region"],
  },
  generation: {
    title: "Procedural Generation",
    description: "Rule-based procedural content generation for dungeons, interiors, wilderness areas, and item variants.",
    properties: [
      { key: "Generator Version", value: "v2.4.0" },
      { key: "Dungeon Templates", value: "6 archetypes" },
      { key: "Interior Templates", value: "12 room types" },
      { key: "Seed Control", value: "Deterministic replay" },
    ],
    actions: ["Generate Dungeon", "New Seed", "Preview"],
  },
  review: {
    title: "Review Queue",
    description: "Quality gate for generated and authored content before promotion to the live build.",
    properties: [
      { key: "Pending Reviews", value: "3" },
      { key: "Approved Today", value: "7" },
      { key: "Rejected", value: "1 (texture artifact)" },
      { key: "Auto-QA", value: "Collision + LOD check" },
    ],
    actions: ["Open Review", "Approve All", "Run QA"],
  },
  export: {
    title: "Build & Export",
    description: "Multi-platform build pipeline with shader compilation, asset cooking, and distribution packaging.",
    properties: [
      { key: "Targets", value: "Win64 / Linux / WebGPU" },
      { key: "Last Build", value: "v1.0.4 — 0 warnings" },
      { key: "Shader Compile", value: "DX12 + Vulkan + Metal" },
      { key: "Package Size", value: "2.4 GB (compressed)" },
    ],
    actions: ["Build Debug", "Build Release", "Deploy"],
  },
  "world-director": {
    title: "World Director",
    description: "AI agent that monitors player tension curves and dynamically spawns encounters, weather shifts, or reinforcements.",
    properties: [
      { key: "Status", value: "Monitoring" },
      { key: "Tension Model", value: "Real-time player tracking" },
      { key: "Event Queue", value: "3 pending spawns" },
      { key: "Difficulty Curve", value: "Adaptive (sigmoid)" },
    ],
    actions: ["Force Event", "View Tension Graph", "Override Difficulty"],
  },
  "story-director": {
    title: "Story Director",
    description: "LLM-driven narrative agent that evolves global lore based on player choices and faction power balances.",
    properties: [
      { key: "Status", value: "Narrative Active" },
      { key: "Story Arcs", value: "3 active threads" },
      { key: "Player Choices", value: "14 tracked decisions" },
      { key: "Lore Entries", value: "48 generated" },
    ],
    actions: ["Inject Plot Point", "View Arc Graph", "Generate Lore"],
  },
  "npc-agents": {
    title: "NPC Agents",
    description: "Autonomous NPC simulation agents with memory, goals, and emergent social interactions.",
    properties: [
      { key: "Running", value: "42 agents" },
      { key: "Memory Depth", value: "Last 100 interactions" },
      { key: "Goal System", value: "Utility AI scoring" },
      { key: "Social Graph", value: "Relationship matrix" },
    ],
    actions: ["Inspect Agent", "Reset Memory", "Spawn Agent"],
  },
  "simulation-agents": {
    title: "Simulation Agents",
    description: "Background agents managing physics ticks, economic cycles, weather progression, and ecology updates.",
    properties: [
      { key: "Active Systems", value: "Physics + Economy" },
      { key: "Tick Rate", value: "60Hz physics / 1Hz econ" },
      { key: "CPU Budget", value: "12% of frame" },
      { key: "Sync Mode", value: "Deterministic lockstep" },
    ],
    actions: ["Pause Sim", "Step Frame", "Profile"],
  },
};

/* ─── Component ──────────────────────────────────────────────────── */

export default function GamingPage() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["world"]));
  const [selectedNode, setSelectedNode] = useState<string>("terrain");
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    brain.find("games").then((d) => {
      if (d.data?.length) setGames(d.data);
    });
  }, []);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeSection = STUDIO_TREE.find((s) =>
    s.children.some((c) => c.id === selectedNode)
  );
  const activeNode = activeSection?.children.find((c) => c.id === selectedNode);
  const inspector = INSPECTOR_DATA[selectedNode];

  return (
    <div className="flex flex-col h-full bg-[#0C0C0F] text-white font-sans overflow-hidden">

      {/* ─── Studio Top Bar ─────────────────────────────────────── */}
      <header className="h-12 border-b border-[#1F1F28] bg-[#0C0C0F] px-5 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-[10px] font-black text-white shadow-md shadow-[#8B5CF6]/20">
            F
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-white tracking-tight">FRONTIER STUDIO</span>
            <span className="text-[9px] font-semibold text-[#8B5CF6]/70 uppercase tracking-widest">Game Development</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141418] border border-[#1F1F28] text-[#71717A] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Build v1.0.4
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#141418] border border-[#1F1F28] text-[#71717A] font-mono">
            UE 5.6 · C++23
          </span>
        </div>
      </header>

      {/* ─── Main Studio Layout: Tree | Canvas | Inspector ─────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">

        {/* ─── Left: Project Tree ─────────────────────────────── */}
        <div className="w-[220px] border-r border-[#1F1F28] bg-[#0E0E12] flex flex-col shrink-0 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[#1F1F28]">
            <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Project</span>
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
                  <span className="text-sm">{section.icon}</span>
                  <span className="text-[11px] font-semibold text-[#A1A1AA] group-hover:text-white transition-colors">
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

        {/* ─── Center: Canvas / Workspace ─────────────────────── */}
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

          {/* Canvas Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {inspector ? (
              <div className="max-w-3xl space-y-6">

                {/* Title block */}
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">{inspector.title}</h1>
                  <p className="text-[12px] text-[#71717A] mt-1 leading-relaxed max-w-xl">{inspector.description}</p>
                </div>

                {/* Properties Table */}
                <div className="bg-[#111115] border border-[#1F1F28] rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#1F1F28]">
                    <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Properties</span>
                  </div>
                  <div className="divide-y divide-[#1F1F28]">
                    {inspector.properties.map((prop) => (
                      <div key={prop.key} className="flex items-center justify-between px-4 py-2.5 hover:bg-[#16161D] transition-colors">
                        <span className="text-[11px] text-[#71717A]">{prop.key}</span>
                        <span className="text-[11px] font-mono text-white">{prop.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {inspector.actions && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {inspector.actions.map((action, idx) => (
                      <button
                        key={action}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                          idx === 0
                            ? "bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-sm shadow-[#8B5CF6]/20"
                            : "bg-[#141418] border border-[#1F1F28] text-[#A1A1AA] hover:text-white hover:border-[#3F3F46]"
                        }`}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}

                {/* Canvas Placeholder — 3D viewport feel */}
                <div className="bg-[#111115] border border-[#1F1F28] rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#1F1F28] flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#52525B] uppercase tracking-widest">Viewport</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                      <span className="text-[10px] text-[#52525B] font-mono">Live</span>
                    </div>
                  </div>
                  <div className="h-[280px] bg-gradient-to-br from-[#0C0C0F] via-[#111118] to-[#0E0E14] flex items-center justify-center relative">
                    {/* Grid overlay */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                      backgroundImage: "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
                      backgroundSize: "40px 40px",
                    }} />
                    {/* Center crosshair */}
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="text-3xl">{activeSection?.icon}</div>
                      <span className="text-[11px] text-[#3F3F46] font-mono">{inspector.title} — Select an entity to preview</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[#3F3F46] text-sm">
                Select a node from the project tree.
              </div>
            )}
          </div>
        </div>

        {/* ─── Right: Inspector Panel ─────────────────────────── */}
        <div className="w-[240px] border-l border-[#1F1F28] bg-[#0E0E12] flex flex-col shrink-0 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[#1F1F28]">
            <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Inspector</span>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {inspector ? (
              <div className="space-y-3 px-3">

                {/* Node identity */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{activeSection?.icon}</span>
                    <span className="text-[12px] font-bold text-white">{inspector.title}</span>
                  </div>
                  {activeNode?.type && (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
                      {activeNode.type}
                    </span>
                  )}
                </div>

                <div className="h-px bg-[#1F1F28]" />

                {/* Quick props */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Details</span>
                  {inspector.properties.slice(0, 4).map((prop) => (
                    <div key={prop.key} className="space-y-0.5">
                      <span className="text-[10px] text-[#52525B] block">{prop.key}</span>
                      <span className="text-[11px] font-mono text-[#A1A1AA] block">{prop.value}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-[#1F1F28]" />

                {/* Status */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Status</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-[11px] text-[#10B981] font-mono">{activeNode?.status}</span>
                  </div>
                </div>

                <div className="h-px bg-[#1F1F28]" />

                {/* Section context */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-[#52525B] uppercase tracking-widest">Section</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeSection?.accent }} />
                    <span className="text-[11px] text-[#A1A1AA]">{activeSection?.label}</span>
                  </div>
                  <span className="text-[10px] text-[#3F3F46]">
                    {activeSection?.children.length} items in this group
                  </span>
                </div>

              </div>
            ) : (
              <div className="px-3 py-4 text-[11px] text-[#3F3F46]">
                No selection.
              </div>
            )}
          </div>

          {/* Inspector footer */}
          <div className="px-3 py-2 border-t border-[#1F1F28] text-[10px] text-[#3F3F46] font-mono">
            frontier-studio v2.4.0
          </div>
        </div>

      </div>
    </div>
  );
}