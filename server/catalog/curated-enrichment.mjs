import { masterTitleKey } from './curated-master.mjs';
import { artistRoles, normalized, recordingVersion, songTitle } from './musicbrainz-identity.mjs';
import { DRAKE_MBID } from './musicbrainz-client.mjs';

const knownIsrcs = r => [...new Set((r.isrcs || []).map(s => s.replace(/[-\s]/g, '').toUpperCase()).filter(s => /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(s)))];
const titleKey = value => masterTitleKey(songTitle(value).replace(/\bu\b/gi,'you').replace(/\s*\((?:album version|freestyle)\)\s*$/i, ''));
const versionKind = r => {
  const detail = `${r.title} ${r.disambiguation || ''}`;
  if (/\b(remix|refix|mashup|bootleg|slowed|sped up|chopped|screwed|live version|live at|radio edit|instrumental|a cappella|acapella)\b/i.test(detail)) return 'different';
  const v = recordingVersion(r);
  return v === 'original' || v === songTitle(r.title) || /dolby atmos|remaster|album version|studio version/i.test(v) ? 'original' : 'different';
};
function projectKey(project) {
  if (/^(OTHER|2024 LEAD)/.test(project)) return null;
  return masterTitleKey(project.replace(/\s*—.*|\s*\+.*|\s*\(\d{4}\)/g, ''));
}
const sameCredits = (a,b) => a.artists.map(x=>x.id).sort().join('|') === b.artists.map(x=>x.id).sort().join('|');
const compatibleCredits = (a,b) => sameCredits(a,b) || (a.artists[0]?.id === b.artists[0]?.id && (a.artists.every(x=>b.artists.some(y=>y.id===x.id)) || b.artists.every(x=>a.artists.some(y=>y.id===x.id))));

