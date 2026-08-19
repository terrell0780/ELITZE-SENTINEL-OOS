"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ConditionalSidebar() {
  const pathname = usePathname();
  
  // Hide sidebar on login and welcome pages
  const hideSidebar = pathname === "/login" || pathname === "/welcome";
  
  if (hideSidebar) return null;
  
  return <Sidebar />;
}

