import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useVideoStore } from '@/hooks/useVideoStore';

export function DownloadPanel() {
  const {
    currentVideo,
    playlistItems,
    isDownloadPanelOpen,
    closeDownloadPanel,
    fetchDownloadCandidates,
    downloadCandidatesCache,
    openDownloadPanel,
  } = useVideoStore();

  const [format, setFormat] = useState<'mp4' | 'mp3'>('mp4');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isDownloadPanelOpen) return null;

  useEffect(() => {
    const handler = () => {
      openDownloadPanel();
    };
    window.addEventListener('openDownloadPanel', handler);
    return () => window.removeEventListener('openDownloadPanel', handler);
  }, [openDownloadPanel]);

  const handleFetch = async (videoUrl: string) => {
    setLoadingId(videoUrl);
    await fetchDownloadCandidates(videoUrl, format);
    setLoadingId(null);
  };

  const renderCandidates = (videoId: string) => {
    const cached = downloadCandidatesCache?.[videoId];
    if (!cached) return null;
    return (
      <div className="mt-2 space-y-2">
        {cached.bestCandidates.map((c: any) => (
          <div key={c.itag} className="flex items-center justify-between gap-2 p-2 border rounded">
            <div className="text-sm">
              <div className="font-medium">{cached.title}</div>
              <div className="text-xs text-muted-foreground">{c.mimeType}</div>
              <div className="text-xs text-muted-foreground">大小預估：{c.estimatedSizeHuman}</div>
            </div>
            <div>
              <a href={c.url} target="_blank" rel="noreferrer" className="inline-block">
                <Button size="sm">下載</Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <div className="w-full md:w-3/4 lg:w-1/2 bg-background border rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">下載影片</h3>
          <div>
            <Button variant="ghost" size="sm" onClick={() => closeDownloadPanel()}>關閉</Button>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="radio" name="format" checked={format === 'mp4'} onChange={() => setFormat('mp4')} />
              <span className="ml-1">MP4（影片）</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="format" checked={format === 'mp3'} onChange={() => setFormat('mp3')} />
              <span className="ml-1">MP3（音訊，實際為音訊格式，如 m4a/webm）</span>
            </label>
          </div>

          {currentVideo && (
            <div className="p-3 border rounded">
              <div className="flex items-center gap-4">
                <img src={currentVideo.details.thumbnail} alt={currentVideo.details.title} className="w-20 h-12 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-medium">{currentVideo.details.title}</div>
                  <div className="text-xs text-muted-foreground">{currentVideo.details.author}</div>
                </div>
                <div>
                  <Button onClick={() => handleFetch(currentVideo.details.url)} disabled={!!loadingId}>
                    {loadingId ? '取得中...' : '取得下載連結'}
                  </Button>
                </div>
              </div>

              <div>{currentVideo && renderCandidates(currentVideo.id)}</div>
            </div>
          )}

          {playlistItems && playlistItems.length > 0 && (
            <div className="p-3 border rounded space-y-2 max-h-64 overflow-auto">
              <div className="font-medium">播放清單：可逐項取得下載連結</div>
              {playlistItems.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 p-2 border-b last:border-b-0">
                  <img src={item.thumbnail} alt={item.title} className="w-16 h-9 object-cover rounded" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium line-clamp-2">{item.title}</div>
                  </div>
                  <div>
                    <Button size="sm" onClick={() => handleFetch(`https://www.youtube.com/watch?v=${item.id}`)}>取得</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DownloadPanel;

