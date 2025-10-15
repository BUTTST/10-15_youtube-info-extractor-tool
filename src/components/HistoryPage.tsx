import { useVideoStore, HistoryItem } from '../store/useVideoStore';

export function HistoryPage() {
  const { history, removeHistoryItem, clearHistory, setUrl, fetchVideoInfo, setPage } = useVideoStore();

  const handleSelectHistory = (item: HistoryItem) => {
    setUrl(item.url);
    fetchVideoInfo();
    setPage('main');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">查詢歷史</h2>
        <button
          onClick={clearHistory}
          className="p-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-500"
          disabled={history.length === 0}
        >
          清除所有紀錄
        </button>
      </div>

      {history.length === 0 ? (
        <p>目前沒有歷史紀錄。</p>
      ) : (
        <ul className="space-y-3">
          {history.map((item) => (
            <li key={item.id} className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md flex gap-4 items-center justify-between">
              <div 
                className="flex gap-4 items-center cursor-pointer flex-grow min-w-0"
                onClick={() => handleSelectHistory(item)}
              >
                <img src={item.thumbnail} alt={item.title} className="w-24 h-auto object-cover rounded-md hidden sm:block" />
                <div className="flex-grow min-w-0">
                  <p className="font-semibold truncate">{item.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    查詢於: {new Date(item.queriedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeHistoryItem(item.id)}
                className="p-2 text-sm rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex-shrink-0"
              >
                刪除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
