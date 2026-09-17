import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/button';
import { InlineError } from '@/components/inline-error';
import { ServiceOptions } from '@/components/service-options';
import { colors, layout } from '@/design/tokens';
import type { MusicService } from '@/domain/music';
import { useAppState } from '@/state/app-state';

export default function Onboarding() {
  const [selected, setSelected] = useState<MusicService | null>(null);
  const { setMusicService, saving, error, clearError } = useAppState();
  return <SafeAreaView style={styles.root}>
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.top}><BrandLogo width={132} />
          <Text accessibilityRole="header" style={styles.title}>Which Drake?</Text>
          <Text style={styles.prompt}>Choose your music service</Text>
        </View>
        <ServiceOptions selected={selected} disabled={saving} onSelect={value => { clearError(); setSelected(value); }} />
        <InlineError message={error} />
        <View style={styles.footer}><Button label="Continue" disabled={!selected} busy={saving}
          onPress={() => { if (selected) void setMusicService(selected); }} />
          <Text style={styles.footnote}>You can change this anytime in Settings.</Text>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white }, scroll: { flexGrow: 1 },
  content: { flexGrow: 1, width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter, paddingBottom: 12 },
  top: { paddingTop: 44, alignItems: 'center', paddingBottom: 48 },
  title: { color: colors.ink, fontSize: 36, fontWeight: '700', letterSpacing: -1.4, lineHeight: 43, marginTop: 54, textAlign: 'center' },
  prompt: { color: colors.secondary, fontSize: 19, lineHeight: 27, marginTop: 18, textAlign: 'center' },
  footer: { marginTop: 'auto', paddingTop: 64, gap: 18 },
  footnote: { color: colors.secondary, fontSize: 15, lineHeight: 22, textAlign: 'center', paddingHorizontal: 24 },
});
