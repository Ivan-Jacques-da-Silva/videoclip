
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Scissors, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoPlayerProps {
  video: {
    id: string;
    filename: string;
    originalName: string;
    duration?: number;
    filePath: string;
  };
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [cutPoints, setCutPoints] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const generateCutsMutation = useMutation({
    mutationFn: async (cutPointsData: string) => {
      const response = await fetch(`/api/videos/${video.id}/generate-cuts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cutPoints: cutPointsData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate cuts');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Cut generation started! Job ID: ${data.jobId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/processing-jobs"] });
      queryClient.invalidateQueries({ queryKey: [`/api/videos/${video.id}/cuts`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const addCurrentTimeToMarkers = () => {
    if (videoRef.current) {
      const timeInMinutes = Math.floor(currentTime / 60);
      const timeInSeconds = Math.floor(currentTime % 60);
      const timeString = `${timeInMinutes}:${timeInSeconds.toString().padStart(2, '0')}`;
      
      setCutPoints(prev => {
        if (prev.trim() === "") {
          return timeString + " |";
        } else {
          return prev + " " + timeString + " |";
        }
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleGenerateCuts = () => {
    if (cutPoints.trim()) {
      generateCutsMutation.mutate(cutPoints.trim());
    } else {
      toast({
        title: "Error",
        description: "Please enter cut points using | markers",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Video Player</span>
          <span className="text-sm font-normal text-muted-foreground">
            {video.originalName}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-auto max-h-96"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            src={`/api/videos/${video.id}/file`}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Timeline Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Current Time: {formatTime(currentTime)}</span>
          <span>Duration: {video.duration ? formatTime(video.duration) : 'Unknown'}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button onClick={handlePlayPause} variant="outline" size="sm">
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button onClick={addCurrentTimeToMarkers} variant="outline" size="sm">
            Mark Cut Point
          </Button>
        </div>

        {/* Cut Points Input */}
        <div className="space-y-2">
          <Label htmlFor="cut-points">
            Cut Points (use | to mark cut positions)
          </Label>
          <Textarea
            id="cut-points"
            placeholder="Example: 0:30 | 1:15 | 2:45 |"
            value={cutPoints}
            onChange={(e) => setCutPoints(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Use format like "0:30 | 1:15 | 2:45 |" to mark cut points at specific times.
            Each | creates a new video segment.
          </p>
        </div>

        {/* Generate Cuts Button */}
        <Button
          onClick={handleGenerateCuts}
          disabled={!cutPoints.trim() || generateCutsMutation.isPending}
          className="w-full"
        >
          <Scissors className="h-4 w-4 mr-2" />
          {generateCutsMutation.isPending ? "Generating Cuts..." : "Generate Cuts"}
        </Button>
      </CardContent>
    </Card>
  );
}
