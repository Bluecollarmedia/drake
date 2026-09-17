import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import type { ReactNode } from 'react';
import { colors } from '@/design/tokens';

interface Props {
  label: string;
  onPress(): void;
  disabled?: boolean;
  busy?: boolean;
  variant?: 'primary' | 'dark' | 'outline';
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
  labelStyle?: StyleProp<TextStyle>;
}
export function Button({ label, onPress, disabled, busy, variant = 'primary', icon, style, selected, labelStyle }: Props) {
  const outlined = variant === 'outline';
  return <Pressable onPress={onPress} disabled={disabled || busy} accessibilityRole="button"
    accessibilityLabel={label} accessibilityState={{ disabled: !!(disabled || busy), busy: !!busy, selected }}
    aria-disabled={!!(disabled || busy)} aria-busy={!!busy} aria-pressed={selected}
    style={({ pressed }) => [styles.base, outlined ? styles.outline : variant === 'dark' ? styles.dark : styles.primary,
      (disabled || busy) && styles.disabled, pressed && styles.pressed, style]}>
    {busy ? <ActivityIndicator color={outlined ? colors.blue : colors.white} /> : icon}
    <Text style={[styles.label, outlined && styles.outlineLabel, variant === 'dark' && styles.providerLabel, labelStyle]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  base: { minHeight: 58, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 12 },
  primary: { backgroundColor: colors.blue }, dark: { backgroundColor: '#1D1E20' },
  outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 18 },
  label: { color: colors.white, fontSize: 18, fontWeight: '600', flexShrink: 1, textAlign: 'center' },
  outlineLabel: { color: colors.ink, fontSize: 12, fontWeight: '500' },
  providerLabel: { fontWeight: '400' },
  disabled: { opacity: 0.45 }, pressed: { opacity: 0.72 },
});
