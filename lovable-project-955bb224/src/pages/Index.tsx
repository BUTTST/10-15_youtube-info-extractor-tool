import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, Youtube, FileText, Image as ImageIcon, Info, History, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CaptionSection from "@/components/CaptionSection";
import ThumbnailSection from "@/components/ThumbnailSection";
import VideoInfoSection from "@/components/VideoInfoSection";
import HistorySection from "@/components/HistorySection";
import ApiKeyManager, { useApiKey } from "@/components/ApiKeyManager";

const Index = () => {
  const [url, setUrl] = useState("");
  const [isDark, setIsDark] = useState(true);
  const { toast } = useToast();
  const { defaultTab } = useApiKey();
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    // 設置預設暗色主題
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    // 處理分享目標 API
    if ('serviceWorker' in navigator && 'share' in navigator) {
      const handleShare = async () => {
        try {
          const data = await (navigator as any).getTargetShare?.();
          if (data?.url) {
            setUrl(data.url);
            toast({
              title: "已接收分享",
              description: "YouTube 連結已自動填入",
            });
          }
        } catch (err) {
          console.log("分享處理錯誤:", err);
        }
      };
      handleShare();
    }
  }, [toast]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const extractVideoId = (urlString: string) => {
    try {
      const url = new URL(urlString);
      if (url.hostname.includes('youtube.com')) {
        return url.searchParams.get('v');
      } else if (url.hostname.includes('youtu.be')) {
        return url.pathname.slice(1);
      }
    } catch {
      return null;
    }
    return null;
  };

  const videoId = extractVideoId(url);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold gradient-text">YT 工具箱</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-secondary"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6 animate-fade-in">
          {/* URL Input Section */}
          <Card className="p-6 glass-effect">
            <div className="space-y-4">
              <label className="text-sm font-medium">YouTube 影片連結</label>
              <div className="flex gap-3">
                <Input
                  placeholder="貼上 YouTube 連結或從分享功能導入..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                {url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUrl("")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {videoId && (
                <div className="mt-4 p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">
                    影片 ID: <span className="font-mono text-foreground">{videoId}</span>
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Function Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-secondary/50">
              <TabsTrigger value="caption" className="flex items-center gap-2 py-3">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">字幕</span>
              </TabsTrigger>
              <TabsTrigger value="thumbnail" className="flex items-center gap-2 py-3">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">縮圖</span>
              </TabsTrigger>
              <TabsTrigger value="info" className="flex items-center gap-2 py-3">
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">詳情</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 py-3">
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">歷史</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 py-3">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">設定</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="caption" className="mt-6">
              <CaptionSection videoId={videoId} url={url} />
            </TabsContent>

            <TabsContent value="thumbnail" className="mt-6">
              <ThumbnailSection videoId={videoId} url={url} />
            </TabsContent>

            <TabsContent value="info" className="mt-6">
              <VideoInfoSection videoId={videoId} url={url} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <HistorySection />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <ApiKeyManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            YouTube 工具箱 - 快速獲取字幕、縮圖與影片資訊
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
