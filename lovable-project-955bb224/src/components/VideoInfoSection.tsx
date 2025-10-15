import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Eye, Calendar, ThumbsUp, User, Hash, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveToHistory } from "@/lib/storage";
import { useApiKey } from "@/components/ApiKeyManager";

interface VideoInfoSectionProps {
  videoId: string | null;
  url: string;
}

const VideoInfoSection = ({ videoId, url }: VideoInfoSectionProps) => {
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string>("");
  const [translating, setTranslating] = useState(false);
  const { toast } = useToast();
  const { apiKey } = useApiKey();

  const fetchVideoInfo = async () => {
    if (!videoId) {
      toast({
        title: "錯誤",
        description: "請先輸入有效的 YouTube 連結",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "錯誤",
        description: "請先在設定頁面輸入 RapidAPI 金鑰",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://youtube-v3-alternative.p.rapidapi.com/video?id=${videoId}`,
        {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'youtube-v3-alternative.p.rapidapi.com'
          }
        }
      );

      if (!response.ok) throw new Error('API 請求失敗');

      const data = await response.json();
      setVideoInfo(data);
      
      // 自動翻譯標題
      if (data.title) {
        translateTitle(data.title);
      }

      saveToHistory({
        type: 'info',
        videoId,
        url,
        data,
        timestamp: Date.now(),
      });

      toast({
        title: "成功",
        description: "影片資訊已獲取",
      });
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法獲取影片資訊，請檢查 API 金鑰",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const translateTitle = async (title: string) => {
    setTranslating(true);
    try {
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=zh-TW&dt=t&q=${encodeURIComponent(title)}`
      );
      const data = await response.json();
      const translated = data[0][0][0];
      setTranslatedTitle(translated);
    } catch (error) {
      console.error('翻譯失敗:', error);
      setTranslatedTitle('');
    } finally {
      setTranslating(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <Button
        onClick={fetchVideoInfo}
        disabled={loading || !videoId}
        className="gradient-primary border-0 w-full sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            獲取中...
          </>
        ) : (
          "獲取影片詳情"
        )}
      </Button>

      {videoInfo && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-3">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{videoInfo.title}</h3>
              {translatedTitle && translatedTitle !== videoInfo.title && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50">
                  <Languages className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {translating ? '翻譯中...' : translatedTitle}
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Hash className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">影片 ID</p>
                  <p className="font-medium font-mono text-sm">{videoInfo.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <User className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">頻道</p>
                  <p className="font-medium">{videoInfo.channelTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">發布日期</p>
                  <p className="font-medium">
                    {videoInfo.publishDate ? formatDate(videoInfo.publishDate) : '未知'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Eye className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">觀看次數</p>
                  <p className="font-medium">
                    {videoInfo.viewCount ? formatNumber(videoInfo.viewCount) : '未知'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <ThumbsUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">按讚數</p>
                  <p className="font-medium">
                    {videoInfo.likeCount !== undefined ? formatNumber(Number(videoInfo.likeCount)) : '未提供'}
                  </p>
                </div>
              </div>
            </div>

            {videoInfo.description && (
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-2">影片描述</p>
                <p className="text-sm whitespace-pre-wrap line-clamp-6">
                  {videoInfo.description}
                </p>
              </div>
            )}
          </div>
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

export default VideoInfoSection;
