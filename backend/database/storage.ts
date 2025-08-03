
import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export class StorageService {
  async getStats() {
    const [videosCount, cutsCount, activeCuts] = await Promise.all([
      prisma.video.count(),
      prisma.cut.count(),
      prisma.cut.count({ where: { status: 'ready' } })
    ]);
    
    return {
      videosUploaded: videosCount.toString(),
      cutsGenerated: cutsCount.toString(),
      postsScheduled: "0",
      activePlatforms: activeCuts.toString()
    };
  }

  async createVideo(videoData: Prisma.VideoCreateInput) {
    return await prisma.video.create({
      data: videoData
    });
  }

  async getAllVideos() {
    return await prisma.video.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: {
        cuts: true,
        processingJobs: true
      }
    });
  }

  async getVideo(id: string) {
    return await prisma.video.findUnique({
      where: { id },
      include: {
        cuts: true,
        processingJobs: true
      }
    });
  }

  async createCut(cutData: Prisma.CutCreateInput) {
    return await prisma.cut.create({
      data: cutData
    });
  }

  async getAllCuts() {
    return await prisma.cut.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        video: true
      }
    });
  }

  async getCutsByVideo(videoId: string) {
    return await prisma.cut.findMany({
      where: { videoId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCut(id: string) {
    return await prisma.cut.findUnique({
      where: { id },
      include: {
        video: true
      }
    });
  }

  async updateCut(id: string, updates: Prisma.CutUpdateInput) {
    return await prisma.cut.update({
      where: { id },
      data: updates
    });
  }

  async deleteCut(id: string) {
    await prisma.cut.delete({
      where: { id }
    });
  }

  async createProcessingJob(jobData: Prisma.ProcessingJobCreateInput) {
    return await prisma.processingJob.create({
      data: jobData
    });
  }

  async getAllProcessingJobs() {
    return await prisma.processingJob.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        video: true
      }
    });
  }

  async updateProcessingJob(id: string, updates: Prisma.ProcessingJobUpdateInput) {
    return await prisma.processingJob.update({
      where: { id },
      data: updates
    });
  }
}

export const storage = new StorageService();
