import { YouTubeInputForm } from "@/components/YouTubeInputForm";
import { VideoInfoSection, ThumbnailSection } from "@/components/VideoInfoSection";
import { CaptionSection } from "@/components/CaptionSection";
import { HistorySection } from "@/components/HistorySection";
import { useVideoStore } from "@/hooks/useVideoStore";

const Index = () => {
  const { error } = useVideoStore();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="text-center my-8">
        <h1 className="text-4xl font-bold">YT 共享快捷資訊</h1>
        <p className="text-muted-foreground mt-2">
          快速獲取 YouTube 影片的縮圖、詳情與字幕。
        </p>
      </header>

      <main className="space-y-6">
        <YouTubeInputForm />
        {error && <p className="text-red-500 text-center">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ThumbnailSection />
            <HistorySection />
          </div>
          <div className="space-y-6">
            <VideoInfoSection />
            <CaptionSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
