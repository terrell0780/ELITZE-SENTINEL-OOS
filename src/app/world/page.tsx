"use client";

import { useState } from "react";

export default function WorldBuilderPage() {
  const [selectedSceneItem, setSelectedSceneItem] = useState("Terrain");
  const [activeBottomTab, setActiveBottomTab] = useState("Assets");

  const sceneTree = {
    SCENE: ["Terrain", "Environment", "Locations", "Biomes"],
    ENTITIES: ["Characters", "NPCs", "Creatures"],
  };

  const objectProperties: Record<string, { type: string; position: string; rotation: string; scale: string; components: string[] }> = {
    Terrain: {
      type: "Heightmap Mesh",
      position: "0.0, 0.0, 0.0",
      rotation: "0.0°, 0.0°, 0.0°",
      scale: "1.0, 1.0, 1.0",
      components: ["ProceduralHeightmapGraph", "HydraulicErosionSim", "PBRSplatmapRenderer"],
    },
    Environment: {
      type: "Atmospheric Lighting",
      position: "0.0, 500.0, 0.0",
      rotation: "45.0°, 120.0°, 0.0°",
      scale: "1.0, 1.0, 1.0",
      components: ["VolumetricFog", "DayNightCycleManager", "RaytracedLumenSun"],
    },
    Locations: {
      type: "POI Group Node",
      position: "142.0, 12.0, 85.0",
      rotation: "0.0°, 0.0°, 0.0°",
      scale: "1.0, 1.0, 1.0",
      components: ["SettlementSpawner", "RoadPathfindingMesh", "BunkerStructureNode"],
    },
    Biomes: {
      type: "Biome Distribution Map",
      position: "0.0, 0.0, 0.0",
      rotation: "0.0°, 0.0°, 0.0°",
      scale: "1.0, 1.0, 1.0",
      components: ["VegetationDensityMap", "WildlifeSpawnVolume", "ClimateBlendGraph"],
    },
    Characters: {
      type: "Faction Leader Actor",
      position: "210.4, 8.2, 42.0",
      rotation: "0.0°, 90.0°, 0.0°",
      scale: "1.0, 1.0, 1.0",
      components: ["SkeletalMesh", "GOAPAIController", "DialogueTreeInstance"],
    },
    NPCs: {
      type: "Simulated NPC Crowd",
      position: "185.0, 5.0, 30.0",
      rotation: "0.0°, 0.0°, 0.0°",
      scale: "1.0, 1.0, 1.0",
      components: ["CrowdNavigationAgent", "ScheduleStateTick", "TradeMemoryMatrix"],
    },
    Creatures: {
      type: "Mutated Fauna Pack",
      position: "420.0, 15.0, -110.0",
      rotation: "0.0°, 180.0°, 0.0°",
      scale: "1.2, 1.2, 1.2",
      components: ["BehaviorTreeRunner", "PerceptionSensor", "LootDropTable"],
    },
  };

  const currentObj = objectProperties[selectedSceneItem] || objectProperties["Terrain"];

  return (
    <div className="h-full bg-[#08090c] text-[#f5f7fa] flex flex-col font-sans overflow-hidden select-none">
      
      {/* ── Header ── */}
      <header className="h-[52px] border-b border-[#ffffff14] bg-[#0d0f13] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-xs font-bold text-[#f5f7fa]">WORLD BUILDER</span>
          <span className="text-[10px] text-[#687180]">| Project Atlas v2.4</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded bg-[#11141a] hover:bg-[#161a21] border border-[#ffffff14] text-xs font-semibold text-[#a7adb8] hover:text-white transition-colors">
            Save
          </button>
          <button className="px-3 py-1 rounded bg-[#11141a] hover:bg-[#161a21] border border-[#ffffff14] text-xs font-semibold text-[#a7adb8] hover:text-white transition-colors">
            Preview
          </button>
          <button className="px-3 py-1 rounded bg-[#1677ff] hover:bg-[#1677ff]/90 text-xs font-bold text-white transition-colors shadow-sm">
            Build
          </button>
        </div>
      </header>

      {/* ── Main Workspace 3-Pane Layout ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* Left: SCENE & ENTITIES TREE */}
        <aside className="w-[200px] border-r border-[#ffffff14] bg-[#0d0f13] flex flex-col shrink-0 overflow-y-auto p-3 space-y-4">
          <div>
            <span className="text-[9px] font-mono font-bold text-[#687180] uppercase tracking-widest block mb-2">SCENE</span>
            <div className="space-y-0.5">
              {sceneTree.SCENE.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedSceneItem(item)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors font-medium ${
                    selectedSceneItem === item
                      ? "bg-[#1677ff]/15 text-[#1677ff] font-semibold border-l-2 border-[#1677ff]"
                      : "text-[#a7adb8] hover:bg-[#161a21] hover:text-[#f5f7fa]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#ffffff0f]">
            <span className="text-[9px] font-mono font-bold text-[#687180] uppercase tracking-widest block mb-2">ENTITIES</span>
            <div className="space-y-0.5">
              {sceneTree.ENTITIES.map((item) => (
                <button
                  key={item}
                  onClick={() => setSelectedSceneItem(item)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors font-medium ${
                    selectedSceneItem === item
                      ? "bg-[#1677ff]/15 text-[#1677ff] font-semibold border-l-2 border-[#1677ff]"
                      : "text-[#a7adb8] hover:bg-[#161a21] hover:text-[#f5f7fa]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: WORLD VIEW Canvas */}
        <main className="flex-1 bg-[#08090c] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />

          <div className="relative z-10 text-center space-y-2">
            <span className="text-4xl">🌍</span>
            <h2 className="text-sm font-mono font-bold text-[#f5f7fa] tracking-wider uppercase">WORLD VIEW</h2>
            <p className="text-xs text-[#687180] font-mono">Viewport Active · Render Mesh: {selectedSceneItem}</p>
          </div>
        </main>

        {/* Right: INSPECTOR */}
        <aside className="w-[240px] border-l border-[#ffffff14] bg-[#0d0f13] flex flex-col shrink-0 p-3 space-y-4 overflow-y-auto">
          <span className="text-[9px] font-mono font-bold text-[#687180] uppercase tracking-widest block">INSPECTOR</span>
          
          <div className="space-y-3 font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#687180] uppercase block">Selected Object</span>
              <p className="font-bold text-[#f5f7fa] mt-0.5">{selectedSceneItem}</p>
              <p className="text-[10px] text-[#1677ff]">{currentObj.type}</p>
            </div>

            <div className="pt-2 border-t border-[#ffffff0f] space-y-1">
              <span className="text-[10px] text-[#687180] uppercase block">Transform</span>
              <div className="bg-[#11141a] p-2 rounded border border-[#ffffff0f] space-y-1 text-[10px]">
                <p className="text-[#a7adb8]"><span className="text-[#687180]">Pos:</span> {currentObj.position}</p>
                <p className="text-[#a7adb8]"><span className="text-[#687180]">Rot:</span> {currentObj.rotation}</p>
                <p className="text-[#a7adb8]"><span className="text-[#687180]">Scale:</span> {currentObj.scale}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#ffffff0f] space-y-1">
              <span className="text-[10px] text-[#687180] uppercase block">Components</span>
              <div className="space-y-1">
                {currentObj.components.map((comp) => (
                  <div key={comp} className="bg-[#11141a] p-1.5 rounded border border-[#ffffff0f] text-[10px] text-[#a7adb8]">
                    {comp}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

      </div>

      {/* ── Bottom Dock ── */}
      <footer className="h-9 border-t border-[#ffffff14] bg-[#0d0f13] px-3 flex items-center justify-between shrink-0 font-mono text-[10px]">
        <div className="flex items-center gap-1">
          {["Assets", "Agents", "Console", "Simulation", "Logs", "Build"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveBottomTab(tab)}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeBottomTab === tab
                  ? "bg-[#161a21] text-[#f5f7fa] font-bold"
                  : "text-[#687180] hover:text-[#a7adb8]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="text-[#687180]">
          UE 5.6 Native Engine · 60 FPS
        </div>
      </footer>

    </div>
  );
}