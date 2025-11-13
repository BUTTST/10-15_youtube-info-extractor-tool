import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import type { Connect } from 'vite';

// Store API key at module level
let RAPIDAPI_KEY: string = '';

// API middleware for development
const apiMiddleware: Connect.NextHandleFunction = async (req, res, next) => {
  if (req.url?.startsWith('/api/')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Handle getVideoInfo
    if (url.pathname === '/api/getVideoInfo') {
      const videoUrl = url.searchParams.get('url');
      if (!videoUrl) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'YouTube URL or video ID is required' }));
        return;
      }

      const extractVideoId = (url: string): string | null => {
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^#\&\?\s]{11})/,
          /^([^#\&\?\s]{11})$/
        ];
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) return match[1];
        }
        return null;
      };

      const videoId = extractVideoId(videoUrl);
      if (!videoId) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid YouTube URL or video ID' }));
        return;
      }

      const apiKey = RAPIDAPI_KEY;
      
      try {
        const response = await fetch(
          `https://youtube-v31.p.rapidapi.com/videos?part=contentDetails,snippet,statistics&id=${videoId}`,
          {
            headers: {
              'x-rapidapi-key': apiKey,
              'x-rapidapi-host': 'youtube-v31.p.rapidapi.com'
            }
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          res.statusCode = response.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to fetch data from YouTube API', details: errorData }));
          return;
        }

        const data = await response.json() as any;
        
        // YouTube Data API v3 格式：數據在 items 陣列中
        if (!data.items || data.items.length === 0) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Video not found' }));
          return;
        }

        const videoData = data.items[0];
        const snippet = videoData.snippet || {};
        const statistics = videoData.statistics || {};
        const contentDetails = videoData.contentDetails || {};

        // 將 ISO 8601 duration 格式轉換為秒數 (PT4M13S -> 253)
        const convertDurationToSeconds = (duration: string): string => {
          if (!duration) return '0';
          const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (!match) return '0';
          const hours = parseInt(match[1] || '0');
          const minutes = parseInt(match[2] || '0');
          const seconds = parseInt(match[3] || '0');
          return String(hours * 3600 + minutes * 60 + seconds);
        };
        
        const formattedData = {
          id: videoData.id || videoId,
          title: snippet.title || '無標題影片',
          author: snippet.channelTitle || '未知頻道',
          thumbnails: snippet.thumbnails ? Object.values(snippet.thumbnails) : [],
          viewCount: statistics.viewCount || '0',
          publishedAt: snippet.publishedAt || new Date().toISOString(),
          description: snippet.description || '',
          lengthSeconds: convertDurationToSeconds(contentDetails.duration),
          channelId: snippet.channelId || '',
        };
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(formattedData));
        return;
      } catch (error: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'An internal server error occurred', details: error.message }));
        return;
      }
    }
    
    // Handle getCaptions - 使用 RapidAPI 字幕 API
    if (url.pathname === '/api/getCaptions') {
      const videoId = url.searchParams.get('videoId');
      const lang = url.searchParams.get('lang');
      const format = url.searchParams.get('format');
      const apiKey = RAPIDAPI_KEY;
      
      if (!videoId) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Video ID is required' }));
        return;
      }

      if (!apiKey) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'API key not configured' }));
        return;
      }

      try {
        // 如果請求字幕列表
        if (!lang || !format) {
          const response = await fetch(
            `https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/language-list/${videoId}?format=json`,
            {
              headers: {
                'x-rapidapi-host': 'youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com',
                'x-rapidapi-key': apiKey
              }
            }
          );
          
          if (!response.ok) {
            res.statusCode = response.status;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to fetch caption list' }));
            return;
          }

          const captionList = await response.json() as any[];
          
          const formattedTracks = captionList.map((track: any) => ({
            lang: track.name,
            code: track.languageCode,
            url: '', // RapidAPI 不需要直接 URL
            isAutoGenerated: track['auto-generated'] === 1
          }));
          
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            captions: formattedTracks,
            count: formattedTracks.length
          }));
          return;
        }
        
        // 如果請求特定語言的字幕內容
        if (format === 'text' && lang) {
          const withTimestamp = url.searchParams.get('timestamp') === 'true';
          
          // 尝试使用 format=text 参数获取纯文本字幕
          const response = await fetch(
            `https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/get-video-info/${videoId}?format=text&lang=${lang}`,
            {
              headers: {
                'x-rapidapi-host': 'youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com',
                'x-rapidapi-key': apiKey
              }
            }
          );
          
          if (!response.ok) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: '未找到该语言的字幕' }));
            return;
          }

          const captionText = await response.text();
          
          // 如果需要添加时间码，处理文本
          // 注意：text格式可能已包含时间码，需要测试
          
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(captionText || '❌ 無字幕內容');
          return;
        }
        
      } catch (error: any) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'An internal server error occurred', details: error.message }));
        return;
      }
    }
  }
  next();
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    {
      name: 'api-middleware',
      configResolved(config: any) {
        // Load environment variables when config is resolved
        const env = loadEnv(config.mode, process.cwd(), '');
        RAPIDAPI_KEY = env.RAPIDAPI_KEY || '';
      },
      configureServer(server: any) {
        server.middlewares.use(apiMiddleware);
      }
    },
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'YouTube資訊提取器-icon-192.png', 'mask-icon.svg', 'icons/icon.svg'],
      manifest: {
        name: 'YT 工具箱',
        short_name: 'YT 工具',
        description: 'YouTube 影片字幕、縮圖與詳情獲取工具',
        theme_color: '#DC2626',
        background_color: '#0f0f14',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'YouTube資訊提取器-icon-16.png',
            sizes: '16x16',
            type: 'image/png'
          },
          {
            src: 'YouTube資訊提取器-icon-32.png',
            sizes: '32x32',
            type: 'image/png'
          },
          {
            src: 'YouTube資訊提取器-icon-48.png',
            sizes: '48x48',
            type: 'image/png'
          },
          {
            src: 'YouTube資訊提取器-icon-64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'YouTube資訊提取器-icon-128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'YouTube資訊提取器-icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'YouTube資訊提取器-icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'YouTube資訊提取器-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        share_target: {
          action: "/",
          method: "GET",
          enctype: "application/x-www-form-urlencoded",
          params: {
            url: "url"
          }
        }
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/img\.youtube\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'youtube-thumbnails',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
