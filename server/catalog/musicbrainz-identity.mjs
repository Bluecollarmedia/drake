export const normalized = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
export function songTitle(value) {
  return normalized(value).replace(/\s*[([](?:feat\.?|ft\.?|featuring)\s+[^)\]]*[)\]]/g, '').replace(/\s*[([](?:clean|explicit|uncensored|censored)(?: version)?[)\]]/g, '').replace(/\s*[-–—]\s*(?:clean|explicit|uncensored|censored)(?: version)?$/g,'').trim();
}
export function recordingVersion(recording) {
  const detail = normalized(recording.disambiguation).replace(/\b(?:clean|explicit|uncensored|censored)(?: version)?\b/g, '').replace(/\b(?:original )?(?:album|studio) version\b/g, '').replace(/^[\s,;/()-]+|[\s,;/()-]+$/g, '').trim();
  const title = songTitle(recording.title);
  const marked = title.match(/\b(?:live|remix|instrumental|acoustic|demo|alternate|edit|sped up|slowed|re-recorded|remaster)\b/);
  return detail || (marked ? title : 'original');
}
export function artistRoles(credits) {
  let featured = false;
  return (credits || []).filter(c => c.artist?.id).map((credit, index, list) => {
    if (index && /\b(?:feat\.?|ft\.?|featuring)\b/i.test(list[index-1].joinphrase || '')) featured = true;
    return { id: credit.artist.id, name: credit.artist.name || credit.name, creditedName: credit.name, joinphrase: credit.joinphrase || '', role: featured ? 'featured' : 'primary', order: index };
  });
}
const artistSet = r => [...new Set(r.artists.map(a => a.id))].sort().join('|');
export function compareRecordings(a, b) {
  const sharedIsrc = a.isrcs.some(code => b.isrcs.includes(code));
  const cleanA=/\b(clean|censored)\b/i.test(`${a.title} ${a.disambiguation||''}`);const cleanB=/\b(clean|censored)\b/i.test(`${b.title} ${b.disambiguation||''}`);
  const explicitA=/\b(explicit|uncensored)\b/i.test(`${a.title} ${a.disambiguation||''}`);const explicitB=/\b(explicit|uncensored)\b/i.test(`${b.title} ${b.disambiguation||''}`);
  const family=a.groups.some(g=>b.groups.includes(g));const near=a.length&&b.length?Math.abs(a.length-b.length):null;
  const declaredEditions=(cleanA&&explicitB)||(cleanB&&explicitA);
  const subset=a.artists.every(x=>b.artists.some(y=>y.id===x.id))||b.artists.every(x=>a.artists.some(y=>y.id===x.id));
  if(songTitle(a.title)===songTitle(b.title)&&artistSet(a)!==artistSet(b)&&a.artists[0]?.id===b.artists[0]?.id&&subset&&declaredEditions&&family&&near!==null&&near<=250&&a.version==='original'&&b.version==='original')return {merge:true,review:false,reason:'declared_clean_explicit_same_family_near_identical_duration_omitted_collaborator_credit'};
  if (songTitle(a.title) !== songTitle(b.title) || artistSet(a) !== artistSet(b)) {
    const similarTitle=songTitle(a.title).replace(/[^\p{L}\p{N}]/gu,'')===songTitle(b.title).replace(/[^\p{L}\p{N}]/gu,'');
    const sameFamily=a.groups.some(g=>b.groups.includes(g));const closeDuration=a.length&&b.length&&Math.abs(a.length-b.length)<=1500;
    const ambiguousMetadata=sameFamily&&closeDuration&&a.version===b.version&&(songTitle(a.title)===songTitle(b.title)||similarTitle);
    return {merge:false,review:sharedIsrc||Boolean(ambiguousMetadata),reason:sharedIsrc?'shared_isrc_conflicting_title_or_performing_credit':ambiguousMetadata?'release_family_duration_with_conflicting_title_or_performing_credit':'different_title_or_performing_credit'};
  }
  if (a.version !== b.version) return { merge: false, review: false, reason: 'different_version' };
  const duration = a.length && b.length ? Math.abs(a.length - b.length) : null;
  if (sharedIsrc && duration !== null && duration <= 1500) return { merge: true, review: false, reason: 'shared_isrc_title_performers_version_duration' };
  const sharedGroup = a.groups.some(group => b.groups.includes(group));
  const cleanExplicitPair = cleanA!==cleanB;
  if (sharedGroup && duration !== null && duration <= 2500 && a.version === 'original' && cleanExplicitPair) return { merge: true, review: false, reason: 'clean_explicit_same_release_group_title_performers_duration' };
  if(sharedGroup&&a.version==='original'&&duration!==null&&duration<=500&&(!a.isrcs.length||!b.isrcs.length)&&(a.positions||[]).some(p=>(b.positions||[]).includes(p)))return {merge:true,review:false,reason:'same_release_group_track_position_title_performers_near_exact_duration_no_conflicting_isrc'};
  return { merge: false, review: true, reason: duration !== null && duration > 1500 ? 'duration_conflict' : 'insufficient_recording_identity_evidence', sharedIsrc, sharedGroup, durationDifferenceMs: duration };
}
export function canonicalize(recordings) {
  const sorted = [...recordings].sort((a,b) => a.id.localeCompare(b.id));
  const parent = new Map(sorted.map(r => [r.id, r.id]));
  const find = id => { while (parent.get(id) !== id) id = parent.get(id); return id; };
  const buckets = new Map(); const codeBuckets = new Map(); const titleBuckets = new Map(); const uncertain = []; const merges = [];
  for (const recording of sorted) {
    const key = `${songTitle(recording.title)}|${artistSet(recording)}|${recording.version}`;
    const sameIdentity = buckets.get(key) || [];
    const titleKey=songTitle(recording.title).replace(/[^\p{L}\p{N}]/gu,'');
    const candidates = [...new Map([...sameIdentity,...(titleBuckets.get(titleKey)||[]),...recording.isrcs.flatMap(code=>codeBuckets.get(code)||[])].map(r=>[r.id,r])).values()];
    for (const candidate of candidates) {
      const evidence = compareRecordings(recording, candidate);
      if (evidence.merge) {
        // No transitive bridge may silently join two conflicting recordings.
        const left = sorted.filter(r => find(r.id) === find(recording.id));
        const right = sorted.filter(r => find(r.id) === find(candidate.id));
        if (left.every(a => right.every(b => compareRecordings(a,b).merge))) {
          const roots = [find(recording.id), find(candidate.id)].sort(); parent.set(roots[1], roots[0]);
          merges.push({ a: recording.id, b: candidate.id, ...evidence });
        } else uncertain.push({ a: recording.id, b: candidate.id, reason: 'conflicting_transitive_identity_evidence' });
      } else if (evidence.review) uncertain.push({ a: recording.id, b: candidate.id, ...evidence });
    }
    buckets.set(key, [...sameIdentity, recording]);
    for(const code of recording.isrcs)codeBuckets.set(code,[...(codeBuckets.get(code)||[]),recording]);
    titleBuckets.set(titleKey,[...(titleBuckets.get(titleKey)||[]),recording]);
  }
  const clusters = new Map();
  for (const recording of sorted) { const root = find(recording.id); clusters.set(root, [...(clusters.get(root) || []), recording]); }
  const reviews = uncertain.filter(p => find(p.a) !== find(p.b));
  return { clusters: [...clusters].map(([key, members]) => ({ key, members })), recordingToCluster: new Map(sorted.map(r => [r.id, find(r.id)])), reviews, merges };
}
