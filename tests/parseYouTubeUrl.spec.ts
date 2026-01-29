import { parseYouTubeUrl } from '../api/_utils/parseYouTubeUrl';

describe('parseYouTubeUrl', () => {
  it('parses watch url with video id', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/watch?v=8SFo7A8sD04');
    expect(res.url_kind).toBe('video');
    expect(res.video_id).toBe('8SFo7A8sD04');
  });

  it('parses short url', () => {
    const res = parseYouTubeUrl('https://youtu.be/8SFo7A8sD04');
    expect(res.url_kind).toBe('video');
    expect(res.video_id).toBe('8SFo7A8sD04');
  });

  it('parses playlist url', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/playlist?list=PL12345');
    expect(res.url_kind).toBe('playlist');
    expect(res.playlist_id).toBe('PL12345');
  });

  it('parses video in playlist', () => {
    const res = parseYouTubeUrl('https://www.youtube.com/watch?v=8SFo7A8sD04&list=RD8SFo7A8sD04');
    expect(res.url_kind).toBe('video_in_playlist');
    expect(res.playlist_id).toBe('RD8SFo7A8sD04');
  });
});

