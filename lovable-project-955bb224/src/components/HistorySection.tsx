import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, ExternalLink, FileText, Image as ImageIcon, Info } from "lucide-react";
import { getHistory, clearHistory, type HistoryItem } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const HistorySection = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const items = getHistory();
    setHistory(items);
  };

  const handleClearHistory = () => {
    if (confirm('確定要清除所有歷史紀錄嗎？')) {
      clearHistory();
      setHistory([]);
      toast({
        title: "已清除",
        description: "所有歷史紀錄已清除",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'caption':
        return <FileText className="w-4 h-4" />;
      case 'thumbnail':
        return <ImageIcon className="w-4 h-4" />;
      case 'info':
        return <Info className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'caption':
        return '字幕';
      case 'thumbnail':
        return '縮圖';
      case 'info':
        return '影片詳情';
      default:
        return type;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">歷史紀錄</h3>
        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearHistory}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清除全部
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>尚無歷史紀錄</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                      {getTypeIcon(item.type)}
                    </div>
                    <span className="text-sm font-medium">
                      {getTypeLabel(item.type)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-secondary/50 px-2 py-1 rounded">
                      {item.videoId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => window.open(item.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>

                  {item.type === 'thumbnail' && item.data?.thumbnailUrl && (
                    <img
                      src={item.data.thumbnailUrl}
                      alt="縮圖"
                      className="w-full max-w-xs rounded-md border"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default HistorySection;
