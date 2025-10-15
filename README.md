# YT 共享快捷資訊 PWA

這是以手機為優先所開發的漸進式應用程式 (PWA)，<br>
讓使用者快速獲取 YouTube 影片的詳細資訊。<br>
<br>
使用者可以將此應用安裝至手機主畫面，並透過系統原生的「分享」功能，<br>
直接將 YouTube App 中正在觀看的影片傳送至本應用進行分析。

| [Rapid API Usage 主控台](https://rapidapi.com/developer/billing/subscriptions-and-usage) | [Youtube v3 Alternative](https://rapidapi.com/ytdlfree/api/youtube-v3-alternative) | [CC 字幕](https://rapidapi.com/nikzeferis/api/youtube-captions-transcript-subtitles-video-combiner) |

## ✨ 主要功能 (Features)

*   **📱 PWA 安裝**: 可將應用程式新增至手機主畫面，提供離線存取與原生應用般的體驗。
*   **🔗 快捷分享整合**: 支援 Android/iOS 的 Web Share Target API，可直接從 YouTube App 分享影片至此應用。
*   **⌨️ 手動輸入**: 支援手動貼上或輸入 YouTube 影片連結。
*   **📊 資訊獲取**:
    *   **影片詳情**: 包含標題、作者、觀看次數、發布日期。
    *   **高畫質縮圖**: 自動抓取最高解析度的影片縮圖。
    *   **CC 字幕**: 獲取影片所有可用的 CC 字幕軌，並提供一鍵複製功能。
*   **📖 歷史紀錄**: 所有查詢過的影片都會被儲存在裝置的本機儲存空間 (LocalStorage) 中，方便日後查看與管理。
*   **☀️/🌙 明暗主題**: 支援手動切換亮色與暗色主題，並會記住您的偏好設定。
*   **🚀 響應式設計**: 介面為手機優先，同時也適用於桌面瀏覽器。

## 🛠️ 技術堆疊 (Tech Stack)

*   **前端**: React (Vite + TypeScript)
*   **樣式**: Tailwind CSS
*   **狀態管理**: Zustand
*   **後端 & 部署**: Vercel Serverless Functions & Vercel Platform
*   **PWA 圖示生成**: Sharp 
