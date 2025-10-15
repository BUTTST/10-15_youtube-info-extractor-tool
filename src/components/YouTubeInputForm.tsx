import { useVideoStore } from '../store/useVideoStore';

export function YouTubeInputForm() {
  const { url, setUrl, fetchVideoInfo, isLoading } = useVideoStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideoInfo();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="貼上 YouTube 影片連結"
        className="flex-grow p-2 rounded-md bg-gray-200 dark:bg-gray-700 border border-transparent focus:border-blue-500 focus:outline-none"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-500"
        disabled={isLoading}
      >
        {isLoading ? '載入中...' : '獲取資訊'}
      </button>
    </form>
  );
}
