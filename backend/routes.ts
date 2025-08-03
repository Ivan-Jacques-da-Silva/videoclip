import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./database/storage";
import { YouTubeService } from "./services/youtube";
import { SocialMediaService } from "./services/social-media";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Schemas de validação
const insertVideoSchema = z.object({
  filename: z.string(),
  originalName: z.string(),
  duration: z.number().optional(),
  filePath: z.string(),
  fileSize: z.number(),
  userId: z.string().optional().nullable(),
});

const insertCutSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  hashtags: z.string().optional(),
  startTime: z.number(),
  endTime: z.number(),
  duration: z.number(),
  filePath: z.string().optional(),
  status: z.string().default("pending"),
  platforms: z.record(z.boolean()).default({}),
  obfuscation: z.record(z.any()).default({}),
});

const insertProcessingJobSchema = z.object({
  videoId: z.string(),
  cutPoints: z.string(),
  status: z.string().default("queued"),
  progress: z.number().default(0),
});
import { FFmpegService } from "./services/ffmpeg";

// Configure multer for file uploads
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb(new Error('Only MP4 files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const ffmpegService = FFmpegService.getInstance();
  const youtubeService = YouTubeService.getInstance();
  const socialMediaService = SocialMediaService.getInstance();

  // Get dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Upload video
  app.post("/api/videos/upload", upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No video file provided" });
      }

      const originalPath = req.file.path;
      const finalPath = path.join('uploads', `${Date.now()}_${req.file.originalname}`);

      fs.renameSync(originalPath, finalPath);

      const videoInfo = await ffmpegService.getVideoInfo(finalPath);

      const videoData = {
        filename: path.basename(finalPath),
        originalName: req.file.originalname,
        duration: Math.round(videoInfo.duration),
        filePath: finalPath,
        fileSize: req.file.size,
        userId: null,
      };

      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  // Download video from YouTube
  app.post("/api/videos/download-youtube", async (req, res) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ message: "YouTube URL is required" });
      }

      const downloadResult = await youtubeService.downloadVideo(url, uploadDir);

      const videoData = {
        filename: path.basename(downloadResult.filePath),
        originalName: downloadResult.originalName,
        duration: downloadResult.duration,
        filePath: downloadResult.filePath,
        fileSize: downloadResult.fileSize,
        userId: null,
      };

      const video = await storage.createVideo(videoData);
      res.json(video);
    } catch (error) {
      console.error('YouTube download error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to download YouTube video" });
    }
  });

  // Social Media Routes
  app.get("/api/social-media/status", (req, res) => {
    const status = socialMediaService.getConnectionStatus();
    res.json(status);
  });

  app.post("/api/social-media/connect/:platform", async (req, res) => {
    try {
      const { platform } = req.params;
      const { accessToken, refreshToken, pageId } = req.body;

      let connected = false;

      switch (platform) {
        case 'instagram':
          connected = await socialMediaService.connectInstagram(accessToken);
          break;
        case 'youtube':
          connected = await socialMediaService.connectYouTube(accessToken, refreshToken);
          break;
        case 'tiktok':
          connected = await socialMediaService.connectTikTok(accessToken);
          break;
        case 'facebook':
          connected = await socialMediaService.connectFacebook(accessToken, pageId);
          break;
        default:
          return res.status(400).json({ message: "Invalid platform" });
      }

      if (connected) {
        res.json({ message: `${platform} connected successfully` });
      } else {
        res.status(400).json({ message: `Failed to connect to ${platform}` });
      }
    } catch (error) {
      res.status(500).json({ message: "Connection failed" });
    }
  });

  app.post("/api/social-media/disconnect/:platform", (req, res) => {
    const { platform } = req.params;
    socialMediaService.disconnect(platform as any);
    res.json({ message: `${platform} disconnected successfully` });
  });

  // Get all videos
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  // Get video by ID
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch video" });
    }
  });

  // Serve video files
  app.get("/api/videos/:id/file", async (req, res) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      if (!fs.existsSync(video.filePath)) {
        return res.status(404).json({ message: "Video file not found" });
      }

      res.sendFile(path.resolve(video.filePath));
    } catch (error) {
      res.status(500).json({ message: "Failed to serve video file" });
    }
  });

  // Generate cuts from video
  app.post("/api/videos/:id/generate-cuts", async (req, res) => {
    try {
      const { cutPoints } = req.body;
      if (!cutPoints || typeof cutPoints !== 'string') {
        return res.status(400).json({ message: "Cut points are required" });
      }

      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      const jobData = {
        video: { connect: { id: video.id } },
        cutPoints,
        status: 'queued',
        progress: 0,
      };

      const job = await storage.createProcessingJob(jobData);
      processVideoInBackground(video, job, cutPoints);

      res.json({ jobId: job.id, message: "Processing started" });
    } catch (error) {
      console.error('Generate cuts error:', error);
      res.status(500).json({ message: "Failed to start cut generation" });
    }
  });

  // Get all cuts
  app.get("/api/cuts", async (req, res) => {
    try {
      const cuts = await storage.getAllCuts();
      res.json(cuts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cuts" });
    }
  });

  // Get cuts by video ID
  app.get("/api/videos/:id/cuts", async (req, res) => {
    try {
      const cuts = await storage.getCutsByVideo(req.params.id);
      res.json(cuts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cuts" });
    }
  });

  // Update cut
  app.patch("/api/cuts/:id", async (req, res) => {
    try {
      const updates = req.body;
      const cut = await storage.updateCut(req.params.id, updates);
      res.json(cut);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cut" });
    }
  });

  // Delete cut
  app.delete("/api/cuts/:id", async (req, res) => {
    try {
      const cut = await storage.getCut(req.params.id);
      if (cut?.filePath && fs.existsSync(cut.filePath)) {
        fs.unlinkSync(cut.filePath);
      }
      await storage.deleteCut(req.params.id);
      res.json({ message: "Cut deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete cut" });
    }
  });

  // Get processing jobs
  app.get("/api/processing-jobs", async (req, res) => {
    try {
      const jobs = await storage.getAllProcessingJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch processing jobs" });
    }
  });

  // Serve cut files
  app.get("/api/cuts/:id/file", async (req, res) => {
    try {
      const cut = await storage.getCut(req.params.id);
      if (!cut || !cut.filePath) {
        return res.status(404).json({ message: "Cut not found" });
      }

      if (!fs.existsSync(cut.filePath)) {
        return res.status(404).json({ message: "Cut file not found" });
      }

      res.sendFile(path.resolve(cut.filePath));
    } catch (error) {
      res.status(500).json({ message: "Failed to serve cut file" });
    }
  });

  // Background processing function
  async function processVideoInBackground(video: any, job: any, cutPoints: string) {
    try {
      await storage.updateProcessingJob(job.id, { 
        status: 'processing', 
        startedAt: new Date() 
      });

      const cutsDir = 'cuts';
      if (!fs.existsSync(cutsDir)) {
        fs.mkdirSync(cutsDir, { recursive: true });
      }

      const cutRanges = ffmpegService.parseCutPoints(cutPoints, video.duration);

      const outputPaths = await ffmpegService.generateCuts(
        video.filePath,
        cutsDir,
        cutRanges,
        async (progress) => {
          await storage.updateProcessingJob(job.id, { progress });
        }
      );

      for (let i = 0; i < cutRanges.length; i++) {
        const cutData = {
          video: { connect: { id: video.id } },
          title: `Cut ${i + 1}`,
          description: `Auto-generated cut from ${cutRanges[i].start} to ${cutRanges[i].end}`,
          hashtags: '',
          startTime: ffmpegService['timeStringToSeconds'](cutRanges[i].start),
          endTime: ffmpegService['timeStringToSeconds'](cutRanges[i].end),
          duration: cutRanges[i].duration,
          filePath: outputPaths[i],
          status: 'ready',
          platforms: {},
          obfuscation: {},
        };

        await storage.createCut(cutData);
      }

      await storage.updateProcessingJob(job.id, { 
        status: 'completed', 
        progress: 100,
        completedAt: new Date()
      });

    } catch (error) {
      console.error('Processing error:', error);
      await storage.updateProcessingJob(job.id, { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}