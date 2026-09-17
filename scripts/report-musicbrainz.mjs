import { readFile,writeFile,mkdir } from 'node:fs/promises';
const root=new URL('../artifacts/musicbrainz/',import.meta.url);
const r=JSON.parse(await readFile(new URL('latest-report.json',root),'utf8'));
const esc=v=>String(v??'unknown').replaceAll('|','\\|').replace(/\r?\n/g,' ');
const artistText=s=>(s.artists||[]).map(a=>`${a.name} (${a.role})`).join(', ');
const rows=songs=>songs.map(s=>`| ${esc(s.title)} | ${esc(artistText(s))} | ${s.appearances} | ${s.id} | [recording](${s.musicbrainz_recordings[0].url}) |`).join('\n');
const c=r.discoveryCounts;
const text=`# Which Drake? — released MusicBrainz catalog report

Generated ${r.createdAt}. Supabase import run: ${r.runId}.

This is the metadata catalog, not an AI recommendation engine. The approved Phase 1 UI remains unchanged. No claim of complete coverage of every Drake song is made.

## Import and verification

| Measure | Result |
|---|---:|
| Raw MusicBrainz recording IDs discovered | ${c.rawMusicBrainzRecordings} |
| Release references/listings examined (union of sources and exclusions) | ${c.releasesExamined} |
| Eligible release listings | ${c.eligibleReleases} |
| Full release track-credit listings | ${c.fullReleaseTrackListings} |
| Targeted indexed appearance listings | ${c.targetedIndexedTrackListings} |
| Track appearances examined in those listings | ${c.allTrackAppearancesExamined} |
| Drake-credited appearances examined | ${c.drakeCreditedAppearancesExamined} |
| Imported release/track appearances | ${r.databaseCounts.appearances} |
| Eligible MusicBrainz recording IDs | ${c.eligibleRecordingIds} |
| Canonical officially released songs | ${r.databaseCounts.canonical_songs} |
| Drake primary/joint primary | ${r.primaryOrJointPrimarySongs} |
| Drake featured (without primary/joint credit) | ${r.featuredSongs} |
| Mixed primary/featured source credit contexts | ${r.ambiguousPrimaryFeatureCreditSongs} |
| Duplicate appearances consolidated beneath canonical songs | ${c.duplicateAppearancesConsolidated} |
| Distinct recording IDs consolidated | ${c.recordingIdsConsolidated} |
| Raw recording entries excluded from eligible catalog | ${c.excludedRawRecordingEntries} |
| Excluded release entries | ${c.excludedReleaseEntries} |
| Excluded Drake-credited track appearances | ${c.excludedTrackAppearances} |
| Uncertain canonical duplicate pairs | ${r.uncertainDuplicatePairs} |
| Newly inserted songs on this run | ${r.newSongs} |
| Newly inserted releases on this run | ${r.newReleases} |
| AI profiles / scenarios / embeddings / analysis jobs | ${r.databaseCounts.analysis_profiles} / ${r.databaseCounts.scenarios} / ${r.databaseCounts.embeddings} / ${r.databaseCounts.analysis_jobs} |

Exclusion figures describe different units and must not be added together. The raw pool includes recordings with no eligible official appearance, DJ fragments, bootlegs and other out-of-scope metadata.

## Source and scope

Artist: [Drake, Canadian rapper](https://musicbrainz.org/artist/${r.coverage.artistId}). Internal UUIDs are preserved; MusicBrainz IDs use a separate external namespace. Songs have catalog_type = official_released. The unreleased catalog is reserved but not populated.

Queries: recording browse by artist MBID with artist credits/ISRCs; release browse by track_artist MBID; recording search arid:${r.coverage.artistId} AND status:official; full release lookups for index-absent references; historical Withdrawn official releases; targeted recording artist-relation lookups for performance ambiguity. All use /ws/2 JSON, identified User-Agent, sequential requests, rate delay and Retry-After/backoff. Source responses and timestamps are cached locally. Snapshot SHA-256: ${r.coverage.snapshotHash}.

Official studio albums, officially released mixtapes/EPs/singles/deluxe appearances, collaborations, featured recordings and compilation/soundtrack appearances are eligible. The source release type and release-group IDs are preserved. MusicBrainz [defines Withdrawn](https://musicbrainz.org/doc/Release) as previously officially released, so historical withdrawn releases stay eligible. Promotional status can include pre-release versions, so promo-only recordings need authorization/release review.

Deduplication reuses MusicBrainz recording IDs and consolidates distinct IDs only with matching title, performer set, version and close duration plus shared ISRC or supported clean/explicit release-family evidence. Fuzzy titles, credit conflicts, missing evidence and transitive conflicts do not trigger automatic merges. Clean/explicit differences remain on individual appearances. Clearly different live/remix/alternate versions keep separate identities.

## Completeness tests

| Requested song | Result | Source title(s) | Canonical matches |
|---|---|---|---:|
${r.completeness.map(t=>`| ${esc(t.title)} | ${t.passed?'PASS':'MISSING — '+esc(t.missingReason)} | ${esc([...new Set(t.sourceTitles)].join('; '))} | ${t.canonicalKeys.length} |`).join('\n')}

Multiple matches mean uncertain distinct recordings remain separate; this is not a claim that every title-level duplicate has been resolved. I Get Lonely Too is accepted as a source-title variant for the I Get Lonely completeness test only; it is not silently merged with another recording.

## 25 sample canonical songs

| Song | Performing credits | Appearances | Internal song UUID | Source |
|---|---|---:|---|---|
${rows(r.sampleCanonicalSongs)}

## 15 featured songs

These use explicit MusicBrainz feature credit join phrases, not an assumption based only on artist ordering.

| Song | Performing credits | Appearances | Internal song UUID | Source |
|---|---|---:|---|---|
${rows(r.featureSamples)}

## Canonical songs with multiple release appearances

${r.multipleReleaseExamples.map(s=>`### ${esc(s.title)}\n\nInternal song UUID: ${s.id}. ${s.appearance_count} appearances.\n\n`+s.appearances.map(a=>`- [${esc(a.title)}](https://musicbrainz.org/release/${a.musicbrainz_id}), disc ${a.disc}, track ${a.track}; internal release UUID ${a.release_id}.`).join('\n')).join('\n\n')}

