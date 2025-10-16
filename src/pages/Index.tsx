import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, Youtube, FileText, Image as ImageIcon, Info, History as HistoryIcon, Settings, Sparkles, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CaptionSection } from "@/components/CaptionSection";
import { ThumbnailSection } from "@/components/VideoInfoSection";
import { VideoInfoSection } from "@/components/VideoInfoSection";
import { HistorySection } from "@/components/HistorySection";
import ApiKeyManager from "@/components/ApiKeyManager";
import { useVideoStore } from "@/hooks/useVideoStore";

const Index = () => {
  const { urlInput, setUrlInput, fetchVideoInfo, isLoading, clearCurrentVideo, currentVideo, error } = useVideoStore();
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 設置預設暗色主題
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    // 處理分享目標 API（只在首次載入時執行）
    const urlParams = new URLSearchParams(window.location.search);
    const sharedUrl = urlParams.get('url');
    if (sharedUrl && !urlInput) {
      setUrlInput(sharedUrl);
      fetchVideoInfo(sharedUrl);
      toast({
        title: "已接收分享",
        description: "YouTube 連結已自動填入",
      });
      // 清除 URL 參數避免重複觸發
      window.history.replaceState({}, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在組件掛載時執行一次

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput) {
      fetchVideoInfo(urlInput);
    }
  };

  const handleClear = () => {
    setUrlInput("");
    clearCurrentVideo();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-effect border-b relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <Sparkles className="w-4 h-4 text-accent absolute -top-1 -right-1 animate-bounce" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                YouTube 工具箱
              </h1>
              <p className="text-xs text-muted-foreground">快速提取影片資訊</p>
            </div>
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
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <div className={`space-y-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* URL Input Section */}
          <Card className="p-6 glass-effect border-primary/20">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <Youtube className="w-4 h-4 text-primary" />
                YouTube 影片連結
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="貼上 YouTube 連結、短連結或影片 ID..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={isLoading}
                    className="pl-10 pr-10 h-12 border-2 focus:border-primary"
                  />
                  {urlInput && !isLoading && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !urlInput}
                  className="h-12 px-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isLoading ? "分析中..." : "提取"}
                </Button>
              </div>
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              {currentVideo && (
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">
                    影片 ID: <span className="font-mono text-foreground">{currentVideo.id}</span>
                  </p>
                </div>
              )}
            </form>
          </Card>

          {/* Function Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-auto p-1 glass-effect">
              <TabsTrigger value="info" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">影片詳情</span>
              </TabsTrigger>
              <TabsTrigger value="thumbnail" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">縮圖</span>
              </TabsTrigger>
              <TabsTrigger value="caption" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">字幕</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <HistoryIcon className="w-4 h-4" />
                <span className="hidden sm:inline">歷史</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">設定</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6 animate-fade-in">
              <VideoInfoSection />
            </TabsContent>

            <TabsContent value="thumbnail" className="mt-6 animate-fade-in">
              <ThumbnailSection />
            </TabsContent>

            <TabsContent value="caption" className="mt-6 animate-fade-in">
              <CaptionSection />
            </TabsContent>

            <TabsContent value="history" className="mt-6 animate-fade-in">
              <HistorySection />
            </TabsContent>

            <TabsContent value="settings" className="mt-6 animate-fade-in">
              <ApiKeyManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 py-8 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            YouTube 工具箱 - 使用 RapidAPI 提供的 YouTube API 服務
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
