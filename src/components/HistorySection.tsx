import { useVideoStore, HistoryItem } from "@/hooks/useVideoStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Trash2, RotateCcw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function HistorySection() {
  const { history, removeFromHistory, clearHistory, fetchVideoInfo, setUrlInput } = useVideoStore();

  const handleHistoryClick = (item: HistoryItem) => {
    setUrlInput(item.details.url);
    fetchVideoInfo(item.details.url);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '剛剛';
    if (minutes < 60) return `${minutes} 分鐘前`;
    if (hours < 24) return `${hours} 小時前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString('zh-TW');
  };

  return (
    <Card className="glass-effect border-primary/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            查詢歷史
          </CardTitle>
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  清空
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確認清空歷史紀錄？</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作將永久刪除所有查詢歷史，且無法復原。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={clearHistory} className="bg-destructive hover:bg-destructive/90">
                    確認清空
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <CardDescription>
          {history.length > 0 ? `共 ${history.length} 筆紀錄` : '點擊紀錄以重新查詢'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>尚無歷史紀錄</p>
            <p className="text-xs mt-1">查詢後的影片會自動儲存於此</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <ul className="space-y-2">
              {history.slice().reverse().map((item) => (
                <li
                  key={item.id}
                  className="group relative flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-secondary/30 transition-all duration-200 cursor-pointer"
                  onClick={() => handleHistoryClick(item)}
                >
                  <div className="relative shrink-0">
                    <img
                      src={item.details.thumbnail}
                      alt={item.details.title}
                      className="h-16 w-24 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md flex items-center justify-center">
                      <RotateCcw className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2 mb-1">
                      {item.details.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.details.author}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(item.queriedAt)}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(item.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
