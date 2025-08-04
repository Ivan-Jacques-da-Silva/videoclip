import { exec, spawn } from 'child_process';
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
      // Verificar se o arquivo existe
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }

      const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`;
      console.log('Executing FFprobe command:', command);
      
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        console.warn('FFprobe stderr:', stderr);
      }
      
      if (!stdout || stdout.trim() === '') {
        throw new Error('FFprobe returned empty output');
      }
      
      const info = JSON.parse(stdout);
      
      if (!info.streams || !info.format) {
        throw new Error('Invalid video file or corrupted');
      }
      
      const videoStream = info.streams.find((stream: any) => stream.codec_type === 'video');
      const duration = parseFloat(info.format.duration || '0');
      
      return {
        duration,
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
      };
    } catch (error) {
      console.error('FFprobe error:', error);
      throw new Error(`Failed to get video info: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    
    // Aplicar múltiplas variações para evitar detecção
    if (options.adjustBrightness) {
      // Ajustar brilho, contraste e saturação aleatoriamente
      const brightness = 0.98 + (Math.random() * 0.04); // ±2%
      const contrast = 0.98 + (Math.random() * 0.04); // ±2%
      const saturation = 0.98 + (Math.random() * 0.04); // ±2%
      filters.push(`eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}`);
    }
    
    // Adicionar ruído muito sutil (imperceptível)
    const noiseStrength = 1 + Math.random() * 2; // 1-3
    filters.push(`noise=alls=${noiseStrength}:allf=t`);
    
    // Modificar metadados extensivamente
    if (options.modifyMetadata) {
      extraOptions.push('-map_metadata', '-1');
      extraOptions.push('-metadata', `title=Clip_${Date.now()}`);
      extraOptions.push('-metadata', `comment=Generated_${Math.random().toString(36).substr(2, 9)}`);
      extraOptions.push('-metadata', `encoder=Custom_${Date.now()}`);
      extraOptions.push('-metadata', `creation_time=${new Date().toISOString()}`);
    }
    
    let command = `ffmpeg -i "${inputPath}"`;
    
    // Aplicar filtros de vídeo
    if (filters.length > 0) {
      command += ` -vf "${filters.join(',')}"`;
    }
    
    if (options.adjustBitrate) {
      // Variar ligeiramente a qualidade (CRF entre 22-24)
      const crf = 22 + Math.floor(Math.random() * 3);
      command += ` -crf ${crf}`;
      
      // Variar preset de encoding
      const presets = ['fast', 'medium', 'slow'];
      const preset = presets[Math.floor(Math.random() * presets.length)];
      command += ` -preset ${preset}`;
    } else {
      command += ' -c:v libx264 -c:a aac';
    }
    
    // Adicionar opções extras
    if (extraOptions.length > 0) {
      command += ` ${extraOptions.join(' ')}`;
    }
    
    // Forçar re-encoding para quebrar fingerprints
    command += ' -avoid_negative_ts make_zero';
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

  async applyFingerprintVariation(inputPath: string, outputPath: string): Promise<void> {
    const variations = [];
    
    // Aplicar variações aleatórias para quebrar fingerprints
    
    // 1. Micro-crop (remover 1-2 pixels das bordas)
    const cropX = Math.floor(Math.random() * 3);
    const cropY = Math.floor(Math.random() * 3);
    if (cropX > 0 || cropY > 0) {
      variations.push(`crop=iw-${cropX}:ih-${cropY}:${cropX/2}:${cropY/2}`);
    }
    
    // 2. Escala micro-variação (99.8% - 100.2%)
    const scale = 0.998 + (Math.random() * 0.004);
    variations.push(`scale=iw*${scale}:ih*${scale}`);
    
    // 3. Rotação imperceptível (±0.1 graus)
    const rotation = (Math.random() - 0.5) * 0.2;
    if (Math.abs(rotation) > 0.05) {
      variations.push(`rotate=${rotation}*PI/180`);
    }
    
    // 4. Ajuste de gamma muito sutil
    const gamma = 0.99 + (Math.random() * 0.02);
    variations.push(`eq=gamma=${gamma}`);
    
    const command = `ffmpeg -i "${inputPath}" -vf "${variations.join(',')}" -c:a copy "${outputPath}" -y`;
    
    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`Fingerprint variation failed: ${error}`);
    }
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
