"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ConditionalSidebar() {
  const pathname = usePathname();
  
  // Hide sidebar on landing / welcome pages
  const hideSidebar = pathname === "/" || pathname === "/welcome";
  
  if (hideSidebar) return null;
  
  return <Sidebar />;
}
