"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";

const SECTION_META: Record<string, { title: string; description: string; category: "development" | "business" | "creative" | "security" | "monitoring" | "default" }> = {
  chat: { title: "Chat", description: "Conversational AI workspace", category: "default" },
  projects: { title: "Projects", description: "Project management and collaboration", category: "business" },
  studio: { title: "Studio", description: "Application builder", category: "development" },
  research: { title: "Research", description: "Deep research and intelligence", category: "default" },
  knowledge: { title: "Knowledge", description: "Enterprise memory and RAG", category: "development" },
  agents: { title: "Agents", description: "Autonomous AI workforce", category: "monitoring" },
  automation: { title: "Automation", description: "Workflow orchestration", category: "development" },
  n8n: { title: "Workflows", description: "n8n workflow integration", category: "development" },
  runtime: { title: "Runtime", description: "AI execution engine", category: "monitoring" },
  deploy: { title: "Deploy", description: "Cloud, edge and self-hosted deployment", category: "development" },
  maps: { title: "Maps", description: "Geospatial intelligence", category: "creative" },
  gaming: { title: "Gaming", description: "Game development platform", category: "creative" },
  marketplace: { title: "Marketplace", description: "Extensions and integrations", category: "business" },
  integrations: { title: "Integrations", description: "Connected external services", category: "development" },
  enterprise: { title: "Enterprise", description: "Organization management", category: "business" },
  security: { title: "Security", description: "Security and governance", category: "security" },
  settings: { title: "Settings", description: "Configuration and preferences", category: "default" },
  media: { title: "Media", description: "Media management", category: "creative" },
  visual: { title: "Visuals", description: "Visual generation", category: "creative" },
  storytelling: { title: "Storytelling", description: "Narrative engine", category: "creative" },
  world: { title: "World", description: "World building", category: "creative" },
  sales: { title: "Sales", description: "Sales pipelines and CRM", category: "business" },
  leadgen: { title: "Lead Generation", description: "Lead generation and scraping", category: "business" },
  jobs: { title: "Jobs", description: "Job queue and scheduling", category: "development" },
  code: { title: "Code", description: "Source code management", category: "development" },
  cli: { title: "CLI", description: "Command line interface", category: "development" },
  workflows: { title: "Workflows", description: "Custom logic workflows", category: "development" },
  intelligence: { title: "Intelligence", description: "Data analysis", category: "monitoring" },
  dashboard: { title: "Dashboard", description: "System overview", category: "monitoring" },
  voice: { title: "Voice", description: "Voice synthesis and recognition", category: "creative" },
  swarm: { title: "Swarm", description: "Multi-agent coordination", category: "monitoring" },
  "threat-intel": { title: "Threat Intel", description: "Threat intelligence feeds", category: "security" },
  lindy: { title: "Lindy AI", description: "Agent orchestration platform", category: "monitoring" },
  "image-to-video": { title: "Image to Video", description: "Convert still images to motion", category: "creative" },
  "3d-creator": { title: "3D Creator", description: "Drag and drop 3D scene builder", category: "creative" },
  "faceless-yt": { title: "Faceless YouTube", description: "Generate faceless YouTube content", category: "creative" },
};

