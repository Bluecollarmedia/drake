import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';

import { createLocalRepository, initialState, type LocalState } from '@/data/local-state';
import type { MusicService } from '@/domain/music';

const repository = createLocalRepository(AsyncStorage);
interface AppStateValue {
  state: LocalState;
  ready: boolean;
  saving: boolean;
  error: string | null;
  retryLoad(): void;
  setMusicService(service: MusicService): Promise<boolean>;
  toggleSaved(id: string): Promise<boolean>;
  clearError(): void;
}
const Context = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = useRef(state);
  const writing = useRef(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    repository.load().then(value => {
      if (!active) return;
      current.current = value;
      setState(value);
      setReady(true);
      setError(null);
    }).catch(() => {
      if (active) setError('Your preferences couldn’t be loaded. Please try again.');
    });
    return () => { active = false; };
  }, [loadAttempt]);

  const update = useCallback(async (transform: (value: LocalState) => LocalState) => {
    if (writing.current) return false;
    writing.current = true;
    setSaving(true);
    setError(null);
    try {
      const next = transform(current.current);
      await repository.save(next);
      current.current = next;
      setState(next);
      return true;
    } catch {
      setError('That change couldn’t be saved. Please try again.');
      return false;
    } finally {
      writing.current = false;
      setSaving(false);
    }
  }, []);

  return <Context.Provider value={{
    state, ready, saving, error,
    retryLoad: () => { setError(null); setLoadAttempt(value => value + 1); },
    clearError: () => setError(null),
    setMusicService: service => update(value => ({ ...value, musicService: service })),
    toggleSaved: id => update(value => ({ ...value, savedSongIds: value.savedSongIds.includes(id)
      ? value.savedSongIds.filter(item => item !== id) : [...value.savedSongIds, id] })),
  }}>{children}</Context.Provider>;
}

export function useAppState() {
  const value = useContext(Context);
  if (!value) throw new Error('useAppState requires AppStateProvider');
  return value;
}
