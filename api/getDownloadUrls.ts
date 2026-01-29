import ytdl from 'ytdl-core';
import { parseYouTubeUrl } from './_utils/parseYouTubeUrl';

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

  const parsed = parseYouTubeUrl(url);

  try {
    // Use ytdl-core to get video info and formats
    const info = await ytdl.getInfo(url);
    const lengthSeconds = Number(info.videoDetails.lengthSeconds || 0);

    // Collect useful formats
    const formats = info.formats.filter((f: any) => f.url);

    // Determine desired candidate formats based on requested format
    const candidates = formats
      .filter((f: any) => {
        if (format === 'mp3') {
          return /audio\//.test(String(f.mimeType));
        }
        return /video\//.test(String(f.mimeType));
      })
      .sort((a: any, b: any) => {
        const ab = Number(a.averageBitrate || a.bitrate || 0);
        const bb = Number(b.averageBitrate || b.bitrate || 0);
        return bb - ab;
      });

    // Map to response entries with estimated sizes
    const mapped = candidates.map((f: any) => {
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
        estimated: !Boolean(f.contentLength)
      };
    });

    const response = {
      url_kind: parsed.url_kind,
      raw_url: parsed.raw_url,
      id: info.videoDetails.videoId,
      title: info.videoDetails.title,
      lengthSeconds,
      thumbnails: info.videoDetails.thumbnail?.thumbnails || [],
      candidates: mapped,
      candidatesCount: mapped.length,
    };

    return res.status(200).json(response);
  } catch (err: any) {
    console.error('getDownloadUrls error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to resolve download URLs', details: err?.message });
  }
}

