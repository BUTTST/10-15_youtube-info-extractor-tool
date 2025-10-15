import { useVideoStore } from "@/hooks/useVideoStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function VideoInfoSection() {
  const { currentVideo, isLoading } = useVideoStore();

  if (isLoading && !currentVideo) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </CardContent>
      </Card>
    );
  }

  if (!currentVideo) {
    return <p className="text-center text-muted-foreground">請貼上 YouTube 連結以開始。</p>;
  }

  const { details } = currentVideo;
  
  const formatViews = (views: string) => {
    return new Intl.NumberFormat().format(Number(views));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{details.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{details.author}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
          <span>觀看次數: {formatViews(details.views)}</span>
          <span>發布日期: {new Date(details.publishDate).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function ThumbnailSection() {
    const { currentVideo, isLoading } = useVideoStore();

    if (isLoading && !currentVideo) {
        return <Skeleton className="aspect-video w-full rounded-lg" />;
    }

    if (!currentVideo) {
        return null;
    }

    return (
        <img
            src={currentVideo.details.thumbnail}
            alt={currentVideo.details.title}
            className="aspect-video w-full rounded-lg object-cover"
        />
    );
}
