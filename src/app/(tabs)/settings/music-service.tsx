import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { DetailHeading } from '@/components/detail-heading';
import { ServiceOptions } from '@/components/service-options';
import { InlineError } from '@/components/inline-error';
import { colors } from '@/design/tokens';
import { useAppState } from '@/state/app-state';
export default function MusicServiceSettings() {
  const { state, setMusicService, saving, error } = useAppState();
  return <Screen><DetailHeading title="Music Service" />
    <View style={styles.body}><View style={styles.balanceSpace} />
      <ServiceOptions selected={state.musicService} disabled={saving} onSelect={service => { void setMusicService(service); }} />
      <Text style={styles.copy}>Your songs will open in the service you choose.</Text>
      <InlineError message={error} /><View style={styles.lowerSpace} />
    </View>
  </Screen>;
}
const styles = StyleSheet.create({
  body: { flex: 1 }, balanceSpace: { flexGrow: 0.45, minHeight: 24, maxHeight: 68 }, lowerSpace: { flexGrow: 1, minHeight: 24 },
  copy: { color: colors.secondary, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 28 },
});
