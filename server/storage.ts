import { videos, cuts, processingJobs, users, type Video, type Cut, type ProcessingJob, type InsertVideo, type InsertCut, type InsertProcessingJob, type User, type InsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Videos
  createVideo(video: InsertVideo): Promise<Video>;
  getVideo(id: string): Promise<Video | undefined>;
  getAllVideos(): Promise<Video[]>;
  deleteVideo(id: string): Promise<void>;

  // Cuts
  createCut(cut: InsertCut): Promise<Cut>;
  getCut(id: string): Promise<Cut | undefined>;
  getAllCuts(): Promise<Cut[]>;
  getCutsByVideo(videoId: string): Promise<Cut[]>;
  updateCut(id: string, updates: Partial<Cut>): Promise<Cut>;
  deleteCut(id: string): Promise<void>;

  // Processing Jobs
  createProcessingJob(job: InsertProcessingJob): Promise<ProcessingJob>;
  getProcessingJob(id: string): Promise<ProcessingJob | undefined>;
  getAllProcessingJobs(): Promise<ProcessingJob[]>;
  updateProcessingJob(id: string, updates: Partial<ProcessingJob>): Promise<ProcessingJob>;
  deleteProcessingJob(id: string): Promise<void>;

  // Stats
  getStats(): Promise<{
    videosUploaded: number;
    cutsGenerated: number;
    postsPublished: number;
    processing: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Videos
  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db
      .insert(videos)
      .values(video)
      .returning();
    return newVideo;
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video || undefined;
  }

  async getAllVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.uploadedAt));
  }

  async deleteVideo(id: string): Promise<void> {
    await db.delete(videos).where(eq(videos.id, id));
  }

  // Cuts
  async createCut(cut: InsertCut): Promise<Cut> {
    const [newCut] = await db
      .insert(cuts)
      .values(cut)
      .returning();
    return newCut;
  }

  async getCut(id: string): Promise<Cut | undefined> {
    const [cut] = await db.select().from(cuts).where(eq(cuts.id, id));
    return cut || undefined;
  }

  async getAllCuts(): Promise<Cut[]> {
    return await db.select().from(cuts).orderBy(desc(cuts.createdAt));
  }

  async getCutsByVideo(videoId: string): Promise<Cut[]> {
    return await db.select().from(cuts).where(eq(cuts.videoId, videoId)).orderBy(desc(cuts.createdAt));
  }

  async updateCut(id: string, updates: Partial<Cut>): Promise<Cut> {
    const [updatedCut] = await db
      .update(cuts)
      .set(updates)
      .where(eq(cuts.id, id))
      .returning();
    return updatedCut;
  }

  async deleteCut(id: string): Promise<void> {
    await db.delete(cuts).where(eq(cuts.id, id));
  }

  // Processing Jobs
  async createProcessingJob(job: InsertProcessingJob): Promise<ProcessingJob> {
    const [newJob] = await db
      .insert(processingJobs)
      .values(job)
      .returning();
    return newJob;
  }

  async getProcessingJob(id: string): Promise<ProcessingJob | undefined> {
    const [job] = await db.select().from(processingJobs).where(eq(processingJobs.id, id));
    return job || undefined;
  }

  async getAllProcessingJobs(): Promise<ProcessingJob[]> {
    return await db.select().from(processingJobs).orderBy(desc(processingJobs.createdAt));
  }

  async updateProcessingJob(id: string, updates: Partial<ProcessingJob>): Promise<ProcessingJob> {
    const [updatedJob] = await db
      .update(processingJobs)
      .set(updates)
      .where(eq(processingJobs.id, id))
      .returning();
    return updatedJob;
  }

  async deleteProcessingJob(id: string): Promise<void> {
    await db.delete(processingJobs).where(eq(processingJobs.id, id));
  }

  // Stats
  async getStats(): Promise<{
    videosUploaded: number;
    cutsGenerated: number;
    postsPublished: number;
    processing: number;
  }> {
    const [videoCount] = await db.select({ count: sql<number>`count(*)` }).from(videos);
    const [cutCount] = await db.select({ count: sql<number>`count(*)` }).from(cuts);
    const [postedCount] = await db.select({ count: sql<number>`count(*)` }).from(cuts).where(eq(cuts.status, 'posted'));
    const [processingCount] = await db.select({ count: sql<number>`count(*)` }).from(processingJobs).where(eq(processingJobs.status, 'processing'));

    return {
      videosUploaded: videoCount?.count || 0,
      cutsGenerated: cutCount?.count || 0,
      postsPublished: postedCount?.count || 0,
      processing: processingCount?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
