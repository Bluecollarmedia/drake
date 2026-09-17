import type { MusicService } from './music';

export interface Recommendation {
  outcome: 'match';
  requestId: string;
  id: string;
  title: string;
  artist: string;
  artists: string[];
  version: string;
  releaseTitle: string | null;
  releaseDate: string | null;
  artworkUrl: string | null;
  explanation: string;
  confidence: number;
  links: Partial<Record<MusicService, string>>;
}

export interface NoStrongMatch {
  outcome: 'no_strong_match';
  requestId: string;
  message: string;
  guidance: string;
  explanation: string;
}
export type RecommendationOutcome = Recommendation | NoStrongMatch;

// UI fixture only. User input is never transmitted or used by a recommendation algorithm.
export const mockRecommendation: Recommendation = {
  outcome: 'match',
  requestId: 'phase1-request',
  id: 'phase1-take-care',
  title: 'Take Care',
  artist: 'Drake',
  artists: ['Drake'], version: 'original', releaseTitle: 'Take Care', releaseDate: '2011-11-15', artworkUrl: null,
  explanation: 'You’re not necessarily missing the relationship itself — you’re missing the connection you had. This song captures that space between letting go and still caring.',
  confidence: 0.9, links: {
    spotify: 'https://open.spotify.com/track/124NFj84ppZ5pAxTuVQYCQ',
    apple: 'https://music.apple.com/us/song/1440746117',
  },
};
