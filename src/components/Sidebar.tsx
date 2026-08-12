"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface SubItem {
  label: string;
  href: string;
}

interface NavGroup {
  section: string;
  items: { label: string; href: string; icon: string; sub?: SubItem[] }[];
}

const NAV: NavGroup[] = [
  {
    section: "MISSION CONTROL",
    items: [
      { label: "Frontier Chat", href: "/chat", icon: "chat" },
      { label: "Frontier Intelligence", href: "/intelligence", icon: "brain" },
      { label: "Executive Dashboard", href: "/dashboard", icon: "chart" },
    ],
  },
  {
    section: "CREATIVE STUDIOS",
    items: [
      {
        label: "Video & Film",
        href: "/media",
        icon: "film",
        sub: [
          { label: "Movies Studio (16:9)", href: "/media/movies" },
          { label: "Shorts Studio (9:16)", href: "/media/shorts" },
          { label: "Faceless YouTube", href: "/media/faceless-yt" },
        ],
      },
      {
        label: "3D & Visual",
        href: "/visual",
        icon: "cube",
        sub: [
          { label: "3D Video Creator", href: "/media/3d-creator" },
          { label: "Image Generation", href: "/visual" },
          { label: "Image to Video", href: "/image-to-video" },
        ],
      },
      {
        label: "Audio & Voice",
        href: "/voice",
        icon: "mic",
      },
    ],
  },
  {
    section: "GAME DEVELOPMENT",
    items: [
      {
        label: "Game Studio",
        href: "/gaming/studio",
        icon: "gamepad",
        sub: [
          { label: "Game Engine", href: "/gaming/studio" },
          { label: "World Builder", href: "/gaming/world" },
          { label: "Asset Pipeline", href: "/gaming" },
        ],
      },
    ],
  },
  {
    section: "AGENT WORKSPACE",
    items: [
      { label: "Frontier Runtime", href: "/runtime", icon: "cpu" },
      { label: "Swarm & Memory", href: "/swarm", icon: "nodes" },
      { label: "Lindy AI Agents", href: "/lindy", icon: "bot" },
      {
        label: "Workflows",
        href: "/workflows",
        icon: "flow",
        sub: [
          { label: "Pipeline Studio", href: "/workflows" },
          { label: "Job Queue", href: "/jobs" },
        ],
      },
    ],
  },
  {
    section: "BUSINESS & GROWTH",
    items: [
      { label: "Sales CRM", href: "/sales", icon: "briefcase" },
      { label: "Lead Generation", href: "/leadgen", icon: "target" },
      { label: "Marketplace", href: "/marketplace", icon: "grid" },
    ],
  },
  {
    section: "SECURITY CENTER",
    items: [
      { label: "Sentinel", href: "/security", icon: "shield" },
      { label: "Threat Intel", href: "/threat-intel", icon: "alert" },
    ],
  },
];

