import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Edit } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Cut } from "@shared/schema";

interface CutsListProps {
  onEditCut: (cut: Cut) => void;
}

export default function CutsList({ onEditCut }: CutsListProps) {
  const { data: cuts = [] } = useQuery<Cut[]>({
    queryKey: ["/api/cuts"],
  });

  const recentCuts = cuts.slice(0, 3);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Cuts</h2>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="space-y-3">
          {recentCuts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No cuts generated yet. Upload a video and create cuts to get started.
            </div>
          ) : (
            recentCuts.map((cut) => (
              <div key={cut.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-material-1 transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-12 bg-gray-300 rounded flex-shrink-0 flex items-center justify-center">
                    <Play className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{cut.title}</p>
                    <p className="text-sm text-gray-600">
                      {Math.floor(cut.duration / 60)}:{(cut.duration % 60).toString().padStart(2, '0')}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        cut.status === 'ready' ? 'bg-green-100 text-green-800' :
                        cut.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        cut.status === 'posted' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cut.status}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEditCut(cut)}
                        disabled={cut.status === 'processing'}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
