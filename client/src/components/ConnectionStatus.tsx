
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export function ConnectionStatus() {
  const { data: stats, isError, isLoading } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error("Failed to connect to backend");
      }
      return response.json();
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  if (isLoading) {
    return (
      <Badge variant="secondary" className="animate-pulse">
        🔄 Connecting...
      </Badge>
    );
  }

  if (isError) {
    return (
      <Badge variant="destructive">
        ❌ Backend Offline
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="bg-green-600">
      ✅ Backend Online
    </Badge>
  );
}
