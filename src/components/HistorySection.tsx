import { useVideoStore, HistoryItem } from "@/hooks/useVideoStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HistorySection() {
  const { history, removeFromHistory, clearHistory, fetchVideoInfo, setUrlInput } = useVideoStore();

  const handleHistoryClick = (item: HistoryItem) => {
    setUrlInput(item.details.url);
    fetchVideoInfo(item.details.url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>查詢歷史</CardTitle>
          <Button
            variant="destructive"
            size="sm"
            onClick={clearHistory}
            disabled={history.length === 0}
          >
            全部清除
          </Button>
        </div>
        <CardDescription>點擊紀錄以重新查詢</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">尚無歷史紀錄。</p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted"
              >
                <div
                  className="flex items-center gap-2 cursor-pointer truncate"
                  onClick={() => handleHistoryClick(item)}
                >
                  <img
                    src={item.details.thumbnail}
                    alt={item.details.title}
                    className="h-10 w-16 object-cover rounded-sm"
                  />
                  <div className="truncate">
                    <p className="font-semibold text-sm truncate">
                      {item.details.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.queriedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromHistory(item.id)}
                >
                  刪除
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
