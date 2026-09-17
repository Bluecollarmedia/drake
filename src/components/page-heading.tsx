import { StyleSheet, Text, View } from 'react-native';
import { BrandLogo } from './brand-logo';
import { colors } from '@/design/tokens';
export function PageHeading({ title }: { title: string }) {
  return <View style={styles.wrap}><BrandLogo width={118} /><Text accessibilityRole="header" style={styles.title}>{title}</Text></View>;
}
const styles = StyleSheet.create({
  wrap: { paddingTop: 30, alignItems: 'center', gap: 42, marginBottom: 32 },
  title: { fontSize: 34, lineHeight: 42, color: colors.ink, fontWeight: '700', letterSpacing: -1.2 },
});
