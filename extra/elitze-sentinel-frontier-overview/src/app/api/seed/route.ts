import { NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, kanbanCards, agents, gameAssets } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Clear existing data
    await db.delete(gameAssets);
    await db.delete(kanbanCards);
    await db.delete(agents);
    await db.delete(projects);

    // Create main project
    const [project] = await db.insert(projects).values({
      name: 'Survival World',
      description: 'Zombie Survival Game Prototype with AI NPCs',
      status: 'active',
    }).returning();

    const projectId = project.id;

    // Create Agents
    const agentData = [
      { name: 'Game Director', role: 'Creative Director', description: 'Oversees the entire game vision and narrative.', avatar: '' },
      { name: 'Unreal Engineer', role: 'Game Engineer', description: 'Builds core gameplay systems and Unreal integration.', avatar: '️' },
      { name: 'NPC Designer', role: 'Designer', description: 'Designs behaviors, dialogues, and personalities for NPCs.', avatar: '' },
      { name: 'Economy Designer', role: 'Designer', description: 'Creates survival economy, crafting and resource systems.', avatar: '' },
      { name: 'Quest Designer', role: 'Writer', description: 'Designs quests, story arcs and objectives.', avatar: '' },
      { name: 'QA Agent', role: 'QA Agent', description: 'Tests mechanics, balance and identifies bugs.', avatar: '' },
    ];

    await db.insert(agents).values(agentData);

    // Create Kanban Cards
    const kanbanData = [
      // IDEAS
      { projectId, title: 'Create NPC faction system', description: 'Define 3 rival survivor factions with unique behaviors', status: 'ideas', assignee: 'NPC Designer', priority: 1 },
      { projectId, title: 'Generate cinematic trailer', description: 'Create a 30-second teaser video for the prototype', status: 'ideas', assignee: 'Game Director', priority: 2 },
      { projectId, title: 'Design inventory UI', description: 'Build drag-and-drop survival inventory with weight limits', status: 'ideas', assignee: 'Economy Designer', priority: 3 },
      
      // BUILDING
      { projectId, title: 'Implement AI economy & crafting', description: 'Dynamic pricing based on scarcity, procedural item generation', status: 'building', assignee: 'Economy Designer', priority: 1 },
      { projectId, title: 'Build combat system', description: 'Melee + ranged combat with stamina and enemy AI', status: 'building', assignee: 'Unreal Engineer', priority: 2 },
      { projectId, title: 'Implement voice dialogue trees', description: 'Procedural dialogue with branching based on player reputation', status: 'building', assignee: 'NPC Designer', priority: 3 },
      
      // TESTING
      { projectId, title: 'Balance difficulty curve', description: 'Test NPC aggression, resource scarcity and survival pacing', status: 'testing', assignee: 'QA Agent', priority: 1 },
      { projectId, title: 'Performance optimization', description: 'Ensure 60fps with 20+ AI NPCs on screen', status: 'testing', assignee: 'Unreal Engineer', priority: 2 },
      
      // READY
      { projectId, title: 'Export WebGL prototype build', description: 'Package playable demo for browser sharing', status: 'ready', assignee: 'Unreal Engineer', priority: 1 },
      { projectId, title: 'Create Steam store page mockup', description: 'Marketing visuals and feature list for hypothetical launch', status: 'ready', assignee: 'Game Director', priority: 2 },
    ];

    await db.insert(kanbanCards).values(kanbanData);

    // Create some demo game assets
    await db.insert(gameAssets).values([
      { 
        projectId, 
        name: 'Ranger NPC', 
        type: 'npc', 
        content: { 
          name: "Elias the Ranger", 
          behavior: "Patrols the forest, helps players who have positive reputation. Hostile to bandits.",
          health: 120,
          dialogueStyle: "Laconic, survivalist",
          faction: "Wanderers"
        } 
      },
      { 
        projectId, 
        name: 'Rusty Axe', 
        type: 'item', 
        content: { 
          damage: 25, 
          durability: 45, 
          weight: 3.2,
          rarity: "Common",
          craftable: true 
        } 
      },
      { 
        projectId, 
        name: 'Main Quest: The Signal', 
        type: 'quest', 
        content: { 
          objective: "Locate the abandoned radio tower and activate emergency beacon",
          rewards: ["Ranger Ally", "High-Caliber Rifle", "200 XP"],
          difficulty: "Medium",
          factionsInvolved: ["Wanderers", "Bandits"]
        } 
      },
    ]);

    return NextResponse.json({ 
      success: true, 
      message: 'Survival World prototype seeded successfully!',
      projectId 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
