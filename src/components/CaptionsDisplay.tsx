import { useVideoStore } from "../store/useVideoStore";

export function CaptionsDisplay() {
  const { captions } = useVideoStore();

  if (!captions || !captions.items || captions.items.length === 0) {
    return (
      <div className="mt-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md">
        <p>找不到可用的字幕。</p>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Maybe show a toast notification here in the future
  };

  return (
    <div className="mt-4 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md">
      <h3 className="text-lg font-bold mb-2">CC 字幕</h3>
      {captions.items.map((captionTrack, index) => (
        <div key={index} className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold">{captionTrack.language}</h4>
            <button 
              onClick={() => handleCopy(captionTrack.subtitles)}
              className="text-sm p-1 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              複製
            </button>
          </div>
          <textarea
            readOnly
            value={captionTrack.subtitles}
            className="w-full h-40 p-2 rounded-md bg-gray-100 dark:bg-gray-700 border-none"
          />
        </div>
      ))}
    </div>
  );
}
