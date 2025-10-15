import { useEffect } from "react";
import { ThemeToggle } from "./components/ThemeToggle";
import { useVideoStore } from "./store/useVideoStore";
import { YouTubeInputForm } from "./components/YouTubeInputForm";
import { VideoDetailsCard } from "./components/VideoDetailsCard";
import { CaptionsDisplay } from "./components/CaptionsDisplay";
import { HistoryPage } from "./components/HistoryPage";

function App() {
  const { isLoading, error, videoDetails, setUrl, fetchVideoInfo, page, setPage } = useVideoStore();

  // Effect to handle shared URL when PWA is launched
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url');
    if (sharedUrl) {
      setUrl(sharedUrl);
      fetchVideoInfo();
    }
  }, [setUrl, fetchVideoInfo]);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex flex-col">
      <header className="p-4 shadow-md bg-white dark:bg-gray-800 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            YT 共享快捷資訊
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(page === 'main' ? 'history' : 'main')}
              className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-sm"
            >
              {page === 'main' ? '查看歷史' : '返回主頁'}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">
        {page === 'main' ? (
          <>
            <YouTubeInputForm />
            
            {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
            
            {isLoading && !videoDetails && (
              <div className="mt-4 text-center">載入中，請稍候...</div>
            )}

            {videoDetails && (
              <>
                <VideoDetailsCard />
                <CaptionsDisplay />
              </>
            )}
          </>
        ) : (
          <HistoryPage />
        )}
      </main>

      <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        © 2025 YT PWA Tool. All Rights Reserved.
      </footer>
    </div>
  )
}

export default App
