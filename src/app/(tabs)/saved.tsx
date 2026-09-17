import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { PageHeading } from '@/components/page-heading';
import { Icon } from '@/components/icon';
import { colors } from '@/design/tokens';
import { listSavedRecommendations, type SavedRecommendation } from '@/data/saved-recommendations';
import { useAuth } from '@/state/auth-state';
import { useRecommendation } from '@/state/recommendation-state';
import { InlineError } from '@/components/inline-error';

export default function Saved() {
  const auth=useAuth();const recommendation=useRecommendation();const [items,setItems]=useState<SavedRecommendation[]>([]);const [error,setError]=useState<string|null>(null);
  useFocusEffect(useCallback(()=>{let active=true;if(auth.ready&&auth.hasAccount)void listSavedRecommendations().then(value=>{if(active){setItems(value);setError(null);}}).catch(()=>{if(active)setError('Saved songs couldn’t be loaded.');});else setItems([]);return()=>{active=false;};},[auth.ready,auth.hasAccount]));
  return <Screen><PageHeading title="Saved" />
    <InlineError message={error}/>
    {items.length ? items.map(item=><Pressable key={item.id} onPress={() => {recommendation.showSaved(item.recommendation);router.push('/home/result');}} accessibilityRole="button" accessibilityLabel={`${item.recommendation.title} by ${item.recommendation.artist}. View saved song.`}
      style={({ pressed }) => [styles.song, pressed && { opacity: 0.7 }]}> 
      {item.recommendation.artworkUrl?<Image source={{uri:item.recommendation.artworkUrl}} style={styles.art}/>:<View style={[styles.art,styles.artFallback]}><Icon name="music" size={25} color={colors.blue}/></View>}
      <View style={{ flex: 1, gap: 5 }}><Text style={styles.songTitle}>{item.recommendation.title}</Text><Text style={styles.subtitle}>{[item.recommendation.artist,item.recommendation.releaseTitle].filter(Boolean).join(' · ')}</Text></View><Icon name="chevron" size={18} color={colors.secondary} />
    </Pressable>) : <View style={styles.empty}><Icon name="saved" size={32} color={colors.secondary} />
      <Text style={styles.emptyTitle}>Your songs, kept close.</Text><Text style={styles.emptyCopy}>Save a song when it feels like you.{ '\n' }You’ll find it here.</Text>
    </View>}
  </Screen>;
}
const styles = StyleSheet.create({
  empty: { marginTop: 70, alignItems: 'center', gap: 18 }, emptyTitle: { color: colors.ink, fontSize: 21, fontWeight: '600', textAlign: 'center' },
  emptyCopy: { color: colors.secondary, fontSize: 17, lineHeight: 25, textAlign: 'center' },
  song: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  art: { width: 64, height: 64, borderRadius: 9 },artFallback:{backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'}, songTitle: { color: colors.ink, fontSize: 20, fontWeight: '600' }, subtitle: { color: colors.secondary, fontSize: 14 },
});
