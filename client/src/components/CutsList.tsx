import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Edit, Trash2, Play, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EditCutModal from "./EditCutModal";
import PublishModal from "./PublishModal";
import { formatTime } from "@/lib/utils";

interface Cut {
  id: string;
  title: string;
  description?: string;
  hashtags?: string;
  startTime: number;
  endTime: number;
  duration: number;
  filePath?: string;
  status: string;
  platforms: Record<string, boolean>;
  video: {
    id: string;
    originalName: string;
  };
}

export default function CutsList() {
  const [selectedCut, setSelectedCut] = useState<Cut | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [cutToPublish, setCutToPublish] = useState<Cut | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: cuts, isLoading } = useQuery<Cut[]>({
    queryKey: ["/api/cuts"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const deleteCutMutation = useMutation({
    mutationFn: async (cutId: string) => {
      const response = await fetch(`/api/cuts/${cutId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete cut');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Cut deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cuts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ready':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'outline';
      case 'published':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleEditCut = (cut: Cut) => {
    setSelectedCut(cut);
    setIsEditModalOpen(true);
  };

  const handlePublishCut = (cut: Cut) => {
    setCutToPublish(cut);
    setIsPublishModalOpen(true);
  };

  const handleDelete = (cutId: string) => {
    if (confirm('Are you sure you want to delete this cut?')) {
      deleteCutMutation.mutate(cutId);
    }
  };

  const handlePlayCut = (cutId: string) => {
    // Open video file in new tab
    window.open(`/api/cuts/${cutId}/file`, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Cuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Loading cuts...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Video Cuts ({cuts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!cuts || cuts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No cuts available. Upload a video and generate cuts to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Video Source</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Time Range</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Platforms</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cuts.map((cut) => (
                    <TableRow key={cut.id}>
                      <TableCell className="font-medium">
                        {cut.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cut.video.originalName}
                      </TableCell>
                      <TableCell>
                        {formatTime(cut.duration)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTime(cut.startTime)} - {formatTime(cut.endTime)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(cut.status)}>
                          {cut.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(cut.platforms).map(([platform, enabled]) => (
                            enabled && (
                              <Badge key={platform} variant="outline" className="text-xs">
                                {platform}
                              </Badge>
                            )
                          ))}
                          {Object.keys(cut.platforms).length === 0 && (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {cut.filePath && (
                            <Button
                              onClick={() => handlePlayCut(cut.id)}
                              size="sm"
                              variant="outline"
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            onClick={() => handleEditCut(cut)}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handlePublishCut(cut)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={cut.status !== 'ready'}
                          >
                            <Share2 className="h-3 w-3" />
                            Publicar
                          </Button>
                          <Button
                            onClick={() => handleDelete(cut.id)}
                            size="sm"
                            variant="destructive"
                            disabled={deleteCutMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCut && (
        <EditCutModal
          cut={selectedCut}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCut(null);
          }}
        />
      )}

      {isPublishModalOpen && cutToPublish && (
        <PublishModal
          cut={cutToPublish}
          onClose={() => {
            setIsPublishModalOpen(false);
            setCutToPublish(null);
          }}
        />
      )}
    </>
  );
}