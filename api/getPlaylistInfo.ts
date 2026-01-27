function extractPlaylistId(url: string): string | null {
  try {
    const u = new URL(url);
    const list = u.searchParams.get('list');
    if (list) return list;
  } catch (e) {
    // not a full url, maybe raw id
    if (/^[a-zA-Z0-9_-]+$/.test(url)) return url;
  }
  return null;
}

export default async function handler(req: any, res: any) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Playlist URL or ID is required' });
  }

  const playlistId = extractPlaylistId(url);
  if (!playlistId) {
    return res.status(400).json({ error: 'Invalid playlist URL or ID' });
  }

  const apiKey = (globalThis as any)?.process?.env?.RAPIDAPI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured. Please set RAPIDAPI_KEY.' });
  }

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'youtube-v31.p.rapidapi.com'
    }
  };

  try {
    // Use playlistItems endpoint to list playlist videos (first page)
    const resp = await fetch(`https://youtube-v31.p.rapidapi.com/playlistItems?playlistId=${playlistId}&part=snippet,contentDetails&maxResults=50`, options);
    if (!resp.ok) {
      const details = await resp.json().catch(() => ({}));
      return res.status(resp.status).json({ error: 'Failed to fetch playlist', details });
    }

    const data = await resp.json();
    const items = (data.items || []).map((it: any) => {
      const thumbs = it.snippet?.thumbnails || {};
      const thumbArr = Object.values(thumbs) as any[];
      const thumbUrl = thumbArr.length ? (thumbArr[thumbArr.length - 1]?.url || '') : '';
      return {
        id: it.contentDetails?.videoId || '',
        title: it.snippet?.title || '無標題',
        thumbnail: thumbUrl,
        publishedAt: it.contentDetails?.videoPublishedAt || it.snippet?.publishedAt || '',
      };
    });

    return res.status(200).json({
      playlistId,
      title: data.snippet?.title || '',
      items,
      totalResults: data.pageInfo?.totalResults || items.length,
    });
  } catch (err: any) {
    console.error('getPlaylistInfo error:', err?.message || err);
    return res.status(500).json({ error: 'Internal error', details: err?.message });
  }
}

