import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  // Parse intent
  const intent = /^(build|create|make|develop)\b/i.test(query) ? "build" : "chat";

  // Extract project name — strip leading verbs and pronouns
  const projectName = intent === "build"
    ? query
      .replace(/^(build|create|make|develop|generate|scaffold)\s+/i, "")
      .replace(/^(me|us|a|an|the|for|my|our)\s+/i, "")
      .replace(/^(a|an|the)\s+/i, "")
      .trim()
    : "";

  // Simulate pipeline
  const stages = [
    { id: "plan", label: "Planning", duration: 600 },
    { id: "arch", label: "Architecture", duration: 900 },
    { id: "project", label: "Project Creation", duration: 700 },
    { id: "agents", label: "Agent Launch", duration: 800 },
  ];

  return NextResponse.json({
    intent,
    projectName,
    stages,
    project: intent === "build" ? {
      name: projectName || "Untitled Project",
      status: "created",
      studio: { status: "open", url: `/studio/${projectName.toLowerCase().replace(/\s+/g, "-")}` },
      agents: { assigned: 3, roles: ["planner", "developer", "reviewer"] },
      knowledge: { seeded: true, documents: 0 },
      kanban: { cards: 6, columns: ["Backlog", "In Progress", "Review", "Done"] },
      runtime: { status: "ready" },
    } : null,
  });
}
