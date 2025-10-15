module.exports = async function handler(req, res) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'YouTube URL is required' });
  }

  const videoId = extractVideoId(url);

  if (!videoId) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured' });
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

    const videoDetails = {
      id: data.id,
      title: data.title,
      thumbnail: data.thumbnails[data.thumbnails.length - 1].url, // Get highest quality
      views: data.viewCount,
      publishDate: data.publishedAt,
      author: data.author,
    };
    
    res.status(200).json(videoDetails);

  } catch (error) {
    console.error('Error in getVideoInfo:', error);
    res.status(500).json({ 
      error: 'An internal server error occurred',
      message: error.message,
      details: error.toString()
    });
  }
}

function extractVideoId(url) {
  const regex = /(?:v=|youtu\.be\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regex);
  return match && match[1] ? match[1] : null;
}
