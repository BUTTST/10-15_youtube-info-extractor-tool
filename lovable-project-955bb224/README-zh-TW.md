# YT 工具箱 🎬

一個現代化的 YouTube 工具 PWA 應用，可快速獲取影片字幕、縮圖與詳細資訊。

## ✨ 功能特色

- 📝 **CC 字幕下載** - 支援多語言字幕獲取與下載
- 🖼️ **高畫質縮圖** - 獲取各種解析度的影片縮圖
- 📊 **影片詳情** - 查看觀看次數、發布日期、按讚數等資訊
- 📱 **PWA 支援** - 可安裝到手機主畫面，像原生 App 一樣使用
- 🔗 **分享功能** - 直接從 YouTube 應用分享影片到本工具
- 🌓 **明暗模式** - 預設暗色主題，可切換亮色模式
- 💾 **歷史紀錄** - 本地儲存所有查詢歷史
- 🔒 **隱私安全** - 所有資料儲存在本地，不上傳雲端

## 🚀 開始使用

### 1. 設定 API 金鑰

前往 [RapidAPI](https://rapidapi.com) 並訂閱以下 API：

1. **YouTube Captions Transcript** (by nikzeferis)
   - 用於獲取影片字幕
   - [API 連結](https://rapidapi.com/nikzeferis/api/youtube-captions-transcript-subtitles-video-combiner)

2. **YouTube v3 Alternative** (by ytdlfree)
   - 用於獲取影片詳細資訊
   - [API 連結](https://rapidapi.com/ytdlfree/api/youtube-v3-alternative)

訂閱後，在應用的「設定」頁面輸入您的 RapidAPI 金鑰。

### 2. 安裝為 PWA（可選）

**在手機上：**
1. 使用瀏覽器開啟本應用
2. 點擊瀏覽器選單中的「加到主畫面」或「安裝應用程式」
3. 完成後可從主畫面直接開啟

**在電腦上：**
1. Chrome/Edge：點擊網址列右側的安裝圖示
2. 完成後可像桌面應用程式一樣使用

### 3. 使用方式

1. **輸入連結**：
   - 直接貼上 YouTube 影片連結
   - 或從 YouTube 應用使用「分享」功能導入

2. **選擇功能**：
   - **字幕**：選擇語言後點擊「獲取字幕」
   - **縮圖**：選擇畫質後自動顯示
   - **詳情**：點擊「獲取影片詳情」查看資訊
   - **歷史**：查看之前的查詢記錄

## 🛠️ 技術架構

- **框架**：React 18 + TypeScript
- **構建工具**：Vite
- **UI 組件**：shadcn/ui + Tailwind CSS
- **PWA**：vite-plugin-pwa
- **部署**：Vercel
- **資料儲存**：localStorage（本地儲存）

## 📦 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 構建生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 🎨 設計系統

- **主色調**：紫色到粉紅漸變 (#8B5CF6 → #EC4899)
- **暗色模式**：深灰黑色系背景
- **亮色模式**：淺灰白色系背景
- **圓角**：1rem（統一圓角設計）
- **動畫**：流暢的淡入效果與過渡

## 📱 分享功能設定

本應用支援 Web Share Target API，可直接從其他應用接收分享的 YouTube 連結。

在 YouTube 應用中：
1. 點擊影片的「分享」按鈕
2. 在分享選單中找到「YT 工具箱」
3. 影片連結會自動填入

## 🔐 隱私說明

- 所有查詢紀錄僅儲存在您的裝置本地
- API 金鑰僅儲存在瀏覽器的 localStorage
- 不會上傳任何資料到我們的伺服器
- API 請求直接發送到 RapidAPI

## 📄 授權

MIT License

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

## 📞 支援

如有問題或建議，請在 GitHub Issues 中提出。
