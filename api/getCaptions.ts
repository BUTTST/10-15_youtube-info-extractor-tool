import type { VercelRequest, VercelResponse } from '@vercel/node';

interface CaptionTrack {
  languageCode: string;
  languageName: string;
  isDefault: boolean;
}

interface CaptionSegment {
  text: string;
  start: number;
  duration: number;
}

// 格式化字幕文本
function formatCaptions(segments: CaptionSegment[], withTimestamp: boolean): string {
  if (!segments || segments.length === 0) {
    return "無可用字幕內容";
  }

  return segments.map(segment => {
    const text = segment.text.trim();
    
    if (withTimestamp) {
      const minutes = Math.floor(segment.start / 60);
      const seconds = Math.floor(segment.start % 60);
      const timestamp = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      return `[${timestamp}] ${text}`;
    }
    return text;
  }).join('\n');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId, lang, format } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  // Use client-provided key first, fallback to server environment variable
  const clientApiKey = req.headers['x-rapidapi-key-client'] as string;
  const apiKey = clientApiKey || process.env.RAPIDAPI_KEY || 'f89f95249amsh669a5069f1ce946p178a57jsn6b1e586b0f93';

  // 如果請求格式化字幕和指定語言，獲取該語言的字幕文本
  if (format === 'formatted' && lang) {
    const url = `https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/get-video-info/${videoId}?format=json&lang=${lang}`;
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        return res.status(response.status).json({ 
          error: 'Failed to fetch captions from API', 
          details: errorData 
        });
      }

      const data = await response.json();
      const withTimestamp = req.query.timestamp === 'true';
      
      // 提取字幕片段
      const segments = data.captions || data.segments || [];
      const formattedText = formatCaptions(segments, withTimestamp);
      
      return res.status(200).send(formattedText);
    } catch (error) {
      console.error('Caption fetch error:', error);
      return res.status(500).json({ error: 'An internal server error occurred', details: error.message });
    }
  }

  // 獲取可用的字幕軌列表
  const url = `https://youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com/get-video-info/${videoId}?format=json`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'youtube-captions-transcript-subtitles-video-combiner.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return res.status(response.status).json({ 
        error: 'Failed to fetch caption list from API', 
        details: errorData 
      });
    }

    const data = await response.json();
    
    // 提取可用的字幕語言列表
    const captionTracks = data.availableLanguages || data.captions || [];
    const formattedTracks = Array.isArray(captionTracks) ? captionTracks.map((track: any) => ({
      lang: track.languageName || track.name || track.lang,
      code: track.languageCode || track.code,
      url: track.url || ''
    })) : [];

    res.status(200).json({ 
      actions: [{
        updateengagementpanelaction: {
          content: {
            transcriptrenderer: {
              content: {
                transcriptsearchpanelrenderer: {
                  footer: {
                    transcriptsubmenurenderer: {
                      items: formattedTracks.map((track: any) => ({
                        transcriptsubmenuitemrenderer: {
                          title: { simpletext: track.lang },
                          continuation: { reloadcontinuationdata: { continuation: track.code } }
                        }
                      }))
                    }
                  }
                }
              }
            }
          }
        }
      }]
    });

  } catch (error) {
    console.error('Caption list error:', error);
    res.status(500).json({ error: 'An internal server error occurred', details: error.message });
  }
}
