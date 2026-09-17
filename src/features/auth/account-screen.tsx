import * as AppleAuthentication from 'expo-apple-authentication';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { InlineError } from '@/components/inline-error';
import { Screen } from '@/components/screen';
import { colors } from '@/design/tokens';
import { useAuth } from '@/state/auth-state';
import { accountError, continueApple, continueOAuth, loadAuthProviders, sendEmailCode, verifyEmailCode, type AccountMode } from './auth-actions';
import { deleteAccount } from '@/data/account';

const copy = {
  save: { heading: 'Keep your Drakes.', detail: 'Create an account to keep your songs across devices.' },
  allowance: { heading: 'Keep finding your Drake.', detail: 'Create a free account to continue using Which Drake?' },
  account: { heading: 'Your account.', detail: 'Keep your Drakes close, wherever you listen.' },
};
export function AccountScreen() {
  const { reason } = useLocalSearchParams<{ reason?: string }>();
  const content = copy[reason as keyof typeof copy] ?? copy.account;
  const auth = useAuth();
  const [mode, setMode] = useState<AccountMode>('upgrade');
  const [providers, setProviders] = useState({ apple: false, google: false, email: false });
  const [appleNative, setAppleNative] = useState(false);
  const [providerError, setProviderError] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const actionLock=useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [resendAfter, setResendAfter] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    let active = true;
    loadAuthProviders().then(value => { if (active) { setProviders(value); setProviderError(false); } }).catch(() => { if (active) setProviderError(true); });
    if (Platform.OS === 'ios') AppleAuthentication.isAvailableAsync().then(value => { if (active) setAppleNative(value); }).catch(() => {});
    return () => { active = false; };
  }, [auth.ready]);
  useEffect(() => {
    if (!resendAfter) return;
    const tick = () => setCooldown(Math.max(0, Math.ceil((resendAfter-Date.now())/1000)));
    tick(); const interval = setInterval(tick,1000); return () => clearInterval(interval);
  }, [resendAfter]);
  const run = async (operation: () => Promise<void>) => {
    if (actionLock.current) return;
    actionLock.current=true;
    setBusy(true); setError(null);
    try { await operation(); } catch (failure) { setError(accountError(failure)); } finally { actionLock.current=false;setBusy(false); }
  };
  const requestCode = async () => {
    await sendEmailCode(email.trim(),mode); setSent(true); setCode(''); setResendAfter(Date.now()+60000);
  };
  const close = () => { if (router.canGoBack()) router.back(); else router.replace('/settings'); };
  const disabled = busy || !auth.ready;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  return <SafeAreaView style={styles.root} edges={['top','bottom']}><Screen keyboard>
    <View style={styles.header}><View style={{ width: 44 }} /><BrandLogo width={106} />
      <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close account" style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
    </View>
    <Text accessibilityRole="header" style={styles.heading}>{auth.hasAccount ? 'Your account.' : mode === 'sign-in' ? 'Welcome back.' : content.heading}</Text>
    <Text style={styles.detail}>{auth.hasAccount ? auth.email ?? 'You’re signed in.' : content.detail}</Text>
    {auth.hasAccount ? <View style={styles.options}>
      <Text style={styles.note}>Your music preference and saved recommendations are synced to your account.</Text>
      <Button label="Sign Out" variant="outline" busy={busy} onPress={() => { void run(auth.signOut); }} />
      <Pressable accessibilityRole="button" disabled={busy} style={styles.delete} onPress={()=>Alert.alert('Delete your account?','This permanently deletes your Which Drake? account and saved songs. An Apple subscription is managed separately and may continue billing until you cancel it in Apple Subscriptions.',[
        {text:'Cancel',style:'cancel'},{text:'Delete Account',style:'destructive',onPress:()=>{void run(async()=>{await deleteAccount();await auth.signOut().catch(()=>{});close();});}},
      ])}><Text style={styles.deleteText}>Delete Account</Text></Pressable>
    </View> : <View style={styles.options}>
      {Platform.OS === 'ios' && appleNative ? <View pointerEvents={disabled || !providers.apple ? 'none' : 'auto'} accessibilityState={{ disabled: disabled || !providers.apple }} style={[styles.appleWrap, (disabled || !providers.apple) && { opacity: 0.45 }]}>
        <AppleAuthentication.AppleAuthenticationButton buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK} cornerRadius={29} style={styles.apple}
          onPress={() => { void run(() => continueApple(mode)); }} />
      </View> : <Button label="Continue with Apple" variant="dark" disabled={disabled || !providers.apple || Platform.OS === 'ios'} onPress={() => { void run(() => continueApple(mode)); }} />}
      <Button label="Continue with Google" variant="outline" disabled={disabled || !providers.google} style={styles.provider} labelStyle={styles.providerLabel}
        onPress={() => { void run(() => continueOAuth('google',mode)); }} />
      <Button label="Continue with Email" variant="outline" disabled={disabled || !providers.email} style={styles.provider} labelStyle={styles.providerLabel}
        onPress={() => { setEmailOpen(true); setError(null); }} />
      {(!providers.apple || !providers.google || !providers.email) && !providerError && <Text style={styles.note}>{!providers.apple && !providers.google && !providers.email
        ? 'Account sign-in isn’t available in this preview yet.' : 'Some sign-in options aren’t available in this preview yet.'}</Text>}
      {emailOpen && <View style={styles.emailForm}>
        <Text style={styles.fieldLabel}>Email</Text><TextInput value={email} onChangeText={value => { setEmail(value); setSent(false); setCode(''); }}
          editable={!busy} placeholder="you@example.com" placeholderTextColor={colors.secondary} accessibilityLabel="Email address"
          autoComplete="email" textContentType="emailAddress" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" style={styles.input} />
        {sent && <><Text style={styles.note}>Check your email for a verification code. Your email is verified before the account upgrade finishes.</Text>
          <TextInput value={code} onChangeText={value => setCode(value.replace(/\D/g,''))} maxLength={8} editable={!busy}
            placeholder="Verification code" placeholderTextColor={colors.secondary} accessibilityLabel="Email verification code"
            autoComplete="one-time-code" textContentType="oneTimeCode" keyboardType="number-pad" style={styles.input} />
          <Button label="Verify Code" busy={busy} disabled={!auth.ready || code.length < 6} onPress={() => { void run(() => verifyEmailCode(email.trim(),code,mode)); }} />
        </>}
        <Button label={sent ? cooldown ? `Send Again (${cooldown}s)` : 'Send Again' : 'Send Verification Code'} busy={!sent && busy}
          variant={sent ? 'outline' : 'primary'} disabled={!emailValid || !auth.ready || busy || (sent && cooldown > 0)} onPress={() => { void run(requestCode); }} />
      </View>}
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => { setMode(value => value === 'upgrade' ? 'sign-in' : 'upgrade'); setSent(false); setCode(''); setError(null); }} style={styles.mode}>
        <Text style={styles.modeText}>{mode === 'upgrade' ? 'Already have an account? Sign in.' : 'New here? Create an account.'}</Text>
      </Pressable>
    </View>}
    {!auth.ready && !auth.error && <ActivityIndicator color={colors.blue} accessibilityLabel="Connecting account" />}
    <InlineError message={error ?? auth.error ?? (providerError ? 'Sign-in options couldn’t be loaded.' : null)} />
    {auth.error && <Button label="Retry Connection" variant="outline" onPress={auth.retry} />}
    <View style={styles.footer}><Icon name="saved" size={18} color={colors.secondary} /><Text style={styles.note}>Your situation text stays out of your account history.</Text></View>
  </Screen></SafeAreaView>;
}
const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:colors.white},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:44},
  close:{width:44,height:44,alignItems:'flex-end',justifyContent:'center'},closeText:{fontSize:30,color:colors.secondary},
  heading:{color:colors.ink,fontSize:32,lineHeight:39,fontWeight:'700',letterSpacing:-1,textAlign:'center'},
  detail:{color:colors.secondary,fontSize:17,lineHeight:25,textAlign:'center',marginTop:14,marginBottom:36},options:{gap:14},
  apple:{width:'100%',height:58},appleWrap:{width:'100%'},provider:{minHeight:58,borderRadius:29},
  providerLabel:{fontSize:17,fontWeight:'500'},
  note:{color:colors.secondary,fontSize:14,lineHeight:21,textAlign:'center'},emailForm:{gap:14,marginTop:12},
  fieldLabel:{color:colors.ink,fontSize:15,fontWeight:'600'},input:{borderWidth:1,borderColor:colors.border,borderRadius:16,backgroundColor:colors.surface,
    paddingHorizontal:16,paddingVertical:16,color:colors.ink,fontSize:17,minHeight:56},
  mode:{minHeight:44,justifyContent:'center',marginTop:8},modeText:{color:colors.blue,fontSize:15,textAlign:'center'},
  delete:{minHeight:44,justifyContent:'center'},deleteText:{color:'#B42318',fontSize:15,textAlign:'center',fontWeight:'600'},
  footer:{justifyContent:'center',alignItems:'center',gap:10,marginTop:36,paddingBottom:16},
});
