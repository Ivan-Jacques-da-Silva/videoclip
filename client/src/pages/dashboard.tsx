import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoUpload from "@/components/VideoUpload";
import VideosList from "@/components/VideosList";
import CutsList from "@/components/CutsList";
import StatsCards from "@/components/StatsCards";
import ProcessingQueue from "@/components/ProcessingQueue";
import SocialMediaPlatform from "@/components/SocialMediaPlatform";
import ConnectionStatus from "@/components/ConnectionStatus";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StatsCards />
          </div>
          <div>
            <ProcessingQueue />
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-0">
            <Tabs defaultValue="videos" className="w-full">
              <div className="border-b border-gray-200 px-6 py-4">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex bg-gray-100">
                  <TabsTrigger value="videos" className="data-[state=active]:bg-white">
                    📹 Vídeos
                  </TabsTrigger>
                  <TabsTrigger value="cuts" className="data-[state=active]:bg-white">
                    ✂️ Cortes
                  </TabsTrigger>
                  <TabsTrigger value="social" className="data-[state=active]:bg-white">
                    📱 Redes Sociais
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="data-[state=active]:bg-white">
                    ⚙️ Configurações
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="videos" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-1">Gerenciar Vídeos</h2>
                    <p className="text-sm text-gray-500">Faça upload e gerencie seus vídeos</p>
                  </div>
                  <VideoUpload />
                  <VideosList />
                </div>
              </TabsContent>

              <TabsContent value="cuts" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-1">Seus Cortes</h2>
                    <p className="text-sm text-gray-500">Visualize e edite seus clipes gerados</p>
                  </div>
                  <CutsList />
                </div>
              </TabsContent>

              <TabsContent value="social" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-1">Publicar nas Redes Sociais</h2>
                    <p className="text-sm text-gray-500">Compartilhe seus clipes nas redes sociais</p>
                  </div>
                  <SocialMediaPlatform />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-1">Configurações do Sistema</h2>
                    <p className="text-sm text-gray-500">Configure conexões e preferências</p>
                  </div>
                  <ConnectionStatus />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}