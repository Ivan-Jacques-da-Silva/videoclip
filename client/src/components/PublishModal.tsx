
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Share2,
  AlertCircle,
  CheckCircle 
} from "lucide-react";

interface Cut {
  id: string;
  title: string;
  description?: string;
  hashtags?: string;
  duration: number;
  filePath?: string;
  platforms: Record<string, boolean>;
}

interface Platform {
  name: string;
  key: string;
  icon: React.ReactNode;
  connected: boolean;
}

interface PublishModalProps {
  cut: Cut;
  onClose: () => void;
}

export default function PublishModal({ cut, onClose }: PublishModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar status das conexões das redes sociais
  const { data: socialStatus } = useQuery({
    queryKey: ["/api/social-media/status"],
  });

  const platforms: Platform[] = [
    {
      name: "Instagram",
      key: "instagram",
      icon: <Instagram className="h-5 w-5" />,
      connected: socialStatus?.instagram?.connected || false,
    },
    {
      name: "YouTube",
      key: "youtube",
      icon: <Youtube className="h-5 w-5" />,
      connected: socialStatus?.youtube?.connected || false,
    },
    {
      name: "TikTok",
      key: "tiktok",
      icon: <Share2 className="h-5 w-5" />,
      connected: socialStatus?.tiktok?.connected || false,
    },
    {
      name: "Facebook",
      key: "facebook",
      icon: <Facebook className="h-5 w-5" />,
      connected: socialStatus?.facebook?.connected || false,
    },
  ];

  const publishMutation = useMutation({
    mutationFn: async (platforms: Record<string, boolean>) => {
      const response = await fetch(`/api/cuts/${cut.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platforms }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to publish cut');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Publicação iniciada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cuts"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePlatformToggle = (platformKey: string, checked: boolean) => {
    setSelectedPlatforms(prev => ({
      ...prev,
      [platformKey]: checked
    }));
  };

  const handleSelectAll = () => {
    const connectedPlatforms = platforms
      .filter(p => p.connected)
      .reduce((acc, p) => ({ ...acc, [p.key]: true }), {});
    setSelectedPlatforms(connectedPlatforms);
  };

  const handlePublish = () => {
    const selectedCount = Object.values(selectedPlatforms).filter(Boolean).length;
    
    if (selectedCount === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma plataforma para publicar",
        variant: "destructive",
      });
      return;
    }

    publishMutation.mutate(selectedPlatforms);
  };

  const connectedPlatforms = platforms.filter(p => p.connected);
  const disconnectedPlatforms = platforms.filter(p => !p.connected);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publicar nas Redes Sociais</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações do Corte */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Clipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Título:</strong> {cut.title}</p>
                <p><strong>Descrição:</strong> {cut.description || 'Sem descrição'}</p>
                <p><strong>Hashtags:</strong> {cut.hashtags || 'Nenhuma'}</p>
                <p><strong>Duração:</strong> {Math.floor(cut.duration / 60)}:{(cut.duration % 60).toString().padStart(2, '0')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Plataformas Conectadas */}
          {connectedPlatforms.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Plataformas Conectadas
                </CardTitle>
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                >
                  Selecionar Todas
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {connectedPlatforms.map((platform) => (
                    <div key={platform.key} className="flex items-center space-x-3">
                      <Checkbox
                        id={platform.key}
                        checked={selectedPlatforms[platform.key] || false}
                        onCheckedChange={(checked) => 
                          handlePlatformToggle(platform.key, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={platform.key}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        {platform.icon}
                        <span>{platform.name}</span>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Conectado
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plataformas Não Conectadas */}
          {disconnectedPlatforms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                  Plataformas Não Conectadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {disconnectedPlatforms.map((platform) => (
                    <div key={platform.key} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {platform.icon}
                        <span className="text-muted-foreground">{platform.name}</span>
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          Não Conectado
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        Conectar
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Configure as conexões na aba "Redes Sociais" para publicar nessas plataformas.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3">
            <Button onClick={onClose} variant="outline">
              Cancelar
            </Button>
            <Button
              onClick={handlePublish}
              disabled={publishMutation.isPending || Object.values(selectedPlatforms).filter(Boolean).length === 0}
            >
              {publishMutation.isPending ? "Publicando..." : "Publicar Agora"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
