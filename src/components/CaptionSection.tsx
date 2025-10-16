import { useState, useEffect } from "react";
import { useVideoStore } from "@/hooks/useVideoStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "./ui/skeleton";
import { Copy, Download, Languages, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CaptionSection() {
  const { currentVideo, fetchFormattedCaption, isLoading } = useVideoStore();
  const [selectedLang, setSelectedLang] = useState<string | undefined>(undefined);
  const [withTimestamp, setWithTimestamp] = useState(true);
  const [captionText, setCaptionText] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const availableCaptions = currentVideo?.captions;

  useEffect(() => {
    // Reset when video changes
    setSelectedLang(undefined);
    setCaptionText("");
  }, [currentVideo?.id]);

  useEffect(() => {
    if (selectedLang && currentVideo?.id) {
      const cacheKey = `${selectedLang}-${withTimestamp}`;
      const cachedCaption = currentVideo.formattedCaptions?.[cacheKey];

      if (cachedCaption) {
        setCaptionText(cachedCaption);
      } else {
        setCaptionText("📝 載入字幕中...");
        fetchFormattedCaption(currentVideo.id, selectedLang, withTimestamp).then(text => {
          setCaptionText(text || "❌ 無法載入字幕");
        });
      }
    }
  }, [selectedLang, withTimestamp, currentVideo, fetchFormattedCaption]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(captionText);
    setCopied(true);
    toast({
      title: "複製成功",
      description: "字幕已複製到剪貼簿",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([captionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentVideo?.details.title || 'captions'}_${selectedLang}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "下載成功",
      description: "字幕檔案已開始下載",
    });
  };

  if (!currentVideo) {
    return (
      <Card className="glass-effect border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            字幕提取
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground space-y-4">
            <Languages className="w-16 h-16 mx-auto opacity-30" />
            <div>
              <p className="text-lg font-medium">尚無影片</p>
              <p className="text-sm mt-2">請先載入 YouTube 影片以查看可用字幕</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!availableCaptions || availableCaptions.length === 0) {
    return (
        <Card className="glass-effect border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5 text-primary" />
                  字幕
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Languages className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>此影片沒有可用的字幕</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="glass-effect border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-primary" />
          字幕提取
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-muted-foreground" />
            <Label className="text-sm font-medium">選擇語言</Label>
          </div>
          <Select onValueChange={setSelectedLang} value={selectedLang}>
            <SelectTrigger className="w-full h-11 border-primary/20">
              <SelectValue placeholder="請選擇字幕語言..." />
            </SelectTrigger>
            <SelectContent>
              {availableCaptions.map((track) => (
                <SelectItem key={track.lang} value={track.lang}>
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    {track.lang}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="timestamp-mode" className="text-sm cursor-pointer">
                顯示時間碼
              </Label>
            </div>
            <Switch
              id="timestamp-mode"
              checked={withTimestamp}
              onCheckedChange={setWithTimestamp}
            />
          </div>
        </div>

        {selectedLang && (
          <div className="space-y-3 animate-fade-in">
            <Textarea
              readOnly
              value={captionText}
              className="h-72 w-full font-mono text-sm border-primary/20 bg-secondary/20"
              placeholder="請先選擇語言以載入字幕..."
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleCopy} 
                disabled={isLoading || !captionText}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    複製字幕
                  </>
                )}
              </Button>
              <Button 
                onClick={handleDownload} 
                disabled={isLoading || !captionText}
                variant="outline"
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                下載
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
