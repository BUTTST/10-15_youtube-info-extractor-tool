import type { VercelRequest, VercelResponse } from '@vercel/node';

function extractVideoId(url: string): string | null {
  // 支援多種 YouTube URL 格式
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^#\&\?\s]{11})/,
    /^([^#\&\?\s]{11})$/ // 直接輸入影片 ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'YouTube URL or video ID is required' });
  }

  const videoId = extractVideoId(url);

  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL or video ID' });
  }

  // Use server environment variable only
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API key not configured. Please set RAPIDAPI_KEY environment variable.' 
    });
  }

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'youtube-v31.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(
      `https://youtube-v31.p.rapidapi.com/videos?part=contentDetails,snippet,statistics&id=${videoId}`, 
      options
    );
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        return res.status(response.status).json({ 
          error: 'Failed to fetch data from YouTube API', 
          details: errorData 
        });
    }

    const data = await response.json();
    
    // YouTube Data API v3 格式：數據在 items 陣列中
    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
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
    
    // 格式化回傳數據，確保前端能正確解析，處理可能的 null 值
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
    
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'An internal server error occurred', details: error.message });
  }
}
