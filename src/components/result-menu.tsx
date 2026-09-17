import { useState } from 'react';
import { ActionSheetIOS, Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/design/tokens';
import { Icon } from './icon';

interface Props { saved: boolean; disabled: boolean; onSave(): void; onShare(): void; onTryAnother(): void }
export function ResultMenu({ saved, disabled, onSave, onShare, onTryAnother }: Props) {
  const [open, setOpen] = useState(false);
  const saveLabel = saved ? 'Remove from Saved' : 'Save Song';
  const actions = [onSave, onShare, onTryAnother];
  const labels = [saveLabel, 'Share', 'Try Another'];
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="More song options" disabled={disabled} aria-disabled={disabled}
      style={styles.trigger} onPress={() => {
        if (Platform.OS === 'ios') ActionSheetIOS.showActionSheetWithOptions({ options: [...labels, 'Cancel'], cancelButtonIndex: 3, userInterfaceStyle: 'light' }, index => actions[index]?.());
        else if (Platform.OS === 'android') Alert.alert('Which Drake?', undefined, labels.map((text, index) => ({ text, onPress: actions[index] })), { cancelable: true });
        else setOpen(true);
      }}><Icon name="more" size={25} /></Pressable>
    <Modal visible={open} transparent onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}><Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Close song options" onPress={() => setOpen(false)} />
        <View style={styles.menu}>{[...labels, 'Cancel'].map((label, index) => <Pressable key={label} accessibilityRole="button" style={styles.row}
          onPress={() => { setOpen(false); actions[index]?.(); }}><Text style={styles.label}>{label}</Text></Pressable>)}</View>
      </View>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  trigger: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-end' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  menu: { backgroundColor: colors.white, borderRadius: 18, width: '100%', maxWidth: 330, overflow: 'hidden' },
  row: { minHeight: 56, padding: 18, borderBottomWidth: 1, borderBottomColor: colors.border }, label: { color: colors.ink, textAlign: 'center', fontSize: 17 },
});
