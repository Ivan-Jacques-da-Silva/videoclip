
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlatformConnectionData {
  accessToken: string;
  refreshToken?: string;
  pageId?: string;
}

export default function ConnectionStatus() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [connectionData, setConnectionData] = useState<PlatformConnectionData>({
    accessToken: "",
    refreshToken: "",
    pageId: "",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: status } = useQuery({
    queryKey: ["/api/social-media/status"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const connectMutation = useMutation({
    mutationFn: async ({ platform, data }: { platform: string; data: PlatformConnectionData }) => {
      const response = await fetch(`/api/social-media/connect/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to connect to ${platform}`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: `Connected to ${variables.platform} successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-media/status"] });
      setConnectionData({ accessToken: "", refreshToken: "", pageId: "" });
      setSelectedPlatform("");
    },
    onError: (error: Error) => {
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (platform: string) => {
      const response = await fetch(`/api/social-media/disconnect/${platform}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to disconnect from ${platform}`);
      }

      return response.json();
    },
    onSuccess: (data, platform) => {
      toast({
        title: "Success",
        description: `Disconnected from ${platform} successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-media/status"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Disconnection Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    if (selectedPlatform && connectionData.accessToken.trim()) {
      connectMutation.mutate({
        platform: selectedPlatform,
        data: connectionData,
      });
    }
  };

  const handleDisconnect = (platform: string) => {
    disconnectMutation.mutate(platform);
  };

  const platforms = [
    { id: 'instagram', name: 'Instagram', needsPageId: false },
    { id: 'youtube', name: 'YouTube', needsPageId: false },
    { id: 'tiktok', name: 'TikTok', needsPageId: false },
    { id: 'facebook', name: 'Facebook', needsPageId: true },
  ];

  const getStatusBadge = (platform: string) => {
    const isConnected = status && status[platform]?.connected;
    
    return (
      <Badge variant={isConnected ? "default" : "secondary"} className="ml-2">
        {isConnected ? (
          <CheckCircle className="h-3 w-3 mr-1" />
        ) : (
          <XCircle className="h-3 w-3 mr-1" />
        )}
        {isConnected ? "Connected" : "Disconnected"}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Social Media Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div key={platform.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <span className="font-medium">{platform.name}</span>
                {getStatusBadge(platform.id)}
              </div>
              
              <div className="flex gap-2">
                {status && status[platform.id]?.connected ? (
                  <Button
                    onClick={() => handleDisconnect(platform.id)}
                    variant="destructive"
                    size="sm"
                    disabled={disconnectMutation.isPending}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setSelectedPlatform(platform.id)}
                        variant="outline"
                        size="sm"
                      >
                        Connect
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Connect to {platform.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="access-token">Access Token</Label>
                          <Input
                            id="access-token"
                            type="password"
                            placeholder="Enter your access token"
                            value={connectionData.accessToken}
                            onChange={(e) =>
                              setConnectionData(prev => ({
                                ...prev,
                                accessToken: e.target.value,
                              }))
                            }
                          />
                        </div>

                        {platform.id === 'youtube' && (
                          <div>
                            <Label htmlFor="refresh-token">Refresh Token</Label>
                            <Input
                              id="refresh-token"
                              type="password"
                              placeholder="Enter your refresh token"
                              value={connectionData.refreshToken || ""}
                              onChange={(e) =>
                                setConnectionData(prev => ({
                                  ...prev,
                                  refreshToken: e.target.value,
                                }))
                              }
                            />
                          </div>
                        )}

                        {platform.needsPageId && (
                          <div>
                            <Label htmlFor="page-id">Page ID</Label>
                            <Input
                              id="page-id"
                              placeholder="Enter your page ID"
                              value={connectionData.pageId || ""}
                              onChange={(e) =>
                                setConnectionData(prev => ({
                                  ...prev,
                                  pageId: e.target.value,
                                }))
                              }
                            />
                          </div>
                        )}

                        <Button
                          onClick={handleConnect}
                          disabled={
                            !connectionData.accessToken.trim() ||
                            connectMutation.isPending ||
                            (platform.needsPageId && !connectionData.pageId?.trim())
                          }
                          className="w-full"
                        >
                          {connectMutation.isPending ? "Connecting..." : "Connect"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          ))}
        </div>

        {!status && (
          <div className="text-center text-muted-foreground">
            Loading connection status...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
