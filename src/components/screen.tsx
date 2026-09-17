import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, layout } from '@/design/tokens';

// NativeTabs owns the iOS ScrollView's automatic status/tab-bar content insets.
// Avoid adding a second bottom safe area or hard-coding the Liquid Glass bar's height.
export function Screen({ children, keyboard = false }: PropsWithChildren<{ keyboard?: boolean }>) {
  const insets = useSafeAreaInsets();
  return <KeyboardAvoidingView collapsable={false} style={styles.root} behavior={keyboard && Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView style={styles.root} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive" automaticallyAdjustKeyboardInsets={false}
      contentContainerStyle={[styles.scroll, { paddingTop: Platform.OS === 'ios' ? 12 : insets.top + 16 }]}>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white }, scroll: { flexGrow: 1, paddingBottom: 24 },
  content: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter, flexGrow: 1 },
});
