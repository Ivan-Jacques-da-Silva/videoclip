import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Video } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { ProcessingJob } from "@shared/schema";

export default function ProcessingQueue() {
  const { data: jobs = [] } = useQuery<ProcessingJob[]>({
    queryKey: ["/api/processing-jobs"],
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });

  const activeJobs = jobs.filter(job => job.status === 'processing' || job.status === 'queued');

  if (activeJobs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Processing Queue</h2>
        <div className="space-y-3">
          {activeJobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center">
                  <Video className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Video Processing</p>
                  <p className="text-sm text-gray-600">
                    {job.status === 'queued' ? 'Queued for processing...' : 'Generating cuts...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Progress value={job.progress || 0} className="w-32" />
                <span className="text-sm text-gray-600 min-w-[35px]">
                  {job.progress || 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
