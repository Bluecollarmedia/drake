import type { Recommendation } from '@/domain/recommendation';
import type { MusicService } from '@/domain/music';
export async function shareRecommendation(song: Recommendation, service: MusicService): Promise<'shared' | 'copied'> {
  const link= song.links[service] ?? song.links.spotify ?? song.links.apple;
  const text = `${song.title} — ${song.artist}\n\n${song.explanation}${link?`\n\n${link}`:''}\n\nFound with Which Drake?`;
  if (navigator.share) {
    try { await navigator.share({ title: 'Which Drake?', text }); }
    catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) throw error; }
    return 'shared';
  }
  await navigator.clipboard.writeText(text);
  return 'copied';
}
