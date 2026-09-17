import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { PageHeading } from '@/components/page-heading';
import { Icon } from '@/components/icon';
import { InlineError } from '@/components/inline-error';
import { Screen } from '@/components/screen';
import { colors } from '@/design/tokens';
import { deleteRecommendationHistoryItem, listRecommendationHistory, type RecommendationHistoryItem } from '@/data/recommendation-history';
import { confirmDestructiveAction } from '@/platform/confirm';
import { useRecommendation } from '@/state/recommendation-state';

function historyDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function History() {
  const recommendation = useRecommendation();
  const [items, setItems] = useState<RecommendationHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setItems(await listRecommendationHistory()); setError(null); }
    catch { setError('Couldn’t load History. Please try again.'); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const remove = async (item: RecommendationHistoryItem) => {
    if (!await confirmDestructiveAction('Delete from History?', `${item.recommendation.title} will be removed from History. Saved songs will not be affected.`, 'Delete')) return;
    try { await deleteRecommendationHistoryItem(item.id); setItems(current => current.filter(value => value.id !== item.id)); }
    catch { setError('Couldn’t delete this History item. Please try again.'); }
  };
  return <Screen><PageHeading title="History" /><InlineError message={error} />
    {items.length ? <View style={styles.list}>{items.map(item => {
      const song = item.recommendation;
      const album = [song.releaseTitle, song.releaseDate?.slice(0, 4)].filter(Boolean).join(' · ');
      return <View key={item.id} style={styles.card}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${song.title}. Open recommendation.`}
          onPress={() => { recommendation.showHistory(song, item.situation); router.push('/home/result'); }} style={({ pressed }) => [styles.open, pressed && styles.pressed]}>
          {song.artworkUrl ? <Image source={{ uri: song.artworkUrl }} style={styles.artwork} /> : <View style={[styles.artwork, styles.fallback]}><Icon name="music" size={24} color={colors.blue} /></View>}
          <View style={styles.details}><Text numberOfLines={1} style={styles.title}>{song.title}</Text>
            <Text numberOfLines={1} style={styles.album}>{album || song.artist}</Text><Text style={styles.date}>{historyDate(item.createdAt)}</Text></View>
          <Icon name="chevron" size={17} color={colors.secondary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${song.title} from History`} hitSlop={10}
          onPress={() => { void remove(item); }} style={({ pressed }) => [styles.delete, pressed && styles.pressed]}>
          <Icon name="trash" size={18} color={colors.secondary} />
        </Pressable>
      </View>;
    })}</View> : <View style={styles.empty}><Icon name="history" size={35} color={colors.secondary} />
      <Text style={styles.emptyTitle}>Your recommendations will appear here.</Text>
      <Text style={styles.emptyCopy}>History is separate from the songs you intentionally save.</Text></View>}
  </Screen>;
}

const styles = StyleSheet.create({
  list: { gap: 12 }, card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 17, backgroundColor: colors.white, overflow: 'hidden' },
  open: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12 }, artwork: { width: 66, height: 66, borderRadius: 10 },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }, details: { flex: 1, minWidth: 0, gap: 3 },
  title: { color: colors.ink, fontSize: 17, fontWeight: '600' }, album: { color: colors.secondary, fontSize: 14 }, date: { color: colors.secondary, fontSize: 12 },
  delete: { width: 44, minHeight: 66, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: colors.border }, pressed: { opacity: 0.58 },
  empty: { marginTop: 70, alignItems: 'center', gap: 16, paddingHorizontal: 24 }, emptyTitle: { color: colors.ink, fontSize: 20, lineHeight: 27, fontWeight: '600', textAlign: 'center' },
  emptyCopy: { color: colors.secondary, fontSize: 16, lineHeight: 24, textAlign: 'center' },
});
