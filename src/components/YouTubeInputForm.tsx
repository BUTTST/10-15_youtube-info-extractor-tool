import { useVideoStore } from "@/hooks/useVideoStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function YouTubeInputForm() {
  const { urlInput, setUrlInput, fetchVideoInfo, isLoading, clearCurrentVideo, currentVideo } = useVideoStore();

  const handleBlur = () => {
    // Only fetch if there's a URL and it's different from the current one
    if (urlInput && urlInput !== currentVideo?.details.url) {
      fetchVideoInfo(urlInput);
    }
  };
  
  const handleClear = () => {
    clearCurrentVideo();
  }

  return (
    <div className="flex w-full items-center space-x-2">
      <Input
        type="url"
        placeholder="貼上 YouTube 影片連結..."
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
        onBlur={handleBlur}
        disabled={isLoading}
      />
      <Button onClick={handleClear} variant="outline" disabled={isLoading || !currentVideo}>
        清除
      </Button>
    </div>
  );
}
