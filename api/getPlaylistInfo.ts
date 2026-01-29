import { parseYouTubeUrl } from './_utils/parseYouTubeUrl';

export default async function handler(req: any, res: any) {
  const { url, maxItems } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Playlist URL or ID is required' });
  }

  const parsed = parseYouTubeUrl(url);
  if (!parsed.playlist_id) {
    return res.status(400).json({ error: 'Invalid playlist URL or ID', parsed });
  }

  const playlistId = parsed.playlist_id;
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
    const items: any[] = [];
    let nextPageToken: string | null = null;
    const limit = Math.min(Number(maxItems || 200), 500); // safety cap
    let fetched = 0;

    do {
      const pageSize = Math.min(50, limit - fetched);
      const urlStr = `https://youtube-v31.p.rapidapi.com/playlistItems?playlistId=${playlistId}&part=snippet,contentDetails&maxResults=${pageSize}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
      const resp = await fetch(urlStr, options);
      if (!resp.ok) {
        const details = await resp.json().catch(() => ({}));
        return res.status(resp.status).json({ error: 'Failed to fetch playlist', details });
      }
      const data = await resp.json();
      const pageItems = (data.items || []).map((it: any) => {
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

      items.push(...pageItems);
      fetched += pageItems.length;
      nextPageToken = data.nextPageToken || null;
    } while (nextPageToken && fetched < limit);

    // Build response with parse metadata
    const response = {
      url_kind: parsed.url_kind,
      playlistId,
      playlist_kind: parsed.playlist_kind,
      processable_level: parsed.processable_level,
      title: '', // RapidAPI playlist title endpoint not used here
      items,
      totalFetched: items.length,
      partial: !!nextPageToken
    };

    return res.status(200).json(response);
  } catch (err: any) {
    console.error('getPlaylistInfo error:', err?.message || err);
    return res.status(500).json({ error: 'Internal error', details: err?.message });
  }
}

