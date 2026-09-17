import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { PageHeading } from '@/components/page-heading';
import { Icon } from '@/components/icon';
import { colors } from '@/design/tokens';
import { musicServices } from '@/domain/music';
import { useAppState } from '@/state/app-state';
import { useAuth } from '@/state/auth-state';

export default function Settings() {
  const { state } = useAppState();
  const { hasAccount } = useAuth();
  const rows = [
    { title: 'Music Service', value: state.musicService ? musicServices[state.musicService].name : '', href: '/settings/music-service' },
    { title: 'Account', value: hasAccount ? 'Signed in' : 'Optional', href: '/account' },
    { title: 'Usage', href: '/settings/usage' },
    { title: 'Subscription', value: 'Full Access', href: '/subscription' },
    { title: 'Clear History', href: '/settings/history' },
    { title: 'About Which Drake?', href: '/settings/about' },
    { title: 'Privacy', href: '/settings/privacy' },
    { title: 'Terms', href: '/settings/terms' },
  ] as const;
  return <Screen><PageHeading title="Settings" /><View style={styles.group}>
    {rows.map((row, index) => <Pressable key={row.title} accessibilityRole="button" onPress={() => router.push(row.href as Href)}
      style={({ pressed }) => [styles.row, index < rows.length - 1 && styles.border, pressed && { backgroundColor: colors.surface }]}>
      <Text style={styles.label}>{row.title}</Text>{'value' in row && <Text style={styles.value}>{row.value}</Text>}
      <Icon name="chevron" color={colors.secondary} size={16} />
    </Pressable>)}
  </View><Text style={styles.version}>Which Drake? · Version 1.0.0</Text></Screen>;
}
const styles = StyleSheet.create({
  group: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingHorizontal: 16, paddingVertical: 16 },
  border: { borderBottomWidth: 1, borderBottomColor: colors.border }, label: { flex: 1, color: colors.ink, fontSize: 17 },
  value: { color: colors.secondary, fontSize: 15 }, version: { color: colors.secondary, fontSize: 13, textAlign: 'center', marginTop: 28 },
});
