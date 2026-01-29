import React, { useState, useEffect, useMemo } from 'react';
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
    selectedForDownload,
    toggleSelectForDownload,
    selectAllForDownload,
    clearAllSelectedForDownload,
  } = useVideoStore();

  const [format, setFormat] = useState<'mp4' | 'mp3'>('mp4');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [wrapInFolder, setWrapInFolder] = useState(false);
  const [folderName, setFolderName] = useState('');

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

  const bytesToHuman = (bytes?: number | null) => {
    if (!bytes || bytes <= 0) return '未知';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    let v = bytes;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(2)} ${units[i]}`;
  };

  const playlistIds = useMemo(() => (playlistItems || []).map((it: any) => it.id), [playlistItems]);

  useEffect(() => {
    setSelectAllChecked(playlistIds.length > 0 && playlistIds.every(id => (selectedForDownload || {})[id]));
  }, [playlistIds, selectedForDownload]);

  const toggleSelectAll = () => {
    if (selectAllChecked) {
      clearAllSelectedForDownload();
      setSelectAllChecked(false);
    } else {
      selectAllForDownload(playlistIds);
      setSelectAllChecked(true);
    }
  };

  const handleToggleItem = (id: string, checked: boolean) => {
    toggleSelectForDownload(id, checked);
  };

  const selectedIds = useMemo(() => Object.keys(selectedForDownload || {}).filter(k => (selectedForDownload || {})[k]), [selectedForDownload]);

  const totalEstimatedBytes = useMemo(() => {
    let total = 0;
    let unknown = false;
    for (const id of selectedIds) {
      const info = downloadCandidatesCache?.[id];
      const candidate = info?.candidates?.[0];
      const size = candidate?.estimatedSizeBytes;
      if (!size) {
        unknown = true;
      } else {
        total += Number(size);
      }
    }
    return { total, unknown };
  }, [selectedIds, downloadCandidatesCache]);

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
              <div className="flex items-center justify-between">
                <div className="font-medium">播放清單：可逐項取得下載連結</div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectAllChecked} onChange={toggleSelectAll} />
                    <span>全選</span>
                  </label>
                </div>
              </div>
              {playlistItems.map((item: any) => {
                const info = downloadCandidatesCache?.[item.id];
                const sizeHint = info?.candidates?.[0]?.estimatedSizeHuman || '未知';
                return (
                  <div key={item.id} className="flex items-center gap-3 p-2 border-b last:border-b-0">
                    <input
                      type="checkbox"
                      checked={!!(selectedForDownload || {})[item.id]}
                      onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                    />
                    <img src={item.thumbnail} alt={item.title} className="w-16 h-9 object-cover rounded" />
                    <div className="flex-1 text-sm">
                      <div className="font-medium line-clamp-2">{item.title}</div>
                      <div className="text-xs text-muted-foreground">大小預估：{sizeHint}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => handleFetch(`https://www.youtube.com/watch?v=${item.id}`)}>取得</Button>
                    </div>
                  </div>
                );
              })}

              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm">
                  已選：{selectedIds.length} 項
                  <span className="ml-3">總預估大小：{totalEstimatedBytes.unknown ? `${bytesToHuman(totalEstimatedBytes.total)}（含未知）` : bytesToHuman(totalEstimatedBytes.total)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={wrapInFolder} onChange={(e) => setWrapInFolder(e.target.checked)} />
                    <span>包成資料夾</span>
                  </label>
                </div>
              </div>

              {wrapInFolder && (
                <div className="mt-2">
                  <input
                    className="w-full border p-2 rounded"
                    placeholder="資料夾名稱（建議：channel-playlist 或 videoTitle）"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                  />
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <Button
                  onClick={() => {
                    // trigger downloads for selected (open candidate url in new tab)
                    for (const id of selectedIds) {
                      const info = downloadCandidatesCache?.[id];
                      const url = info?.candidates?.[0]?.url;
                      if (url) window.open(url, '_blank');
                    }
                  }}
                  disabled={selectedIds.length === 0}
                >
                  逐個下載已選項目
                </Button>
                <Button
                  variant="outline"
                  disabled
                  title="Serverless 模式下暫不支援伺服器端打包。如需打包請使用外部 worker/服務。"
                >
                  打包為 ZIP（不支援）
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DownloadPanel;

