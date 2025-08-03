import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export interface CutTimeRange {
  start: string;
  end: string;
  duration: number;
}

export class FFmpegService {
  private static instance: FFmpegService;

  static getInstance(): FFmpegService {
    if (!FFmpegService.instance) {
      FFmpegService.instance = new FFmpegService();
    }
    return FFmpegService.instance;
  }

  async getVideoInfo(filePath: string): Promise<{ duration: number; width: number; height: number }> {
    try {
      const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
      const { stdout } = await execAsync(command);
      const info = JSON.parse(stdout);
      
      const videoStream = info.streams.find((stream: any) => stream.codec_type === 'video');
      const duration = parseFloat(info.format.duration || '0');
      
      return {
        duration,
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get video info: ${error}`);
    }
  }

  parseCutPoints(cutPointsString: string, videoDuration: number): CutTimeRange[] {
    const timeStrings = cutPointsString.split('|').map(t => t.trim()).filter(Boolean);
    const cuts: CutTimeRange[] = [];
    
    let prevTime = 0;
    
    for (let i = 0; i < timeStrings.length; i++) {
      const timeInSeconds = this.timeStringToSeconds(timeStrings[i]);
      
      if (timeInSeconds > prevTime && timeInSeconds <= videoDuration) {
        cuts.push({
          start: this.secondsToTimeString(prevTime),
          end: this.secondsToTimeString(timeInSeconds),
          duration: timeInSeconds - prevTime,
        });
        prevTime = timeInSeconds;
      }
    }
    
    // Add final segment if there's remaining video
    if (prevTime < videoDuration) {
      cuts.push({
        start: this.secondsToTimeString(prevTime),
        end: this.secondsToTimeString(videoDuration),
        duration: videoDuration - prevTime,
      });
    }
    
    return cuts;
  }

  async generateCuts(
    inputPath: string,
    outputDir: string,
    cuts: CutTimeRange[],
    onProgress?: (progress: number) => void
  ): Promise<string[]> {
    const outputPaths: string[] = [];
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    for (let i = 0; i < cuts.length; i++) {
      const cut = cuts[i];
      const outputFileName = `cut_${i + 1}_${Date.now()}.mp4`;
      const outputPath = path.join(outputDir, outputFileName);
      
      try {
        await this.extractSegment(inputPath, outputPath, cut.start, cut.duration);
        outputPaths.push(outputPath);
        
        if (onProgress) {
          onProgress(Math.round(((i + 1) / cuts.length) * 100));
        }
      } catch (error) {
        throw new Error(`Failed to generate cut ${i + 1}: ${error}`);
      }
    }
    
    return outputPaths;
  }

  async extractSegment(inputPath: string, outputPath: string, startTime: string, duration: number): Promise<void> {
    const command = `ffmpeg -i "${inputPath}" -ss ${startTime} -t ${duration} -c copy "${outputPath}" -y`;
    
    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`FFmpeg extraction failed: ${error}`);
    }
  }

  async obfuscateVideo(inputPath: string, outputPath: string, options: {
    adjustBitrate?: boolean;
    adjustBrightness?: boolean;
    modifyMetadata?: boolean;
  }): Promise<void> {
    let filters: string[] = [];
    let extraOptions: string[] = [];
    
    if (options.adjustBrightness) {
      // Slightly adjust brightness by ±2%
      const brightness = 0.98 + (Math.random() * 0.04);
      filters.push(`eq=brightness=${brightness}`);
    }
    
    if (options.modifyMetadata) {
      extraOptions.push('-map_metadata', '-1');
      extraOptions.push('-metadata', `title=Video_${Date.now()}`);
    }
    
    let command = `ffmpeg -i "${inputPath}"`;
    
    if (filters.length > 0) {
      command += ` -vf "${filters.join(',')}"`;
    }
    
    if (options.adjustBitrate) {
      // Slightly adjust bitrate
      command += ' -crf 23';
    } else {
      command += ' -c copy';
    }
    
    if (extraOptions.length > 0) {
      command += ` ${extraOptions.join(' ')}`;
    }
    
    command += ` "${outputPath}" -y`;
    
    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`FFmpeg obfuscation failed: ${error}`);
    }
  }

  private timeStringToSeconds(timeString: string): number {
    const parts = timeString.split(':');
    if (parts.length === 2) {
      // MM:SS format
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else if (parts.length === 3) {
      // HH:MM:SS format
      return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return 0;
  }

  private secondsToTimeString(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }
}
