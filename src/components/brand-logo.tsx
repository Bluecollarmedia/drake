import { Image, View } from 'react-native';

export function BrandLogo({ width = 140 }: { width?: number }) {
  return <View style={{ alignItems: 'center' }}>
    <Image source={require('../../assets/brand/wd-logo.png')} resizeMode="contain"
      style={{ width, height: width * 476 / 1068 }} accessibilityLabel="Which Drake?" />
  </View>;
}
