# 🎬 YouTube 資訊提取器

一個現代化、美觀的 YouTube 影片資訊提取工具，採用 PWA 架構，支援影片詳情、高清縮圖和完整字幕提取。

[![部署在 Vercel](https://vercel.com/button)](https://vercel.com)


| [Vercel主控台](https://vercel.com/titans-projects-0ee27614/10-15-youtube-info-extractor-tool) | [項目頁面](https://10-15-youtube-info-extractor-tool.vercel.app/) | [YouTube v31 資訊擷取](https://rapidapi.com/ytdlfree/api/youtube-v31) | [YouTube CC字幕](https://rapidapi.com/nikzeferis/api/youtube-captions-transcript-subtitles-video-combiner) | [Rapidapi訂閱管理](https://rapidapi.com/developer/billing/subscriptions-and-usage) |
| :---: | :---: | :---: | :---: | :---: |



## ✨ 主要功能

### 🎯 核心功能
- **📱 PWA 支援** - 可安裝到手機主畫面，提供原生應用般的體驗
- **🔗 Web Share Target** - 支援從 YouTube App 直接分享影片至本應用
- **🎨 現代化 UI** - 採用毛玻璃效果、漸變色和流暢動畫
- **⚡ 快速提取** - 支援完整 URL、短連結或直接輸入影片 ID
 - **📂 讀取網址播放清單** - 支援 YouTube 播放清單網址，自動解析清單中所有影片，批次提取影片資訊與字幕，並支援篩選、整批下載

### 📊 資訊展示
- **🖼️ 高清縮圖** - 自動獲取最高解析度的影片縮圖
- **📝 影片詳情** - 標題、作者、觀看次數（中文顯示：億/萬）、發布日期
- **💬 智能字幕** - 支援多語言字幕提取與類型標注
  - ✨ **一次性下載所有語言字幕**，切換語言無需等待
  - 🏷️ 明確標示字幕來源（作者上傳 ✓ / 自動生成 🤖 / CC 字幕）
  - ⏱️ 可選擇顯示或隱藏時間碼
  - 🌍 支援 40+ 種語言自動識別
  - 📦 智能語言代碼匹配（如 en-US、en-GB 自動對應到 en）
- **💾 下載功能** - 支援複製和下載字幕文件

### 📖 歷史管理
- **自動儲存** - 所有查詢記錄自動保存到本地
- **智能緩存** - 字幕內容持久化，避免重複抓取浪費 API 額度
- **快速恢復** - 點擊歷史記錄立即恢復所有已獲取的字幕
- **靈活管理** - 支援單筆刪除或全部清空

## 🎯 技術亮點

### 字幕下載優化
本專案採用**混合 API 策略**，完美結合兩個 API 的優勢：

1. **YouTube V31 API** - 提供字幕列表與類型標記
   - 標示字幕來源（作者上傳 / 自動生成 / CC）
   - 免費配額充足

2. **YouTube Captions API** - 提供完整字幕內容
   - `/download-all/` 端點一次返回所有語言
   - SRT 格式，支援完整解析

3. **預格式化策略**
   - 後端一次性下載所有語言字幕
   - 預先生成「有時間碼」和「無時間碼」兩個版本
   - 前端切換語言時直接從緩存讀取，無需等待

**效果：**
- ✅ 只調用一次 API，節省配額
- ⚡ 切換語言即時顯示，無延遲
- 📦 完整緩存到 localStorage，關閉瀏覽器也不會丟失

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
  - [YouTube v31](https://rapidapi.com/ytdlfree/api/youtube-v31) - 影片資訊與字幕列表（含類型標記）
  - [YouTube Captions](https://rapidapi.com/nikzeferis/api/youtube-captions-transcript-subtitles-video-combiner) - 字幕內容下載
  - **混合策略**: 結合兩個 API 優勢，一次獲取所有語言字幕並預格式化

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

# 設定環境變數
# 本地開發：創建 .env 文件並添加：
# RAPIDAPI_KEY=your_api_key_here

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
   - [YouTube v31](https://rapidapi.com/ytdlfree/api/youtube-v31)
   - [YouTube Captions Transcript](https://rapidapi.com/nikzeferis/api/youtube-captions-transcript-subtitles-video-combiner)
3. 在 Vercel 環境變數中設定 `RAPIDAPI_KEY`（詳見下方部署說明）

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
3. 設定環境變數：
   - **Name**: `RAPIDAPI_KEY`（⚠️ 不要使用 `VITE_` 前綴！）
   - **Value**: 你的 RapidAPI 金鑰
   - **Environments**: Production, Preview, Development（全選）
4. 部署完成！

### ⚠️ 重要：環境變數設定

- ✅ 正確：`RAPIDAPI_KEY`（只在後端使用，安全）
- ❌ 錯誤：`VITE_RAPIDAPI_KEY`（會暴露到前端，不安全！）

本專案採用 Vercel Serverless Functions 架構，API 金鑰只在後端使用，確保安全性。

## 📄 授權

MIT License

## 🙏 致謝

- shadcn/ui - 優秀的 UI 組件庫
- Radix UI - 無障礙組件基礎
- RapidAPI - API 服務提供 
