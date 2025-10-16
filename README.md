# 🎬 YouTube 資訊提取器

一個現代化、美觀的 YouTube 影片資訊提取工具，採用 PWA 架構，支援影片詳情、高清縮圖和完整字幕提取。

[![部署在 Vercel](https://vercel.com/button)](https://vercel.com)

## ✨ 主要功能

### 🎯 核心功能
- **📱 PWA 支援** - 可安裝到手機主畫面，提供原生應用般的體驗
- **🔗 Web Share Target** - 支援從 YouTube App 直接分享影片至本應用
- **🎨 現代化 UI** - 採用毛玻璃效果、漸變色和流暢動畫
- **⚡ 快速提取** - 支援完整 URL、短連結或直接輸入影片 ID

### 📊 資訊展示
- **🖼️ 高清縮圖** - 自動獲取最高解析度的影片縮圖
- **📝 影片詳情** - 標題、作者、觀看次數、發布日期
- **💬 完整字幕** - 支援多語言字幕提取，可選擇顯示時間碼
- **💾 下載功能** - 支援複製和下載字幕文件

### 📖 歷史管理
- **自動儲存** - 所有查詢記錄自動保存到本地
- **快速重載** - 點擊歷史記錄即可重新載入
- **智能管理** - 支援單筆刪除或全部清空

## 🛠️ 技術架構

### 前端技術
- **框架**: React 18 + Vite 5
- **語言**: TypeScript
- **UI 庫**: Tailwind CSS + shadcn/ui + Radix UI
- **狀態管理**: Zustand (持久化)
- **動畫**: Tailwind 動畫 + CSS 過渡效果

### 後端架構  
- **平台**: Vercel Serverless Functions
- **API**: RapidAPI
  - [YouTube v3 Alternative](https://rapidapi.com/ytdlfree/api/youtube-v3-alternative) - 影片資訊
  - [YouTube Captions](https://rapidapi.com/nikzeferis/api/youtube-captions-transcript-subtitles-video-combiner) - 字幕提取

### PWA 功能
- **Service Worker** - 離線緩存
- **Web Share Target** - 原生分享整合
- **安裝提示** - 可添加到主畫面

## 🚀 快速開始

### 環境需求
- Node.js 18+
- npm 或 yarn

### 安裝步驟

```bash
# 克隆專案
git clone <repository-url>
cd youtube-info-extractor-tool

# 安裝依賴
npm install

# 設定環境變數（可選）
# 創建 .env.local 文件並添加：
# VITE_RAPIDAPI_KEY=your_api_key_here

# 啟動開發伺服器
npm run dev

# 建構生產版本
npm run build

# 預覽生產版本
npm run preview
```

### API 金鑰設定

1. 前往 [RapidAPI](https://rapidapi.com/) 註冊帳號
2. 訂閱以下 API：
   - YouTube v3 Alternative
   - YouTube Captions Transcript
3. 在應用中可以：
   - 使用內建的測試 API 金鑰（有限額度）
   - 在設定中輸入自己的 API 金鑰

## 📱 PWA 安裝

### Android/iOS
1. 使用瀏覽器開啟應用
2. 點擊「添加到主畫面」
3. 完成！現在可以從主畫面啟動

### 分享功能使用
1. 在 YouTube App 中播放影片
2. 點擊「分享」按鈕
3. 選擇「YouTube 資訊提取器」
4. 自動開啟並提取資訊

## 🎨 設計特色

- **漸變背景** - 動態紫粉漸變效果
- **毛玻璃卡片** - 半透明模糊背景
- **流暢動畫** - 頁面載入和互動動畫
- **響應式佈局** - 適配手機、平板、桌面
- **深色模式** - 自動適應系統主題

## 🔧 部署到 Vercel

1. Fork 此專案
2. 在 [Vercel](https://vercel.com) 導入專案
3. 設定環境變數 `VITE_RAPIDAPI_KEY`
4. 部署完成！

## 📄 授權

MIT License

## 🙏 致謝

- shadcn/ui - 優秀的 UI 組件庫
- Radix UI - 無障礙組件基礎
- RapidAPI - API 服務提供 
