import { useState } from "react";
import { useVideoStore } from "@/hooks/useVideoStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, User, ExternalLink, Info, Image as ImageIcon, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function VideoInfoSection() {
  const { currentVideo, isLoading } = useVideoStore();
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  if (isLoading && !currentVideo) {
    return (
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (!currentVideo) {
    return (
      <Card className="glass-effect border-primary/20">
        <CardContent className="py-16">
          <div className="text-center text-muted-foreground space-y-4">
            <Info className="w-16 h-16 mx-auto opacity-30" />
            <div>
              <p className="text-lg font-medium">尚未載入影片</p>
              <p className="text-sm mt-2">請在上方輸入 YouTube 連結並點擊「提取」</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { details } = currentVideo;
  
  const formatViews = (views: string) => {
    const num = Number(views);
    if (isNaN(num)) {
      return '無觀看數據';
    }
    if (num === 0) {
      return '0 次觀看';
    }
    if (num >= 100000000) {
      // 1亿以上显示"亿"
      return (num / 100000000).toFixed(1) + '億';
    }
    if (num >= 10000) {
      // 1万以上显示"万"
      return (num / 10000).toFixed(1) + '萬';
    }
    return num.toLocaleString('zh-TW');
  }

  const formatFullNumber = (views: string) => {
    const num = Number(views);
    if (isNaN(num)) {
      return '資料不可用';
    }
    if (num === 0) {
      return '0';
    }
    return num.toLocaleString('zh-TW');
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // 清理文件名中的無效字符
  const sanitizeFileName = (fileName: string): string => {
    return fileName
      .replace(/[<>:"/\\|?*]/g, '') // 移除無效字符
      .replace(/\s+/g, '_') // 空格替換為底線
      .substring(0, 100); // 限制長度
  }

  const handleDownloadMP3 = async () => {
    if (!currentVideo || !details.id) {
      toast({
        title: "下載失敗",
        description: "影片資訊不可用",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      // 輪詢檢查處理狀態
      const pollStatus = async (): Promise<string> => {
        const maxAttempts = 60; // 最多嘗試 60 次（約 5 分鐘）
        const pollInterval = 5000; // 每 5 秒檢查一次
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const response = await fetch(`/api/downloadMP3?id=${details.id}`);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || '下載失敗');
          }

          const contentType = response.headers.get('content-type');
          
          // 如果是音頻文件流（直接下載）
          if (contentType && contentType.includes('audio/')) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${sanitizeFileName(details.title)}.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return 'success';
          }
          
          // 如果是 JSON 響應
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            
            // 檢查狀態
            if (data.status === 'ok' || data.status === 'ready' || data.status === 'success') {
              const downloadUrl = data.link || data.downloadUrl || data.url;
              
              if (downloadUrl && downloadUrl.trim() !== '') {
                // 創建臨時鏈接並觸發下載
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `${sanitizeFileName(details.title)}.mp3`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return 'success';
              }
            }
            
            // 如果還在處理中，繼續輪詢
            if (data.status === 'processing' || data.status === 'in process') {
              const progress = data.progress || 0;
              // 更新 toast 顯示進度（可選）
              if (attempt % 6 === 0) { // 每 30 秒更新一次提示
                toast({
                  title: "處理中...",
                  description: `轉換進度：${progress}%`,
                });
              }
              
              // 等待後繼續輪詢
              await new Promise(resolve => setTimeout(resolve, pollInterval));
              continue;
            }
            
            // 如果狀態是錯誤
            if (data.status === 'error' || data.status === 'failed') {
              throw new Error(data.msg || data.message || '轉換失敗');
            }
          }
          
          // 其他情況，等待後繼續
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        
        // 超過最大嘗試次數
        throw new Error('處理超時，請稍後再試');
      };

      await pollStatus();
      
      toast({
        title: "下載成功",
        description: "MP3 檔案下載已開始",
      });
      
    } catch (error: any) {
      console.error('Download MP3 error:', error);
      toast({
        title: "下載失敗",
        description: error.message || "無法下載 MP3，請稍後再試",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <Card className="glass-effect border-primary/20 overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-2xl font-bold line-clamp-2 flex-1">
            {details.title}
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0"
            onClick={() => window.open(details.url, '_blank')}
          >
            <ExternalLink className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {/* 主要內容區：桌面版左右排列，手機版上下排列 */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左側：影片詳情 (手機版在上) */}
          <div className="flex-1 space-y-4 order-1">
            <div className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">{details.author}</span>
            </div>

            {/* 觀看次數與發佈日期：改為上下排列 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-secondary/50 p-3 rounded-lg">
                <Eye className="w-5 h-5 text-accent" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">觀看次數</p>
                  <p className="text-lg font-bold text-foreground">{formatViews(details.views)}</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    完整數字：{formatFullNumber(details.views)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-secondary/50 p-3 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">發布日期</p>
                  <p className="text-sm font-semibold text-foreground">{formatDate(details.publishDate)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                影片 ID: {details.id}
              </Badge>
              <Button
                onClick={handleDownloadMP3}
                disabled={isDownloading}
                variant="default"
                className="gap-2"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    下載中...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    下載MP3
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 右側：縮圖 (手機版在下) */}
          <div className="lg:w-[320px] order-2">
            <div className="relative rounded-lg overflow-hidden border border-primary/20 group/thumbnail hover:border-primary/40 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300 z-10"></div>
              <img
                src={details.thumbnail}
                alt={details.title}
                className="w-full h-auto object-cover transform group-hover/thumbnail:scale-105 transition-transform duration-500"
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent z-20 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300">
                <p className="text-white font-medium text-xs line-clamp-2">
                  {details.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ThumbnailSection() {
    const { currentVideo, isLoading } = useVideoStore();

    if (isLoading && !currentVideo) {
        return (
          <Card className="glass-effect border-primary/20">
            <CardContent className="p-0">
              <Skeleton className="aspect-video w-full rounded-t-xl" />
            </CardContent>
          </Card>
        );
    }

    if (!currentVideo) {
        return (
          <Card className="glass-effect border-primary/20">
            <CardContent className="py-24">
              <div className="text-center text-muted-foreground space-y-4">
                <ImageIcon className="w-20 h-20 mx-auto opacity-30" />
                <div>
                  <p className="text-lg font-medium">尚無縮圖</p>
                  <p className="text-sm mt-2">請先載入 YouTube 影片</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }

    return (
        <Card className="glass-effect border-primary/20 overflow-hidden group hover:shadow-xl transition-all duration-300">
          <CardContent className="p-0 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <img
                src={currentVideo.details.thumbnail}
                alt={currentVideo.details.title}
                className="aspect-video w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
              <p className="text-white font-medium text-sm line-clamp-2">
                {currentVideo.details.title}
              </p>
            </div>
          </CardContent>
        </Card>
    );
}
