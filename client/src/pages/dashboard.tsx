import { useState } from "react";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import VideoUpload from "@/components/VideoUpload";
import VideoPlayer from "@/components/VideoPlayer";
import ProcessingQueue from "@/components/ProcessingQueue";
import CutsList from "@/components/CutsList";
import EditCutModal from "@/components/EditCutModal";
import SocialMediaPlatform from "@/components/SocialMediaPlatform";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import type { Cut, Video } from "@shared/schema";

export default function Dashboard() {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [editingCut, setEditingCut] = useState<Cut | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: cuts = [], refetch: refetchCuts } = useQuery({
    queryKey: ["/api/cuts"],
  });

  const filteredCuts = cuts.filter((cut: Cut) =>
    cut.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cut.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleEditCut = (cut: Cut) => {
    setEditingCut(cut);
  };

  const handleCutUpdated = () => {
    refetchCuts();
    setEditingCut(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Video Upload & Player */}
          <div className="lg:col-span-2 space-y-6">
            <VideoUpload onVideoSelect={handleVideoSelect} />
            {selectedVideo && (
              <VideoPlayer 
                video={selectedVideo} 
                onCutsGenerated={refetchCuts}
              />
            )}
            <ProcessingQueue />
          </div>

          {/* Right Column: Cut Management & Social Media */}
          <div className="space-y-6">
            <CutsList onEditCut={handleEditCut} />
            
            {/* Social Media Integration */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media</h2>
                <div className="space-y-4">
                  <SocialMediaPlatform 
                    platform="instagram"
                    name="Instagram"
                    icon="IG"
                    color="bg-pink-500"
                  />
                  <SocialMediaPlatform 
                    platform="youtube"
                    name="YouTube"
                    icon="YT"
                    color="bg-red-500"
                  />
                  <SocialMediaPlatform 
                    platform="tiktok"
                    name="TikTok"
                    icon="TT"
                    color="bg-black"
                  />
                  <SocialMediaPlatform 
                    platform="facebook"
                    name="Facebook"
                    icon="FB"
                    color="bg-blue-500"
                  />

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs">
                        YT
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">YouTube</p>
                        <p className="text-sm text-gray-600">Connected</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white text-xs">
                        TT
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">TikTok</p>
                        <p className="text-sm text-orange-500">Disconnected</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">
                        FB
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Facebook</p>
                        <p className="text-sm text-gray-600">Connected</p>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      Post Selected Cuts
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      Schedule Posts
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Cuts Table */}
        <Card className="mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">All Video Cuts</h2>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search cuts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Cut
                </Button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Video</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCuts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No cuts found. Upload a video and generate cuts to get started.
                    </td>
                  </tr>
                ) : (
                  filteredCuts.map((cut: Cut) => (
                    <tr key={cut.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center">
                          <div className="w-0 h-0 border-l-[6px] border-l-gray-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{cut.title}</div>
                          <div className="text-sm text-gray-500">{cut.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.floor(cut.duration / 60)}:{(cut.duration % 60).toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cut.status === 'ready' ? 'bg-green-100 text-green-800' :
                          cut.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          cut.status === 'posted' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {cut.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditCut(cut)}
                          disabled={cut.status === 'processing'}
                        >
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                          Post
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {editingCut && (
        <EditCutModal
          cut={editingCut}
          onClose={() => setEditingCut(null)}
          onSave={handleCutUpdated}
        />
      )}
    </div>
  );
}
