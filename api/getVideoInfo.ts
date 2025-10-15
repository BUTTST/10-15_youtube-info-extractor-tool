import type { VercelRequest, VercelResponse } from '@vercel/node';

function extractVideoId(url: string): string | null {
  const regex = /(?:v=|youtu\.be\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'YouTube URL is required' });
  }

  const videoId = extractVideoId(url);

  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  // Use client-provided key first, fallback to environment variable
  const clientApiKey = req.headers['x-rapidapi-key-client'] as string;
  const apiKey = clientApiKey || process.env.VITE_RAPIDAPI_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on the server or provided by the client' });
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
        const errorData = await response.json();
        return res.status(response.status).json({ error: 'Failed to fetch data from YouTube API', details: errorData });
    }

    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
}
