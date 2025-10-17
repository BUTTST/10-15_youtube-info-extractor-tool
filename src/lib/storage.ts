const DEFAULT_TAB_STORAGE = 'yt-tools-default-tab';

export const saveDefaultTab = (tab: string) => {
  localStorage.setItem(DEFAULT_TAB_STORAGE, tab);
};

export const getDefaultTab = () => {
  return localStorage.getItem(DEFAULT_TAB_STORAGE) || 'caption';
};

// --- History Management (Example) ---
const HISTORY_STORAGE_KEY = 'yt-tools-history';

export interface HistoryItem {
  type: 'caption' | 'thumbnail' | 'info';
  videoId: string;
  url: string;
  data: any;
  timestamp: number;
}

export const getHistory = (): HistoryItem[] => {
  try {
    const history = localStorage.getItem(HISTORY_STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Failed to get history", error);
    return [];
  }
};

export const saveToHistory = (item: HistoryItem) => {
  const history = getHistory();
  history.unshift(item); // Add to the beginning
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 50))); // Limit history size
};

export const clearHistory = () => {
  localStorage.removeItem(HISTORY_STORAGE_KEY);
};
