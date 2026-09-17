import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider, useAppState } from '@/state/app-state';
import { colors } from '@/design/tokens';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/button';
import { AuthStateProvider } from '@/state/auth-state';
import { RecommendationStateProvider } from '@/state/recommendation-state';

export { ErrorBoundary } from 'expo-router';
void SplashScreen.preventAutoHideAsync().catch(() => {});
const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.white, card: colors.white, text: colors.ink, primary: colors.blue } };

function Navigation() {
  const { ready, state, error, retryLoad } = useAppState();
  useEffect(() => { if (ready || error) void SplashScreen.hideAsync(); }, [ready, error]);
  if (!ready) return <View style={styles.loading}><BrandLogo />
    {error ? <><Text accessibilityRole="alert" style={styles.error}>{error}</Text><Button label="Try Again" onPress={retryLoad} /></> : <ActivityIndicator color={colors.blue} style={{ marginTop: 24 }} accessibilityLabel="Loading preferences" />}
  </View>;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white }, animation: 'slide_from_right' }}>
    <Stack.Screen name="index" />
    <Stack.Screen name="account" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    <Stack.Screen name="subscription" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    <Stack.Screen name="auth/callback" />
    <Stack.Protected guard={!state.musicService}><Stack.Screen name="onboarding" options={{ gestureEnabled: false }} /></Stack.Protected>
    <Stack.Protected guard={!!state.musicService}><Stack.Screen name="(tabs)" /></Stack.Protected>
  </Stack>;
}

export default function RootLayout() {
  return <SafeAreaProvider><ThemeProvider value={theme}><AppStateProvider><AuthStateProvider><RecommendationStateProvider>
    <StatusBar style="dark" /><Navigation />
  </RecommendationStateProvider></AuthStateProvider></AppStateProvider></ThemeProvider></SafeAreaProvider>;
}
const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  error: { fontSize: 16, color: colors.secondary, textAlign: 'center', lineHeight: 24 },
});
