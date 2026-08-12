export interface NavItem {
  label: string;
  href: string;
}

export interface NavSection {
  label: string;
  icon: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Platform",
    icon: "grid",
    items: [
      { label: "Elitze Global Search", href: "/global-search" },
      { label: "Chat", href: "/chat" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Intelligence", href: "/intelligence" },
    ],
  },
  {
    label: "Development",
    icon: "code",
    items: [
      { label: "Studio", href: "/studio" },
      { label: "Code Editor", href: "/code" },
      { label: "Code Refactor", href: "/refactor" },
      { label: "Runtime", href: "/runtime" },
      { label: "CLI Terminal", href: "/cli" },
    ],
  },
  {
    label: "Automation",
    icon: "zap",
    items: [
      { label: "n8n Workflows", href: "/n8n" },
      { label: "Lindy AI Agents", href: "/lindy" },
      { label: "Pipelines", href: "/workflows" },
      { label: "Webhooks", href: "/integrations" },
    ],
  },
  {
    label: "Security",
    icon: "shield",
    items: [
      { label: "Sentinel", href: "/security" },
      { label: "Threat Intel", href: "/threat-intel" },
    ],
  },
  {
    label: "Creative",
    icon: "pen",
    items: [
      { label: "Media Studio", href: "/media" },
      { label: "Visual Editor", href: "/visual" },
      { label: "Image to Video", href: "/image-to-video" },
      { label: "Storytelling", href: "/storytelling" },
    ],
  },
  {
    label: "Gaming",
    icon: "gamepad",
    items: [
      { label: "Game Studio", href: "/gaming" },
      { label: "World Builder", href: "/world" },
    ],
  },
  {
    label: "Business",
    icon: "briefcase",
    items: [
      { label: "Sales CRM", href: "/sales" },
      { label: "Lead Generation", href: "/leadgen" },
      { label: "Jobs", href: "/jobs" },
      { label: "Marketplace", href: "/marketplace" },
    ],
  },
  {
    label: "System",
    icon: "settings",
    items: [
      { label: "Enterprise", href: "/enterprise" },
      { label: "Co-Build Workspace", href: "/collaboration" },
      { label: "Settings", href: "/settings" },
    ],
  },
];

export function findNavItem(href: string): { section: NavSection; item?: NavItem } | null {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.href === href) return { section, item };
    }
  }
  return null;
}

export function findSectionForPath(pathname: string): NavSection | null {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) {
        return section;
      }
    }
  }
  return null;
}