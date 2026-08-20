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
      { label: "Chat", href: "/chat", icon: "MessageSquare" },
      { label: "Agents", href: "/swarm", icon: "Bot" },
      { label: "Command", href: "/cli", icon: "Terminal" },
      { label: "Workflows", href: "/workflows", icon: "Workflow" },
    ],
  },
  {
    section: "GAME DEVELOPMENT",
    items: [
      { label: "Frontier Studio", href: "/gaming", icon: "PanelsTopLeft" },
      { label: "Game Designer", href: "/gaming/studio", icon: "PanelsTopLeft" },
      { label: "World Builder", href: "/world", icon: "Globe2" },
      { label: "Characters & NPCs", href: "/visual", icon: "Users" },
      { label: "Story & Narrative", href: "/storytelling", icon: "BookOpen" },
      { label: "Asset Factory", href: "/visual", icon: "Package" },
      { label: "AI Director", href: "/swarm", icon: "Bot" },
      { label: "Build & Export", href: "/workflows", icon: "Hammer" },
    ],
  },
  {
    section: "INTELLIGENCE",
    items: [
      { label: "Models", href: "/marketplace", icon: "Cpu" },
      { label: "Agent Runtime", href: "/runtime", icon: "Activity" },
      { label: "Knowledge", href: "/intelligence", icon: "Database" },
      { label: "Memory", href: "/swarm", icon: "Brain" },
    ],
  },
  {
    section: "SECOPS",
    items: [
      { label: "Security", href: "/security", icon: "Shield" },
      { label: "Vulnerabilities", href: "/security", icon: "Bug" },
      { label: "CVE Intelligence", href: "/threat-intel", icon: "ShieldAlert" },
      { label: "Exposure", href: "/leadgen", icon: "Radar" },
      { label: "Threat Intelligence", href: "/threat-intel", icon: "Crosshair" },
      { label: "Remediation", href: "/security", icon: "Shield" },
    ],
  },
  {
    section: "ENTERPRISE",
    items: [
      { label: "Projects", href: "/dashboard", icon: "Folder" },
      { label: "Integrations", href: "/integrations", icon: "Workflow" },
      { label: "Audit", href: "/enterprise", icon: "FileText" },
      { label: "Policies", href: "/enterprise", icon: "Lock" },
      { label: "Team", href: "/enterprise", icon: "Users" },
    ],
  },
];

function SidebarIcon({ name, active }: { name: string; active: boolean }) {
  const iconClass = `w-3.5 h-3.5 shrink-0 transition-colors ${
    active ? "text-[#1677ff]" : "text-[#687180] group-hover:text-[#a7adb8]"
  }`;

  switch (name) {
    case "MessageSquare":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "Bot":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M12 7v4" />
          <line x1="8" y1="16" x2="8" y2="16" />
          <line x1="16" y1="16" x2="16" y2="16" />
        </svg>
      );
    case "Terminal":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case "Workflow":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="6" height="6" rx="1" />
          <rect x="15" y="3" width="6" height="6" rx="1" />
          <rect x="9" y="15" width="6" height="6" rx="1" />
          <path d="M6 9v3a2 2 0 0 0 2 2h4m6-5v3a2 2 0 0 1-2 2h-4" />
        </svg>
      );
    case "PanelsTopLeft":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      );
    case "Globe2":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      );
    case "Users":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "BookOpen":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case "Package":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16.5 9.4 7.55 4.24" />
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.29 7 12 12 20.71 7" />
          <line x1="12" y1="22" x2="12" y2="12" />
        </svg>
      );
    case "Hammer":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 12-8.373 8.373a1 1 0 1 1-1.414-1.414L13.586 10.586" />
          <path d="m18 15 4-4" />
          <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.242-1.76H10l4 4-2 2-4-4v2.486a6 6 0 0 0 1.758 4.242L12 14" />
        </svg>
      );
    case "Cpu":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="16" height="16" x="4" y="4" rx="2" />
          <rect width="6" height="6" x="9" y="9" rx="1" />
          <path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" />
          <path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" />
        </svg>
      );
    case "Activity":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case "Database":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
        </svg>
      );
    case "Brain":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "Shield":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "Bug":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="8" height="14" x="8" y="6" rx="4" />
          <path d="m19 7-3 2" /><path d="m5 7 3 2" /><path d="m19 19-3-2" /><path d="m5 19 3-2" />
          <path d="M20 13h-4" /><path d="M4 13h4" /><path d="m10 4 1 2" /><path d="m14 4-1 2" />
        </svg>
      );
    case "ShieldAlert":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case "Radar":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19.07 4.93A10 10 0 0 0 6.99 3.34" />
          <path d="M4.93 19.07A10 10 0 0 0 17.01 20.66" />
          <path d="M2 12h20" /><path d="M12 2v20" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "Crosshair":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="22" y1="12" x2="18" y2="12" />
          <line x1="6" y1="12" x2="2" y2="12" />
          <line x1="12" y1="6" x2="12" y2="2" />
          <line x1="12" y1="22" x2="12" y2="18" />
        </svg>
      );
    case "Folder":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" />
        </svg>
      );
    case "FileText":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
    case "Lock":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <aside className="w-12 h-screen bg-[#0d0f13] flex flex-col items-center py-4 border-r border-[#ffffff14] select-none shrink-0 z-30">
        <button
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 rounded-md flex items-center justify-center text-[#687180] hover:text-[#f5f7fa] hover:bg-[#161a21] transition-colors"
          title="Expand Sidebar"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[248px] h-screen bg-[#0d0f13] flex flex-col select-none shrink-0 border-r border-[#ffffff14] z-30">
      
      {/* ── Brand Header ── */}
      <div className="p-4 border-b border-[#ffffff14] shrink-0 flex items-center justify-between">
        <div 
          className="cursor-pointer group"
          onClick={() => router.push("/")}
        >
          <span className="text-[12px] font-extrabold text-[#f5f7fa] tracking-wider uppercase block leading-tight">ELITZE</span>
          <span className="text-[12px] font-extrabold text-[#f5f7fa] tracking-wider uppercase block leading-tight">SENTINEL</span>
          <span className="text-[9px] font-bold text-[#1677ff] tracking-widest uppercase block mt-0.5">FRONTIER OOS</span>
        </div>

        <button 
          onClick={() => setCollapsed(true)}
          className="text-[#687180] hover:text-[#f5f7fa] transition-colors p-1 rounded hover:bg-[#161a21]"
          title="Collapse Sidebar"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* ── Categorized Navigation ── */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
        {NAV_SECTIONS.map((sec) => (
          <div key={sec.section}>
            <div className="px-2 mb-1">
              <span className="text-[9px] font-bold text-[#687180] uppercase tracking-widest">{sec.section}</span>
            </div>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium tracking-wide transition-all group relative ${
                      active
                        ? "bg-[#1677ff]/12 text-[#f5f7fa] font-semibold border-l-[3px] border-[#1677ff] rounded-l-none pl-[7px]"
                        : "text-[#a7adb8] hover:bg-[#161a21] hover:text-[#f5f7fa]"
                    }`}
                  >
                    <SidebarIcon name={item.icon} active={active} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer User Info ── */}
      <div className="p-3 border-t border-[#ffffff14] shrink-0 flex items-center justify-between text-[11px]">
        <div>
          <p className="font-bold text-[#f5f7fa] leading-none">Terrell Hall</p>
          <p className="text-[9px] text-[#1677ff] font-bold uppercase tracking-wider mt-0.5">SOVEREIGN OS</p>
        </div>
      </div>

    </aside>
  );
}