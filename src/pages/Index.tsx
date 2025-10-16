import { YouTubeInputForm } from "@/components/YouTubeInputForm";
import { VideoInfoSection, ThumbnailSection } from "@/components/VideoInfoSection";
import { CaptionSection } from "@/components/CaptionSection";
import { HistorySection } from "@/components/HistorySection";
import { useVideoStore } from "@/hooks/useVideoStore";
import { Youtube, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const { error } = useVideoStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className={`text-center mb-12 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <Youtube className="w-16 h-16 text-primary animate-pulse" />
              <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2 animate-bounce" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-300%">
            YouTube 資訊提取器
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            快速獲取影片詳情、高清縮圖與完整字幕 ✨
          </p>
        </header>

        {/* Main Content */}
        <main className={`space-y-8 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Input Section with Glass Effect */}
          <div className="glass-effect rounded-2xl p-6 shadow-xl">
            <YouTubeInputForm />
            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
                <p className="text-destructive font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Thumbnail & Video Info */}
            <div className="xl:col-span-2 space-y-6">
              <ThumbnailSection />
              <VideoInfoSection />
            </div>

            {/* Right Column - Captions & History */}
            <div className="xl:col-span-1 space-y-6">
              <CaptionSection />
              <HistorySection />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 text-sm text-muted-foreground">
          <p>使用 RapidAPI 提供的 YouTube API 服務</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
