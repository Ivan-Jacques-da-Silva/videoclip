import { Card, CardContent } from "@/components/ui/card";
import { Upload, Scissors, Share, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Stats {
  videosUploaded: number;
  cutsGenerated: number;
  postsPublished: number;
  processing: number;
}

export default function StatsCards() {
  const { data: stats = { videosUploaded: 0, cutsGenerated: 0, postsPublished: 0, processing: 0 } } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Upload className="text-primary text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Videos Uploaded</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.videosUploaded}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Scissors className="text-orange-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Cuts Generated</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.cutsGenerated}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Share className="text-green-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Posts Published</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.postsPublished}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.processing}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
