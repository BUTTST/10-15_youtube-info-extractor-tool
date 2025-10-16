# 🔑 環境變數設置指南

## ⚠️ 重要安全說明

**API 金鑰應該保存在後端（Vercel Serverless Functions），不應暴露到前端！**

本專案採用安全架構：
- ✅ API 金鑰只在後端 Serverless Functions 中使用
- ✅ 前端通過 `/api/*` 端點請求後端
- ✅ 使用者可以選擇在瀏覽器本地儲存自己的金鑰（僅儲存在使用者自己的瀏覽器中）

---

## 方法 1：Vercel 環境變數（推薦用於部署）

### ⭐ Vercel 部署設置

1. 進入你的 Vercel 專案設置
2. 找到 **Environment Variables**（環境變數）
3. 添加新變數：
   - **Name**: `RAPIDAPI_KEY`（注意：不要用 `VITE_` 前綴！）
   - **Value**: 你的 RapidAPI 金鑰
   - **Environment**: Production, Preview, Development（全選）
4. 重新部署專案

**為什麼不用 `VITE_` 前綴？**
- ❌ `VITE_RAPIDAPI_KEY` 會被打包到前端，暴露給所有人
- ✅ `RAPIDAPI_KEY` 只存在於後端 Serverless Functions，安全！

### 本地開發設置（可選）

如果你想在本地開發時使用自己的金鑰：

1. **創建 `.env` 檔案**（在專案根目錄）
   ```bash
   # Windows PowerShell
   New-Item -Path ".env" -ItemType File
   ```

2. **在 `.env` 中添加你的 API 金鑰**
   ```env
   RAPIDAPI_KEY=你的實際金鑰
   ```

3. **重新啟動開發伺服器**
   ```bash
   npm run dev
   ```

**注意：** `.env` 檔案已在 `.gitignore` 中，不會被提交到 Git

---

## 方法 2：在應用中手動設置（推薦給一般使用者）

**✨ 不需要設置環境變數！**

1. 打開應用
2. 點擊 **「設定」** 分頁（最右邊的齒輪圖標）
3. 在 **API 金鑰管理** 區域輸入你的金鑰
4. 點擊 **「儲存金鑰」**
5. 完成！金鑰會儲存在瀏覽器本地

---

## 如何獲取 RapidAPI 金鑰

### 步驟 1：註冊 RapidAPI
前往 [RapidAPI](https://rapidapi.com/) 註冊帳號

### 步驟 2：訂閱需要的 API

#### API 1: YouTube v3 Alternative（影片資訊）
- 網址：https://rapidapi.com/ytdlfree/api/youtube-v3-alternative
- 點擊 **"Subscribe to Test"**
- 選擇 **Basic 免費方案**（每月 500 次請求）

#### API 2: YouTube Captions（字幕提取）
- 網址：https://rapidapi.com/nikzeferis/api/youtube-captions-transcript-subtitles-video-combiner
- 點擊 **"Subscribe to Test"**
- 選擇 **Basic 免費方案**

### 步驟 3：複製 API 金鑰
1. 訂閱後，在 API 頁面找到 **"Code Snippets"**
2. 你會看到類似這樣的金鑰：
   ```
   'x-rapidapi-key': 'abc123def456...'
   ```
3. 複製這串金鑰

---

## 使用內建測試金鑰

**如果你不想設置自己的金鑰**，應用已內建測試金鑰，但有以下限制：
- ⚠️ 共享額度有限
- ⚠️ 可能隨時失效
- ⚠️ 不建議用於生產環境

---

## 常見問題

### Q: 為什麼我的請求失敗？
A: 可能原因：
- API 金鑰未設置或錯誤
- API 配額已用完
- 影片 ID 無效

### Q: 如何檢查我的 API 配額？
A: 前往 [RapidAPI Dashboard](https://rapidapi.com/developer/billing/subscriptions-and-usage)

### Q: 免費方案夠用嗎？
A: 
- Basic 方案：每月 500 次請求
- 個人使用通常足夠
- 如需更多可升級方案

### Q: 可以同時使用多個設置方式嗎？
A: 優先順序：
1. 應用內設置的金鑰（最高優先，存在使用者瀏覽器本地）
2. 後端環境變數 `RAPIDAPI_KEY`（伺服器端）
3. 內建測試金鑰（最低優先，共享額度有限）

### Q: 為什麼警告我使用 VITE_RAPIDAPI_KEY？
A: 
- Vite 的 `VITE_` 前綴會將環境變數打包到前端代碼
- 這會讓所有訪問網站的人看到你的 API 金鑰！
- 正確做法是使用 `RAPIDAPI_KEY`（無 VITE_ 前綴）
- 金鑰只會存在於後端 Serverless Functions 中

---

## 🔒 安全建議

### ❌ 不要這樣做：
- ❌ 使用 `VITE_RAPIDAPI_KEY`（會暴露到前端）
- ❌ 將 `.env` 或 `.env.local` 提交到 Git
- ❌ 在公開場合分享你的 API 金鑰
- ❌ 將金鑰直接寫在程式碼中
- ❌ 在前端代碼中硬編碼金鑰

### ✅ 應該這樣做：
- ✅ 使用 `RAPIDAPI_KEY`（只在後端使用）
- ✅ 將金鑰設定在 Vercel 環境變數
- ✅ 本地開發使用 `.env` 檔案（已在 .gitignore 中）
- ✅ 定期更換 API 金鑰
- ✅ 監控 API 使用量
- ✅ 個人用戶可以在「設定」分頁輸入自己的金鑰（僅存在該用戶瀏覽器）

### 🎯 架構說明

```
使用者瀏覽器          前端應用              後端 API              外部服務
    │                  │                    │                    │
    │                  │                    │                    │
    │  輸入 URL        │                    │                    │
    ├────────────────→ │                    │                    │
    │                  │  /api/getVideoInfo │                    │
    │                  ├───────────────────→│                    │
    │                  │                    │  使用 RAPIDAPI_KEY │
    │                  │                    ├───────────────────→│
    │                  │                    │  (安全，不暴露)     │
    │                  │                    │←───────────────────┤
    │                  │←───────────────────┤                    │
    │  顯示結果        │                    │                    │
    │←────────────────┤                    │                    │
```

**金鑰只在後端 Serverless Functions 中使用，前端看不到！**

---

## 需要幫助？

如果遇到問題，請檢查：
1. ✅ API 金鑰是否正確
2. ✅ 網路連線是否正常
3. ✅ 瀏覽器控制台是否有錯誤訊息
4. ✅ RapidAPI 配額是否還有剩餘

