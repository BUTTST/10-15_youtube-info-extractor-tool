下載功能部署說明（降級方案：僅回傳直接檔案 URL）

概要
- 本專案在 Vercel serverless 上部署時，無法執行長時間的本地二進位（如 yt-dlp、ffmpeg）。因此採用「功能降級」策略：後端 API 透過 node 套件（ytdl-core）解析並回傳可直接下載的媒體檔案 URL（不做轉檔或打包）。

已實作項目
- `api/getDownloadUrls.ts`：使用 `ytdl-core` 取得可用格式並回傳候選下載 URL（包含估算大小）。
- `api/getPlaylistInfo.ts`：使用 RapidAPI 的 YouTube endpoint 取得播放清單項目清單（需在 Vercel 設定 `RAPIDAPI_KEY`）。
- 前端 `DownloadPanel`：使用者可選 MP4/MP3（實際為影片或音訊原始格式），取得直接下載連結並顯示預估大小。

注意事項與限制
- MP3 選項不會執行實際的 MP3 轉檔；此選項會回傳音訊-only 的原始檔（例如 m4a 或 webm）。若需實際轉檔為 mp3，需外部工作者或容器（含 ffmpeg）。
- 估算大小來源：若格式 metadata 含 `contentLength` 則使用之；否則以 `averageBitrate` × `duration` 做估算，屬於預估值，UI 會標示為「預估」。
- 直接回傳的 URL 可能會在一段時間後失效（YouTube 直連通常帶簽名 token）。建議：使用者即時點擊下載，或在後端提供短時效的 Proxy/重導向（需額外存儲與清理策略）。
- 大量批次下載或長清單操作可能造成速率限制或被 YT 阻擋；建議限制單次可查詢的清單項目數量或增加節流。

部署步驟（Vercel）
1. 在 Vercel 專案中新增環境變數 `RAPIDAPI_KEY`（用於播放清單 API），與現有的設置一致。  
2. 安裝相依：`ytdl-core`（在本地或發佈時加入 `package.json`）。  
3. 部署並注意 serverless 冷啟動與流量限制，測試單一影片解析與下載連結是否可用。

未來擴充建議
- 若要支援真正的 MP3 轉檔或 ZIP 打包，需額外一個可執行 yt-dlp/ffmpeg 的任務服務（外部 VM、容器或隊列系統），Vercel 僅負責觸發與回傳最終下載連結。

