"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    section: "MISSION CONTROL",
    items: [
      { label: "Frontier Chat", href: "/chat", icon: "chat" },
      { label: "Frontier Intelligence", href: "/intelligence", icon: "eye" },
      { label: "Executive Dashboard", href: "/dashboard", icon: "chart" },
    ],
  },
  {
    section: "AGENT WORKSPACE",
    items: [
      { label: "Frontier Runtime", href: "/runtime", icon: "box" },
      { label: "Voice & Vision", href: "/voice", icon: "mic" },
      { label: "Swarm & Memory", href: "/swarm", icon: "users" },
    ],
  },
  {
    section: "SECURITY CENTER",
    items: [
      { label: "Terrell", href: "/profile", icon: "user" },
    ],
  },
];

function SidebarIcon({ name }: { name: string }) {
  switch (name) {
    case "chat":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "eye":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "chart":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "box":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
    case "mic":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        </svg>
      );
    case "users":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "user":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => pathname === href;

  if (collapsed) {
    return (
      <aside className="w-14 h-screen bg-[#111113] flex flex-col items-center py-4 border-r border-[#27272A] select-none shrink-0 z-20">
        <button
          onClick={() => setCollapsed(false)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-[#1C1C1F] transition-colors"
          title="Expand Sidebar"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[280px] h-screen bg-[#111113] flex flex-col select-none shrink-0 border-r border-[#27272A] z-20">
      
      {/* Top Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#27272A] shrink-0">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => router.push("/chat")}
        >
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#27272A] shadow-md">
            <img src="/chat-bg.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight uppercase">ELITZE FRONTIER</span>
        </div>

        <button 
          onClick={() => setCollapsed(true)}
          className="text-[#71717A] hover:text-white transition-colors p-1 rounded-md hover:bg-[#1C1C1F]"
          title="Collapse Sidebar"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
        {NAV_SECTIONS.map((sec) => (
          <div key={sec.section}>
            <div className="px-3 mb-2">
              <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest">{sec.section}</span>
            </div>
            <div className="space-y-1">
              {sec.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? "bg-[#27272A] text-white shadow-sm"
                        : "text-[#A1A1AA] hover:bg-[#1C1C1F] hover:text-white"
                    }`}
                  >
                    <SidebarIcon name={item.icon} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}