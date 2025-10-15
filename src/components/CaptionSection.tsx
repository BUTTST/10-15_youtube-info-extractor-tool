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

export function CaptionSection() {
  const { currentVideo, fetchFormattedCaption, isLoading } = useVideoStore();
  const [selectedLang, setSelectedLang] = useState<string | undefined>(undefined);
  const [withTimestamp, setWithTimestamp] = useState(true);
  const [captionText, setCaptionText] = useState("");

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
        setCaptionText("載入字幕中...");
        fetchFormattedCaption(currentVideo.id, selectedLang, withTimestamp).then(text => {
          setCaptionText(text);
        });
      }
    }
  }, [selectedLang, withTimestamp, currentVideo, fetchFormattedCaption]);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(captionText);
    // You can add a toast notification here
  };

  if (!currentVideo) return null;
  if (!availableCaptions || availableCaptions.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>字幕</CardTitle>
            </CardHeader>
            <CardContent>
                <p>找不到可用的字幕。</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>字幕</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Select onValueChange={setSelectedLang} value={selectedLang}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="選擇語言" />
            </SelectTrigger>
            <SelectContent>
              {availableCaptions.map((track) => (
                <SelectItem key={track.lang} value={track.lang}>
                  {track.lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch
              id="timestamp-mode"
              checked={withTimestamp}
              onCheckedChange={setWithTimestamp}
            />
            <Label htmlFor="timestamp-mode">顯示時間碼</Label>
          </div>
        </div>

        {selectedLang && (
          <div className="space-y-2">
            <Textarea
              readOnly
              value={captionText}
              className="h-64 w-full"
              placeholder="請先選擇語言以載入字幕..."
            />
            <Button onClick={handleCopy} disabled={isLoading || !captionText}>複製字幕</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
