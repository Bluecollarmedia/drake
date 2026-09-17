export type MusicService = 'spotify' | 'apple';

export const musicServices = {
  spotify: { name: 'Spotify', playLabel: 'Play on Spotify' },
  apple: { name: 'Apple Music', playLabel: 'Play on Apple Music' },
} as const;

export function isMusicService(value: unknown): value is MusicService {
  return value === 'spotify' || value === 'apple';
}
