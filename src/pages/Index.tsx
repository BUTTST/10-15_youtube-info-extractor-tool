import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Sun, Youtube, FileText, Info, History as HistoryIcon, Sparkles, Search, X, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CaptionSection } from "@/components/CaptionSection";
import { VideoInfoSection } from "@/components/VideoInfoSection";
import { HistorySection } from "@/components/HistorySection";
import { useVideoStore, HistoryItem } from "@/hooks/useVideoStore";

const Index = () => {
  const { urlInput, setUrlInput, fetchVideoInfo, isLoading, clearCurrentVideo, currentVideo, error } = useVideoStore();
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [mounted, setMounted] = useState(false);
  const [showRestoreNotification, setShowRestoreNotification] = useState(false);
  const [restoredItem, setRestoredItem] = useState<HistoryItem | null>(null);
  const { toast } = useToast();
  const processedShareRef = useRef<string | null>(null);

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

  // 處理分享目標 API - 立即響應，無延遲
  useEffect(() => {
    const processShare = () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      // 嘗試多種參數名稱（url, text, title）
      const sharedUrl = urlParams.get('url') || 
                        urlParams.get('text') || 
                        urlParams.get('title');
      
      // 檢查是否已經處理過這個分享（避免重複處理）
      if (sharedUrl && processedShareRef.current !== sharedUrl) {
        processedShareRef.current = sharedUrl;
        
        // 立即覆蓋舊網址，不檢查當前是否有內容
        setUrlInput(sharedUrl);
        
        // 立即開始提取，不等待任何延遲
        fetchVideoInfo(sharedUrl).then(() => {
          toast({
            title: "✅ 已接收分享",
            description: "正在自動提取影片資訊...",
            duration: 2000,
          });
        }).catch(() => {
          toast({
            title: "❌ 提取失敗",
            description: "無法獲取影片資訊",
            variant: "destructive",
          });
        });
        
        // 立即清除 URL 參數避免重複觸發
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    // 立即執行一次
    processShare();

    // 監聽 URL 變化（處理應用已打開時的情況）
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        processShare();
      }
    };

    // 監聽頁面可見性變化（PWA 切換回來時）
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 監聽 focus 事件（應用獲得焦點時）
    window.addEventListener('focus', processShare);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', processShare);
    };
  }, [setUrlInput, fetchVideoInfo, toast]);

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

  const handleRestore = (item: HistoryItem) => {
    // 跳轉至字幕頁面
    setActiveTab("caption");
    
    // 顯示恢復通知
    setRestoredItem(item);
    setShowRestoreNotification(true);
    
    // 300ms 後開始淡出，500ms 後完全隱藏
    setTimeout(() => {
      setShowRestoreNotification(false);
    }, 3000);
    
    setTimeout(() => {
      setRestoredItem(null);
    }, 3500);
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
            <TabsList className="grid w-full grid-cols-3 h-auto p-1 glass-effect">
              <TabsTrigger value="info" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">影片詳情</span>
              </TabsTrigger>
              <TabsTrigger value="caption" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">字幕</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <HistoryIcon className="w-4 h-4" />
                <span className="hidden sm:inline">歷史</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6 animate-fade-in">
              <VideoInfoSection />
            </TabsContent>

            <TabsContent value="caption" className="mt-6 animate-fade-in">
              <CaptionSection />
            </TabsContent>

            <TabsContent value="history" className="mt-6 animate-fade-in">
              <HistorySection onRestore={handleRestore} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* 恢復通知 */}
      {restoredItem && (
        <div 
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] transition-all duration-500 ${
            showRestoreNotification 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <Card className="glass-effect border-primary/50 shadow-2xl max-w-md w-[90vw] md:w-[500px]">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">✅ 成功復原</h3>
                  <p className="text-sm text-muted-foreground">已跳轉至字幕頁面</p>
                </div>
              </div>
              
              {/* 完整橫條展示 */}
              <div className="flex items-start gap-3 p-3 rounded-lg border border-primary/30 bg-secondary/30">
                <img
                  src={restoredItem.details.thumbnail}
                  alt={restoredItem.details.title}
                  className="h-16 w-24 object-cover rounded-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2 mb-1">
                    {restoredItem.details.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {restoredItem.details.author}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

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
