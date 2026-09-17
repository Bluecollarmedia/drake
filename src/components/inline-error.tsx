import { Text } from 'react-native';
import { colors } from '@/design/tokens';
export function InlineError({ message, neutral = false }: { message: string | null; neutral?: boolean }) {
  return message ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: neutral ? colors.secondary : colors.error, fontSize: 14, lineHeight: 20, marginTop: 12 }}>{message}</Text> : null;
}