export default function SlugPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug || "";

  const root = slug.split("/")[0];
  const sub = slug.split("/").slice(1).join("/");
  const meta = SECTION_META[sub] || SECTION_META[root] || { title: root, description: "Workspace environment", category: "default" };

  const renderContent = useMemo(() => {
    switch (meta.category) {
      case "development":
        return (
          <div className="flex-1 flex flex-col font-mono text-sm text-[#A1A1AA]">
            <div className="flex items-center gap-4 mb-4 border-b border-[#27272A] pb-2">
              <span className="text-[#D92A2A]">src/</span>
              <span>main.ts</span>
              <span>config.json</span>
            </div>
            <div className="flex-1">
              <div className="text-[#FAFAFA] mb-2">// Environment initialized</div>
              <div><span className="text-[#D92A2A]">const</span> workspace = <span className="text-[#FAFAFA]">new</span> Workspace();</div>
              <div>workspace.mount();</div>
            </div>
          </div>
        );
      case "business":
        return (
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between mb-6">
              <div className="h-8 w-48 bg-[#1A1A1D] rounded"></div>
              <div className="h-8 w-24 bg-[#D92A2A]/10 rounded"></div>
            </div>
            <div className="border border-[#27272A] rounded-lg divide-y divide-[#27272A]">
              <div className="p-4 flex gap-4 text-xs text-[#A1A1AA] uppercase font-semibold bg-[#09090B]">
                <div className="flex-1">ID</div>
                <div className="flex-1">Name</div>
                <div className="flex-1">Status</div>
                <div className="flex-1">Date</div>
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 flex gap-4 text-sm text-[#FAFAFA] items-center">
                  <div className="flex-1 text-[#A1A1AA] font-mono">#{i}000{i}</div>
                  <div className="flex-1">Entry Record {i}</div>
                  <div className="flex-1"><span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs rounded-full font-medium">Active</span></div>
                  <div className="flex-1 text-[#A1A1AA]">2026-07-28</div>
                </div>
              ))}
            </div>
          </div>
        );
      case "creative":
        return (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[#27272A] rounded-lg min-h-[200px]">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 border-2 border-[#27272A] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#71717A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <p className="text-sm text-[#A1A1AA]">Canvas ready. Drop assets here.</p>
            </div>
          </div>
        );
      case "security":
      case "monitoring":
        return (
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="col-span-2 border border-[#27272A] bg-[#09090B] rounded-lg p-4 h-32 flex flex-col justify-between">
              <span className="text-xs text-[#A1A1AA] uppercase font-semibold">System Status</span>
              <div className="flex items-end gap-2 h-16">
                {[40, 70, 45, 90, 60, 30, 85, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-[#D92A2A]/40 hover:bg-[#D92A2A] transition-all rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
            </div>
            <div className="border border-[#27272A] bg-[#09090B] rounded-lg p-4">
              <span className="text-xs text-[#A1A1AA] uppercase block mb-2 font-semibold">Active Nodes</span>
              <div className="text-2xl font-semibold text-[#FAFAFA] font-mono">2,048</div>
            </div>
            <div className="border border-[#27272A] bg-[#09090B] rounded-lg p-4">
              <span className="text-xs text-[#A1A1AA] uppercase block mb-2 font-semibold">Network Traffic</span>
              <div className="text-2xl font-semibold text-[#FAFAFA] font-mono">14.2 TB/s</div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 min-h-[200px]">
            <div className="w-16 h-16 rounded-full bg-[#1A1A1D] flex items-center justify-center border border-[#27272A]">
              <svg className="w-6 h-6 text-[#71717A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div>
              <p className="text-sm text-[#FAFAFA] font-medium mb-1">Workspace Ready</p>
              <p className="text-xs text-[#A1A1AA]">This module has been initialized and is ready for configuration.</p>
            </div>
          </div>
        );
    }
  }, [meta.category]);

  return (
    <div className="flex flex-col h-full bg-[#09090B]">
      {/* Top breadcrumb bar */}
      <header className="h-12 px-6 border-b border-[#27272A] bg-[#111113] flex items-center gap-2 shrink-0">
        <span className="text-xs text-[#A1A1AA] capitalize">{root}</span>
        {sub && (
          <>
            <svg className="w-3 h-3 text-[#27272A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span className="text-xs text-[#FAFAFA] font-medium capitalize">{sub.replace(/-/g, " ")}</span>
          </>
        )}
        {!sub && (
          <span className="text-xs text-[#FAFAFA] font-medium capitalize">{meta.title}</span>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-semibold text-[#FAFAFA] mb-1">{meta.title}</h1>
          <p className="text-sm text-[#A1A1AA] mb-8">{meta.description}</p>

          <div className="bg-[#111113] border border-[#27272A] rounded-xl p-6 min-h-[300px] flex flex-col shadow-sm">
            {renderContent}
          </div>
        </div>
      </div>
    </div>
  );
}
