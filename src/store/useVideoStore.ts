import { create } from 'zustand';

// Define the structure of video details and captions
interface VideoDetails {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  publishDate: string;
  author: string;
}

interface CaptionData {
  // Define based on the actual API response structure
  items: any[]; 
}

// Define the state structure
interface VideoState {
  url: string;
  isLoading: boolean;
  error: string | null;
  videoDetails: VideoDetails | null;
  captions: CaptionData | null;
  history: HistoryItem[];
  page: 'main' | 'history';
  setUrl: (url: string) => void;
  fetchVideoInfo: () => Promise<void>;
  addHistoryItem: (item: HistoryItem) => void;
  removeHistoryItem: (id: string) => void;
  clearHistory: () => void;
  setPage: (page: 'main' | 'history') => void;
}

export interface HistoryItem extends VideoDetails {
  url: string;
  queriedAt: string;
}

const getInitialHistory = (): HistoryItem[] => {
  try {
    const item = window.localStorage.getItem('yt-history');
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};


export const useVideoStore = create<VideoState>((set, get) => ({
  // Initial state
  url: '',
  isLoading: false,
  error: null,
  videoDetails: null,
  captions: null,
  history: getInitialHistory(),
  page: 'main',

  // Action to set the URL from the input
  setUrl: (url: string) => set({ url }),

  // Action to fetch all video information
  fetchVideoInfo: async () => {
    const { url } = get();
    if (!url) return;

    set({ isLoading: true, error: null, videoDetails: null, captions: null });

    try {
      // Fetch video details
      const detailsRes = await fetch(`/api/getVideoInfo?url=${encodeURIComponent(url)}`);
      if (!detailsRes.ok) {
        const errorData = await detailsRes.json();
        throw new Error(errorData.error || 'Failed to get video details');
      }
      const details: VideoDetails = await detailsRes.json();
      set({ videoDetails: details });

      // Add to history
      const newHistoryItem: HistoryItem = { 
        ...details,
        url: url,
        queriedAt: new Date().toISOString() 
      };
      get().addHistoryItem(newHistoryItem);

      // Fetch captions using the video ID from the details
      const captionsRes = await fetch(`/api/getCaptions?videoId=${details.id}`);
      if (!captionsRes.ok) {
        // This is a soft fail, we still show video details
        console.error('Could not fetch captions');
        set({ captions: { items: [] } }); // Set empty captions
      } else {
        const captions: CaptionData = await captionsRes.json();
        set({ captions });
      }

    } catch (err: any) {
      set({ error: err.message || 'An unknown error occurred' });
    } finally {
      set({ isLoading: false });
    }
  },

  // History actions
  addHistoryItem: (item: HistoryItem) => {
    const newHistory = [item, ...get().history];
    localStorage.setItem('yt-history', JSON.stringify(newHistory));
    set({ history: newHistory });
  },

  removeHistoryItem: (id: string) => {
    const newHistory = get().history.filter(item => item.id !== id);
    localStorage.setItem('yt-history', JSON.stringify(newHistory));
    set({ history: newHistory });
  },

  clearHistory: () => {
    localStorage.removeItem('yt-history');
    set({ history: [] });
  },

  // Page navigation action
  setPage: (page: 'main' | 'history') => set({ page }),
}));
