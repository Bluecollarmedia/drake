import { router, type Href } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BrandLogo } from '@/components/brand-logo';
import { Icon } from '@/components/icon';
import { Screen } from '@/components/screen';
import { colors } from '@/design/tokens';
import { InlineError } from '@/components/inline-error';
import { Button } from '@/components/button';
import { useRecommendation } from '@/state/recommendation-state';
import { useAuth } from '@/state/auth-state';

export default function Home() {
  const recommendation = useRecommendation();
  const auth = useAuth();
  const [focused, setFocused] = useState(false);
  const input = useRef<TextInput>(null);
  const findSong = async () => {
    if (recommendation.loading) return;
    Keyboard.dismiss(); input.current?.blur();
    if (await recommendation.submit()) router.push('/home/result');
  };
  return <Screen keyboard>
    <View style={styles.hero}><BrandLogo width={140} />
      <Text accessibilityRole="header" style={styles.headline}>What are you{ '\n' }going through?</Text>
      <Text style={styles.support}>Tell us how you feel, and we’ll find{ '\n' }the perfect Drake song for you.</Text>
    </View>
    <View style={[styles.inputRow, focused && styles.focused, recommendation.loading && styles.disabledInput]}>
    <TextInput ref={input} value={recommendation.draft} onChangeText={recommendation.setDraft} multiline={false} maxLength={1500} editable={!recommendation.loading}
      placeholder="Type how you’re feeling..." placeholderTextColor={colors.secondary} accessibilityLabel="What’s going on?"
      accessibilityHint="Describe your situation, or choose an example below."
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType="go" onSubmitEditing={findSong}
      style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'solid', outlineWidth: 0 }]} />
    <Pressable accessibilityRole="button" accessibilityLabel="Find My Song" accessibilityState={{ disabled: recommendation.loading, busy: recommendation.loading }}
      aria-disabled={recommendation.loading} disabled={recommendation.loading} onPress={() => { void findSong(); }}
      style={({ pressed }) => [styles.submit, pressed && { opacity: 0.7 }]}>
      {recommendation.loading ? <ActivityIndicator color={colors.white} /> : <Icon name="arrow" color={colors.white} size={25} />}
    </Pressable>
    </View>
    {recommendation.loading && <View style={styles.loading} accessibilityLiveRegion="polite"><Text style={styles.loadingTitle}>Finding your Drake…</Text><Text style={styles.loadingCopy}>Listening for what matters in your situation.</Text></View>}
    <InlineError message={recommendation.error ?? auth.error} neutral={recommendation.errorCode==='too_short'} />
    {recommendation.errorCode && ['network','timeout','busy','unavailable'].includes(recommendation.errorCode) ?
      <Button label="Try Again" variant="outline" disabled={recommendation.loading} onPress={() => { void findSong(); }} /> : null}
    {recommendation.errorCode==='free_limit' && <Button label={auth.hasAccount?'View Full Access':'Create an Account'} variant="outline"
      onPress={()=>router.push((auth.hasAccount?'/subscription':{pathname:'/account',params:{reason:'limit'}}) as Href)} />}
    <View style={styles.examples} accessibilityLabel="Example situations">
      {recommendation.starterPrompts.map(example => <Pressable key={example} accessibilityRole="button" accessibilityLabel={example}
        disabled={recommendation.loading} onPress={() => recommendation.setDraft(example)} style={({ pressed }) => [styles.chip, recommendation.loading&&styles.disabledInput, pressed && { opacity: 0.65 }]}> 
        <Text style={styles.chipText}>{example}</Text>
      </Pressable>)}
    </View>
  </Screen>;
}
const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 30, paddingBottom: 46 },
  headline: { marginTop: 48, color: colors.ink, fontSize: 36, lineHeight: 42, fontWeight: '700', letterSpacing: -1.4, textAlign: 'center' },
  support: { color: colors.secondary, fontSize: 18, lineHeight: 26, textAlign: 'center', marginTop: 24 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 22, minHeight: 68, padding: 9 },
  input: { flex: 1, minWidth: 0, borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 12, paddingVertical: 10, color: colors.ink, fontSize: 18, lineHeight: 26 },
  submit: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  focused: { borderColor: colors.blue }, disabledInput:{opacity:0.62}, loading:{alignItems:'center',paddingTop:20,gap:5},
  loadingTitle:{color:colors.ink,fontSize:17,fontWeight:'600'},loadingCopy:{color:colors.secondary,fontSize:14},
  examples: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24 },
  chip: { backgroundColor: colors.surface, borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, minHeight: 44 },
  chipText: { fontSize: 15, color: colors.secondary, lineHeight: 21 },
});
