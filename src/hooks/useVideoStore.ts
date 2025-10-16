import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getApiKey } from '@/lib/storage';

// --- Type Definitions ---
export interface VideoDetails {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  publishDate: string;
  author: string;
  url: string; 
}

export interface CaptionTrack {
  lang: string;
  url: string; 
}

export interface HistoryItem {
  id: string;
  details: VideoDetails;
  captions?: CaptionTrack[];
  formattedCaptions?: { [lang: string]: string };
  queriedAt: string;
}

interface VideoState {
  // State
  urlInput: string;
  isLoading: boolean;
  error: string | null;
  currentVideo: HistoryItem | null;
  history: HistoryItem[];

  // Actions
  setUrlInput: (url: string) => void;
  fetchVideoInfo: (url: string) => Promise<void>;
  fetchFormattedCaption: (videoId: string, lang: string, withTimestamp: boolean) => Promise<string>;
  clearCurrentVideo: () => void;
  
  // History Actions
  addOrUpdateHistory: (item: HistoryItem) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;
}

// --- Zustand Store ---
export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      urlInput: '',
      isLoading: false,
      error: null,
      currentVideo: null,
      history: [],

      // --- Actions ---
      setUrlInput: (url) => set({ urlInput: url }),

      fetchVideoInfo: async (url) => {
        if (!url) return;
        set({ isLoading: true, error: null, currentVideo: null });
        
        const apiKey = getApiKey();
        const headers = apiKey ? { 'x-rapidapi-key-client': apiKey } : {};

        try {
          // 獲取影片資訊
          const infoRes = await fetch(`/api/getVideoInfo?url=${encodeURIComponent(url)}`, { headers });
          
          if (!infoRes.ok) {
            const errorData = await infoRes.json().catch(() => ({ error: 'Network error' }));
            throw new Error(errorData.error || 'Failed to fetch video details');
          }
          
          const infoData = await infoRes.json();
          
          // 提取最高畫質的縮圖
          let thumbnail = '';
          if (infoData.thumbnails && Array.isArray(infoData.thumbnails) && infoData.thumbnails.length > 0) {
            // 獲取最後一個（最高解析度）的縮圖
            thumbnail = infoData.thumbnails[infoData.thumbnails.length - 1].url;
          }
          
          const details: VideoDetails = {
            id: infoData.id,
            title: infoData.title || 'Unknown Title',
            thumbnail: thumbnail,
            views: infoData.viewCount || '0',
            publishDate: infoData.publishedAt || new Date().toISOString(),
            author: infoData.author || 'Unknown Author',
            url: url
          };

          // 獲取字幕列表
          let captionTracks: CaptionTrack[] = [];
          try {
            const captionsRes = await fetch(`/api/getCaptions?videoId=${details.id}`, { headers });
            if (captionsRes.ok) {
              const captionsData = await captionsRes.json();
              
              // 解析字幕軌道
              const items = captionsData?.actions?.[0]?.updateengagementpanelaction?.content?.transcriptrenderer?.content?.transcriptsearchpanelrenderer?.footer?.transcriptsubmenurenderer?.items;
              
              if (items && Array.isArray(items)) {
                captionTracks = items.map((item: any) => ({
                  lang: item.transcriptsubmenuitemrenderer?.title?.simpletext || 'Unknown',
                  url: item.transcriptsubmenuitemrenderer?.continuation?.reloadcontinuationdata?.continuation || ''
                }));
              }
            }
          } catch (captionError) {
            console.warn('Failed to fetch captions:', captionError);
            // 繼續執行，只是沒有字幕
          }

          const newHistoryItem: HistoryItem = {
            id: details.id,
            details,
            captions: captionTracks,
            queriedAt: new Date().toISOString(),
          };

          set({ currentVideo: newHistoryItem, error: null });
          get().addOrUpdateHistory(newHistoryItem);

        } catch (err: any) {
          console.error('Fetch video info error:', err);
          set({ 
            error: err.message || '無法獲取影片資訊，請檢查網址或稍後再試',
            currentVideo: null
          });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchFormattedCaption: async (videoId, lang, withTimestamp) => {
        set({ isLoading: true });
        
        const apiKey = getApiKey(); // Get key from local storage
        const headers = apiKey ? { 'x-rapidapi-key-client': apiKey } : {};

        try {
            const res = await fetch(`/api/getCaptions?videoId=${videoId}&lang=${lang}&format=formatted&timestamp=${withTimestamp}`);
            if (!res.ok) throw new Error('Failed to fetch formatted caption');
            const text = await res.text();
            
            // The original code had a template literal here, but it was not closed.
            // Assuming the intent was to parse the JSON response or handle the text.
            // For now, we'll just return the text as a placeholder.
            // In a real scenario, you'd parse the JSON or handle the text appropriately.
            return text;
        } catch (err: any) {
          set({ error: err.message || 'An unknown error occurred' });
          return ''; // Return empty string on error
        } finally {
          set({ isLoading: false });
        }
      },
      clearCurrentVideo: () => set({ currentVideo: null }),
      
      // History Actions
      addOrUpdateHistory: (item) => set(state => ({
        history: state.history.some(h => h.id === item.id)
          ? state.history.map(h => h.id === item.id ? item : h)
          : [...state.history, item]
      })),
      removeFromHistory: (id) => set(state => ({
        history: state.history.filter(h => h.id !== id)
      })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'yt-video-history', // local storage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);