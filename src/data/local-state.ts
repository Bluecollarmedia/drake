import { isMusicService, type MusicService } from '../domain/music.ts';

export interface LocalState {
  version: 1;
  musicService: MusicService | null;
  savedSongIds: string[];
}

export interface StoragePort {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export const STORAGE_KEY = 'which-drake:local-state:v1';
export const initialState: LocalState = { version: 1, musicService: null, savedSongIds: [] };

export function decodeLocalState(raw: string | null): LocalState {
  if (!raw) return { ...initialState, savedSongIds: [] };
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1) {
      return { ...initialState, savedSongIds: [] };
    }
    const record = value as Record<string, unknown>;
    return {
      version: 1,
      musicService: isMusicService(record.musicService) ? record.musicService : null,
      savedSongIds: Array.isArray(record.savedSongIds)
        ? [...new Set(record.savedSongIds.filter((id): id is string => typeof id === 'string' && id.length < 100))]
        : [],
    };
  } catch {
    return { ...initialState, savedSongIds: [] };
  }
}

export function createLocalRepository(storage: StoragePort) {
  return {
    async load() { return decodeLocalState(await storage.getItem(STORAGE_KEY)); },
    async save(state: LocalState) { await storage.setItem(STORAGE_KEY, JSON.stringify(state)); },
  };
}
