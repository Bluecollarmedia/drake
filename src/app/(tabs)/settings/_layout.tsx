import { Stack } from 'expo-router';
import { colors } from '@/design/tokens';
export default function SettingsLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white } }} />;
}
