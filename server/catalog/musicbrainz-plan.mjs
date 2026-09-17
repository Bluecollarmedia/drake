import { DRAKE_MBID } from './musicbrainz-client.mjs';
import { artistRoles, canonicalize, normalized, recordingVersion, songTitle } from './musicbrainz-identity.mjs';

export function buildPlan(rawRecordings, releases, excludedReleases, performanceReviews = []) {
  const raw = new Map(rawRecordings.map(r => [r.id,r])); const discoveries=new Map(raw);const recordings = new Map();
  const appearances = []; const excludedTracks = []; const metadataWarnings = [];
  let examined = 0; let drakeCredited = 0;
  for (const release of releases) {
    if(!['Official','Withdrawn'].includes(release.status))throw new Error(`ineligible_release_status:${release.id}:${release.status}`);
    for (const medium of release.media || []) {
      if ((medium.tracks || []).length !== medium['track-count']) throw new Error(`incomplete_release_tracklist:${release.id}:${medium.position}`);
      for (const track of medium.tracks || []) {
        examined++;
        const source = track.recording; if (!source?.id) throw new Error(`missing_recording:${release.id}:${track.id}`);
        const info = raw.get(source.id) || source;
        const sourceCredits = source['artist-credit'] || [];
        const trackCredits = track['artist-credit'] || sourceCredits;
        const hasDrake = credits => credits.some(c => c.artist?.id === DRAKE_MBID);
        if (!hasDrake(trackCredits) && !hasDrake(sourceCredits)) continue;
        if(!discoveries.has(source.id))discoveries.set(source.id,{...source,'artist-credit':trackCredits});
        drakeCredited++;
        const detail = `${info.title} ${info.disambiguation || ''} ${source.title} ${source.disambiguation || ''} ${track.title}`.replace(/[‐‑‒–—−-]/g,' ');
        let reason;
        const performanceHold=performanceReviews.find(r=>r.recordingId===source.id&&r.heldForPerformanceReview);
        if(performanceHold)reason='held_for_performing_artist_credit_review';
        else if (/\binstrumental\b/i.test(detail)&&!performanceReviews.some(r=>r.recordingId===source.id&&r.drakePerformanceConfirmed))reason='instrumental_without_drake_performance_evidence';
        else if (info.video || source.video || /(?:DVD|Blu-ray|VHS)/i.test(medium.format || '')) reason = 'video_not_song_recording';
        else if (/\b(karaoke|tribute|cover version|unofficial|bootleg|leak|unreleased|fan (?:made|upload)|ai (?:generated|cover|vocals)|dj mix|continuous mix|mixed|excerpt)\b/i.test(detail)) reason = 'non_original_unofficial_or_dj_excerpt_recording';
        if (reason) { excludedTracks.push({ release: release.id, track: track.id, recording: source.id, title: source.title, reason }); continue; }
        const credits = hasDrake(sourceCredits) ? sourceCredits : trackCredits;
        const artists = artistRoles(credits);
        const current = recordings.get(source.id);
        const isrcs = [...new Set([...(info.isrcs || []), ...(source.isrcs || [])].map(c => String(c).replace(/[-\s]/g,'').toUpperCase()).filter(c => /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(c)))];
        const value = { id: source.id, title: info.title || source.title, disambiguation: info.disambiguation || source.disambiguation || '', length: info.length || source.length || track.length || null,
          artists, isrcs, groups: [...new Set([...(current?.groups || []), release['release-group']?.id].filter(Boolean))],
          positions:[...(current?.positions||[]),`${release['release-group']?.id}:${medium.position}:${track.position}`],
          source: { recordingArtistCredit: sourceCredits, trackArtistCredit: trackCredits, performanceEvidence: hasDrake(sourceCredits) ? 'recording_artist_credit' : 'track_artist_credit', firstReleaseDate: info['first-release-date'] || null } };
        value.version = recordingVersion(value);
        if (current && current.artists.map(a => a.id).join('|') !== artists.map(a => a.id).join('|')) metadataWarnings.push({ recording: source.id, reason: 'performing_credit_differs_between_appearances' });
        recordings.set(source.id, value);
        appearances.push({ releaseId: release.id, recordingId: source.id, trackId: track.id, title: track.title, disc: medium.position, position: track.position,
          length: track.length || source.length || null, explicit:/\b(clean|censored)\b/i.test(value.disambiguation)?false:/\b(explicit|uncensored)\b/i.test(value.disambiguation)?true:null,
          artists: artistRoles(trackCredits), source: { recordingId: source.id, trackId: track.id, artistCredit: trackCredits, creditSource:track.creditSource||'full_release_track_artist_credit', recordingArtistCredit: sourceCredits, releaseStatus: release.status, releaseGroupId: release['release-group']?.id, mediumFormat: medium.format } });
      }
    }
  }
  const canonical = canonicalize([...recordings.values()]);
  const appearancesByCluster = new Map();
  for (const appearance of appearances) {
    const key = canonical.recordingToCluster.get(appearance.recordingId);
    appearancesByCluster.set(key, [...(appearancesByCluster.get(key) || []), appearance]);
  }
  const excludedRecordings = [...discoveries.values()].filter(r => !recordings.has(r.id)).map(r => ({ id:r.id, title:r.title, reason:'no_eligible_official_audio_release_appearance_in_musicbrainz_snapshot' }));
  const completenessNames = ['Headlines','Doing It Wrong','Best I Ever Had','The Motto','Club Paradise','I Get Lonely','Fancy','Shut It Down','Fire & Desire','Redemption','4PM in Calabasas','Two Birds, One Stone','Dreams Money Can Buy','Free Spirit'];
  const tests = completenessNames.map(title => {
    const key = songTitle(title);
    const matches = canonical.clusters.filter(c => c.members.some(r => songTitle(r.title) === key || (key === 'i get lonely' && songTitle(r.title) === 'i get lonely too')));
    const rawMatches = rawRecordings.filter(r => songTitle(r.title) === key || (key === 'i get lonely' && songTitle(r.title) === 'i get lonely too'));
    return { title, passed: matches.length > 0, canonicalKeys:matches.map(c => c.key), sourceTitles:matches.flatMap(c => c.members.map(r => r.title)), rawRecordingIds:rawMatches.map(r => r.id), missingReason:matches.length ? null : rawMatches.length ? 'discovered_recording_has_no_eligible_official_release_appearance' : 'not_discovered_in_recording_artist_credit_browse' };
  });
  return { ...canonical, recordings, releases, appearances, appearancesByCluster, excludedTracks, excludedRecordings, excludedReleases, metadataWarnings, completeness:tests,
    counts:{ rawMusicBrainzRecordings:discoveries.size,artistRecordingBrowseIds:rawRecordings.length,additionalTrackLevelRecordingIds:discoveries.size-rawRecordings.length,releasesExamined:releases.length+excludedReleases.length, eligibleReleases:releases.length, allTrackAppearancesExamined:examined, drakeCreditedAppearancesExamined:drakeCredited,
      fullReleaseTrackListings:releases.filter(r=>!r.targetedTrackListing).length,targetedIndexedTrackListings:releases.filter(r=>r.targetedTrackListing).length,
      importedAppearances:appearances.length, eligibleRecordingIds:recordings.size, canonicalSongs:canonical.clusters.length, duplicateAppearancesConsolidated:appearances.length-canonical.clusters.length,
      recordingIdsConsolidated:recordings.size-canonical.clusters.length, excludedReleaseEntries:excludedReleases.length, excludedTrackAppearances:excludedTracks.length, excludedRawRecordingEntries:excludedRecordings.length } };
}

