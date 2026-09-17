import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/button';
import { DetailHeading } from '@/components/detail-heading';
import { InlineError } from '@/components/inline-error';
import { Screen } from '@/components/screen';
import { clearRecommendationHistory } from '@/data/recommendation-history';
import { colors } from '@/design/tokens';
import { confirmDestructiveAction } from '@/platform/confirm';

export default function HistorySettings() {
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const clear = async () => {
    if (!await confirmDestructiveAction('Clear all History?', 'This removes every recommendation from History. Your Saved songs will remain.', 'Clear History')) return;
    setWorking(true); setError(null); setMessage(null);
    try { await clearRecommendationHistory(); setMessage('History cleared. Saved songs were not changed.'); }
    catch { setError('Couldn’t clear History. Please try again.'); }
    finally { setWorking(false); }
  };
  return <Screen><DetailHeading title="Clear History" /><View style={styles.content}>
    <Text style={styles.heading}>Remove your recommendation history.</Text>
    <Text style={styles.copy}>This deletes your previous recommendation results and their associated situations. Songs you intentionally saved remain in Saved.</Text>
    <Button label="Clear History" variant="outline" busy={working} onPress={() => { void clear(); }} />
    {message ? <Text accessibilityLiveRegion="polite" style={styles.success}>{message}</Text> : null}<InlineError message={error} />
  </View></Screen>;
}
const styles = StyleSheet.create({
  content: { gap: 20 }, heading: { color: colors.ink, fontSize: 25, lineHeight: 33, fontWeight: '600' }, copy: { color: colors.secondary, fontSize: 17, lineHeight: 26 },
  success: { color: colors.secondary, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
