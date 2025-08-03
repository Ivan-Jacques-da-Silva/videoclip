import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadVideoMutation = useMutation({
    mutationFn: async (videoFile: File) => {
      const formData = new FormData();
      formData.append('video', videoFile);

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload video');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      setFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const downloadYoutubeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch('/api/videos/download-youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to download YouTube video');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "YouTube video downloaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
      setYoutubeUrl("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'video/mp4') {
        toast({
          title: "Error",
          description: "Please select an MP4 file only.",
          variant: "destructive",
        });
        return;
      }
      if (selectedFile.size > 500 * 1024 * 1024) { // 500MB
        toast({
          title: "Error",
          description: "File size must be less than 500MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadVideoMutation.mutate(file);
    }
  };

  const handleYoutubeDownload = () => {
    if (youtubeUrl.trim()) {
      downloadYoutubeMutation.mutate(youtubeUrl.trim());
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Video File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="video-file">Select MP4 File (max 500MB)</Label>
            <Input
              id="video-file"
              ref={fileInputRef}
              type="file"
              accept="video/mp4"
              onChange={handleFileSelect}
            />
          </div>

          {file && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          {uploadVideoMutation.isPending && (
            <div>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-1">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || uploadVideoMutation.isPending}
            className="w-full"
          >
            {uploadVideoMutation.isPending ? "Uploading..." : "Upload Video"}
          </Button>
        </CardContent>
      </Card>

      {/* YouTube Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5" />
            Download from YouTube
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="youtube-url">YouTube Video URL</Label>
            <Input
              id="youtube-url"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>

          <Button
            onClick={handleYoutubeDownload}
            disabled={!youtubeUrl.trim() || downloadYoutubeMutation.isPending}
            className="w-full"
          >
            {downloadYoutubeMutation.isPending ? "Downloading..." : "Download Video"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}