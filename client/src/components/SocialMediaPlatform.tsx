
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SocialMediaPlatformProps {
  platform: string;
  name: string;
  icon: string;
  color: string;
}

export default function SocialMediaPlatform({ platform, name, icon, color }: SocialMediaPlatformProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [pageId, setPageId] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: socialStatus } = useQuery({
    queryKey: ["/api/social-media/status"],
  });

  const isConnected = socialStatus?.[platform] || false;

  const connectMutation = useMutation({
    mutationFn: async () => {
      const body: any = { accessToken };
      if (platform === 'youtube' && refreshToken) {
        body.refreshToken = refreshToken;
      }
      if (platform === 'facebook' && pageId) {
        body.pageId = pageId;
      }

      const response = await fetch(`/api/social-media/connect/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Connection failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${name} connected successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-media/status"] });
      setIsConnecting(false);
      setAccessToken("");
      setRefreshToken("");
      setPageId("");
    },
    onError: (error) => {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect",
        variant: "destructive",
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/social-media/disconnect/${platform}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Disconnect failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Disconnected",
        description: `${name} disconnected successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-media/status"] });
    },
  });

  const handleConnect = () => {
    connectMutation.mutate();
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate();
  };

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-6 h-6 ${color} rounded flex items-center justify-center text-white text-xs`}>
          {icon}
        </div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-orange-500'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </p>
        </div>
      </div>
      
      {isConnected ? (
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDisconnect}
            disabled={disconnectMutation.isPending}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Dialog open={isConnecting} onOpenChange={setIsConnecting}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect to {name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Access Token</label>
                <Input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Enter your access token"
                />
              </div>
              
              {platform === 'youtube' && (
                <div>
                  <label className="text-sm font-medium">Refresh Token (Optional)</label>
                  <Input
                    type="password"
                    value={refreshToken}
                    onChange={(e) => setRefreshToken(e.target.value)}
                    placeholder="Enter your refresh token"
                  />
                </div>
              )}
              
              {platform === 'facebook' && (
                <div>
                  <label className="text-sm font-medium">Page ID</label>
                  <Input
                    value={pageId}
                    onChange={(e) => setPageId(e.target.value)}
                    placeholder="Enter your Facebook page ID"
                  />
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleConnect}
                  disabled={!accessToken || connectMutation.isPending}
                  className="flex-1"
                >
                  {connectMutation.isPending ? "Connecting..." : "Connect"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsConnecting(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
