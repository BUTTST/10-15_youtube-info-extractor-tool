import { useVideoStore } from '../store/useVideoStore';

export function VideoDetailsCard() {
  const { videoDetails } = useVideoStore();

  if (!videoDetails) return null;
  
  // Helper to format numbers with commas
  const formatViews = (views: number) => {
    return new Intl.NumberFormat().format(views);
  }

  return (
    <div className="mt-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md flex flex-col sm:flex-row gap-4">
      <img 
        src={videoDetails.thumbnail} 
        alt={videoDetails.title}
        className="w-full sm:w-48 h-auto object-cover rounded-md"
      />
      <div className="flex-grow">
        <h2 className="text-xl font-bold">{videoDetails.title}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{videoDetails.author}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
          <span>觀看次數: {formatViews(videoDetails.views)}</span>
          <span>發布日期: {new Date(videoDetails.publishDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