export function enrichCuratedMaster(master, rawRecordings, releases, performanceReviews = []) {
  const raw = new Map(rawRecordings.map(r=>[r.id,r])); const titleIndex = new Map();
  const add = (key,value) => titleIndex.set(key,[...(titleIndex.get(key)||[]),value]);
  for (const release of releases) {
    const group = release['release-group'] || {};
    if (!['Official','Withdrawn'].includes(release.status) || (group['secondary-types']||[]).includes('DJ-mix') || /\b(bootlegs?|unofficial|karaoke|tribute|cut.?ups?|fan.?made)\b/i.test(`${release.title} ${release.disambiguation || ''}`)) continue;
    for (const medium of release.media || []) for (const track of medium.tracks || []) {
      if (!track.recording?.id) continue;
      const r = {...track.recording,...raw.get(track.recording.id)};
      const credits = track['artist-credit'] || r['artist-credit'] || [];
      const artists = artistRoles(credits);
      if (r.video || /DVD|Blu-ray|VHS/i.test(medium.format || '') || /\b(mixed|excerpt|unreleased|leak|bootleg|ai generated|ai cover)\b/i.test(`${r.disambiguation || ''} ${r.title}`)) continue;
      const item = {recordingId:r.id,trackId:track.id,title:r.title,trackTitle:track.title,disambiguation:r.disambiguation||'',length:r.length||track.length||null,isrcs:knownIsrcs(r),artists,
        recordingCredit:r['artist-credit']||[],trackCredit:credits,releaseId:release.id,releaseTitle:release.title,releaseStatus:release.status,groupId:group.id,groupTitle:group.title||release.title,
        disc:medium.position,position:track.position,explicit:/\b(clean|censored)\b/i.test(`${r.title} ${r.disambiguation}`)?false:/\b(explicit|uncensored)\b/i.test(`${r.title} ${r.disambiguation}`)?true:null,
        creditSource:track.creditSource||'full_release_track_artist_credit',versionKind:versionKind(r),sourceURL:`https://musicbrainz.org/recording/${r.id}`};
      const keys=new Set([titleKey(r.title),titleKey(track.title)]);
      // A declared remix in the list can match its parenthesized source title.
      if(/\bremix\b/i.test(`${r.title} ${r.disambiguation}`)) keys.add(titleKey(r.title.replace(/\s*\([^)]*remix[^)]*\)/i,''))+':remix');
      for(const key of keys)add(key,item);
    }
  }
  const enriched=master.candidates.map(candidate=>{
    const feature=master.scope==='feature_guest';
    const reviews=[];const keys=feature?[]:candidate.entries.map(e=>projectKey(e.project)).filter(Boolean);
    const searchKey=titleKey(candidate.title.replace(feature?/\s*\([^)]*remix[^)]*\)/i:/$^/,''))+(candidate.version.startsWith('remix:')?':remix':'');
    const qualifierKeys=candidate.entries.filter(e=>/\(Freestyle\)/i.test(e.qualifier)).map(e=>titleKey(e.title+' Freestyle'));
    // A factual title alias is enrichment only; supplied membership and title stay unchanged.
    if(feature&&candidate.title==='Invented Sex'&&masterTitleKey(candidate.entries[0].primary)==='treysongz')qualifierKeys.push(titleKey('I Invented Sex'));
    let potential=[...new Map([...(titleIndex.get(searchKey)||[]),...qualifierKeys.flatMap(k=>titleIndex.get(k)||[])].map(t=>[`${t.releaseId}:${t.disc}:${t.position}`,t])).values()];
    // A requested remix never licenses attaching its sped-up/live/edit/remix-of-remix variants.
    if(feature)potential=potential.filter(t=>!/\b(sped up|slowed|chopped|screwed|mashup|live at|live version|radio edit|instrumental|acapella|a cappella)\b/i.test(`${t.title} ${t.disambiguation} ${t.releaseTitle}`));
    if(candidate.version==='original'||candidate.version==='unspecified')potential=potential.filter(t=>t.versionKind==='original');
    else potential=potential.filter(t=>/remix/i.test(`${t.title} ${t.disambiguation}`));
    const primaryNames=feature?candidate.entries[0].primary.split(/\s*&\s*/).map(masterTitleKey):[];
    const primaryMatches=t=>primaryNames.every(n=>t.artists.some(a=>[a.name,a.creditedName].map(masterTitleKey).includes(n)));
    let best;
    const onProject=t=>feature?!!best&&t.groupId===best.groupId&&primaryMatches(t):keys.some(k=>masterTitleKey(t.groupTitle)===k||masterTitleKey(t.releaseTitle).startsWith(k));
    const anchors=feature?potential.filter(t=>primaryMatches(t)&&(candidate.explicitlyReview||t.artists.some(a=>a.id===DRAKE_MBID))):keys.length?potential.filter(onProject):potential.filter(t=>t.artists.some(a=>a.id===DRAKE_MBID));
    const suppliedArtistNames=candidate.entries[0].credit.split(/\s+feat\.?\s+|\s*&\s*|,\s*/i).map(masterTitleKey);
    const artistMismatch=t=>feature?t.artists.filter(a=>!suppliedArtistNames.some(n=>[a.name,a.creditedName].map(masterTitleKey).includes(n))).length:0;
    // No title-only attachment across different projects when the supplied project lacks evidence.
    best=[...anchors].sort((a,b)=>artistMismatch(a)-artistMismatch(b)||b.isrcs.length-a.isrcs.length||Number(a.explicit===false)-Number(b.explicit===false)||a.recordingId.localeCompare(b.recordingId))[0];
    const accepted=[];const tentative=[];
    if(best){
      for(const t of potential){
        const near=best.length&&t.length?Math.abs(best.length-t.length):null;
        const sameCode=best.isrcs.some(s=>t.isrcs.includes(s));
        if(t.recordingId===best.recordingId||(onProject(t)&&compatibleCredits(best,t)&&near!==null&&near<=2500)||(sameCode&&sameCredits(best,t)&&near!==null&&near<=1500))accepted.push(t);
        else tentative.push(t);
      }
      if(normalized(songTitle(best.title))!==normalized(candidate.title))reviews.push({reason:'supplied_title_differs_from_source_title',blocking:false,evidence:{supplied:candidate.title,source:best.title,url:best.sourceURL}});
      const primary=best.artists.filter(a=>a.role==='primary');
      const drake=best.artists.find(a=>a.id===DRAKE_MBID);
      if(feature&&drake?.role==='primary')reviews.push({reason:'feature_list_conflicts_with_joint_primary_source_billing',blocking:true,evidence:{suppliedPrimary:candidate.entries[0].primary,suppliedRole:candidate.roles,source:best.artists,url:best.sourceURL}});
      if(!drake&&!candidate.roles.some(r=>/Group/.test(r)))reviews.push({reason:'source_credit_does_not_establish_drake_performance',blocking:true,evidence:{artists:best.artists,url:best.sourceURL}});
      if(drake?.role==='featured'&&candidate.roles.some(r=>/Lead|Joint-Primary/.test(r)))reviews.push({reason:'supplied_role_differs_from_source_feature_credit',blocking:false,evidence:{supplied:candidate.roles,sourceRole:drake.role,url:best.sourceURL}});
      // Keep supplied credits untouched; even non-blocking factual disagreements need review.
      const suppliedNames=candidate.entries[0].credit.split(/\s+feat\.?\s+|\s*&\s*|,\s*/i).map(masterTitleKey);
      const sourceNames=best.artists.map(a=>masterTitleKey(a.name));
      if(suppliedNames.some(n=>!sourceNames.includes(n))||sourceNames.some(n=>!suppliedNames.includes(n)))reviews.push({reason:'supplied_artist_credit_differs_from_source_credit',blocking:false,evidence:{supplied:candidate.entries[0].credit,source:best.artists,url:best.sourceURL,primaryArtists:primary.map(a=>a.name)}});
    } else {
      const localizedSuggestions=[...new Map([...titleIndex.values()].flat().filter(t=>onProject(t)&&titleKey(t.title).includes(titleKey(candidate.title).slice(0,Math.max(4,Math.floor(titleKey(candidate.title).length*0.65))))).map(t=>[t.recordingId,t])).values()].slice(0,5);
      reviews.push({reason:potential.length?'matching_title_found_but_supplied_project_not_verified':'no_verified_metadata_match_in_cached_sources',blocking:true,evidence:{suppliedTitle:candidate.title,projects:candidate.entries.map(e=>e.project),possibleMatches:potential.slice(0,10),unverifiedTitleSuggestions:localizedSuggestions}});
    }
    if(tentative.length)reviews.push({reason:'additional_recording_identities_require_review',blocking:false,evidence:{recordings:[...new Map(tentative.map(t=>[t.recordingId,t])).values()].map(t=>({id:t.recordingId,title:t.title,durationMs:t.length,isrcs:t.isrcs,artists:t.artists,release:t.releaseTitle,url:t.sourceURL}))}});
    if(feature&&accepted.length){
      const dated=accepted.map(t=>({date:releases.find(r=>r.id===t.releaseId)?.date,id:t.releaseId})).filter(x=>/^\d{4}/.test(x.date||'')).sort((a,b)=>a.date.localeCompare(b.date));
      const year=candidate.entries[0].year;
      if(dated[0]&&Number(dated[0].date.slice(0,4))!==year)reviews.push({reason:'verified_appearance_year_differs_from_supplied_inventory_year',blocking:false,evidence:{suppliedYear:year,earliestMatchedAppearance:dated[0].date,url:'https://musicbrainz.org/release/'+dated[0].id,qualification:'Verified appearance date, not a claim about the first-ever release; supplied inventory year is preserved.'}});
    }
    for(const conflict of candidate.conflicts)reviews.push({reason:conflict,blocking:true,evidence:{entries:candidate.entries}});
    if(candidate.explicitlyReview)reviews.push({reason:'master_list_requires_performing_credit_verification',blocking:true,evidence:{roles:candidate.roles}});
    const performance=performanceReviews.filter(p=>accepted.some(t=>t.recordingId===p.recordingId));
    if(performance.some(p=>p.heldForPerformanceReview))reviews.push({reason:'incomplete_or_conflicting_vocal_relationships_require_review',blocking:true,evidence:{checks:performance.filter(p=>p.heldForPerformanceReview)}});
    return {...candidate,best:best||null,appearances:accepted,recordingIds:[...new Set(accepted.map(a=>a.recordingId))],reviews,status:reviews.some(r=>r.blocking)?'needs_review':'approved'};
  });
  // A provider recording ID must never silently represent two intended master songs.
  const owners=new Map();
  for(const c of enriched)for(const id of c.recordingIds)owners.set(id,[...(owners.get(id)||[]),c]);
  for(const [id,values] of owners)if(values.length>1)for(const c of values){c.status='needs_review';c.reviews.push({reason:'recording_id_matches_multiple_master_candidates',blocking:true,evidence:{recordingId:id,candidates:values.map(x=>x.key)}});c.recordingIds=c.recordingIds.filter(x=>x!==id);c.appearances=c.appearances.filter(x=>x.recordingId!==id);}
  return {master,enriched,releases,counts:{...master.counts,enrichedCandidates:enriched.filter(c=>c.best).length,approvedCandidates:enriched.filter(c=>c.status==='approved').length,heldCandidates:enriched.filter(c=>c.status==='needs_review').length,
    importedAppearances:enriched.reduce((n,c)=>n+c.appearances.length,0),recordingIds:enriched.reduce((n,c)=>n+c.recordingIds.length,0),metadataReviewCases:enriched.reduce((n,c)=>n+c.reviews.length,0)}};
}
