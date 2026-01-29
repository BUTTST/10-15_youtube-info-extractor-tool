## YouTube 網址解析與播放清單判斷 — 開發筆記

目的：提供一份給開發者與 AI 使用的參考規格，能從任意 YouTube 連結解析出關鍵欄位、判斷 URL 類型、並評估播放清單（playlist）能否被後端穩定處理。內容以表格與範例為主，方便快速整合到後端或工具（例如 `yt-dlp`）中。

---

## 一、常見網址型態（總覽）

| 類型 | 範例 | 主要識別欄位/路徑 | 說明 |
|---|---|---:|---|
| 單支影片頁 (watch) | `https://www.youtube.com/watch?v=VIDEO_ID` | path=`/watch`, query:`v` | 直接指向影片 |
| 短連結 (youtu.be) | `https://youtu.be/VIDEO_ID` | path segment | 影片短網址 |
| 播放清單本體 | `https://www.youtube.com/playlist?list=PLAYLIST_ID` | path=`/playlist`, query:`list` | 播放清單頁面 |
| 影片在播放清單脈絡 | `https://www.youtube.com/watch?v=VID&list=PID` | `v` + `list` | 影片以某清單脈絡播放 |
| Shorts | `https://www.youtube.com/shorts/VIDEO_ID` | path startswith `/shorts/` | Shorts 影片頁 |

---

## 二、URL 拆解欄位（要擷取的欄位與用途）

| 欄位 | 來源位置 | 範例值 | 用途 |
|---|---|---|---|
| `host` | URL host | `www.youtube.com` | 白名單 / 路由判斷 |
| `path` | URL path | `/watch`, `/playlist`, `/shorts/…` | 基本類型分類 |
| `video_id` | query `v` 或短連結 path | `8SFo7A8sD04` | 影片主鍵 |
| `playlist_id` | query `list` 或 playlist page | `RD8SFo7A8sD04` | 清單主鍵 |
| `start_radio` / 其他 | query params | `1` | 補充上下文（電台、mix） |
| `raw_url` | 原始 URL | `...` | 紀錄、回溯、debug |

範例解析（目標 URL）  
`https://www.youtube.com/watch?v=8SFo7A8sD04&list=RD8SFo7A8sD04&start_radio=1&rv=8SFo7A8sD04`

- `host` = `www.youtube.com`  
- `path` = `/watch`  
- `video_id` = `8SFo7A8sD04`  
- `playlist_id` = `RD8SFo7A8sD04`  
- `start_radio` = `1`

---

## 三、判斷邏輯：URL 是影片 / 清單 / 影片在清單中

優先順序（簡述）
1. 若 path 是 `/playlist` 且有 `list` → `url_kind = playlist`  
2. 若 path 是 `/watch` 或短連結並且沒有 `list` → `url_kind = video`  
3. 若 path 是 `/watch` 且同時有 `v` 與 `list` → `url_kind = video_in_playlist`

判斷表格：

| 條件 | 結果 (`url_kind`) |
|---|---|
| path=`/playlist` 且 query 包含 `list` | `playlist` |
| path=`/watch` 且只有 `v`（無 `list`） | `video` |
| path=`/watch` 且同時有 `v` 與 `list` | `video_in_playlist` |
| path 以 `/shorts/` 開頭 | `shorts` |

範例（目標 URL） → `video_in_playlist`

---

## 四、播放清單類型（啟發式分類）與可處理性

說明：先用 `playlist_id` 前綴做快速分類，再用 API/抓取結果做驗證（兩段式）。

| 前綴或模式 | 類型 | 特性 | 建議後端處理策略 |
|---|---|---|---|
| `RD*` | Mix / Radio（自動生成） | 動態、依帳號/地區變動 | 標記 `unstable`，可嘗試抓取但不可長期信賴 |
| `PL*` | 使用者建立 playlist | 穩定 | 標記 `stable`，可批次處理 |
| `UU*` | 頻道上傳集合 | 穩定 | `stable`（視權限） |
| `WL*` / `LL*` | 個人專屬（稍後觀看、按讚） | 需登入 | 標記 `auth_required` |
| 其他（Topic/Release） | 自動生成發行/主題 | 可能穩定 | 以抓取結果為準 |

processable_level 建議值：`stable` / `unstable` / `auth_required` / `unavailable`

後端驗證步驟（簡要）
1. 以 `playlist_id` 呼叫中繼資料端點（或用 `yt-dlp -J --flat-playlist`）取得清單標題與 items。  
2. 若回傳清單並包含 items → `stable`（或 `unstable` 視前綴而定）  
3. 若回傳要求登入或被封鎖 → `auth_required`  
4. 若 404 / 無法取得 → `unavailable`

---

## 五、建議輸出 JSON 規格（後端 API）

範例欄位：

```json
{
  "url_kind": "video_in_playlist",
  "host": "www.youtube.com",
  "path": "/watch",
  "video_id": "8SFo7A8sD04",
  "playlist_id": "RD8SFo7A8sD04",
  "playlist_kind": "mix_radio",
  "playlist_title": "（若可取得）",
  "processable_level": "unstable",
  "raw_url": "原始輸入 URL",
  "notes": "依 playlist 前綴與中繼資料綜合判斷"
}
```

欄位說明（簡短）
- `playlist_kind`: 用前綴啟發式分類 (e.g., `mix_radio`, `user_playlist`, `channel_feed`)  
- `processable_level`: 最終可否、以及如何處理（見上）

---

六、工具整合範例（`yt-dlp`）

- 快速判斷並輸出 JSON（不下載）：
```bash
yt-dlp -J --flat-playlist "https://www.youtube.com/watch?v=8SFo7A8sD04&list=RD8SFo7A8sD04&start_radio=1&rv=8SFo7A8sD04"
```
- 強制當作 playlist（即使 URL 同時含 `v` 與 `list`）：
```bash
yt-dlp --yes-playlist -J --flat-playlist "URL"
```
- 強制只當作單支影片：
```bash
yt-dlp --no-playlist -J "URL"
```

輸出解析要點：若 JSON 含 `entries` → playlist；否則為單一影片物件。若要快速抓 `playlist_id`、`playlist_title` 可用 `--print` 參數。

---

七、實作建議（給後端/新手）

- 建立一個 URL 解析函式，輸出標準 JSON（參考第五節）。  
- 先做「前綴啟發式分類」，再用工具或 API 做確認（以避免誤判）。  
- 對 `RD*` 類型採謹慎策略：可提供嘗試抓取但在 UI/日誌上標示為不穩定。  
- 若需批次或排程抓取，對 `processable_level != stable` 的項目採退避/重試機制或人工審核。  
- 記錄原始 URL 與抓取時間、回應狀態，方便問題追蹤。

---

八、目標 URL 的最終判定（範例總結）

| 欄位 | 結論 |
|---|---|
| `url_kind` | `video_in_playlist` |
| `video_id` | `8SFo7A8sD04` |
| `playlist_id` | `RD8SFo7A8sD04` |
| `playlist_kind` | `mix_radio` |
| `processable_level` | `unstable` |

原因：`list` 前綴為 `RD` 且有 `start_radio=1`，符合自動生成 Mix/Radio 的行為；此類清單內容會依時間與使用者/地區而變動，後端不應視為穩定來源。

---

參考/備註：本檔整理基於常見 URL 規則與 `yt-dlp` 可用選項，實際系統應以抓取驗證結果為最終決策依據。

