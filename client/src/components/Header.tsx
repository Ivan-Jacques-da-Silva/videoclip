import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionStatus } from "./ConnectionStatus";

export function Header() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            🎬 VideoClip Pro Dashboard
          </CardTitle>
          <ConnectionStatus />
        </div>
      </CardHeader>
    </Card>
  );
}