import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const mastery = sqliteTable("mastery", {
  userId: text("user_id").notNull(),
  subject: text("subject").notNull(),
  code: text("code").notNull(),
  topic: text("topic").notNull(),
  score: integer("score").notNull().default(50),
  evidence: integer("evidence").notNull().default(0),
  confidence: text("confidence").notNull().default("Low"),
  knowledge: integer("knowledge").notNull().default(50),
  application: integer("application").notNull().default(50),
  exam: integer("exam").notNull().default(50),
  note: text("note").notNull().default("Not assessed yet"),
  due: text("due").notNull().default("Today"),
  updatedAt: text("updated_at").notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.subject, table.code] })]);

export const attempts = sqliteTable("attempts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  questionId: text("question_id").notNull(),
  subject: text("subject").notNull(),
  objectiveCode: text("objective_code").notNull(),
  correct: integer("correct", { mode: "boolean" }).notNull(),
  confidence: text("confidence").notNull(),
  usedHint: integer("used_hint", { mode: "boolean" }).notNull(),
  difficulty: integer("difficulty").notNull(),
  delta: integer("delta").notNull(),
  awardedMarks: integer("awarded_marks"),
  totalMarks: integer("total_marks"),
  missedPoints: text("missed_points"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_attempts_user_created").on(table.userId, table.createdAt)]);

export const materials = sqliteTable("materials", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  objectKey: text("object_key").notNull(),
  status: text("status").notNull().default("Stored"),
  pages: integer("pages"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_materials_user_created").on(table.userId, table.createdAt)]);

export const admins = sqliteTable("admins", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  createdAt: text("created_at").notNull(),
});

export const studentProfiles = sqliteTable("student_profiles", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name").notNull(),
  classCode: text("class_code").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_student_profiles_class").on(table.classCode)]);

export const contentPacks = sqliteTable("content_packs", {
  packOrder: integer("pack_order").primaryKey(),
  name: text("name").notNull().unique(),
  status: text("status").notNull().default("Draft"),
  version: integer("version").notNull().default(0),
  releaseNote: text("release_note").notNull().default(""),
  updatedBy: text("updated_by"),
  updatedAt: text("updated_at").notNull(),
});

export const packReleases = sqliteTable("pack_releases", {
  id: text("id").primaryKey(),
  packOrder: integer("pack_order").notNull(),
  version: integer("version").notNull(),
  status: text("status").notNull(),
  releaseNote: text("release_note").notNull().default(""),
  changedBy: text("changed_by").notNull(),
  changedAt: text("changed_at").notNull(),
}, (table) => [index("idx_pack_releases_order_changed").on(table.packOrder, table.changedAt)]);
