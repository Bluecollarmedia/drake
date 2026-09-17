import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/button';
import { Icon, ProviderMark } from '@/components/icon';
import { InlineError } from '@/components/inline-error';
import { Screen } from '@/components/screen';
import { ResultMenu } from '@/components/result-menu';
import { colors } from '@/design/tokens';
import { musicServices } from '@/domain/music';
import { shareRecommendation } from '@/platform/share';
import { useAppState } from '@/state/app-state';
import { useAuth } from '@/state/auth-state';
import { useRecommendation } from '@/state/recommendation-state';
import { deleteSavedRecommendation, findSavedRecommendation, saveRecommendation } from '@/data/saved-recommendations';

export function ResultScreen() {
  const { width, height } = useWindowDimensions();
  const { state } = useAppState();
  const { hasAccount } = useAuth();
  const recommendation=useRecommendation(); const song=recommendation.current;
  const [actionError, setActionError] = useState<string | null>(null);
  const [savedRecord,setSavedRecord]=useState<{songId:string;id:string}|null>(null); const [saving,setSaving]=useState(false);
  const [sharing, setSharing] = useState(false);
  const [opening, setOpening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedSituationRequestId, setExpandedSituationRequestId] = useState<string | null>(null);
  const service = state.musicService ?? 'spotify';
  const saved = !!song&&savedRecord?.songId===song.id;
  const artworkSize = Math.min(width - 88, height * 0.29, 268);
  const tryAnother = () => {recommendation.clearForAnother();router.dismissTo('/home');};
  const save = async () => {
    if(!song)return;
    if (!hasAccount && !saved) router.push({ pathname: '/account', params: { reason: 'save' } });
    else {setSaving(true);setActionError(null);try{if(savedRecord?.songId===song.id){await deleteSavedRecommendation(savedRecord.id);setSavedRecord(null);}else{const value=await saveRecommendation({songId:song.id,explanation:song.explanation});setSavedRecord({songId:song.id,id:value.id});}}catch{setActionError('Couldn’t update Saved. Please try again.');}finally{setSaving(false);}}
  };
  const share = async () => {
    setSharing(true); setActionError(null);
    try { if(song)setCopied(await shareRecommendation(song, service) === 'copied'); }
    catch { setActionError('Couldn’t share this song. Please try again.'); }
    finally { setSharing(false); }
  };

  useEffect(()=>{let active=true;if(song&&hasAccount)void findSavedRecommendation(song.id).then(value=>{if(active)setSavedRecord(value?{songId:song.id,id:value.id}:null);}).catch(()=>{});return()=>{active=false;};},[song,hasAccount]);
  if(recommendation.noMatch)return <Screen><View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to Home" onPress={tryAnother} style={styles.back}><Icon name="back" size={24} /></Pressable>
      <BrandLogo width={106} /><View style={{width:44}} />
    </View><View style={styles.noMatch}>
      <View style={styles.noMatchMark}><BrandLogo width={120}/></View>
      <Text accessibilityRole="header" style={styles.noMatchTitle}>{recommendation.noMatch.message}</Text>
      <Text style={styles.noMatchCopy}>{recommendation.noMatch.guidance}</Text>
      <Button label="Tell Us More" onPress={tryAnother} style={{width:'100%'}} />
    </View></Screen>;
  if(!song)return <Screen><View style={styles.missing}><Text style={styles.title}>No recommendation yet.</Text><Button label="Find My Song" onPress={tryAnother}/></View></Screen>;
  const link= song.links[service] ?? song.links.spotify ?? song.links.apple;
  const situationExpanded=expandedSituationRequestId===song.requestId;
  const linkService= song.links[service]?service:song.links.spotify?'spotify':song.links.apple?'apple':service;
  const release=[song.releaseTitle,song.releaseDate?.slice(0,4)].filter(Boolean).join(' · ');
  return <Screen>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to Home" onPress={tryAnother} style={styles.back}>
        <Icon name="back" size={24} />
      </Pressable>
      <BrandLogo width={106} />
      <ResultMenu saved={saved} disabled={saving || sharing} onSave={save} onShare={() => { void share(); }} onTryAnother={tryAnother} />
    </View>
    {song.artworkUrl?<Image source={{uri:song.artworkUrl}} accessibilityLabel={`${song.releaseTitle??song.title} artwork`}
      resizeMode="cover" style={[styles.artwork, { width: artworkSize, height: artworkSize }]} />:<View style={[styles.artwork,styles.artworkFallback,{width:artworkSize,height:artworkSize}]}><BrandLogo width={artworkSize*0.58}/></View>}
    <View style={styles.metadata}><Text accessibilityRole="header" style={styles.title}>{song.title}</Text>
      <Text style={styles.artist}>{song.artist}</Text>{release?<Text style={styles.release}>{release}</Text>:null}
    </View>
    {link&&<Button label={musicServices[linkService].playLabel} variant="dark" busy={opening} icon={<ProviderMark service={linkService} size={34} />}
      onPress={async () => {
        setActionError(null); setOpening(true);
        try { await Linking.openURL(link); }
        catch { setActionError(`Couldn’t open ${musicServices[linkService].name}. Please try again.`); }
        finally { setOpening(false); }
      }} />}
    <View style={styles.why}>
      <Text accessibilityRole="header" style={styles.whyTitle}>WHY THIS SONG?</Text>
      <Text style={styles.explanation}>{song.explanation}</Text>
    </View>
    {recommendation.currentSituation ? <View style={styles.situation}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: situationExpanded }} onPress={() => setExpandedSituationRequestId(situationExpanded ? null : song.requestId)} style={styles.situationButton}>
        <Text style={styles.situationTitle}>Your situation</Text><View style={{ transform: [{ rotate: situationExpanded ? '90deg' : '0deg' }] }}><Icon name="chevron" size={16} color={colors.secondary} /></View>
      </Pressable>
      {situationExpanded ? <Text style={styles.situationCopy}>{recommendation.currentSituation}</Text> : null}
    </View> : null}
    <View style={styles.actions}>
      <Button label={saved ? 'Saved' : 'Save Song'} selected={saved} variant="outline" busy={saving} icon={<Icon name={saved ? 'check' : 'saved'} size={22} color={saved ? colors.blue : colors.ink} />}
        style={[styles.action, styles.saveAction]} onPress={save} />
      <Button label={copied ? 'Copied' : 'Share'} variant="outline" busy={sharing} icon={<Icon name="share" size={22} />} style={[styles.action, styles.shareAction]} onPress={() => { void share(); }} />
      <Button label="Try Another" variant="outline" icon={<Icon name="retry" size={20} />} style={[styles.action, styles.tryAction]} onPress={tryAnother} />
    </View>
    <InlineError message={actionError} />
  </Screen>;
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, marginBottom: 16 },
  back: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  artwork: { alignSelf: 'center', borderRadius: 14, boxShadow: '0 5px 12px rgba(0,0,0,0.10)' },artworkFallback:{backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'},missing:{flex:1,justifyContent:'center',alignItems:'center',gap:28},
  metadata: { alignItems: 'center', paddingTop: 16, paddingBottom: 18, gap: 4 },
  title: { color: colors.ink, fontSize: 30, fontWeight: '700', letterSpacing: -0.8, lineHeight: 36 },
  artist: { color: colors.secondary, fontSize: 20, lineHeight: 25 }, release: { color: colors.secondary, fontSize: 16, lineHeight: 22 },
  why: { backgroundColor: colors.surface, borderRadius: 22, padding: 19, marginTop: 14 },
  whyTitle: { color: colors.ink, fontSize: 17, fontWeight: '700', lineHeight: 23, marginBottom: 9 },
  explanation: { color: colors.secondary, fontSize: 17, lineHeight: 24 },
  situation: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, marginTop: 12, overflow: 'hidden' },
  situationButton: { minHeight: 52, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  situationTitle: { color: colors.ink, fontSize: 15, fontWeight: '600' }, situationCopy: { color: colors.secondary, fontSize: 15, lineHeight: 22, paddingHorizontal: 16, paddingBottom: 16 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12 },
  action: { flexBasis: 0, minHeight: 54, paddingHorizontal: 8, gap: 7 },
  saveAction: { flexGrow: 1.1, minWidth: 100 }, shareAction: { flexGrow: 0.85, minWidth: 80 }, tryAction: { flexGrow: 1.25, minWidth: 112 },
  noMatch:{flex:1,alignItems:'center',justifyContent:'center',paddingHorizontal:22,gap:18},
  noMatchMark:{width:178,height:178,borderRadius:32,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center',marginBottom:8},
  noMatchTitle:{color:colors.ink,fontSize:30,lineHeight:36,fontWeight:'700',letterSpacing:-.8,textAlign:'center'},
  noMatchCopy:{color:colors.secondary,fontSize:17,lineHeight:25,textAlign:'center',marginBottom:18},
});
