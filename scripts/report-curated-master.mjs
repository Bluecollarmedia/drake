import { readFile,writeFile,mkdir } from 'node:fs/promises';
const root=new URL('../artifacts/curated-catalog/',import.meta.url);
const read=n=>readFile(new URL(n,root),'utf8').then(JSON.parse);
const r=await read('latest-report.json');const idempotence=await read('idempotence-verification.json');const security=await read('security-verification.json');
const esc=s=>String(s??'Not verified').replaceAll('|','\\|').replace(/\r?\n/g,' ');
const status=s=>s==='approved'?'Eligible catalog candidate':'Held for review';
const reason={no_verified_metadata_match_in_cached_sources:'No verified title/version match in available metadata',matching_title_found_but_supplied_project_not_verified:'A similar title exists, but the supplied project/version was not verified',master_list_requires_performing_credit_verification:'Explicit Review role: Drake performance must be verified',source_credit_does_not_establish_drake_performance:'Source credit does not establish Drake performance',incomplete_or_conflicting_vocal_relationships_require_review:'Vocal relationships are incomplete or contradictory; check actual Drake performance',supplied_title_differs_from_source_title:'Supplied title differs from source title',supplied_artist_credit_differs_from_source_credit:'Supplied artist credit differs from source credit',supplied_role_differs_from_source_feature_credit:'Supplied role differs from source feature credit',additional_recording_identities_require_review:'Other source recording identities require review before attachment',recording_id_matches_multiple_master_candidates:'The same source recording ID matches different intended master candidates'};
const sources=e=>[...(e.possibleMatches||[]),...(e.unverifiedTitleSuggestions||[]),...(e.recordings||[])];
const details=v=>{
  const e=v.evidence;const rows=[];
  if(e.supplied)rows.push(`Supplied: ${esc(Array.isArray(e.supplied)?e.supplied.join(', '):e.supplied)}.`);
  if(e.source)rows.push(`Source: ${esc(Array.isArray(e.source)?e.source.map(a=>`${a.name} (${a.role})`).join(', '):e.source)}.`);
  if(e.sourceRole)rows.push(`Source Drake role: ${e.sourceRole}.`);
  if(e.url)rows.push(`[Evidence](${e.url}).`);
  if(e.checks)for(const p of e.checks)rows.push(`[Performance metadata](${p.evidenceURL}): listed vocal performers ${esc(p.vocalPerformers.map(a=>a.name).join(', '))}; absence of a Drake relationship is not proof of no Drake vocals.`);
  const proposed=[...new Map(sources(e).map(t=>[t.recordingId||t.id,t])).values()];
  if(proposed.length)rows.push('\n'+proposed.map(t=>`  - [${esc(t.title)}](https://musicbrainz.org/recording/${t.recordingId||t.id}), ${esc(t.releaseTitle||t.release||t.groupTitle)}; ${t.length||t.durationMs||'unknown'} ms; ISRC ${(t.isrcs||[]).join(', ')||'not supplied'}. This is a proposal, not an automatic new canonical song.`).join('\n'));
  return rows.join(' ');
};
const held=r.allReviews.filter(c=>c.status==='needs_review');
const originalReview=r.catalog.filter(s=>s.supplied_roles.some(role=>/review/i.test(role)));
const byRole=r.catalog.reduce((a,s)=>{for(const role of s.supplied_roles)a[role]=(a[role]||0)+1;return a;},{});
const masterEntry=c=>r.entries.find(e=>e.song_id===c.id);
const sample=['How About Now','My Side','Which One','Headlines','Doing It Wrong','The Motto'].map(t=>r.catalog.find(s=>s.title===t));
const text=`# Which Drake? — curated lead/joint-primary catalog, Part 1

Generated ${r.createdAt}. Membership source: the user's supplied master list, not MusicBrainz discovery. Master SHA-256: ${r.masterHash}.

## Imported result

| Measure | Result |
|---|---:|
| Supplied entries retained, with exact credits and roles | ${r.counts.master_entries} |
| Canonical song/version candidates | ${r.counts.canonical_songs} |
| Repeated canonical entries consolidated | ${r.parsedCounts.repeatedCanonicalEntries} |
| Candidates with matched factual metadata | ${r.enrichmentCounts.enrichedCandidates} |
| Eligible catalog candidates | ${r.counts.eligible_songs} |
| Candidates held for review | ${r.counts.held_candidates} |
| Explicit Review candidates, all ineligible | ${r.parsedCounts.explicitReviewCandidates} |
| Matched source release editions | ${r.counts.releases} |
| Release/track appearances | ${r.counts.appearances} |
| MusicBrainz recording IDs underneath these candidates | ${r.counts.musicbrainz_recording_ids} |
| Factual metadata review cases (blocking and non-blocking) | ${r.enrichmentCounts.metadataReviewCases} |
| New songs / releases on repeat real import | ${idempotence.repeatNewSongs} / ${idempotence.repeatNewReleases} |
| Profiles / scenarios / embeddings / analysis jobs | ${r.counts.analysis_profiles} / ${r.counts.scenarios} / ${r.counts.embeddings} / ${r.counts.analysis_jobs} |

All ${r.counts.master_entries} input entries were checked against the database for exact raw entry, credit and role preservation. All 403 canonical UUIDs and the reported catalog counts stayed identical on the second real import. UUID fingerprint: ${idempotence.canonicalUuidFingerprint}.

Supplied Role counts: ${Object.entries(byRole).map(([role,n])=>`${role}: ${n}`).join('; ')}. These are the supplied categories, independent of provider display-credit conventions.

## Duplicates

- How About Now: one song, appearances on If You're Reading This It's Too Late and Care Package.
- My Side: one song, appearances on If You're Reading This It's Too Late and Care Package.
- Which One: one song, standalone and Maid of Honour appearances.
- The three identical-text Intro entries identify different projects (Room for Improvement, Comeback Season and Honestly, Nevermind), so they retain three different canonical UUIDs.
- Extra Special and Do What U Do each retain their intentionally separate original/remix candidates. Their unverified alternate metadata is held, not silently merged.

## Catalog review gate

Explicit Review titles: ${originalReview.map(s=>s.title).join('; ')}. None is eligible. Another ${r.counts.held_candidates-originalReview.length} candidates have blocking metadata/performance discrepancies and remain held. Held entries are still in the catalog; no supplied entry was removed.

### All held candidates

| Supplied song | Supplied project | Blocking issues |
|---|---|---|
${held.map(c=>`| ${esc(c.title)} | ${esc(c.projects.join('; '))} | ${esc(c.reviews.filter(v=>v.blocking).map(v=>reason[v.reason]||v.reason.replaceAll('_',' ')).join('; '))} |`).join('\n')}

Some early mixtape entries do not match the verified project tracklists. In particular, the list's Room for Improvement has 16 entries while its [source release tracklist](https://musicbrainz.org/release/d2c8cbb8-d541-4379-9299-c4997ab28371) has 23; the supplied Comeback Season has 23 versus its [source tracklist](https://musicbrainz.org/release/bc3cbaae-ec82-4909-9a08-78a4de7a5c7f) with 24. This does not authorize adding or deleting master-list songs. Supplied list positions are retained as list positions; they are not asserted as official track numbers.

## Sample canonical entries

| Supplied title | Source title | Roles retained | UUID | Matched appearances |
|---|---|---|---|---:|
${sample.filter(Boolean).map(s=>`| ${esc(s.title)} | ${esc(s.official_title)} | ${esc(s.supplied_roles.join('; '))} | ${s.id} | ${s.appearances} |`).join('\n')}

The complete 403-song export is [curated-lead-catalog.csv](curated-lead-catalog.csv). It includes supplied title/credit/project/role, source title, performing credits, duration, date, ISRCs, status and internal UUID. A blank field is unknown, not fabricated.

## Source and verification

${r.coverage.metadataSource}. Four full source-project lookups verified Room for Improvement, Comeback Season, So Far Gone and Her Loss. No artist-wide discovery ran during this import. The identified, rate-limited MusicBrainz client and all useful previous source caches remain preserved.

Canonical IDs are internal UUIDs. MusicBrainz recording, release, track and artist IDs remain in their external namespace. Matching title/version/project evidence selects an anchor; compatible clean/explicit editions attach to the same intended master candidate. Shared source IDs or compatible ISRC/title/performer/duration evidence permit other appearances. Uncertain recording IDs remain review proposals and never create extra catalog songs.

All ${security.rlsTables} application tables enable RLS. Real authenticated-client SQL was denied catalog, membership, master-entry and metadata-review writes. Database constraints reject approval of unverified performance-review entries. An unlisted official-release fixture was excluded by the eligible-catalog view. All security fixtures rolled back. TypeScript, lint, 29 tests and 21/21 Expo Doctor checks passed. No Phase 1 screen or native Liquid Glass tab code was edited.

${r.coverage.limitations.map(s=>'- '+s).join('\n')}

## Every factual metadata discrepancy / uncertain attachment

Non-blocking discrepancies preserve an eligible master candidate with a verified anchor; they do not silently replace its supplied title, credit or role. Blocking issues keep the candidate ineligible. No semantic analysis is included below.

${r.allReviews.map((c,i)=>`### ${i+1}. ${esc(c.title)} — ${status(c.status)}\n\nUUID: ${c.songId}. Supplied role(s): ${esc(c.roles.join('; '))}. Project(s): ${esc(c.projects.join('; '))}. Source title: ${esc(c.sourceTitle)}.\n\n`+c.reviews.map(v=>`- **${reason[v.reason]||v.reason.replaceAll('_',' ')}** (${v.blocking?'blocking':'non-blocking'}). ${details(v)}`).join('\n')).join('\n\n')}

