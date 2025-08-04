
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

      console.log('Starting YouTube download for:', url);

      // Primeiro, obter informações do vídeo
      const infoCommand = `yt-dlp --get-duration --get-title --get-filename -o "%(title)s.%(ext)s" "${url}"`;
      console.log('Getting video info:', infoCommand);
      
      const { stdout: infoOutput, stderr: infoStderr } = await execAsync(infoCommand);
      
      if (infoStderr) {
        console.warn('yt-dlp info stderr:', infoStderr);
      }

      const infoLines = infoOutput.trim().split('\n');
      const duration = this.parseDuration(infoLines[0] || '0:00');
      const title = infoLines[1] || 'Unknown Video';
      const filename = infoLines[2] || 'video.mp4';

      console.log('Video info - Duration:', duration, 'Title:', title);

      // Download video using yt-dlp
      const downloadCommand = `yt-dlp -f "best[ext=mp4][height<=720]/best[ext=mp4]/best" --no-playlist --restrict-filenames -o "${outputTemplate}" "${url}"`;
      console.log('Download command:', downloadCommand);
      
      const { stdout, stderr } = await execAsync(downloadCommand, { timeout: 300000 }); // 5 min timeout
      
      if (stderr) {
        console.warn('yt-dlp download stderr:', stderr);
      }

      console.log('yt-dlp download stdout:', stdout);

      // Find the downloaded file
      const files = fs.readdirSync(outputDir).filter(file => file.startsWith(`youtube_${timestamp}_`));
      
      if (files.length === 0) {
        console.error('No files found with pattern:', `youtube_${timestamp}_`);
        console.log('Files in directory:', fs.readdirSync(outputDir));
        throw new Error('No file was downloaded. Check yt-dlp installation and video availability.');
      }

      const filePath = path.join(outputDir, files[0]);
      const stats = fs.statSync(filePath);
      
      console.log('Downloaded file:', filePath, 'Size:', stats.size);

      return {
        filePath,
        originalName: title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_') + '.mp4',
        duration,
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
