import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull(),
  category: text("category"),
  deadline: timestamp("deadline"),
  playlistUrl: text("playlist_url"),
  created: timestamp("created").notNull().defaultNow(),
  updated: timestamp("updated"),
  sessions: integer("sessions").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  taskId: integer("task_id").references(() => tasks.id),
  type: text("type").notNull(),
  duration: integer("duration").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  duration: integer("duration").notNull(),
  completed: boolean("completed").notNull().default(false),
  created: timestamp("created").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content"),
  lastEdited: timestamp("last_edited").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  theme: text("theme").notNull().default('light'),
  fontSize: integer("font_size").notNull().default(16),
  blockedSites: text("blocked_sites").array(),
  customCategories: text("custom_categories").array(),
  notificationsEnabled: boolean("notifications_enabled").default(false),
  pomoSettings: jsonb("pomo_settings"),
  focusModeEnabled: boolean("focus_mode_enabled").default(false),
});

export const userRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  sessions: many(sessions),
  goals: many(goals),
  notes: many(notes),
  settings: many(settings),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [sessions.taskId],
    references: [tasks.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  user: one(users, {
    fields: [settings.userId],
    references: [users.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  created: true,
  updated: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  timestamp: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  created: true,
  completedAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  lastEdited: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
