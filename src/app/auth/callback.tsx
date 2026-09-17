import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Text } from 'react-native';
import { Screen } from '@/components/screen';
import { Button } from '@/components/button';
import { completeAuthCallback } from '@/features/auth/auth-actions';
import { colors } from '@/design/tokens';
export default function AuthCallback() {
  const nativeUrl = Linking.useURL();
  const [error,setError]=useState(false);
  const url = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.href : nativeUrl;
  useEffect(() => {
    if (!url) return;
    let active=true;
    completeAuthCallback(url).then(() => { if (active) router.replace('/account'); }).catch(() => { if (active) setError(true); });
    return () => { active=false; };
  },[url]);
  return <Screen><Text style={{color:colors.ink,fontSize:22,marginVertical:40}}>{error ? 'Sign-in couldn’t be completed.' : 'Finishing your sign-in…'}</Text>
    {error && <Button label="Return to Account" onPress={() => router.replace('/account')} />}</Screen>;
}
