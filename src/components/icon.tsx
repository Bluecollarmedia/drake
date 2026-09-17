import { SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '@/design/tokens';
import { providerMarks } from '@/design/provider-marks';

type IconName = 'home' | 'saved' | 'music' | 'history' | 'settings' | 'back' | 'chevron' | 'share' | 'retry' | 'check' | 'more' | 'arrow' | 'trash';
const symbols = {
  home: 'house.fill', saved: 'bookmark', music: 'music.note', history: 'clock.arrow.circlepath', settings: 'gearshape',
  back: 'chevron.left', chevron: 'chevron.right', share: 'square.and.arrow.up',
  retry: 'arrow.clockwise', check: 'checkmark', more: 'ellipsis', arrow: 'arrow.right', trash: 'trash',
} as const;
const paths: Record<IconName, string> = {
  home: 'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',
  saved: 'M6 3h12v18l-6-4-6 4Z',
  music: 'M9 18V5l12-2v13M9 9l12-2',
  history: 'M12 7v5l3 2M4 7V3m0 0h4M4 3a9 9 0 1 1-1 13',
  settings: 'm9 3-1 3-3 1-2 3 2 2-1 3 2 3 3-1 3 2 3-2 3 1 2-3-1-3 2-2-2-3-3-1-1-3Z',
  back: 'm15 4-8 8 8 8', chevron: 'm9 5 7 7-7 7',
  share: 'M12 16V2m-4 4 4-4 4 4M7 10H4v12h16V10h-3',
  retry: 'M20 8a9 9 0 1 0 1 8M20 2v6h-6', trash: 'M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6',
  check: 'm5 12 4 4L19 6', more: '', arrow: 'M4 12h16m-7-7 7 7-7 7',
};

export function Icon({ name, size = 24, color = colors.ink }: { name: IconName; size?: number; color?: string }) {
  if (Platform.OS === 'ios') return <SymbolView name={symbols[name]} size={size} tintColor={color} />;
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {name === 'settings' && <Circle cx="12" cy="12" r="3" />}
    {name === 'music' && <><Circle cx="6" cy="18" r="3" /><Circle cx="18" cy="16" r="3" /></>}
    {name === 'more' ? [5,12,19].map(cx => <Circle key={cx} cx={cx} cy="12" r="1.5" fill={color} />) : <Path d={paths[name]} fill={name === 'home' && color === colors.blue ? color : 'none'} />}
  </Svg>;
}

// Source vector paths preserve provider branding; never tinted to the WD? blue.
export function ProviderMark({ service, size = 52 }: { service: 'spotify' | 'apple'; size?: number }) {
  if (service === 'spotify') return <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <Circle cx="12" cy="12" r="12" fill="#121212" />
    <Path d={providerMarks.spotify.path} fill={providerMarks.spotify.color} />
  </Svg>;
  return <Svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <Rect width="24" height="24" rx="5" fill="white" />
    <Path d={providerMarks.apple.path} fill={providerMarks.apple.color} />
  </Svg>;
}
