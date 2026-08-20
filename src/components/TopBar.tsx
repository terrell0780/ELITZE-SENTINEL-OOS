"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const ROUTE_BREADCRUMBS: Record<string, string[]> = {
  "/": ["FRONTIER", "OPERATING ENVIRONMENT"],
  "/chat": ["FRONTIER", "CONVERSATION", "CHAT"],
  "/swarm": ["FRONTIER", "AGENTS", "SWARM"],
  "/cli": ["FRONTIER", "COMMAND", "CLI"],
  "/workflows": ["FRONTIER", "WORKFLOWS"],
  "/gaming": ["FRONTIER", "GAME DEVELOPMENT", "FRONTIER STUDIO"],
  "/gaming/studio": ["FRONTIER", "GAME DEVELOPMENT", "GAME DESIGNER"],
  "/world": ["FRONTIER", "GAME DEVELOPMENT", "WORLD BUILDER"],
  "/visual": ["FRONTIER", "GAME DEVELOPMENT", "CHARACTERS & ASSETS"],
  "/storytelling": ["FRONTIER", "GAME DEVELOPMENT", "STORY & NARRATIVE"],
  "/marketplace": ["INTELLIGENCE", "MODELS"],
  "/runtime": ["INTELLIGENCE", "AGENT RUNTIME"],
  "/intelligence": ["INTELLIGENCE", "KNOWLEDGE"],
  "/security": ["SENTINEL", "SECOPS", "SECURITY"],
  "/threat-intel": ["SENTINEL", "SECOPS", "CVE INTELLIGENCE"],
  "/leadgen": ["SENTINEL", "SECOPS", "EXPOSURE"],
  "/dashboard": ["ENTERPRISE", "PROJECTS"],
  "/integrations": ["ENTERPRISE", "INTEGRATIONS"],
  "/enterprise": ["ENTERPRISE", "AUDIT & POLICIES"],
  "/settings": ["ENTERPRISE", "SETTINGS"],
  "/jobs": ["ENTERPRISE", "JOBS"],
  "/lindy": ["FRONTIER", "AGENT AUTOMATION"],
  "/sales": ["ENTERPRISE", "SALES"],
};

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  // Hide topbar on login and welcome pages
  if (pathname === "/login" || pathname === "/welcome") return null;

  const breadcrumbs = ROUTE_BREADCRUMBS[pathname] || ["ELITZE SENTINEL", "FRONTIER"];

  return (
    <header className="h-[58px] bg-[#0d0f13] border-b border-[#ffffff14] px-5 flex items-center justify-between shrink-0 select-none z-20">
      
      {/* ── Breadcrumb Navigation ── */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-[#a7adb8]">
        {breadcrumbs.map((part, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {idx > 0 && <span className="text-[#687180] font-normal">/</span>}
            <span 
              className={`font-semibold tracking-wide ${
                idx === breadcrumbs.length - 1 ? "text-[#f5f7fa] font-bold" : "hover:text-[#f5f7fa] cursor-pointer"
              }`}
              onClick={() => {
                if (idx === 0 && part === "FRONTIER") router.push("/");
                if (idx === 0 && part === "SENTINEL") router.push("/security");
              }}
            >
              {part}
            </span>
          </div>
        ))}
      </div>

      {/* ── Right Action Tools ── */}
      <div className="flex items-center gap-4">
        
        {/* Search ⌘K */}
        <button
          onClick={() => router.push("/global-search")}
          className="flex items-center gap-3 bg-[#11141a] hover:bg-[#161a21] border border-[#ffffff14] px-3 py-1.5 rounded-md text-[11px] text-[#a7adb8] hover:text-[#f5f7fa] transition-colors font-mono"
        >
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#687180]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Search</span>
          </div>
          <span className="bg-[#161a21] border border-[#ffffff14] text-[9px] px-1.5 py-0.5 rounded text-[#687180] font-bold">
            ⌘K
          </span>
        </button>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#a7adb8]">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="font-medium">Connected</span>
        </div>

        {/* User Profile Avatar */}
        <button
          onClick={() => router.push("/settings")}
          className="w-7 h-7 rounded-md bg-[#1677ff] text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-[#1677ff]/30 hover:opacity-90 transition-opacity"
          title="Terrell Hall (User Settings)"
        >
          T
        </button>

      </div>

    </header>
  );
}
