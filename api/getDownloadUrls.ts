import ytdl from 'ytdl-core';

function bytesToHuman(bytes: number) {
  if (!bytes || bytes <= 0) return '未知';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let v = bytes;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(2)} ${units[i]}`;
}

export default async function handler(req: any, res: any) {
  const { url, format } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'YouTube URL is required' });
  }

  try {
    // Use ytdl-core to get video info and formats
    const info = await ytdl.getInfo(url);
    const lengthSeconds = Number(info.videoDetails.lengthSeconds || 0);

    // Collect useful formats
    const formats = info.formats.filter(f => f.url);

    // Determine desired candidate formats based on requested format
    const candidates = formats
      .filter(f => {
        if (format === 'mp3') {
          // audio-only formats (m4a/webm)
          return /audio\//.test(String(f.mimeType));
        }
        // mp4 / video: prefer container mp4 or mp4-like with both audio+video
        return /video\//.test(String(f.mimeType));
      })
      // sort by bitrate/quality descending
      .sort((a, b) => {
        const ab = Number(a.averageBitrate || a.bitrate || 0);
        const bb = Number(b.averageBitrate || b.bitrate || 0);
        return bb - ab;
      });

    // Map to response entries with estimated sizes
    const mapped = candidates.map(f => {
      let sizeBytes: number | null = null;
      if (f.contentLength) {
        sizeBytes = Number(f.contentLength);
      } else {
        const bitrate = Number(f.averageBitrate || f.bitrate || 0); // bits per second
        if (bitrate && lengthSeconds) {
          // bits -> bytes
          sizeBytes = Math.round((bitrate * lengthSeconds) / 8);
        }
      }

      return {
        itag: f.itag,
        mimeType: f.mimeType,
        qualityLabel: f.qualityLabel || f.audioBitrate || null,
        url: f.url,
        estimatedSizeBytes: sizeBytes,
        estimatedSizeHuman: sizeBytes ? bytesToHuman(sizeBytes) : '未知',
      };
    });

    // Return top candidates and basic metadata
    const response = {
      id: info.videoDetails.videoId,
      title: info.videoDetails.title,
      lengthSeconds,
      thumbnails: info.videoDetails.thumbnail?.thumbnails || [],
      bestCandidates: mapped.slice(0, 5),
      allCandidatesCount: mapped.length,
    };

    return res.status(200).json(response);
  } catch (err: any) {
    console.error('getDownloadUrls error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to resolve download URLs', details: err?.message });
  }
}

