# API 功能與返回內容分析報告

本文檔旨在分析項目所使用的兩個核心 RapidAPI 端點的功能，並記錄其返回的數據結構。

---

## 1. 獲取影片資訊 (getVideoInfo)

-   **API 提供商**: `youtube-v3-alternative.p.rapidapi.com`
-   **功能**: 提供 YouTube 影片的 ID，返回該影片的詳細資訊。
-   **狀態**: ✅ **功能正常**

### cURL 測試指令

```bash
curl --request GET \
     --url "https://youtube-v3-alternative.p.rapidapi.com/video?id=dQw4w9WgXcQ" \
     --header "x-rapidapi-host: youtube-v3-alternative.p.rapidapi.com" \
     --header "x-rapidapi-key: YOUR_RAPIDAPI_KEY"
```

### 成功返回的 JSON 內容 (範例)

```json
{
  "id": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)",
  "lengthSeconds": "213",
  "keywords": [
    "rick astley",
    "Never Gonna Give You Up",
    "nggyu",
    "rick rolled",
    "..."
  ],
  "channelTitle": "Rick Astley",
  "channelId": "UCuAXFkgsw1L7xaCfnd5JJOw",
  "description": "The official video for “Never Gonna Give You Up” by Rick Astley...",
  "thumbnail": [
    {
      "url": "https://i.ytimg.com/vi_webp/dQw4w9WgXcQ/default.webp",
      "width": 120,
      "height": 90
    },
    {
      "url": "https://i.ytimg.com/vi_webp/dQw4w9WgXcQ/mqdefault.webp",
      "width": 320,
      "height": 180
    },
    {
      "url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg?sqp=-oaymwEcCK4FEIIDSEbyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLAtyUwHA-QTnSIeRMIY_9t9RnBjkA",
      "width": 686,
      "height": 386
    }
  ],
  "allowRatings": true,
  "viewCount": "1703060713",
  "isPrivate": false,
  "isLiveContent": false,
  "publishDate": "2009-10-24T23:57:33-07:00",
  "uploadDate": "2009-10-24T23:57:33-07:00"
}
```

### 關鍵數據欄位解析

-   `id`: 影片的唯一標識符。
-   `title`: 影片標題。
-   `viewCount`: 觀看次數。
-   `publishDate`: 影片的發布日期。
-   `channelTitle`: 上傳該影片的頻道名稱 (在你的代碼中對應 `author`)。
-   `thumbnail`: 一個包含多種尺寸縮圖的陣列。你的代碼邏輯是選取最後一個，即最高畫質的縮圖。

---

## 2. 獲取影片字幕 (getCaptions)

-   **API 提供商**: `youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com`
-   **功能**: 提供 YouTube 影片的 ID，返回該影片的所有可用字幕。
-   **狀態**: ❌ **功能異常**

### cURL 測試指令 (已嘗試)

```bash
# 嘗試 1: /v1
curl --request GET \
     --url "https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/v1?videoId=dQw4w9WgXcQ" \
     ...

# 嘗試 2: /v1/captions
curl --request GET \
     --url "https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/v1/captions?videoId=dQw4w9WgXcQ" \
     ...
```

### 失敗返回的 JSON 內容

兩次嘗試均返回類似的錯誤，表示端點不存在。

```json
{
  "message": "Endpoint '/v1' does not exist"
}
```

```json
{
  "message": "Endpoint '/v1/captions' does not exist"
}
```

### 結論

`getCaptions` API 的端點很可能已經被 API 提供商更改或移除。你需要前往 [RapidAPI 網站](https://rapidapi.com/nikzeferis/api/youtube-captions-transcript-subtitles-video-combiner) 檢查該 API 的最新文檔，找到正確的請求路徑，或者尋找一個替代的 API 來獲取字幕。

**這也解釋了為什麼你的應用在獲取影片資訊後，字幕部分會失敗或沒有反應。**
