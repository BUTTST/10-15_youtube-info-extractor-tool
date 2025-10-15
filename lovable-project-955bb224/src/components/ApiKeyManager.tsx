import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_KEY_STORAGE = 'yt-tools-api-key';
const DEFAULT_TAB_STORAGE = 'yt-tools-default-tab';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [defaultTab, setDefaultTab] = useState<string>("caption");

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE);
    const storedTab = localStorage.getItem(DEFAULT_TAB_STORAGE);
    if (storedKey) {
      setApiKey(storedKey);
    }
    if (storedTab) {
      setDefaultTab(storedTab);
    }
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    setApiKey(key);
  };

  const saveDefaultTab = (tab: string) => {
    localStorage.setItem(DEFAULT_TAB_STORAGE, tab);
    setDefaultTab(tab);
  };

  return { apiKey, saveApiKey, defaultTab, saveDefaultTab };
};

const ApiKeyManager = () => {
  const { apiKey, saveApiKey, defaultTab, saveDefaultTab } = useApiKey();
  const [inputKey, setInputKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setInputKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    if (!inputKey.trim()) {
      toast({
        title: "錯誤",
        description: "請輸入 RapidAPI 金鑰",
        variant: "destructive",
      });
      return;
    }

    saveApiKey(inputKey.trim());
    toast({
      title: "已儲存",
      description: "API 金鑰已安全儲存在本地",
    });
  };

  const handleDefaultTabChange = (value: string) => {
    saveDefaultTab(value);
    toast({
      title: "設定已更新",
      description: "初始畫面已更改",
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">RapidAPI 設定</h3>
        <p className="text-sm text-muted-foreground">
          請前往 <a href="https://rapidapi.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">RapidAPI</a> 訂閱以下 API 並輸入您的金鑰：
        </p>
        <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
          <li>YouTube Captions Transcript (nikzeferis)</li>
          <li>YouTube v3 Alternative (ytdlfree)</li>
        </ul>
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-key">RapidAPI 金鑰</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="api-key"
              type={showKey ? "text" : "password"}
              placeholder="輸入您的 RapidAPI 金鑰"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            儲存
          </Button>
        </div>
        {apiKey && (
          <p className="text-xs text-muted-foreground">
            ✓ 金鑰已設定
          </p>
        )}
      </div>

      <div className="space-y-2 pt-4 border-t">
        <Label htmlFor="default-tab">初始畫面</Label>
        <Select value={defaultTab} onValueChange={handleDefaultTabChange}>
          <SelectTrigger id="default-tab">
            <SelectValue placeholder="選擇初始畫面" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="caption">字幕</SelectItem>
            <SelectItem value="thumbnail">縮圖</SelectItem>
            <SelectItem value="info">影片詳情</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          開啟應用時預設顯示的功能分頁
        </p>
      </div>
    </Card>
  );
};

export default ApiKeyManager;
