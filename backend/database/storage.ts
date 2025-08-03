
import { db } from "./db";
import { videos, cuts, processingJobs, users } from "../../shared/schema";
import { eq, desc } from "drizzle-orm";
import type { InsertVideo, InsertCut, InsertProcessingJob, Video, Cut, ProcessingJob } from "../../shared/schema";

export class StorageService {
  async getStats() {
    const [videosCount] = await db.select({ count: db.$count(videos) }).from(videos);
    const [cutsCount] = await db.select({ count: db.$count(cuts) }).from(cuts);
    const [activeCuts] = await db.select({ count: db.$count(cuts) }).from(cuts).where(eq(cuts.status, 'ready'));
    
    return {
      videosUploaded: videosCount.count.toString(),
      cutsGenerated: cutsCount.count.toString(),
      postsScheduled: "0",
      activePlatforms: activeCuts.count.toString()
    };
  }

  async createVideo(videoData: InsertVideo): Promise<Video> {
    const [video] = await db.insert(videos).values(videoData).returning();
    return video;
  }

  async getAllVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.uploadedAt));
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video;
  }

  async createCut(cutData: InsertCut): Promise<Cut> {
    const [cut] = await db.insert(cuts).values(cutData).returning();
    return cut;
  }

  async getAllCuts(): Promise<Cut[]> {
    return await db.select().from(cuts).orderBy(desc(cuts.createdAt));
  }

  async getCutsByVideo(videoId: string): Promise<Cut[]> {
    return await db.select().from(cuts).where(eq(cuts.videoId, videoId));
  }

  async getCut(id: string): Promise<Cut | undefined> {
    const [cut] = await db.select().from(cuts).where(eq(cuts.id, id));
    return cut;
  }

  async updateCut(id: string, updates: Partial<Cut>): Promise<Cut> {
    const [cut] = await db.update(cuts).set(updates).where(eq(cuts.id, id)).returning();
    return cut;
  }

  async deleteCut(id: string): Promise<void> {
    await db.delete(cuts).where(eq(cuts.id, id));
  }

  async createProcessingJob(jobData: InsertProcessingJob): Promise<ProcessingJob> {
    const [job] = await db.insert(processingJobs).values(jobData).returning();
    return job;
  }

  async getAllProcessingJobs(): Promise<ProcessingJob[]> {
    return await db.select().from(processingJobs).orderBy(desc(processingJobs.createdAt));
  }

  async updateProcessingJob(id: string, updates: Partial<ProcessingJob>): Promise<ProcessingJob> {
    const [job] = await db.update(processingJobs).set(updates).where(eq(processingJobs.id, id)).returning();
    return job;
  }
}

export const storage = new StorageService();
