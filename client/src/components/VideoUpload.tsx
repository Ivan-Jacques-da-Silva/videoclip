import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, Info } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Video } from "@shared/schema";

interface VideoUploadProps {
  onVideoSelect: (video: Video) => void;
}

export default function VideoUpload({ onVideoSelect }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (video: Video) => {
      toast({
        title: "Upload successful",
        description: "Your video has been uploaded successfully.",
      });
      onVideoSelect(video);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    if (file.type !== 'video/mp4') {
      toast({
        title: "Invalid file type",
        description: "Please select an MP4 video file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select a video smaller than 500MB.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Video</h2>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
            isDragging 
              ? 'border-primary bg-blue-50' 
              : 'border-gray-300 hover:border-primary'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <CloudUpload className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
          <p className="text-lg text-gray-600 mb-2">
            {uploadMutation.isPending 
              ? "Uploading..." 
              : "Drag and drop your MP4 video here"
            }
          </p>
          <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
          <Button 
            disabled={uploadMutation.isPending}
            variant={uploadMutation.isPending ? "secondary" : "default"}
          >
            {uploadMutation.isPending ? "Uploading..." : "Choose File"}
          </Button>
        </div>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Info className="h-4 w-4 mr-2" />
          Supported formats: MP4 (max 500MB)
        </div>
      </CardContent>
    </Card>
  );
}
