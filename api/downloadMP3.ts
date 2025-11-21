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
    
    // 如果返回的是 JSON（包含下載鏈接）
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // API 可能返回 { link: "..." } 或 { url: "..." } 或 { downloadUrl: "..." }
      const downloadUrl = data.link || data.url || data.downloadUrl || data.mp3 || data.download;
      
      if (downloadUrl) {
        return res.status(200).json({ 
          downloadUrl: downloadUrl,
          title: data.title || null,
          status: data.status || 'ok'
        });
      }
      
      // 如果 JSON 中沒有下載鏈接，返回整個響應
      return res.status(200).json(data);
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

