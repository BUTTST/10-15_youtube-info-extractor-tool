import { useVideoStore } from "@/hooks/useVideoStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";
import { useState } from "react";

export function YouTubeInputForm() {
  const { urlInput, setUrlInput, fetchVideoInfo, isLoading, clearCurrentVideo, currentVideo } = useVideoStore();
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput && urlInput !== currentVideo?.details.url) {
      fetchVideoInfo(urlInput);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Only fetch if there's a URL and it's different from the current one
    if (urlInput && urlInput !== currentVideo?.details.url) {
      fetchVideoInfo(urlInput);
    }
  };
  
  const handleClear = () => {
    clearCurrentVideo();
    setUrlInput('');
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative group">
        <div className={`absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl blur-lg opacity-0 transition-opacity duration-300 ${isFocused ? 'opacity-30' : 'group-hover:opacity-20'}`}></div>
        
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${isFocused ? 'text-primary' : 'text-muted-foreground'}`} />
            <Input
              type="url"
              placeholder="貼上 YouTube 影片連結或 ID..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              disabled={isLoading}
              className="pl-12 pr-12 h-14 text-lg border-2 focus:border-primary transition-all duration-300 rounded-xl bg-background/50"
            />
            {urlInput && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !urlInput}
            className="h-14 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                分析中
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                提取
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span>💡 提示：</span>
        <span>支援完整連結、短連結或影片 ID</span>
      </div>
    </form>
  );
}
