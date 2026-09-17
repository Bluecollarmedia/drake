import { Stack } from 'expo-router';
import { colors } from '@/design/tokens';
export default function HomeLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white }, animation: 'slide_from_right' }} />;
}