## Every uncertain duplicate case

${r.allUncertainDuplicates.length?r.allUncertainDuplicates.map((d,index)=>`### ${index+1}. ${esc(d.title_a)} ↔ ${esc(d.title_b)}\n\nCanonical UUIDs: ${d.song_a_id} / ${d.song_b_id}. Durations: ${d.duration_a??'unknown'} / ${d.duration_b??'unknown'} ms. Versions: ${esc(d.version_a)} / ${esc(d.version_b)}. Review UUID: ${d.id}.\n\n`+(d.evidence.cases||[]).map(p=>`- [Recording A](https://musicbrainz.org/recording/${p.a}) / [Recording B](https://musicbrainz.org/recording/${p.b}): ${esc(p.reason)}; shared ISRC ${p.sharedIsrc??'not established'}; same release family ${p.sharedGroup??'not established'}; duration difference ${p.durationDifferenceMs??'unknown'} ms.`).join('\n')).join('\n\n'):'None.'}

## Performing-credit holds and suspected gaps

${r.performanceMetadataReview.filter(p=>p.heldForPerformanceReview).map(p=>`- [${esc(p.title)}](${p.evidenceURL}): held for review. Listed vocal performers: ${esc(p.vocalPerformers.map(v=>v.name).join(', '))}; Drake performance relationship not established. Relationships may be incomplete; this is a conservative hold, not proof the song never includes Drake.`).join('\n')||'No contradictory vocal-relationship holds.'}

${r.limitations.map(v=>'- '+v).join('\n')}

Full exclusion lists, source IDs and evidence are in the local machine-readable latest-report.json alongside timestamped source responses in artifacts/musicbrainz/cache. No Spotify/Apple links or unavailable source metadata were fabricated.
`;
await mkdir(new URL('../docs/catalog/',import.meta.url),{recursive:true});
await writeFile(new URL('../docs/catalog/musicbrainz-report.md',import.meta.url),text);
console.log(JSON.stringify({report:'docs/catalog/musicbrainz-report.md',samples:r.sampleCanonicalSongs.length,features:r.featureSamples.length,uncertainPairs:r.allUncertainDuplicates.length}));
