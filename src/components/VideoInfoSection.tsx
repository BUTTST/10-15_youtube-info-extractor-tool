import { useVideoStore } from "@/hooks/useVideoStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, User, ExternalLink, Info, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VideoInfoSection() {
  const { currentVideo, isLoading } = useVideoStore();

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
    return Number(views).toLocaleString('zh-TW');
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
      <CardContent className="relative space-y-4">
        <div className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">{details.author}</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 bg-secondary/50 p-3 rounded-lg relative">
            <Eye className="w-5 h-5 text-accent" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">觀看次數</p>
              <p className="text-lg font-bold text-foreground">{formatViews(details.views)}</p>
            </div>
            <div className="absolute bottom-1 right-2 text-[18px] text-muted-foreground/45">
              完整數字：{formatFullNumber(details.views)}
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

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
            影片 ID: {details.id}
          </Badge>
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
