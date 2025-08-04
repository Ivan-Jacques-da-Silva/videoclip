
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Play, Scissors } from "lucide-react";
import { useState } from "react";
import VideoPlayer from "./VideoPlayer";

interface Video {
  id: string;
  filename: string;
  originalName: string;
  duration?: number;
  filePath: string;
  fileSize: number;
  createdAt: string;
}

export default function VideosList() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return 'Unknown';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (selectedVideo) {
    return (
      <div className="space-y-4">
        <Button 
          onClick={() => setSelectedVideo(null)}
          variant="outline"
        >
          ← Voltar para lista de vídeos
        </Button>
        <VideoPlayer video={selectedVideo} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seus Vídeos ({videos?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Carregando vídeos...
          </div>
        ) : !videos || videos.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhum vídeo encontrado. Faça upload ou baixe um vídeo do YouTube para começar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Arquivo</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Data de Upload</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">
                      {video.originalName}
                    </TableCell>
                    <TableCell>
                      {formatTime(video.duration || 0)}
                    </TableCell>
                    <TableCell>
                      {formatFileSize(video.fileSize)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(video.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedVideo(video)}
                          size="sm"
                          variant="outline"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Reproduzir
                        </Button>
                        <Button
                          onClick={() => setSelectedVideo(video)}
                          size="sm"
                        >
                          <Scissors className="h-4 w-4 mr-1" />
                          Criar Cortes
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
  );
}
