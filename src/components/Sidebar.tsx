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
    section: "FRONTIER",
    items: [
      { label: "Chat", href: "/chat", icon: "chat" },
      { label: "Agents", href: "/swarm", icon: "users" },
      { label: "Command CLI", href: "/cli", icon: "terminal" },
      { label: "Workflows", href: "/workflows", icon: "workflow" },
    ],
  },
  {
    section: "GAME DEVELOPMENT",
    items: [
      { label: "Frontier Studio", href: "/gaming", icon: "studio" },
      { label: "Game Designer", href: "/gaming/studio", icon: "studio" },
      { label: "World Builder", href: "/world", icon: "studio" },
      { label: "Characters & NPCs", href: "/visual", icon: "users" },
      { label: "Story & Narrative", href: "/storytelling", icon: "brain" },
      { label: "Asset Factory", href: "/visual", icon: "studio" },
      { label: "AI Director Mesh", href: "/swarm", icon: "brain" },
      { label: "Build & Export", href: "/workflows", icon: "workflow" },
    ],
  },
  {
    section: "INTELLIGENCE",
    items: [
      { label: "Models", href: "/marketplace", icon: "models" },
      { label: "Agent Runtime", href: "/runtime", icon: "system" },
      { label: "Knowledge", href: "/intelligence", icon: "brain" },
      { label: "Memory", href: "/swarm", icon: "brain" },
    ],
  },
  {
    section: "SENTINEL",
    items: [
      { label: "SecOps Console", href: "/security", icon: "shield" },
      { label: "CVE Intelligence", href: "/threat-intel", icon: "shield" },
      { label: "Exposure Monitoring", href: "/leadgen", icon: "shield" },
      { label: "Remediation", href: "/security", icon: "shield" },
    ],
  },
  {
    section: "ENTERPRISE",
    items: [
      { label: "Projects", href: "/dashboard", icon: "home" },
      { label: "Integrations", href: "/integrations", icon: "workflow" },
      { label: "Audit & RBAC", href: "/enterprise", icon: "settings" },
    ],
  },
];


function SidebarIcon({ name }: { name: string }) {
  switch (name) {
    case "home":
      return (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      );
    case "chat":
      return (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "terminal":
      return (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case "users":
      return (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      );
    case "studio":
      return (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "brain":
      return (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "shield":
      return (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "workflow":
      return (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 3 21 3 21 8" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
    case "models":
      return (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        </svg>
      );
    case "system":
      return (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
    case "settings":
      return (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    default:
      return (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      <aside className="w-12 h-screen bg-[#0B0F19] flex flex-col items-center py-4 border-r border-[#1E293B] select-none shrink-0 z-20">
        <button
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
          title="Expand Sidebar"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[240px] h-screen bg-[#0B0F19] flex flex-col select-none shrink-0 border-r border-[#1E293B] z-20">
      
      {/* Top Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[#1E293B] shrink-0">
        <div 
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => router.push("/chat")}
        >
          <div className="w-7 h-7 rounded-lg bg-[#0066FF] flex items-center justify-center font-extrabold text-white text-xs shadow-md shadow-[#0066FF]/30">
            E
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-tight uppercase block leading-none">ELITZE SENTINEL</span>
            <span className="text-[9px] font-semibold text-[#0066FF] uppercase tracking-widest">FRONTIER OOS</span>
          </div>
        </div>

        <button 
          onClick={() => setCollapsed(true)}
          className="text-[#64748B] hover:text-white transition-colors p-1 rounded-md hover:bg-[#1E293B]"
          title="Collapse Sidebar"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Main OS Categorized Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((sec) => (
          <div key={sec.section}>
            <div className="px-2 mb-1.5">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{sec.section}</span>
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-all ${
                      active
                        ? "bg-[#0066FF] text-white shadow-sm shadow-[#0066FF]/25 font-bold"
                        : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-white"
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

      {/* Footer User Info */}
      <div className="p-3 border-t border-[#1E293B] shrink-0 flex items-center justify-between text-[11px] text-[#64748B]">
        <span className="font-semibold text-white">Terrell Hall</span>
        <span className="text-[10px] text-[#38BDF8] font-bold uppercase">Sovereign OS</span>
      </div>

    </aside>
  );
}