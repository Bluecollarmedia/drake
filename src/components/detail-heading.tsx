import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './icon';
import { colors } from '@/design/tokens';
export function DetailHeading({ title }: { title: string }) {
  return <View style={styles.wrap}><Pressable accessibilityRole="button" accessibilityLabel="Back to Settings"
    onPress={() => router.dismissTo('/settings')} style={styles.back}><Icon name="back" /></Pressable>
    <Text accessibilityRole="header" style={styles.title}>{title}</Text><View style={{ width: 44 }} /></View>;
}
const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 38 },
  back: { width: 44, height: 44, justifyContent: 'center' }, title: { flex: 1, color: colors.ink, fontWeight: '600', fontSize: 18, textAlign: 'center' },
});
