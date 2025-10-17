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
      'x-rapidapi-host': 'youtube-v3-alternative.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(`https://youtube-v3-alternative.p.rapidapi.com/video?id=${videoId}`, options);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        return res.status(response.status).json({ 
          error: 'Failed to fetch data from YouTube API', 
          details: errorData 
        });
    }

    const data = await response.json();
    
    // 格式化回傳數據，確保前端能正確解析
    const formattedData = {
      id: data.id,
      title: data.title,
      author: data.channelTitle,
      thumbnails: data.thumbnail || [],
      viewCount: data.viewCount,
      publishedAt: data.publishDate || data.uploadDate,
      description: data.description,
      lengthSeconds: data.lengthSeconds,
      channelId: data.channelId,
    };
    
    res.status(200).json(formattedData);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'An internal server error occurred', details: error.message });
  }
}
