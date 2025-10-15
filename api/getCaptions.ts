import type { VercelRequest, VercelResponse } from '@vercel/node';

interface TranscriptItem {
  tStartMs: number;
  dDurationMs: number;
  segs: { utf8: string }[];
}

interface TranscriptResponse {
  wireMagic: string;
  actions: {
    updateengagementpanelaction: {
      targetId: string;
      content: {
        transcriptrenderer: {
          content: {
            transcriptsearchpanelrenderer: {
              body: {
                transcriptsegmentlistrenderer: {
                  initialsegments: TranscriptItem[];
                };
              };
            };
          };
        };
      };
    };
  }[];
}

function formatTranscript(transcript: TranscriptResponse, withTimestamp: boolean): string {
  if (!transcript?.actions?.[0]?.updateengagementpanelaction?.content?.transcriptrenderer?.content?.transcriptsearchpanelrenderer?.body?.transcriptsegmentlistrenderer?.initialsegments) {
    return "無法解析字幕格式。";
  }

  const segments = transcript.actions[0].updateengagementpanelaction.content.transcriptrenderer.content.transcriptsearchpanelrenderer.body.transcriptsegmentlistrenderer.initialsegments;

  return segments.map(item => {
    const startTime = new Date(item.tStartMs).toISOString().substr(14, 5);
    const text = item.segs.map(seg => seg.utf8).join('').replace(/\s+/g, ' ').trim();
    
    if (withTimestamp) {
      return `${startTime}\n${text}`;
    }
    return text;
  }).join('\n\n');
}


export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { videoId, lang, format } = req.query;

  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  // Use client-provided key first, fallback to environment variable
  const clientApiKey = req.headers['x-rapidapi-key-client'] as string;
  const apiKey = clientApiKey || process.env.VITE_RAPIDAPI_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on the server or provided by the client' });
  }

  const url = `https://youtube-v3-alternative.p.rapidapi.com/transcript?id=${videoId}${lang ? `&lang=${lang}` : ''}`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'youtube-v3-alternative.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'Failed to fetch transcript from API', details: errorData });
    }

    const data: TranscriptResponse = await response.json();

    if (format === 'formatted') {
      const withTimestamp = req.query.timestamp === 'true';
      const formattedText = formatTranscript(data, withTimestamp);
      res.status(200).send(formattedText);
    } else {
      res.status(200).json(data);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An internal server error occurred' });
  }
}
