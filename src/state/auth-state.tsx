import type { Session } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import { getSupabase } from '@/data/supabase';
import { installationRepository } from '@/platform/installation';
import { useAppState } from './app-state';

interface AuthState {
  ready: boolean; hasAccount: boolean; email: string | null; error: string | null;
  retry(): void; signOut(): Promise<void>;
}
const Context = createContext<AuthState | null>(null);
let bootstrap: Promise<Session> | null = null;
async function ensureSession() {
  if (!bootstrap) bootstrap = (async () => {
    await installationRepository.get(); // Secure proof is persisted before contacting the server.
    const client = getSupabase();
    const existing = await client.auth.getSession();
    if (existing.error) throw existing.error; // A connection error must not silently create another Auth user.
    if (existing.data.session) return existing.data.session;
    const anonymous = await client.auth.signInAnonymously();
    if (anonymous.error || !anonymous.data.session) throw anonymous.error ?? new Error('No anonymous session.');
    return anonymous.data.session;
  })().finally(() => { bootstrap = null; });
  return bootstrap;
}
export function AuthStateProvider({ children }: PropsWithChildren) {
  const { state, ready: preferencesReady } = useAppState();
  const [session, setSession] = useState<Session | null>(null);
  const [registeredSession, setRegisteredSession] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => { setRegisteredSession(null); setError(null); setAttempt(value => value + 1); }, []);
  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    let removeLifecycle = () => {};
    void Promise.resolve().then(() => {
      if (!active) return;
      const client = getSupabase();
      // Keep the callback synchronous; network work belongs in effects, avoiding Auth lock deadlocks.
      const subscription = client.auth.onAuthStateChange((_event, next) => {
        if (active) { setSession(next); if (!next) setRegisteredSession(null); }
      });
      unsubscribe = () => subscription.data.subscription.unsubscribe();
      if (Platform.OS !== 'web') {
        const onLifecycle = (value: string) => { if (value === 'active') client.auth.startAutoRefresh(); else client.auth.stopAutoRefresh(); };
        onLifecycle(AppState.currentState);
        const listener = AppState.addEventListener('change', onLifecycle);
        removeLifecycle = () => { listener.remove(); client.auth.stopAutoRefresh(); };
      }
      ensureSession().then(next => { if (active) setSession(next); }).catch(() => {
        if (active) setError('We couldn’t connect your account. Your preview is still available.');
      });
    }).catch(() => { if (active) setError('Account services aren’t available yet. Your preview is still available.'); });
    return () => { active = false; unsubscribe(); removeLifecycle(); };
  }, [attempt]);
  const userId = session?.user.id;
  const anonymous = session?.user.is_anonymous;
  const sessionKey = userId ? `${userId}:${anonymous}` : null;
  useEffect(() => {
    if (!userId || !preferencesReady) return;
    let active = true;
    (async () => {
      const identity = await installationRepository.get();
      const client = getSupabase();
      const { error: registrationError } = await client.rpc('register_installation', {
        p_id: identity.id, p_token: identity.token, p_platform: Platform.OS,
        p_app_version: Constants.expoConfig?.version ?? 'unknown',
      });
      if (registrationError) throw registrationError;
      if (state.musicService) {
        const { error: profileError } = await client.from('profiles').update({ preferred_music_service: state.musicService, onboarding_completed: true }).eq('id', userId);
        if (profileError) throw profileError;
      }
      if (active) { setRegisteredSession(`${userId}:${anonymous}`); setError(null); }
    })().catch(() => { if (active) { setRegisteredSession(null); setError('We couldn’t sync your account. Please try again.'); } });
    return () => { active = false; };
  }, [userId, anonymous, preferencesReady, state.musicService, attempt]);
  const signOut = async () => {
    const { error: signOutError } = await getSupabase().auth.signOut({ scope: 'local' });
    if (signOutError) throw signOutError;
    // Installation identity and server ledger are intentionally retained.
    setSession(null); setRegisteredSession(null); retry();
  };
  return <Context.Provider value={{ ready: sessionKey !== null && registeredSession === sessionKey, hasAccount: session?.user.is_anonymous === false,
    email: session?.user.is_anonymous === false ? session.user.email ?? null : null, error, retry, signOut }}>{children}</Context.Provider>;
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error('useAuth requires AuthStateProvider.');
  return value;
}
