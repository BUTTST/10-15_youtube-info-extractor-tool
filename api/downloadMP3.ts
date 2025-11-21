import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Video ID is required' });
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
      'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(
      `https://youtube-mp36.p.rapidapi.com/dl?id=${id}`, 
      options
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return res.status(response.status).json({ 
        error: 'Failed to fetch MP3 from API', 
        details: errorData 
      });
    }

    // 檢查響應類型
    const contentType = response.headers.get('content-type');
    
    // 如果返回的是 JSON（包含下載鏈接或處理狀態）
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // 返回完整的響應，包括 status, progress, link 等
      // 讓前端根據 status 決定是否需要輪詢
      return res.status(200).json({
        status: data.status || 'unknown',
        link: data.link || '',
        title: data.title || null,
        progress: data.progress || null,
        duration: data.duration || null,
        msg: data.msg || null,
        // 為了向後兼容，也提供 downloadUrl
        downloadUrl: data.link || data.url || data.downloadUrl || data.mp3 || data.download || ''
      });
    }
    
    // 如果返回的是文件流（直接是 MP3 文件）
    if (contentType && contentType.includes('audio/')) {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="audio_${id}.mp3"`);
      res.setHeader('Content-Length', buffer.length.toString());
      
      return res.status(200).send(buffer);
    }
    
    // 其他情況，嘗試作為文件流處理
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="audio_${id}.mp3"`);
    res.setHeader('Content-Length', buffer.length.toString());
    
    return res.status(200).send(buffer);
    
  } catch (error) {
    console.error('MP3 Download API Error:', error);
    res.status(500).json({ 
      error: 'An internal server error occurred', 
      details: (error as Error).message 
    });
  }
}

