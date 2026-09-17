import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from './icon';
import { colors, layout } from '@/design/tokens';

// Flat, opaque browser-only navigation. Real Liquid Glass exists only in the native iOS implementation.
export default function AppTabs() {
  return <Tabs><View style={styles.content}><TabSlot style={{ flex: 1 }} /></View>
    <TabList asChild><View style={styles.list}>
      <TabTrigger name="home" href="/home" asChild><TabButton name="home">Home</TabButton></TabTrigger>
      <TabTrigger name="saved" href="/saved" asChild><TabButton name="saved">Saved</TabButton></TabTrigger>
      <TabTrigger name="history" href={'/history' as Href} asChild><TabButton name="history">History</TabButton></TabTrigger>
      <TabTrigger name="settings" href="/settings" asChild><TabButton name="settings">Settings</TabButton></TabTrigger>
    </View></TabList>
  </Tabs>;
}
function TabButton({ children, isFocused, name, ...props }: TabTriggerSlotProps & { name: 'home' | 'saved' | 'history' | 'settings' }) {
  const color = isFocused ? colors.blue : colors.secondary;
  return <Pressable {...props} accessibilityRole="tab" accessibilityState={{ selected: isFocused }}
    aria-selected={!!isFocused}
    style={({ pressed }) => [styles.tab, pressed && { opacity: 0.7 }]}>
    <Icon name={name === 'saved' ? 'music' : name} color={color} size={25} /><Text style={[styles.label, { color }]}>{children}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  content: { flex: 1, backgroundColor: colors.white }, list: { flexDirection: 'row', width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, minHeight: 78, paddingTop: 10, paddingBottom: 15 },
  tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 5 }, label: { fontSize: 11, fontWeight: '500' },
});
