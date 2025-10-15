export interface HistoryItem {
  type: 'caption' | 'thumbnail' | 'info';
  videoId: string;
  url: string;
  data: any;
  timestamp: number;
}

const HISTORY_KEY = 'yt-tools-history';
const MAX_HISTORY_ITEMS = 50;

export const saveToHistory = (item: HistoryItem) => {
  try {
    const history = getHistory();
    history.unshift(item);
    
    // 限制歷史紀錄數量
    if (history.length > MAX_HISTORY_ITEMS) {
      history.splice(MAX_HISTORY_ITEMS);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('儲存歷史紀錄失敗:', error);
  }
};

export const getHistory = (): HistoryItem[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('讀取歷史紀錄失敗:', error);
    return [];
  }
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('清除歷史紀錄失敗:', error);
  }
};
