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
        set({ isLoading: true, error: null });
        
        const apiKey = getApiKey(); // Get key from local storage
        const headers = apiKey ? { 'x-rapidapi-key-client': apiKey } : {};

        try {
          const infoRes = await fetch(`/api/getVideoInfo?url=${encodeURIComponent(url)}`, { headers });
          if (!infoRes.ok) throw new Error('Failed to get video details');
          const infoData = await infoRes.json();
          
          const details: VideoDetails = {
            id: infoData.id,
            title: infoData.title,
            thumbnail: infoData.thumbnails[infoData.thumbnails.length - 1].url,
            views: infoData.viewCount,
            publishDate: infoData.publishedAt,
            author: infoData.author,
            url: url
          };

          // Now fetch available captions list
          const captionsRes = await fetch(`/api/getCaptions?videoId=${details.id}`, { headers });
          if (!captionsRes.ok) {
            console.warn("Could not fetch caption list, proceeding without it.");
          }
          const captionsData = await captionsRes.json();
          const captionTracks: CaptionTrack[] = captionsData?.actions?.[0]?.updateengagementpanelaction?.content?.transcriptrenderer?.content?.transcriptsearchpanelrenderer?.footer?.transcriptsubmenurenderer?.items?.map((item: any) => ({
            lang: item.transcriptsubmenuitemrenderer.title.simpletext,
            url: item.transcriptsubmenuitemrenderer.continuation.reloadcontinuationdata.continuation // This is a simplification
          })) || [];


          const newHistoryItem: HistoryItem = {
            id: details.id,
            details,
            captions: captionTracks,
            queriedAt: new Date().toISOString(),
          };

          set({ currentVideo: newHistoryItem });
          get().addOrUpdateHistory(newHistoryItem);

        } catch (err: any) {
          set({ error: err.message || 'An unknown error occurred' });
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