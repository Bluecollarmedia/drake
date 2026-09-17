import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/design/tokens';
import { musicServices, type MusicService } from '@/domain/music';
import { Icon, ProviderMark } from './icon';

export function ServiceOptions({ selected, onSelect, disabled }: { selected: MusicService | null; onSelect(service: MusicService): void; disabled?: boolean }) {
  return <View style={styles.list} accessibilityRole="radiogroup" accessibilityLabel="Music service">
    {(['spotify', 'apple'] as const).map(service => <Pressable key={service} accessibilityRole="radio"
      accessibilityLabel={musicServices[service].name} accessibilityState={{ checked: selected === service, disabled: !!disabled }}
      aria-checked={selected === service} aria-disabled={!!disabled}
      disabled={disabled} onPress={() => onSelect(service)}
      style={({ pressed }) => [styles.option, selected === service && styles.selected, pressed && { opacity: 0.7 }]}>
      <ProviderMark service={service} size={56} />
      <View style={styles.copy}><Text style={styles.name}>{musicServices[service].name}</Text>
        <Text style={styles.subtitle}>Play directly in {musicServices[service].name}</Text></View>
      <Icon name={selected === service ? 'check' : 'chevron'} size={20} color={selected === service ? colors.blue : colors.secondary} />
    </Pressable>)}
  </View>;
}
const styles = StyleSheet.create({
  list: { gap: 12 }, option: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 20, paddingVertical: 20, minHeight: 98, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white,
    boxShadow: '0 3px 12px rgba(0,0,0,0.025)' },
  selected: { borderColor: colors.blue, backgroundColor: colors.selected }, copy: { flex: 1, gap: 6 },
  name: { color: colors.ink, fontSize: 20, fontWeight: '600', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.secondary, lineHeight: 20 },
});
