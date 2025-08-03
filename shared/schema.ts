import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  duration: integer("duration"), // in seconds
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").default(sql`now()`),
  userId: varchar("user_id").references(() => users.id),
});

export const cuts = pgTable("cuts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  hashtags: text("hashtags"),
  startTime: integer("start_time").notNull(), // in seconds
  endTime: integer("end_time").notNull(), // in seconds
  duration: integer("duration").notNull(), // in seconds
  filePath: text("file_path"),
  status: text("status").notNull().default("pending"), // pending, processing, ready, posted, error
  platforms: jsonb("platforms").default({}), // {instagram: true, youtube: false, etc}
  obfuscation: jsonb("obfuscation").default({}), // obfuscation settings
  createdAt: timestamp("created_at").default(sql`now()`),
  processedAt: timestamp("processed_at"),
});

export const processingJobs = pgTable("processing_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  videoId: varchar("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  cutPoints: text("cut_points").notNull(), // "00:30|02:15|04:45|07:20"
  status: text("status").notNull().default("queued"), // queued, processing, completed, failed
  progress: integer("progress").default(0),
  error: text("error"),
  createdAt: timestamp("created_at").default(sql`now()`),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

// Relations
export const videosRelations = relations(videos, ({ many, one }) => ({
  cuts: many(cuts),
  processingJobs: many(processingJobs),
  user: one(users, {
    fields: [videos.userId],
    references: [users.id],
  }),
}));

export const cutsRelations = relations(cuts, ({ one }) => ({
  video: one(videos, {
    fields: [cuts.videoId],
    references: [videos.id],
  }),
}));

export const processingJobsRelations = relations(processingJobs, ({ one }) => ({
  video: one(videos, {
    fields: [processingJobs.videoId],
    references: [videos.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  uploadedAt: true,
});

export const insertCutSchema = createInsertSchema(cuts).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertProcessingJobSchema = createInsertSchema(processingJobs).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

export type InsertCut = z.infer<typeof insertCutSchema>;
export type Cut = typeof cuts.$inferSelect;

export type InsertProcessingJob = z.infer<typeof insertProcessingJobSchema>;
export type ProcessingJob = typeof processingJobs.$inferSelect;
