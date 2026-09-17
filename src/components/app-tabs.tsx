import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { colors } from '@/design/tokens';

export default function AppTabs() {
  return <NativeTabs tintColor={colors.blue} minimizeBehavior="never"
    iconColor={{ default: colors.secondary, selected: colors.blue }}
    labelStyle={{ default: { color: colors.secondary, fontSize: 11 }, selected: { color: colors.blue, fontSize: 11 } }}>
    <NativeTabs.Trigger name="home" contentStyle={{ backgroundColor: colors.white }}>
      <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
    </NativeTabs.Trigger>
    <NativeTabs.Trigger name="saved" contentStyle={{ backgroundColor: colors.white }}>
      <NativeTabs.Trigger.Label>Saved</NativeTabs.Trigger.Label>
      <NativeTabs.Trigger.Icon sf="music.note" md="music_note" />
    </NativeTabs.Trigger>
    <NativeTabs.Trigger name="history" contentStyle={{ backgroundColor: colors.white }}>
      <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
      <NativeTabs.Trigger.Icon sf="clock.arrow.circlepath" md="history" />
    </NativeTabs.Trigger>
    <NativeTabs.Trigger name="settings" contentStyle={{ backgroundColor: colors.white }}>
      <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
    </NativeTabs.Trigger>
  </NativeTabs>;
}
