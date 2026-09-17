import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { getBackendConfig, getSupabase } from '@/data/supabase';
import { randomToken } from '@/platform/installation';

export type AccountMode = 'upgrade' | 'sign-in';
export function authRedirect() { return AuthSession.makeRedirectUri({ scheme: 'whichdrake', path: 'auth/callback' }); }
export async function loadAuthProviders() {
  const { url, key } = getBackendConfig();
  const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
  if (!response.ok) throw new Error('Account services are unavailable.');
  const settings = await response.json();
  return { apple: settings.external?.apple === true, google: settings.external?.google === true,
    email: settings.external?.email === true && process.env.EXPO_PUBLIC_EMAIL_OTP_READY === 'true' };
}
const callbacks = new Map<string, Promise<void>>();
export function completeAuthCallback(url: string) {
  const callback = new URL(url);
  const expected = new URL(authRedirect());
  if (callback.protocol !== expected.protocol || callback.host !== expected.host || callback.pathname !== expected.pathname) {
    return Promise.reject(new Error('Unexpected sign-in callback.'));
  }
  if (callback.searchParams.has('error')) return Promise.reject(new Error('Sign-in couldn’t be completed. Please try again.'));
  const code = callback.searchParams.get('code');
  if (!code) return Promise.reject(new Error('No sign-in code was received.'));
  let pending = callbacks.get(code);
  if (!pending) {
    pending = (async () => {
      const { error } = await getSupabase().auth.exchangeCodeForSession(code);
      if (error) throw error;
    })();
    callbacks.set(code, pending);
    if (callbacks.size > 16) callbacks.delete(callbacks.keys().next().value!);
  }
  return pending;
}
export async function continueOAuth(provider: 'google' | 'apple', mode: AccountMode) {
  const client = getSupabase();
  const credentials = { provider, options: { redirectTo: authRedirect(), skipBrowserRedirect: true } };
  const { data, error } = mode === 'upgrade'
    ? await client.auth.linkIdentity(credentials) : await client.auth.signInWithOAuth(credentials);
  if (error) throw error;
  if (!data.url) throw new Error('Sign-in isn’t available yet.');
  if (Platform.OS === 'web') {
    window.location.assign(data.url);
    return;
  }
  const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirect());
  if (result.type === 'success') await completeAuthCallback(result.url);
  else throw Object.assign(new Error('Sign-in cancelled.'), { code: 'auth_cancelled' });
}
export async function continueApple(mode: AccountMode) {
  if (Platform.OS !== 'ios') return continueOAuth('apple', mode);
  const nonce = await randomToken(); const state = await randomToken();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL], nonce: hashedNonce, state,
  });
  if (!credential.identityToken || credential.state !== state) throw new Error('Apple sign-in couldn’t be verified.');
  const credentials = { provider: 'apple', token: credential.identityToken, nonce };
  const { error } = mode === 'upgrade' ? await getSupabase().auth.linkIdentity(credentials) : await getSupabase().auth.signInWithIdToken(credentials);
  if (error) throw error;
}
export async function sendEmailCode(email: string, mode: AccountMode) {
  const client = getSupabase();
  const { error } = mode === 'upgrade'
    ? await client.auth.updateUser({ email }, { emailRedirectTo: authRedirect() })
    : await client.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: authRedirect() } });
  if (error) throw error;
}
export async function verifyEmailCode(email: string, token: string, mode: AccountMode) {
  const { error } = await getSupabase().auth.verifyOtp({ email, token, type: mode === 'upgrade' ? 'email_change' : 'email' });
  if (error) throw error;
}
export function accountError(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : null;
  if (code === 'ERR_REQUEST_CANCELED' || code === 'auth_cancelled') return null;
  if (code === 'identity_already_exists' || code === 'email_exists' || code === 'user_already_exists') return 'That login belongs to an account. Choose Sign in to use it.';
  if (code === 'manual_linking_disabled') return 'Account upgrades aren’t available yet.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Please wait a little before trying again.';
  if (code === 'otp_expired') return 'That code expired. Please request another one.';
  return 'We couldn’t complete that sign-in. Please try again.';
}
