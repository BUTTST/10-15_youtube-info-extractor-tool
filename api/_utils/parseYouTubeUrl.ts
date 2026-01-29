export function parseYouTubeUrl(input: string) {
  const raw = input?.trim();
  if (!raw) return { url_kind: 'invalid', raw_url: input, error: 'empty' };

  try {
    const url = new URL(raw);
    const host = url.hostname;
    const path = url.pathname;
    const params = url.searchParams;
    const v = params.get('v');
    const list = params.get('list');
    let video_id: string | null = null;
    let playlist_id: string | null = null;

    // short link youtu.be/VIDEO_ID
    if (host.includes('youtu.be')) {
      const seg = path.split('/').filter(Boolean);
      if (seg.length >= 1) video_id = seg[0];
    }

    // shorts
    if (!video_id && path.startsWith('/shorts/')) {
      const seg = path.split('/').filter(Boolean);
      if (seg.length >= 2) video_id = seg[1] || seg[0];
    }

    if (!video_id && v) video_id = v;
    if (list) playlist_id = list;

    // Determine url_kind
    let url_kind = 'unknown';
    if (path.startsWith('/playlist') && playlist_id) url_kind = 'playlist';
    else if ((path.startsWith('/watch') || video_id) && playlist_id) url_kind = 'video_in_playlist';
    else if (video_id) url_kind = 'video';
    else if (path.startsWith('/shorts/')) url_kind = 'shorts';

    // playlist_kind heuristic by prefix
    let playlist_kind = '';
    if (playlist_id) {
      if (/^RD/.test(playlist_id)) playlist_kind = 'mix_radio';
      else if (/^PL/.test(playlist_id)) playlist_kind = 'user_playlist';
      else if (/^UU/.test(playlist_id)) playlist_kind = 'channel_uploads';
      else if (/^LL/.test(playlist_id)) playlist_kind = 'likes_watch_later';
      else playlist_kind = 'other';
    }

    // processable_level heuristic
    const processable_level = playlist_id
      ? (/^RD/.test(playlist_id) ? 'unstable' : 'stable')
      : 'n/a';

    return {
      url_kind,
      host,
      path,
      video_id: video_id || null,
      playlist_id: playlist_id || null,
      playlist_kind,
      processable_level,
      raw_url: raw
    };
  } catch (e) {
    // maybe input is raw id
    const trimmed = raw;
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return { url_kind: 'video', video_id: trimmed, raw_url: raw, host: '', path: '' };
    }
    return { url_kind: 'invalid', raw_url: raw, error: 'Cannot parse' };
  }
}

