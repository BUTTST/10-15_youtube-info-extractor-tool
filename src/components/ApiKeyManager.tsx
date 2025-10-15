import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getApiKey, saveApiKey } from "@/lib/storage";

const ApiKeyManager = () => {
  const [apiKey, setApiKey] = useState(getApiKey() || "");
  const { toast } = useToast();

  const handleSave = () => {
    saveApiKey(apiKey);
    toast({
      title: "成功",
      description: "API 金鑰已儲存。變更將在下次刷新後完全生效。",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API 金鑰管理</CardTitle>
        <CardDescription>
          在此輸入您的 RapidAPI 金鑰。如果您將此欄位留空，應用程式將會嘗試使用部署時設定的後備環境變數。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="password"
          placeholder="貼上您的 RapidAPI 金鑰..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <Button onClick={handleSave}>儲存金鑰</Button>
      </CardContent>
    </Card>
  );
};

export default ApiKeyManager;
