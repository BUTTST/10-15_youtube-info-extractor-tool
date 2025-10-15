import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveToHistory } from "@/lib/storage";

interface ThumbnailSectionProps {
  videoId: string | null;
  url: string;
}

const ThumbnailSection = ({ videoId, url }: ThumbnailSectionProps) => {
  const [quality, setQuality] = useState("maxresdefault");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (videoId) {
      const newUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
      setThumbnailUrl(newUrl);
      
      saveToHistory({
        type: 'thumbnail',
        videoId,
        url,
        data: { thumbnailUrl: newUrl, quality },
        timestamp: Date.now(),
      });
    }
  }, [videoId, quality, url]);

  const downloadThumbnail = async () => {
    if (!thumbnailUrl) return;

    try {
      const response = await fetch(thumbnailUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thumbnail_${videoId}_${quality}.jpg`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "下載成功",
        description: "縮圖已下載",
      });
    } catch (error) {
      toast({
        title: "下載失敗",
        description: "無法下載縮圖",
        variant: "destructive",
      });
    }
  };

  const openInNewTab = () => {
    if (thumbnailUrl) {
      window.open(thumbnailUrl, '_blank');
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={quality} onValueChange={setQuality}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="選擇畫質" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="maxresdefault">最高解析度</SelectItem>
            <SelectItem value="hq720">1080p</SelectItem>
            <SelectItem value="sddefault">720p</SelectItem>
            <SelectItem value="hqdefault">480p</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button
            onClick={downloadThumbnail}
            disabled={!videoId}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            下載
          </Button>
          <Button
            onClick={openInNewTab}
            disabled={!videoId}
            variant="outline"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            開啟
          </Button>
        </div>
      </div>

      {videoId && thumbnailUrl && (
        <div className="animate-fade-in">
          <div className="relative rounded-lg overflow-hidden border">
            <img
              src={thumbnailUrl}
              alt="YouTube 縮圖"
              className="w-full h-auto"
              onError={(e) => {
                toast({
                  title: "載入失敗",
                  description: "此畫質的縮圖可能不存在，請嘗試其他畫質",
                  variant: "destructive",
                });
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {thumbnailUrl}
          </p>
        </div>
      )}

      {!videoId && (
        <div className="text-center py-8 text-muted-foreground">
          請先輸入 YouTube 影片連結
        </div>
      )}
    </Card>
  );
};

export default ThumbnailSection;