function SidebarIcon({ name }: { name: string }) {
  const d: Record<string, string> = {
    chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    brain: "M12 2a9 9 0 0 0-9 9c0 3.88 2.46 7.19 5.9 8.45.15.06.32-.04.32-.21v-1.52c-2.4-.56-2.91-1.16-2.91-1.16-.4-1-.97-1.27-.97-1.27-.79-.54.06-.53.06-.53.87.06 1.33.9 1.33.9.78 1.33 2.04.95 2.54.72.08-.56.3-.95.55-1.17-1.92-.22-3.94-.96-3.94-4.28 0-.95.34-1.72.9-2.33-.09-.22-.39-1.1.09-2.3 0 0 .73-.23 2.4.89A8.36 8.36 0 0 1 12 6.84c.74 0 1.49.1 2.19.3 1.67-1.12 2.4-.89 2.4-.89.48 1.2.18 2.08.09 2.3.56.61.9 1.38.9 2.33 0 3.33-2.03 4.06-3.96 4.27.31.27.59.8.59 1.61v2.39c0 .17.17.27.32.21A9 9 0 0 0 21 11a9 9 0 0 0-9-9z",
    chart: "M18 20V10M12 20V4M6 20v-6",
    film: "M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4h-4z",
    cube: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
    mic: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2",
    gamepad: "M6 12h4M8 10v4M15 13h.01M18 11h.01M2 15.27V8.73A2 2 0 0 1 3.25 7l7.5-3a2 2 0 0 1 2.5 0l7.5 3A2 2 0 0 1 22 8.73v6.54A2 2 0 0 1 20.75 17l-7.5 3a2 2 0 0 1-2.5 0l-7.5-3A2 2 0 0 1 2 15.27z",
    cpu: "M4 4h16v16H4zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
    nodes: "M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM5 16a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 8v4M7.5 17.2L12 12M16.5 17.2L12 12",
    bot: "M12 2a2 2 0 0 1 2 2v2h3a2 2 0 0 1 2 2v9a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8a2 2 0 0 1 2-2h3V4a2 2 0 0 1 2-2zM9 13v2M15 13v2",
    flow: "M5 3v4M3 5h4M6 17v4M8 19H4M13 3l7 7M15.6 14.4l5.4 5.4",
    briefcase: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
    target: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zm0-6c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-4z",
    grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  };
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d[name] || d.chat} />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "Video & Film": true,
  });

  const toggle = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-[260px] h-screen bg-[#1A1A1F] flex flex-col select-none shrink-0 border-r border-[#2A2A30]">

      {/* Brand */}
      <div
        className="h-16 flex items-center gap-3 px-5 border-b border-[#2A2A30] cursor-pointer shrink-0 hover:bg-[#222228] transition-colors"
        onClick={() => router.push("/chat")}
      >
        <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#3A3A42] shadow-md shrink-0">
          <img src="/chat-bg.jpg" alt="Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <span className="text-[13px] font-bold text-white tracking-tight block leading-tight">ELITZE FRONTIER</span>
          <span className="text-[10px] text-[#6B6B78] font-medium block">Sovereign AI Platform</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {NAV.map(group => (
          <div key={group.section}>
            <div className="px-2 mb-2">
              <span className="text-[10px] font-bold text-[#4A4A55] uppercase tracking-wider">{group.section}</span>
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = isActive(item.href) || item.sub?.some(s => isActive(s.href));
                const isOpen = expanded[item.label];
                const hasSub = item.sub && item.sub.length > 0;

                return (
                  <div key={item.label}>
                    {/* Main Item */}
                    <button
                      onClick={() => {
                        if (hasSub) {
                          toggle(item.label);
                        } else {
                          router.push(item.href);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all group ${
                        active
                          ? "bg-[#D92A2A]/15 text-[#D92A2A]"
                          : "text-[#9B9BA8] hover:bg-[#222228] hover:text-white"
                      }`}
                    >
                      <SidebarIcon name={item.icon} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {hasSub && (
                        <svg
                          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-90" : ""}`}
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </button>

                    {/* Dropdown Sub-Items */}
                    {hasSub && isOpen && (
                      <div className="ml-5 pl-4 border-l border-[#2A2A30] mt-1 mb-2 space-y-0.5">
                        {item.sub!.map(sub => (
                          <button
                            key={sub.href}
                            onClick={() => router.push(sub.href)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                              isActive(sub.href)
                                ? "text-[#D92A2A] bg-[#D92A2A]/10"
                                : "text-[#6B6B78] hover:text-white hover:bg-[#222228]"
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer */}
      <div className="flex items-center gap-3 border-t border-[#2A2A30] p-4">
        <div className="w-8 h-8 rounded-full bg-[#D92A2A] text-white flex items-center justify-center text-xs font-bold shadow-sm">
          T
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-white block truncate">Terrell</span>
          <span className="text-[10px] text-[#6B6B78] block truncate">terrell0780@gmail.com</span>
        </div>
      </div>
    </aside>
  );
}