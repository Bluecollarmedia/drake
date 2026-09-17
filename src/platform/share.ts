import { Share } from 'react-native';
import type { Recommendation } from '@/domain/recommendation';
import type { MusicService } from '@/domain/music';
export async function shareRecommendation(song: Recommendation, service: MusicService): Promise<'shared' | 'copied'> {
  const link= song.links[service] ?? song.links.spotify ?? song.links.apple;
  await Share.share({ title: 'Which Drake?', message: `${song.title} — ${song.artist}\n\n${song.explanation}${link?`\n\n${link}`:''}\n\nFound with Which Drake?` });
  return 'shared';
}
