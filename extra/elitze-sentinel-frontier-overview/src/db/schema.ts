import { pgTable, text, serial, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const kanbanCards = pgTable('kanban_cards', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('ideas'), // ideas, building, testing, ready
  assignee: text('assignee'), // e.g. 'NPC Designer'
  priority: integer('priority').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const agents = pgTable('agents', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  status: text('status').default('active'),
  description: text('description'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const gameAssets = pgTable('game_assets', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'npc', 'item', 'terrain', 'quest'
  content: jsonb('content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type KanbanCard = typeof kanbanCards.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type GameAsset = typeof gameAssets.$inferSelect;
