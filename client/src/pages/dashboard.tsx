import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import VideoUpload from "@/components/VideoUpload";
import VideoPlayer from "@/components/VideoPlayer";
import CutsList from "@/components/CutsList";
import ProcessingQueue from "@/components/ProcessingQueue";
import ConnectionStatus from "@/components/ConnectionStatus";

interface Video {
  id: string;
  filename: string;
  originalName: string;
  duration?: number;
  filePath: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: videos } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const latestVideo = videos?.[0]; // Assuming videos are ordered by creation date

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <StatsCards />

        {/* Main Content */}
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="editor">Video Editor</TabsTrigger>
            <TabsTrigger value="cuts">Cuts</TabsTrigger>
            <TabsTrigger value="queue">Processing</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <VideoUpload />

            {/* Recent Videos */}
            {videos && videos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Videos ({videos.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {videos.slice(0, 5).map((video) => (
                      <div 
                        key={video.id} 
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{video.originalName}</p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : 'Unknown'}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="editor">
            {latestVideo ? (
              <VideoPlayer video={latestVideo} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    No videos available. Please upload a video first.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cuts">
            <CutsList />
          </TabsContent>

          <TabsContent value="queue">
            <ProcessingQueue />
          </TabsContent>

          <TabsContent value="social">
            <ConnectionStatus />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}