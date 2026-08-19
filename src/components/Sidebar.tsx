"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const FRONTIER_NAV_ITEMS: NavItem[] = [
  { label: "HOME / DESKTOP", href: "/dashboard", icon: "home" },
  { label: "FRONTIER CHAT", href: "/chat", icon: "chat" },
  { label: "AGENTS", href: "/swarm", icon: "users" },
  { label: "AGENT STUDIO", href: "/studio", icon: "studio" },
  { label: "KNOWLEDGE", href: "/intelligence", icon: "brain" },
  { label: "SECOPS", href: "/security", icon: "shield" },
  { label: "WORKFLOWS", href: "/workflows", icon: "workflow" },
  { label: "MODEL CENTER", href: "/marketplace", icon: "models" },
  { label: "SYSTEM", href: "/runtime", icon: "system" },
  { label: "SETTINGS", href: "/settings", icon: "settings" },
];

function SidebarIcon({ name }: { name: string }) {
  switch (name) {
    case "home":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "chat":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
    case "studio":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "brain":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "shield":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "workflow":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 3 21 3 21 8" />
          <line x1="10" y1="14" x2="21" y2="3" />
          <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
        </svg>
      );
    case "models":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      );
    case "system":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
    case "settings":
      return (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
      <aside className="w-14 h-screen bg-[#0B0F19] flex flex-col items-center py-4 border-r border-[#1E293B] select-none shrink-0 z-20">
        <button
          onClick={() => setCollapsed(false)}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors"
          title="Expand Sidebar"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[260px] h-screen bg-[#0B0F19] flex flex-col select-none shrink-0 border-r border-[#1E293B] z-20">
      
      {/* Top Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#1E293B] shrink-0">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => router.push("/chat")}
        >
          <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center font-extrabold text-white text-sm shadow-md shadow-[#0066FF]/30">
            E
          </div>
          <span className="text-xs font-bold text-white tracking-wider uppercase">FRONTIER OS</span>
        </div>

        <button 
          onClick={() => setCollapsed(true)}
          className="text-[#64748B] hover:text-white transition-colors p-1 rounded-md hover:bg-[#1E293B]"
          title="Collapse Sidebar"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Main OS Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 mb-3">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">FRONTIER OS CORE</span>
        </div>

        {FRONTIER_NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                active
                  ? "bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/25"
                  : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-white"
              }`}
            >
              <SidebarIcon name={item.icon} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer Contact Indicator */}
      <div className="p-3 border-t border-[#1E293B] shrink-0 flex items-center justify-between text-[11px] text-[#64748B]">
        <span className="font-semibold text-white">Terrell Hall</span>
        <span className="text-[10px] text-[#38BDF8] font-bold uppercase">Sovereign OS</span>
      </div>

    </aside>
  );
}