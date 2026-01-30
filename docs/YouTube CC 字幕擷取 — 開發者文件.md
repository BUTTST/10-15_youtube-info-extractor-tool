# YouTube CC 字幕擷取 — 開發者文件

此文件為通用開發者筆記，整理在專案中實作 YouTube 字幕（CC / 自動生成）擷取時的必要參數、呼叫方式、回傳格式、解析策略與快取設計重點。文件不包含任何專案內部檔案路徑或特定實作檔案註記，僅保留可跨專案重用的關鍵參數與範例。

---

## 高階流程（簡述）

1. 從前端傳入影片識別（URL 或 videoId）。若傳入 URL，先解析出 11 字元的 videoId。  
2. 伺服器端使用受保護的 API 金鑰向第三方服務（或 YouTube 相關 API）發出 HTTP GET 請求，取得可用字幕軌列表與字幕檔內容（常見格式為 SRT）。  
3. 伺服器將字幕內容進行解析／格式化（通常產出兩種版本：有時間碼 / 無時間碼），回傳給前端。  
4. 前端將回傳的預格式化字幕儲存在本地快取（例如 localStorage），後續展示、複製、下載皆可直接從快取讀取以避免重複呼叫外部 API。

---

## 必要的 HTTP 標頭（Headers）與呼叫方式

- 常見第三方代理或 RapidAPI 風格的呼叫時需要：
  - `x-rapidapi-key`: <API_KEY_FROM_SERVER_ENV>（**僅伺服器端使用**，請勿在前端暴露）
  - `x-rapidapi-host`: <API_HOSTNAME>（依使用的代理服務指定）

- 範例（伺服器端發送 GET）：

```bash
curl -s -H "x-rapidapi-key: $RAPIDAPI_KEY" \
     -H "x-rapidapi-host: example-rapidapi-host.com" \
     "https://example-rapidapi-host.com/download-all/{VIDEO_ID}?format_subtitle=srt&format_answer=json"
```

- 設計要點：
  - API 金鑰以環境變數傳到伺服器（例如 `RAPIDAPI_KEY`）；伺服器再將 key 放入 header。
  - 所有對外 HTTP 請求應有適當的錯誤處理：若回傳非 200，擷取錯誤 payload 並回傳給呼叫端或記錄。

---

## 常見的外部 API 回傳格式（範例）

- 下載全部字幕的回傳常見為陣列，每個元素代表一種語言的字幕檔，範例如下：

```json
[
  { "languageCode": "en", "subtitle": "1\n00:00:01,000 --> 00:00:03,000\nHello world\n\n2\n00:00:04,000 --> 00:00:06,000\n..." },
  { "languageCode": "zh-TW", "subtitle": "1\n00:00:01,000 --> 00:00:03,000\n哈囉\n..." }
]
```

- 如果是查詢字幕軌列表，則可能回傳包含語言代碼、標題與類型的物件陣列（視 API 而定）。

---

## SRT 解析與格式化建議

- 解析要點：
  - 以空白行分割 SRT 區塊；每個區塊通常包含序號、時間行與一或多行文本。
  - 從時間行擷取開始時間（HH:MM:SS,mmm）來顯示時間戳記或計算秒數。

- 預格式化輸出（伺服器端可預先產生兩種版本）：
  - 有時間碼：每段以 `[MM:SS] 文本` 或保留完整 `HH:MM:SS` 顯示，視 UI 需求而定。  
  - 無時間碼：只保留純文本，每個區塊合併為一行，用換行分段。

- 範例：把 SRT 轉成 `withTimestamp` / `withoutTimestamp` 字串以供前端直接顯示或下載。

---

## 前端快取設計（關鍵參數）

- 快取用途：避免多次向外部字幕 API 發出請求；提升離線或重載體驗。  
- 建議快取儲存位置：`localStorage` 或其他持久化 storage（若需跨裝置同步則用 server-side 儲存）。  
- 建議的快取 key 命名規則（簡潔且易匹配變體）：
  - `formattedCaptions`：對應一個物件，鍵採 `"{lang}-{withTimestamp}"`，例如：`"en-true"`, `"en-false"`, `"zh-TW-true"`。  
  - 全部影片歷史 key（示例）：`yt-video-history`（儲存包含影片 metadata 與 `formattedCaptions` 的紀錄陣列）。

- 快取寫入示例（概念）：

```js
// allSubtitles = { "en": { withTimestamp: "...", withoutTimestamp: "..." }, ... }
const formattedCaptions = {};
Object.keys(allSubtitles).forEach(lang => {
  formattedCaptions[`${lang}-true`] = allSubtitles[lang].withTimestamp || '';
  formattedCaptions[`${lang}-false`] = allSubtitles[lang].withoutTimestamp || '';
});
// 把 formattedCaptions 存到影片的快取物件中，並序列化到 localStorage
```

---

## 前端讀取與語言匹配策略

- 讀取時優先策略：
  1. 先嘗試 exact key（`{lang}-{withTimestamp}`）。  
  2. 若找不到，嘗試匹配語言變體（例如：`en` ↔ `en-US`、`zh` ↔ `zh-TW`），比較方式可用 startsWith 或 split('-')[0]。  
  3. 若仍找不到，可決定是否觸發按需下載（fallback）或回傳「不可用」訊息給使用者。

- 範例匹配條件（概念）：

```js
// formattedCaptions: object with keys like "en-true"
function findFormattedCaption(formattedCaptions, requestedLang, withTimestamp) {
  const exactKey = `${requestedLang}-${withTimestamp}`;
  if (formattedCaptions[exactKey]) return formattedCaptions[exactKey];

  const keys = Object.keys(formattedCaptions);
  const matchedKey = keys.find(k => {
    const keyLang = k.split('-')[0];
    const keyTimestamp = k.endsWith('true');
    return (keyLang === requestedLang || keyLang.startsWith(requestedLang + '-') || requestedLang.startsWith(keyLang + '-'))
           && keyTimestamp === withTimestamp;
  });
  return matchedKey ? formattedCaptions[matchedKey] : null;
}
```

---

## 錯誤處理與邊界情況

- 伺服器端：
  - 外部 API 可能回傳非預期結果（格式不符、空陣列、或錯誤碼），應回傳清楚的錯誤訊息與狀態碼給前端供顯示或重試策略使用。  
  - 若使用第三方代理（如 RapidAPI），應捕捉頻率限制（rate limit）與 key 無效的情況並記錄。

- 前端：
  - 若快取不存在且按需下載失敗，給使用者友善訊息（例如「該語言字幕尚未下載或不可用」）。  
  - 若字幕內容過大，考慮分塊載入或顯示載入進度。

---

## 可擴充建議（設計考量）

- 按需下載 vs 一次性下載：
  - 若目標影片有很多語言但使用者只需單一語言，採按需下載可以節省頻寬與提高回應速度。  
  - 若希望離線使用或快速切換語言，則一次性下載並快取所有可用語言更合適。

- 格式支援：
  - 將解析器抽成共用模組以支援 SRT、VTT 等格式。

---


