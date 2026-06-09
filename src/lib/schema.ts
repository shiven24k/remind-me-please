import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp_ms" }).notNull(),
  metadata: text("metadata", { mode: "json" })
    .$type<{ extractionAttempted?: boolean; taskExtracted?: boolean }>()
    .default({}),
});

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  messageId: text("message_id").references(() => messages.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: integer("due_date", { mode: "timestamp_ms" }),
  priority: text("priority", { enum: ["high", "medium", "low"] }).default("medium").notNull(),
  status: text("status", { enum: ["pending", "done", "snoozed"] }).default("pending").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const reminders = sqliteTable("reminders", {
  id: text("id").primaryKey(),
  taskId: text("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  fireAt: integer("fire_at", { mode: "timestamp_ms" }).notNull(),
  fired: integer("fired", { mode: "boolean" }).default(false).notNull(),
  snoozeUntil: integer("snooze_until", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const messagesRelations = relations(messages, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  message: one(messages, { fields: [tasks.messageId], references: [messages.id] }),
  reminders: many(reminders),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  task: one(tasks, { fields: [reminders.taskId], references: [tasks.id] }),
}));

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;