export function releaseMetadata(release) {
  const group = release['release-group'] || {};
  const secondary = group['secondary-types'] || [];
  const primary = normalized(group['primary-type']);
  const type = secondary.includes('Mixtape/Street') ? 'mixtape' : secondary.includes('Compilation') ? 'compilation' : ['album','ep','single'].includes(primary) ? primary : 'unknown';
  const sourceDate = release.date || group['first-release-date'];
  let precision = /^\d{4}$/.test(sourceDate) ? 'year' : /^\d{4}-\d{2}$/.test(sourceDate) ? 'month' : /^\d{4}-\d{2}-\d{2}$/.test(sourceDate) ? 'day' : null;
  const date = precision === 'year' ? `${sourceDate}-01-01` : precision === 'month' ? `${sourceDate}-01` : precision ? sourceDate : null;
  if (date && (Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date)) precision=null;
  return { type, date:precision ? date : null, precision, source:{ provider:'musicbrainz', releaseGroupId:group.id, primaryType:group['primary-type'], secondaryTypes:secondary, status:release.status, disambiguation:release.disambiguation, originalDate:release.date, country:release.country, labelInfo:release['label-info'] || [], releaseEvents:release['release-events'] || [], evidenceURL:`https://musicbrainz.org/release/${release.id}` } };
}
