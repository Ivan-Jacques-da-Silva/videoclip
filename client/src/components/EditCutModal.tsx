import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Play } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Cut } from "@shared/schema";

interface EditCutModalProps {
  cut: Cut;
  onClose: () => void;
  onSave: () => void;
}

export default function EditCutModal({ cut, onClose, onSave }: EditCutModalProps) {
  const [title, setTitle] = useState(cut.title);
  const [description, setDescription] = useState(cut.description || "");
  const [hashtags, setHashtags] = useState(cut.hashtags || "");
  const [platforms, setPlatforms] = useState(cut.platforms as Record<string, boolean> || {});
  const [obfuscation, setObfuscation] = useState(cut.obfuscation as Record<string, boolean> || {});
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Cut>) => {
      const response = await fetch(`/api/cuts/${cut.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cut');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cut updated",
        description: "Your changes have been saved successfully.",
      });
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update cut",
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/cuts/${cut.id}/publish-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          hashtags,
          platforms,
          obfuscation,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to publish to social media');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Published successfully",
        description: "Your video has been published to all selected platforms.",
      });
      onSave();
    },
    onError: (error) => {
      toast({
        title: "Publishing failed",
        description: error instanceof Error ? error.message : "Failed to publish to social media",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      title,
      description,
      hashtags,
      platforms,
      obfuscation,
    });
  };

  const handlePublishToAll = () => {
    // First save, then publish
    updateMutation.mutate({
      title,
      description,
      hashtags,
      platforms,
      obfuscation,
    }, {
      onSuccess: () => {
        publishMutation.mutate();
      }
    });
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setPlatforms(prev => ({
      ...prev,
      [platform]: checked,
    }));
  };

  const handleObfuscationChange = (option: string, checked: boolean) => {
    setObfuscation(prev => ({
      ...prev,
      [option]: checked,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Video Cut</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Video Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div className="bg-black rounded-lg aspect-video relative">
              {cut.filePath ? (
                <video 
                  src={`/api/cuts/${cut.id}/file`}
                  className="w-full h-full object-contain rounded-lg"
                  controls={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white text-center">
                    <Play className="h-12 w-12 mx-auto mb-2" />
                    <p>Video processing...</p>
                  </div>
                </div>
              )}
              <button className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Play className="h-5 w-5 text-gray-800 ml-1" />
                </div>
              </button>
            </div>
          </div>

          {/* Title and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter cut title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <Input
                value={`${Math.floor(cut.duration / 60)}:${(cut.duration % 60).toString().padStart(2, '0')}`}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description for this cut"
              rows={3}
            />
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hashtags</label>
            <Input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#example #hashtags #videocontent"
            />
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Publishing Platforms</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'instagram', label: 'Instagram', color: 'bg-pink-500' },
                { key: 'youtube', label: 'YouTube', color: 'bg-red-500' },
                { key: 'tiktok', label: 'TikTok', color: 'bg-black' },
                { key: 'facebook', label: 'Facebook', color: 'bg-blue-600' },
              ].map((platform) => (
                <label key={platform.key} className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <Checkbox
                    checked={platforms[platform.key] || false}
                    onCheckedChange={(checked) => handlePlatformChange(platform.key, checked as boolean)}
                  />
                  <div className={`w-4 h-4 ${platform.color} rounded`}></div>
                  <span className="text-sm">{platform.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Obfuscation Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Content Obfuscation</label>
            <div className="space-y-3">
              {[
                { key: 'metadata', label: 'Modify metadata' },
                { key: 'bitrate', label: 'Adjust bitrate slightly' },
                { key: 'brightness', label: 'Minor brightness adjustment' },
              ].map((option) => (
                <label key={option.key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={obfuscation[option.key] || false}
                    onCheckedChange={(checked) => handleObfuscationChange(option.key, checked as boolean)}
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            onClick={handlePublishToAll}
            disabled={updateMutation.isPending || publishMutation.isPending}
          >
            {publishMutation.isPending ? "Publishing..." : "Save & Publish to All"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
