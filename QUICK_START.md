# ⚡ 快速開始指南

## 🎯 三種使用方式

### 方式 1️⃣：直接使用（最簡單）✨

**無需任何設置！**

1. 開啟應用：http://localhost:8084
2. 貼上 YouTube 連結
3. 點擊「提取」
4. 完成！

> 使用內建測試金鑰，立即開始使用（共享額度有限）

---

### 方式 2️⃣：個人金鑰（推薦）🔑

**在應用內設置你自己的金鑰**

1. 打開應用
2. 點擊 **「設定」** 分頁（右邊齒輪圖標⚙️）
3. 輸入你的 RapidAPI 金鑰
4. 點擊「儲存金鑰」
5. 完成！

✅ 金鑰只儲存在你的瀏覽器本地  
✅ 其他人看不到你的金鑰  
✅ 每次打開應用自動載入

---

### 方式 3️⃣：伺服器環境變數（開發者）💻

**適合部署到 Vercel 或本地開發**

#### Vercel 部署：

1. Vercel 專案設置
2. Environment Variables
3. 添加變數：
   - **Name**: `RAPIDAPI_KEY` ⚠️ 不要用 `VITE_`！
   - **Value**: 你的金鑰
4. 重新部署

#### 本地開發：

```bash
# 創建 .env 檔案
echo "RAPIDAPI_KEY=你的金鑰" > .env

# 重啟伺服器
npm run dev
```

---

## ⚠️ 重要：不要使用 `VITE_RAPIDAPI_KEY`

### 為什麼？

| 變數名稱 | 位置 | 安全性 | 結果 |
|---------|------|--------|------|
| `VITE_RAPIDAPI_KEY` | 前端代碼 | ❌ 不安全 | 所有人都能看到你的金鑰！ |
| `RAPIDAPI_KEY` | 後端 API | ✅ 安全 | 只有伺服器能存取 |

### 正確架構：

```
前端 (src/) 
    ↓ 
    不包含金鑰
    ↓
後端 (/api/*.ts)
    ↓
    使用 RAPIDAPI_KEY
    ↓
外部 API
```

---

## 🔑 如何獲取 RapidAPI 金鑰

### 5 分鐘設置流程：

1. **註冊** → https://rapidapi.com/
2. **訂閱 API**：
   - [YouTube v3 Alternative](https://rapidapi.com/ytdlfree/api/youtube-v3-alternative)
   - [YouTube Captions](https://rapidapi.com/nikzeferis/api/youtube-captions-transcript-subtitles-video-combiner)
3. **選擇方案** → Basic（免費，每月 500 次）
4. **複製金鑰** → 在 API 頁面找到 `x-rapidapi-key`
5. **貼上金鑰** → 到應用的「設定」分頁

---

## 📊 使用配額

| 方案 | 每月請求數 | 價格 | 適合 |
|------|-----------|------|------|
| Basic | 500 | 免費 | ✅ 個人使用 |
| Pro | 10,000 | $10/月 | 團隊使用 |
| Ultra | 50,000 | $30/月 | 商業使用 |

**估算：** 1 次完整查詢 = 2 次 API 請求（影片資訊 + 字幕）

---

## ✅ 測試你的設置

### 測試影片連結：

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### 預期結果：

1. ✅ 「影片詳情」顯示標題和作者
2. ✅ 「縮圖」顯示高清圖片
3. ✅ 「字幕」顯示可用語言（如果影片有字幕）
4. ✅ 查詢記錄自動加入「歷史」

### 如果失敗：

- ❌ API 金鑰錯誤 → 檢查金鑰是否正確
- ❌ 配額用完 → 檢查 [RapidAPI Dashboard](https://rapidapi.com/developer/billing/subscriptions-and-usage)
- ❌ 影片無效 → 嘗試其他影片連結
- ❌ 網路問題 → 檢查網路連線

---

## 🆘 常見問題

### Q: 我需要設置環境變數嗎？
**A:** 不一定！三種方式任選：
- 直接用（內建金鑰）
- 應用內設置（推薦）
- 環境變數（開發者）

### Q: 為什麼警告 VITE_ 前綴？
**A:** 會暴露金鑰到前端！改用 `RAPIDAPI_KEY`

### Q: 免費方案夠用嗎？
**A:** 個人使用 500次/月 通常夠用

### Q: 金鑰存在哪裡最安全？
**A:** 
1. 🥇 Vercel 環境變數
2. 🥈 本地 `.env` 檔案
3. 🥉 應用內設置（僅你的瀏覽器）

### Q: 可以分享我的金鑰嗎？
**A:** ❌ 絕對不要！每個人應該用自己的金鑰

---

## 🎉 現在開始使用！

```bash
# 確保開發伺服器正在運行
npm run dev

# 訪問
http://localhost:8084

# 享受使用！
```

**需要更詳細的說明？** 查看 `ENV_SETUP.md` 📚

