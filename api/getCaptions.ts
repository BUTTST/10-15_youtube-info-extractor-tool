import type { VercelRequest, VercelResponse } from '@vercel/node';

module.exports = async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { videoId } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured' });
  }

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(`https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/v1?videoId=${videoId}`, options);
    
    if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ error: 'Failed to fetch captions from API', details: errorData });
    }

    const data = await response.json();
    
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
}
