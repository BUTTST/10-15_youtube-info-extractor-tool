import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveToHistory } from "@/lib/storage";
import { useApiKey } from "@/components/ApiKeyManager";

interface CaptionSectionProps {
  videoId: string | null;
  url: string;
}

const CaptionSection = ({ videoId, url }: CaptionSectionProps) => {
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<any>(null);
  const [language, setLanguage] = useState("zh-Hant");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { apiKey } = useApiKey();

  const fetchCaptions = async () => {
    if (!videoId) {
      toast({
        title: "錯誤",
        description: "請先輸入有效的 YouTube 連結",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "錯誤",
        description: "請先在設定頁面輸入 RapidAPI 金鑰",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/download-all/${videoId}`,
        {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com'
          }
        }
      );

      if (!response.ok) throw new Error('API 請求失敗');

      const data = await response.json();
      setCaptions(data);
      
      saveToHistory({
        type: 'caption',
        videoId,
        url,
        data,
        timestamp: Date.now(),
      });

      toast({
        title: "成功",
        description: "字幕已獲取",
      });
    } catch (error) {
      toast({
        title: "錯誤",
        description: "無法獲取字幕，請檢查 API 金鑰或影片是否有字幕",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!captions) return;
    
    const text = captions.transcript || JSON.stringify(captions, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "已複製",
      description: "字幕內容已複製到剪貼簿",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCaptions = () => {
    if (!captions) return;

    const text = captions.transcript || JSON.stringify(captions, null, 2);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `captions_${videoId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="選擇語言" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zh-Hant">繁體中文</SelectItem>
            <SelectItem value="zh-Hans">簡體中文</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ja">日本語</SelectItem>
            <SelectItem value="ko">한국어</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={fetchCaptions}
          disabled={loading || !videoId}
          className="gradient-primary border-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              獲取中...
            </>
          ) : (
            "獲取字幕"
          )}
        </Button>
      </div>

      {captions && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  已複製
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  複製
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCaptions}
            >
              <Download className="w-4 h-4 mr-2" />
              下載
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-secondary/50 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">
              {captions.transcript || JSON.stringify(captions, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {!videoId && (
        <div className="text-center py-8 text-muted-foreground">
          請先輸入 YouTube 影片連結
        </div>
      )}
    </Card>
  );
};

export default CaptionSection;
