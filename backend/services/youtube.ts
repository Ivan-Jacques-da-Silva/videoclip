
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export class YouTubeService {
  private static instance: YouTubeService;

  static getInstance(): YouTubeService {
    if (!YouTubeService.instance) {
      YouTubeService.instance = new YouTubeService();
    }
    return YouTubeService.instance;
  }

  async downloadVideo(url: string, outputDir: string): Promise<{ filePath: string; originalName: string; duration: number; fileSize: number }> {
    try {
      // Validate YouTube URL
      if (!this.isValidYouTubeUrl(url)) {
        throw new Error('Invalid YouTube URL');
      }

      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const timestamp = Date.now();
      const outputTemplate = path.join(outputDir, `youtube_${timestamp}_%(title)s.%(ext)s`);

      // Download video using yt-dlp
      const command = `yt-dlp -f "best[ext=mp4]" --no-playlist -o "${outputTemplate}" "${url}"`;
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.warn('yt-dlp warning:', stderr);
      }

      // Find the downloaded file
      const files = fs.readdirSync(outputDir).filter(file => file.startsWith(`youtube_${timestamp}_`));
      
      if (files.length === 0) {
        throw new Error('No file was downloaded');
      }

      const filePath = path.join(outputDir, files[0]);
      const stats = fs.statSync(filePath);
      
      // Get video info
      const infoCommand = `yt-dlp --get-duration --get-title "${url}"`;
      const { stdout: infoOutput } = await execAsync(infoCommand);
      const [title, durationStr] = infoOutput.trim().split('\n');
      
      return {
        filePath,
        originalName: `${title}.mp4`,
        duration: this.parseDuration(durationStr),
        fileSize: stats.size
      };

    } catch (error) {
      console.error('YouTube download error:', error);
      throw new Error(`Failed to download YouTube video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isValidYouTubeUrl(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  }

  private parseDuration(durationStr: string): number {
    // Parse duration from format like "3:45" or "1:23:45"
    const parts = durationStr.split(':').map(Number);
    let seconds = 0;
    
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    
    return seconds;
  }
}