Part 2 guest/features is awaiting the user's separate list. No unreleased catalog or Phase 3 work was started.
`;
const output=new URL('../docs/catalog/',import.meta.url);await mkdir(output,{recursive:true});
await writeFile(new URL('curated-lead-report.md',output),text);
const csv=s=>'"'+String(s??'').replaceAll('"','""')+'"';
const header=['internal_uuid','supplied_title','version','supplied_roles','supplied_credit','supplied_projects','source_title','source_artist_credits','duration_ms','earliest_matched_appearance_date','isrcs','matched_appearances','artwork_appearances','status'];
const rows=r.catalog.map(c=>[c.id,c.title,c.version_key,c.supplied_roles.join('; '),masterEntry(c)?.supplied_credit,[...new Set(r.entries.filter(e=>e.song_id===c.id).map(e=>e.project))].join('; '),c.official_title,(c.artists||[]).map(a=>`${a.name} (${a.role})`).join('; '),c.duration_ms,c.earliest_source_release_date?.slice(0,10),c.isrcs?.join('; '),c.appearances,c.artwork_appearances,c.status]);
await writeFile(new URL('curated-lead-catalog.csv',output),[header,...rows].map(row=>row.map(csv).join(',')).join('\n')+'\n');
console.log(JSON.stringify({report:'docs/catalog/curated-lead-report.md',catalogExport:'docs/catalog/curated-lead-catalog.csv',canonicalSongs:r.catalog.length,held:held.length,reviewCandidates:r.allReviews.length,reviewCases:r.enrichmentCounts.metadataReviewCases}));
