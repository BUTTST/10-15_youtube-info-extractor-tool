API 規格 — 下載相關（getDownloadUrls / getPlaylistInfo）

1) GET /api/getDownloadUrls
 - Query:
   - url (string) - 必填，YouTube 影片連結或 ID
   - format (string) - 可選，'mp4' 或 'mp3'（mp3 代表音訊-only 候選，實際回傳 m4a/webm 等）
 - Response 200:
 ```json
 {
   "url_kind":"video",
   "raw_url":"原始輸入 URL",
   "id":"VIDEO_ID",
   "title":"影片標題",
   "lengthSeconds":123,
   "thumbnails":[...],
   "candidates":[
     {
       "itag":22,
       "mimeType":"video/mp4; codecs=\"avc1.64001F, mp4a.40.2\"",
       "qualityLabel":"720p",
       "url":"https://....signature...",
       "estimatedSizeBytes":12345678,
       "estimatedSizeHuman":"11.77 MB",
       "estimated":false
     }
   ],
   "candidatesCount": 3
 }
 ```
 - 注意：
   - `estimated` 為 true 表示大小為估算值（contentLength 不存在）。
   - 返回的 `url` 可能包含簽名並具有時效性，建議使用者即時下載或使用短時效 proxy。

2) GET /api/getPlaylistInfo
 - Query:
   - url (string) - 必填，播放清單的完整連結或包含 list= 的 watch 連結
   - maxItems (number) - 可選，最大抓取項目數（預設 200，上限 500）
 - Response 200:
 ```json
 {
   "url_kind":"playlist",
   "playlistId":"PLxxxx",
   "playlist_kind":"user_playlist",
   "processable_level":"stable",
   "title":"播放清單標題（如有）",
   "items":[
     { "id":"VIDEO_ID","title":"標題","thumbnail":"...","publishedAt":"..." }
   ],
   "totalFetched":50,
   "partial": false
}
```
 - 注意：若 `partial: true` 表示未回傳完整清單（分頁限制）。

3) 錯誤處理
 - API 會在錯誤情況下回傳非 2xx 狀態，並包含 `error` 欄位與可能的 `details`。

4) 安全與限制（部署提醒）
 - 直接回傳的下載 URL 可能會失效；若需穩定下載建議部署短時效 proxy 或外部 worker 上傳到 S3/CDN。
 - 在 serverless（Vercel）環境下，避免長時間 blocking 任務（不可在此執行 yt-dlp/ffmpeg 轉檔）。

