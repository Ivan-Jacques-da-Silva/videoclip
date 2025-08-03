import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Pause, Save, Scissors } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Video } from "@shared/schema";

interface VideoPlayerProps {
  video: Video;
  onCutsGenerated: () => void;
}

export default function VideoPlayer({ video, onCutsGenerated }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [cutPoints, setCutPoints] = useState("00:30|02:15|04:45|07:20");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateCutsMutation = useMutation({
    mutationFn: async (cutPointsString: string) => {
      const response = await fetch(`/api/videos/${video.id}/generate-cuts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cutPoints: cutPointsString }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate cuts');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Processing started",
        description: "Your video cuts are being generated. Check the processing queue for updates.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/processing-jobs"] });
      onCutsGenerated();
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate cuts",
        variant: "destructive",
      });
    },
  });

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleGenerateCuts = () => {
    if (!cutPoints.trim()) {
      toast({
        title: "Invalid cut points",
        description: "Please enter cut points in the format: 00:30|02:15|04:45",
        variant: "destructive",
      });
      return;
    }
    
    generateCutsMutation.mutate(cutPoints);
  };

  const getVideoUrl = () => {
    return `/api/videos/${video.id}/file`;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Video Player</h2>
          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Ready</span>
        </div>
        
        {/* Video Preview Area */}
        <div className="bg-black rounded-lg aspect-video mb-4 relative overflow-hidden">
          <video
            ref={videoRef}
            src={getVideoUrl()}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onLoadedData={() => {
              if (videoRef.current) {
                setCurrentTime(0);
              }
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
            <Button
              size="lg"
              className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-gray-800"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
            </Button>
          </div>
          <div className="absolute bottom-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
            <span>{formatTime(currentTime)}</span> / <span>{formatTime(video.duration || 0)}</span>
          </div>
        </div>

        {/* Timeline Controls */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max={video.duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            <span className="text-sm text-gray-600 min-w-[80px]">
              {formatTime(video.duration || 0)}
            </span>
          </div>

          {/* Cut Points Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cut Points (use | to mark)
            </label>
            <Textarea
              value={cutPoints}
              onChange={(e) => setCutPoints(e.target.value)}
              placeholder="Enter timestamps like: 00:30|02:15|04:45|07:20"
              rows={3}
              className="resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              This will create {cutPoints.split('|').filter(Boolean).length + 1} video segments
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleGenerateCuts}
              disabled={generateCutsMutation.isPending}
            >
              <Scissors className="h-4 w-4 mr-2" />
              {generateCutsMutation.isPending ? "Generating..." : "Generate Cuts"}
            </Button>
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save Project
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
