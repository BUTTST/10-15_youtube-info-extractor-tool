const API_KEY_STORAGE = 'yt-tools-api-key';
const DEFAULT_TAB_STORAGE = 'yt-tools-default-tab';

export const saveApiKey = (apiKey: string) => {
  try {
    localStorage.setItem(API_KEY_STORAGE, apiKey);
  } catch (error) {
    console.error("Failed to save API key", error);
  }
};

export const getApiKey = (): string | null => {
  try {
    return localStorage.getItem(API_KEY_STORAGE);
  } catch (error) {
    console.error("Failed to get API key", error);
    return null;
  }
};

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
