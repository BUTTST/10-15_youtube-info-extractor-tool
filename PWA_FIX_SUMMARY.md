# PWA 修復摘要

## 問題
1. ❌ 使用了已棄用的 `<meta name="apple-mobile-web-app-capable">` 標籤
2. ❌ 缺少 PWA 圖示檔案（404 錯誤）
3. ❌ Manifest 中的圖示下載失敗

## 解決方案

### 1. 更新 Meta 標籤
**檔案**: `index.html`

添加了新的標準 meta 標籤：
```html
<meta name="mobile-web-app-capable" content="yes" />
```

保留舊的 Apple 特定標籤以維持向後相容性。

### 2. 生成 PWA 圖示
使用 `@vite-pwa/assets-generator` 套件自動生成所有必要的圖示：

**生成的檔案**:
- `favicon.ico` - 網站圖示
- `pwa-64x64.png` - 小尺寸 PWA 圖示
- `pwa-192x192.png` - 標準 PWA 圖示
- `pwa-512x512.png` - 高解析度 PWA 圖示
- `maskable-icon-512x512.png` - 可遮罩圖示（適配不同裝置）
- `apple-touch-icon-180x180.png` - iOS 主畫面圖示

**指令**:
```bash
npm run generate:pwa-icons
```

### 3. 更新配置檔案

#### `vite.config.ts`
- 更新 `includeAssets` 列表
- 修正 manifest 中的 icons 配置
- 添加 maskable icon 支援

#### `package.json`
新增腳本：
```json
"generate:pwa-icons": "pwa-assets-generator --preset minimal public/pwa-icon.svg"
```

## 圖示設計

建立了 `public/pwa-icon.svg` 作為來源圖示，設計特點：
- 使用應用程式主題色彩 (#8B5CF6)
- 包含 YouTube 播放按鈕樣式圖示
- 顯示 "CC" 符號（字幕功能）
- 包含應用程式名稱 "YT 工具"

## 驗證

建置成功完成，所有圖示已正確生成並包含在 `dist` 資料夾中：
```
✓ dist/favicon.ico
✓ dist/pwa-64x64.png
✓ dist/pwa-192x192.png
✓ dist/pwa-512x512.png
✓ dist/maskable-icon-512x512.png
✓ dist/apple-touch-icon-180x180.png
```

## 未來維護

如需更新 PWA 圖示：
1. 編輯 `public/pwa-icon.svg`
2. 執行 `npm run generate:pwa-icons`
3. 重新建置專案 `npm run build`

## 結果

✅ 所有 PWA 警告和錯誤已解決
✅ 應用程式可正確安裝為 PWA
✅ 圖示在所有裝置上正確顯示
✅ 符合最新的 PWA 標準

