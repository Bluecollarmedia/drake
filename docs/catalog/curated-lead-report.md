# Which Drake? — curated lead/joint-primary catalog, Part 1

Generated 2026-09-16T01:18:16.214Z. Membership source: the user's supplied master list, not MusicBrainz discovery. Master SHA-256: aa69a0bdd51b6677d335715c6a5f38edfb07f30523c5c724bd936e68809c6a61.

## Imported result

| Measure | Result |
|---|---:|
| Supplied entries retained, with exact credits and roles | 406 |
| Canonical song/version candidates | 403 |
| Repeated canonical entries consolidated | 3 |
| Candidates with matched factual metadata | 389 |
| Eligible catalog candidates | 382 |
| Candidates held for review | 21 |
| Explicit Review candidates, all ineligible | 6 |
| Matched source release editions | 333 |
| Release/track appearances | 2770 |
| MusicBrainz recording IDs underneath these candidates | 704 |
| Factual metadata review cases (blocking and non-blocking) | 161 |
| New songs / releases on repeat real import | 0 / 0 |
| Profiles / scenarios / embeddings / analysis jobs | 0 / 0 / 0 / 0 |

All 406 input entries were checked against the database for exact raw entry, credit and role preservation. All 403 canonical UUIDs and the reported catalog counts stayed identical on the second real import. UUID fingerprint: e333e75ac1ad040692cd56627224c219891f64b75f1f8ea08502a60a6a01bcf3.

Supplied Role counts: Lead: 344; Drake-project guest performance / Review: 2; Review: 3; Lead / Collaboration: 11; Group / Joint: 5; Joint-Primary: 37; Interlude / Review: 1. These are the supplied categories, independent of provider display-credit conventions.

## Duplicates

- How About Now: one song, appearances on If You're Reading This It's Too Late and Care Package.
- My Side: one song, appearances on If You're Reading This It's Too Late and Care Package.
- Which One: one song, standalone and Maid of Honour appearances.
- The three identical-text Intro entries identify different projects (Room for Improvement, Comeback Season and Honestly, Nevermind), so they retain three different canonical UUIDs.
- Extra Special and Do What U Do each retain their intentionally separate original/remix candidates. Their unverified alternate metadata is held, not silently merged.

## Catalog review gate

Explicit Review titles: 3AM on Glenwood; 4422; Buried Alive Interlude; Screw the World – Interlude; Skepta Interlude; Yebba's Heartbreak. None is eligible. Another 15 candidates have blocking metadata/performance discrepancies and remain held. Held entries are still in the catalog; no supplied entry was removed.

### All held candidates

| Supplied song | Supplied project | Blocking issues |
|---|---|---|
| Pistol Proof | ROOM FOR IMPROVEMENT (2006) | No verified title/version match in available metadata |
| Bad Meaning Good | ROOM FOR IMPROVEMENT (2006) | A similar title exists, but the supplied project/version was not verified |
| Room for Improvement | ROOM FOR IMPROVEMENT (2006) | No verified title/version match in available metadata |
| About Improvement | ROOM FOR IMPROVEMENT (2006) | No verified title/version match in available metadata |
| Extra Special | ROOM FOR IMPROVEMENT (2006) | No verified title/version match in available metadata |
| S.C.A.R. | ROOM FOR IMPROVEMENT (2006) | No verified title/version match in available metadata |
| Outro | ROOM FOR IMPROVEMENT (2006) | A similar title exists, but the supplied project/version was not verified |
| Where to Aim | COMEBACK SEASON (2007) | No verified title/version match in available metadata |
| The Question | COMEBACK SEASON (2007) | No verified title/version match in available metadata |
| Fading | COMEBACK SEASON (2007) | A similar title exists, but the supplied project/version was not verified |
| Must Hate Skits | COMEBACK SEASON (2007) | No verified title/version match in available metadata |
| Do What U Do | COMEBACK SEASON (2007) | A similar title exists, but the supplied project/version was not verified |
| Missin' You | COMEBACK SEASON (2007) | No verified title/version match in available metadata |
| So So Fresh | SO FAR GONE (2009) | No verified title/version match in available metadata |
| Buried Alive Interlude | TAKE CARE (2011) | Explicit Review role: Drake performance must be verified |
| Jorja Interlude | MORE LIFE (2017) | Vocal relationships are incomplete or contradictory; check actual Drake performance |
| 4422 | MORE LIFE (2017) | Explicit Review role: Drake performance must be verified |
| Skepta Interlude | MORE LIFE (2017) | Explicit Review role: Drake performance must be verified; Vocal relationships are incomplete or contradictory; check actual Drake performance |
| Yebba's Heartbreak | CERTIFIED LOVER BOY (2021) | Explicit Review role: Drake performance must be verified |
| 3AM on Glenwood | HER LOSS — WITH 21 SAVAGE (2022) | Source credit does not establish Drake performance; Explicit Review role: Drake performance must be verified |
| Screw the World – Interlude | FOR ALL THE DOGS + SCARY HOURS EDITION (2023) | Explicit Review role: Drake performance must be verified |

Some early mixtape entries do not match the verified project tracklists. In particular, the list's Room for Improvement has 16 entries while its [source release tracklist](https://musicbrainz.org/release/d2c8cbb8-d541-4379-9299-c4997ab28371) has 23; the supplied Comeback Season has 23 versus its [source tracklist](https://musicbrainz.org/release/bc3cbaae-ec82-4909-9a08-78a4de7a5c7f) with 24. This does not authorize adding or deleting master-list songs. Supplied list positions are retained as list positions; they are not asserted as official track numbers.

## Sample canonical entries

| Supplied title | Source title | Roles retained | UUID | Matched appearances |
|---|---|---|---|---:|
| How About Now | How About Now | Lead | 8e27b63e-b087-4894-9401-f8f600504799 | 4 |
| My Side | My Side | Lead | 36a3fb1b-c163-41a0-baa1-5466b9885ab6 | 6 |
| Which One | Which One | Lead / Collaboration | bfe64e3f-9223-4ca1-83d0-13d649a5bf0a | 4 |
| Headlines | Headlines | Lead | 6effb45f-d46b-40af-b90b-228ec525485c | 7 |
| Doing It Wrong | Doing It Wrong | Lead | 7f325f9d-a482-423a-9065-493a324e0815 | 11 |
| The Motto | The Motto | Lead | b550b766-73e8-4ae3-9c78-63a4c85c49a7 | 11 |

The complete 403-song export is [curated-lead-catalog.csv](curated-lead-catalog.csv). It includes supplied title/credit/project/role, source title, performing credits, duration, date, ISRCs, status and internal UUID. A blank field is unknown, not fabricated.

## Source and verification

Previously cached MusicBrainz /ws/2 responses plus four targeted full-project lookups; no new artist-wide discovery. Four full source-project lookups verified Room for Improvement, Comeback Season, So Far Gone and Her Loss. No artist-wide discovery ran during this import. The identified, rate-limited MusicBrainz client and all useful previous source caches remain preserved.

Canonical IDs are internal UUIDs. MusicBrainz recording, release, track and artist IDs remain in their external namespace. Matching title/version/project evidence selects an anchor; compatible clean/explicit editions attach to the same intended master candidate. Shared source IDs or compatible ISRC/title/performer/duration evidence permit other appearances. Uncertain recording IDs remain review proposals and never create extra catalog songs.

All 31 application tables enable RLS. Real authenticated-client SQL was denied catalog, membership, master-entry and metadata-review writes. Database constraints reject approval of unverified performance-review entries. An unlisted official-release fixture was excluded by the eligible-catalog view. All security fixtures rolled back. TypeScript, lint, 29 tests and 21/21 Expo Doctor checks passed. No Phase 1 screen or native Liquid Glass tab code was edited.

- Curated membership is not expanded by MusicBrainz; missing or disagreeing metadata does not delete a candidate.
- Source titles and source credits are retained separately from supplied titles, credits and roles. Source conflicts need review.
- Only matched, compatible recording identities get provider IDs/appearances; uncertain identities remain proposals linked to the same candidate for review, not additional songs.
- List positions are not asserted as official track numbers; only source tracklists provide those.
- MusicBrainz Official status and credits are community metadata, not independent rights or complete vocal-performance proof.
- Targeted indexed appearances may be incomplete or lag edits; actual full track-credit listings and recording-credit fallbacks are labeled separately.
- Artwork references exist only when source metadata confirms Cover Art Archive artwork. Missing Spotify/Apple identifiers and links are not fabricated.
- Source release dates describe verified appearances and are not necessarily the first-ever release date of the underlying song. Supplied project years remain claims until matched.
- Review entries and blocking discrepancies stay excluded from the future eligible-catalog view until reviewed. The recommendation engine itself is not implemented.
- Part 2 features/guests is not supplied or imported; this is not the entire final Drake recommendation catalog.

## Every factual metadata discrepancy / uncertain attachment

Non-blocking discrepancies preserve an eligible master candidate with a verified anchor; they do not silently replace its supplied title, credit or role. Blocking issues keep the candidate ineligible. No semantic analysis is included below.

### 1. Intro — Eligible catalog candidate

UUID: 8b9f0a7e-553e-447e-a9dc-9896701581ce. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: Intro.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake. Source: DJ Smallz (primary), Drake (primary). [Evidence](https://musicbrainz.org/recording/70407848-29ff-44ee-ae0d-2833a1bd3ed0).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [Intro](https://musicbrainz.org/recording/397cc569-f9ef-41f2-bbd3-9cbb048d57c4), Honestly, Nevermind; 36935 ms; ISRC USUG12204899. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/624e6816-a6a5-43df-9ed8-5344dc0e1fb0), Comeback Season; 30000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/e1c9acdb-8e32-437d-840b-d29b0333d3d4), Young & Successful; 35000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/dd59d9a4-a7d6-4cb5-88dc-c91e40daa576), Tha Carter IV; 172000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/aeb3d678-e2ea-4bc4-9929-e78a7890edc5), Soul Movement, Volume 1; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/1ea33c6b-7370-4d2e-8182-ecd460e8b403), Soul Movement, Volume 1; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/052e1d8f-00a3-4b26-acbd-d67399c079e8), Cole World: The Sideline Story; 82000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/2d3fa3e2-a992-4a9f-989a-a0ddfb72de4c), Harder Than Ever; 93000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/7e25cf46-01dc-42d9-bda3-0ee5ff41be78), Championships; 213402 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/db00c3d7-119a-4653-9ae2-34906e988a19), Last Train to Paris; 93693 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/3c081789-5ada-4f57-9d04-3bfb25fab959), Last Train to Paris; 93000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/b1fcad1f-bc65-4afb-aadb-f27909f0f32d), The Inkwell; 181271 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/ff564f09-887c-4f15-8655-dad250f81e5e), Harder Than Ever; 93338 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/0ec96420-dcb3-4c9a-b555-31e4cf0b39de), Pricele$$; 108000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/672f1b30-a2e3-4bb6-b8f8-1ca40b9363ef), Savage Mode II; 70044 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/4b5290c8-822f-4796-8b10-625255057b7e), Love Thy Brother; 38000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/36b71361-4910-4a14-9020-5deb7bb0afef), The Weezy Effects 2; 92000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/f88a4e75-bd64-4c8d-b775-768c40dccb0d), Fórmula, vol. 2; 71000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/0bde26eb-0f3a-4d37-b37f-347b82c3d74d), Das ist der Remix; 102000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/e1c8e321-1b01-4b3f-8eda-968bdb6a525f), Shock Value II; 48853 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/be45ef9e-09c5-40ff-98f2-5ad0be63d4ac), Victory; 153992 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/09a8bfe1-3bd7-4cfd-9dd7-482d0b1f47af), Twitter Music, Vol. 3; 44000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro (Dear America)](https://musicbrainz.org/recording/4c28cd05-15ce-40b7-a8c0-f2575d190f40), Dear America; 67660 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/bbdce017-506f-4d40-aa83-5d4aad11eafb), SAVAGE MODE II; 70044 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/bd4b47d6-6e20-4873-bb64-552f7e6b233f), Victory; 154000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/5a814d02-3c2d-4395-ac40-2e22883f161d), Beam Me Up Scotty; 63791 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 2. Pistol Proof — Held for review

UUID: f0b733d1-2cfb-4c5b-bf58-298a3adfc20f. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: Not verified.

- **No verified title/version match in available metadata** (blocking). 

### 3. Bad Meaning Good — Held for review

UUID: 4ebda06a-c485-4d8a-b244-f263f9482154. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: Not verified.

- **A similar title exists, but the supplied project/version was not verified** (blocking). 
  - [Bad Meaning Good](https://musicbrainz.org/recording/55e4aaeb-b95a-40f6-9d2c-d23180f4a258), Soul Movement, Volume 1; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Bad Meanin' Good](https://musicbrainz.org/recording/1cccc234-3d45-41aa-9ca5-6ee5c199c40e), Room for Improvement; 152000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 4. Room for Improvement — Held for review

UUID: 45036617-f9fb-4608-b80f-2aea734cfc30. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: Not verified.

- **No verified title/version match in available metadata** (blocking). 

### 5. Extra Special — Eligible catalog candidate

UUID: 79f9d597-4791-4ff6-a1ea-4f19122c4ecb. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: Extra Special.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake. Source: DJ Smallz (primary), Drake (primary). [Evidence](https://musicbrainz.org/recording/cc3db582-4c65-451b-af4d-bf311daede9a).

### 6. About Improvement — Held for review

UUID: 7aae1bed-fa52-4ec1-bde7-2c8f32192ac7. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: Not verified.

- **No verified title/version match in available metadata** (blocking). 

### 7. Do What U Do — Eligible catalog candidate

UUID: 395fb953-3aa0-4665-9580-fe3da60449f1. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: Do What You Do.

- **Supplied title differs from source title** (non-blocking). Supplied: Do What U Do. Source: Do What You Do. [Evidence](https://musicbrainz.org/recording/ec8ff37e-9c44-4346-9a2f-aa40a30f9160).
- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake. Source: DJ Smallz (primary), Drake (primary). [Evidence](https://musicbrainz.org/recording/ec8ff37e-9c44-4346-9a2f-aa40a30f9160).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [Do What You Do](https://musicbrainz.org/recording/27e39481-b3ae-40a9-896d-0735ada2efcb), Comeback Season; 176000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 8. City Is Mine — Eligible catalog candidate

UUID: 348475e9-6ed2-4569-8d58-dca4bb6a47af. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: City Is Mine.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake. Source: DJ Smallz (primary), Drake (primary). [Evidence](https://musicbrainz.org/recording/91f0e354-9343-4fdf-9a7b-ce0e8bd00856).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [City Is Mine](https://musicbrainz.org/recording/61088b37-1a10-448a-a58b-2a7425f55ea8), Comeback Season; 223000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 9. AM 2 PM — Eligible catalog candidate

UUID: 15ea758a-d1df-4889-9ace-72aaf6469c39. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: A.M. 2 P.M..

- **Supplied title differs from source title** (non-blocking). Supplied: AM 2 PM. Source: A.M. 2 P.M.. [Evidence](https://musicbrainz.org/recording/ea35e584-da54-4e81-a463-c60de54c29e4).
- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake feat. Nickelus F. Source: DJ Smallz (primary), Drake (primary), Nickelus F (featured). [Evidence](https://musicbrainz.org/recording/ea35e584-da54-4e81-a463-c60de54c29e4).

### 10. Video Girl — Eligible catalog candidate

UUID: 8b61e6e9-1406-460d-8a87-38292de96136. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: Video Girl.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake. Source: DJ Smallz (primary), Drake (primary), Sean G (featured). [Evidence](https://musicbrainz.org/recording/9f440db8-b367-4fa1-8874-cbec8cfdb11d).

### 11. Come Winter — Eligible catalog candidate

UUID: 13d1ac3a-099c-4629-a53d-7f6244061bab. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: Come Winter.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake. Source: DJ Smallz (primary), Drake (primary). [Evidence](https://musicbrainz.org/recording/6b589940-aa46-4cea-aecd-2a7fca21adeb).

### 12. Extra Special — Held for review

UUID: ff7ea6a2-bc37-409b-87f7-23bef4461fcf. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: Not verified.

- **No verified title/version match in available metadata** (blocking). 
  - [Extra Special](https://musicbrainz.org/recording/cc3db582-4c65-451b-af4d-bf311daede9a), Room for Improvement; 178000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 13. A Scorpio's Mind — Eligible catalog candidate

UUID: 15b1fdf1-dad1-4ba1-afbf-a0027e83ae73. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: A Scorpio's Mind.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake feat. Nickelus F. Source: DJ Smallz (primary), Drake (primary), Nickelus F (featured). [Evidence](https://musicbrainz.org/recording/49962263-e2ae-445b-b303-5f280ce00382).

### 14. S.C.A.R. — Held for review

UUID: 76cde421-491c-4f7f-94cc-ad829cfb20fa. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: Not verified.

- **No verified title/version match in available metadata** (blocking). 

### 15. All This Love — Eligible catalog candidate

UUID: 090d6075-d257-49bf-8f3c-899703544aba. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: All This Love.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake feat. Voyce. Source: DJ Smallz (primary), Drake (primary), Voyce (featured). [Evidence](https://musicbrainz.org/recording/ef58604c-8011-4173-b338-35b144e95552).

### 16. Outro — Held for review

UUID: 948ae8a8-56a9-4785-9eca-daa250ec4037. Supplied role(s): Lead. Project(s): ROOM FOR IMPROVEMENT (2006). Source title: Not verified.

- **A similar title exists, but the supplied project/version was not verified** (blocking). 
  - [Outro](https://musicbrainz.org/recording/d3615d3c-0a8a-45ab-ab0f-b266a91e356c), So Far Gone; 174398 ms; ISRC USCM51900151. This is a proposal, not an automatic new canonical song.
  - [Outro](https://musicbrainz.org/recording/58f82a8a-9cc1-4d3c-b999-958d31f2722d), So Far Gone; 174398 ms; ISRC USCM51900184. This is a proposal, not an automatic new canonical song.
  - [U.P.A. Outro](https://musicbrainz.org/recording/31d884d0-dc9e-43e0-966d-3e4c23b77a12), Room for Improvement; 134000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 17. Intro — Eligible catalog candidate

UUID: 2e07e986-060c-4081-bd93-9d7f2a5d2b31. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Intro.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Intro](https://musicbrainz.org/recording/397cc569-f9ef-41f2-bbd3-9cbb048d57c4), Honestly, Nevermind; 36935 ms; ISRC USUG12204899. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/e1c9acdb-8e32-437d-840b-d29b0333d3d4), Young & Successful; 35000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/dd59d9a4-a7d6-4cb5-88dc-c91e40daa576), Tha Carter IV; 172000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/aeb3d678-e2ea-4bc4-9929-e78a7890edc5), Soul Movement, Volume 1; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/1ea33c6b-7370-4d2e-8182-ecd460e8b403), Soul Movement, Volume 1; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/70407848-29ff-44ee-ae0d-2833a1bd3ed0), Room for Improvement; 52000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/052e1d8f-00a3-4b26-acbd-d67399c079e8), Cole World: The Sideline Story; 82000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/2d3fa3e2-a992-4a9f-989a-a0ddfb72de4c), Harder Than Ever; 93000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/7e25cf46-01dc-42d9-bda3-0ee5ff41be78), Championships; 213402 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/db00c3d7-119a-4653-9ae2-34906e988a19), Last Train to Paris; 93693 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/3c081789-5ada-4f57-9d04-3bfb25fab959), Last Train to Paris; 93000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/b1fcad1f-bc65-4afb-aadb-f27909f0f32d), The Inkwell; 181271 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/ff564f09-887c-4f15-8655-dad250f81e5e), Harder Than Ever; 93338 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/0ec96420-dcb3-4c9a-b555-31e4cf0b39de), Pricele$$; 108000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/672f1b30-a2e3-4bb6-b8f8-1ca40b9363ef), Savage Mode II; 70044 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/4b5290c8-822f-4796-8b10-625255057b7e), Love Thy Brother; 38000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/36b71361-4910-4a14-9020-5deb7bb0afef), The Weezy Effects 2; 92000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/f88a4e75-bd64-4c8d-b775-768c40dccb0d), Fórmula, vol. 2; 71000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/0bde26eb-0f3a-4d37-b37f-347b82c3d74d), Das ist der Remix; 102000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/e1c8e321-1b01-4b3f-8eda-968bdb6a525f), Shock Value II; 48853 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/be45ef9e-09c5-40ff-98f2-5ad0be63d4ac), Victory; 153992 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/09a8bfe1-3bd7-4cfd-9dd7-482d0b1f47af), Twitter Music, Vol. 3; 44000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro (Dear America)](https://musicbrainz.org/recording/4c28cd05-15ce-40b7-a8c0-f2575d190f40), Dear America; 67660 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/bbdce017-506f-4d40-aa83-5d4aad11eafb), SAVAGE MODE II; 70044 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/bd4b47d6-6e20-4873-bb64-552f7e6b233f), Victory; 154000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/5a814d02-3c2d-4395-ac40-2e22883f161d), Beam Me Up Scotty; 63791 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 18. Closer — Eligible catalog candidate

UUID: a72e04a0-d186-4f84-9a10-0c8fbe45177a. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Closer.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Closer](https://musicbrainz.org/recording/34bb4161-8c39-4fad-8a75-32733b1bb732), Anthems: R&B; 235000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Closer (bonus track)](https://musicbrainz.org/recording/02b65b9e-c2f9-498c-873f-212b2a81a2b8), Stronger With Each Tear; 250467 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 19. Replacement Girl — Eligible catalog candidate

UUID: 30d8b883-7b0f-420c-8b73-58bfe0b32604. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Replacement Girl.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Replacement Girl](https://musicbrainz.org/recording/08953f85-a753-4f3f-9d6c-1dd9d89cd4ac), Heartbreak Drake; 216000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 20. Barry Bonds — Eligible catalog candidate

UUID: 3e6442ae-5c48-415a-9dae-36a87e2bc8d7. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Barry Bonds Freestyle.

- **Supplied title differs from source title** (non-blocking). Supplied: Barry Bonds. Source: Barry Bonds Freestyle. [Evidence](https://musicbrainz.org/recording/48d76c83-4f54-4abf-b1a1-85bb708b7b01).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [Barry Bonds Freestyle](https://musicbrainz.org/recording/117422d2-cacd-4764-92a7-ce513d27e69f), CASH Is KING; 95622 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 21. Where to Aim — Held for review

UUID: ffaa8140-1d68-4232-958e-140f0b795b13. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Not verified.

- **No verified title/version match in available metadata** (blocking). 
  - [Where to Now](https://musicbrainz.org/recording/883fc38e-8472-49af-84b1-6f706b665199), Comeback Season; 114000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 22. Share — Eligible catalog candidate

UUID: 9913ab5d-04b4-4f52-831f-28f1670d8a9b. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Share.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Share](https://musicbrainz.org/recording/ce28955c-93ad-4105-aed2-eacf896bb9c5), Soul Movement, Volume 1; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Share (album version)](https://musicbrainz.org/recording/4c61f235-1e97-4ab5-8b9c-267e1615db5e), R&B Anthems: The Ultimate Collection; 106680 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 23. Don't U Have a Man — Eligible catalog candidate

UUID: 200d37ab-2bb7-4f9d-b31a-59005bc39e63. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Don't You Have a Man.

- **Supplied title differs from source title** (non-blocking). Supplied: Don't U Have a Man. Source: Don't You Have a Man. [Evidence](https://musicbrainz.org/recording/bc38ebb5-9eec-4580-b8c1-0acb467c8fa4).
- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake feat. Dwele. Source: Drake (primary), Little Brother (featured), Dwele (featured). [Evidence](https://musicbrainz.org/recording/bc38ebb5-9eec-4580-b8c1-0acb467c8fa4).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [Don't U Have a Man?](https://musicbrainz.org/recording/554ea2cc-4d19-41ff-aac5-7328b15dbda5), Odd Summer Vol. 3; 159000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 24. The Question — Held for review

UUID: 0e18ad45-f93d-4e77-9936-c673ca65820f. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Not verified.

- **No verified title/version match in available metadata** (blocking). 

### 25. Fading — Held for review

UUID: 660fcf29-223b-42f7-96bd-456df4fd8dcd. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Not verified.

- **A similar title exists, but the supplied project/version was not verified** (blocking). 
  - [Fading](https://musicbrainz.org/recording/cb443721-e0ff-4230-9678-01de7ecffa8b), Loud; 199666 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 26. Must Hate Skits — Held for review

UUID: 5f4cb719-b5df-477e-9002-916e7ff812d2. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Not verified.

- **No verified title/version match in available metadata** (blocking). 

### 27. Do What U Do — Held for review

UUID: 6bb1625c-e6d4-40c2-a8ec-e45a2a6372ec. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Not verified.

- **A similar title exists, but the supplied project/version was not verified** (blocking). 
  - [Do What You Do (remix)](https://musicbrainz.org/recording/dbea9bc7-8235-4e11-9695-11aec8a8826d), We Got the Remix; 70000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Do What You Do](https://musicbrainz.org/recording/27e39481-b3ae-40a9-896d-0735ada2efcb), Comeback Season; 176000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 28. Easy to Please — Eligible catalog candidate

UUID: a964448d-ec57-4938-8425-82fdb5b4f86a. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Easy to Please.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake feat. Richie Sena. Source: Drake (primary), Richie Sosa (featured). [Evidence](https://musicbrainz.org/recording/19840149-b941-4bf4-8ba7-9e0158806b45).

### 29. Think Good Thoughts — Eligible catalog candidate

UUID: 9c40a01c-a505-4614-a05f-25143d8a5e8a. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Think Good Thoughts.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake feat. Phonte & Elzhi. Source: Drake (primary). [Evidence](https://musicbrainz.org/recording/49283130-9e0f-4b90-9f32-4e74d6569b03).

### 30. Teach U a Lesson — Eligible catalog candidate

UUID: 62870bfe-1578-43b5-a4ea-46ea9fe63bdd. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Teach U a Lesson.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Teach U a Lesson](https://musicbrainz.org/recording/99a97d69-e9ca-4ffd-aeac-8a2866c9412f), Heartbreak Drake; 74000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 31. Missin' You — Held for review

UUID: 2cb5247b-9768-4779-9ac8-c18bc092dcfa. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Not verified.

- **No verified title/version match in available metadata** (blocking). 
  - [Missing You (remix)](https://musicbrainz.org/recording/778829da-e887-4b83-a17a-4a7da2eb04cd), Comeback Season; 315000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 32. Man of the Year — Eligible catalog candidate

UUID: 075e132b-c0e2-42aa-9482-17f1e71d2f79. Supplied role(s): Lead. Project(s): COMEBACK SEASON (2007). Source title: Man of the Year.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Man of the Year](https://musicbrainz.org/recording/eaa576cd-89f6-4d46-bbf1-042c62ef69c0), Heartbreak Drake; 232000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 33. Successful — Eligible catalog candidate

UUID: a5918652-14d9-4bce-996d-1d587a128f36. Supplied role(s): Lead. Project(s): SO FAR GONE (2009). Source title: Successful.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Successful](https://musicbrainz.org/recording/1e35e16f-2975-4f23-86f3-a9ed66c143a5), So Far Gone; 351720 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Successful](https://musicbrainz.org/recording/3778f11d-b269-4ca1-b612-b0d856b48bf2), Thank Me Later; 351000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Successful](https://musicbrainz.org/recording/b2ee6542-a835-4d9e-8429-ac3f68dc81d8), Ready; 266000 ms; ISRC USAT20902618. This is a proposal, not an automatic new canonical song.
  - [Successful](https://musicbrainz.org/recording/cfe756a2-13f9-43bf-914a-821c820d874f), Ready; 266000 ms; ISRC USAT22211816. This is a proposal, not an automatic new canonical song.

### 34. Best I Ever Had — Eligible catalog candidate

UUID: de349773-7bb5-40c7-b030-072ed6fb3b2e. Supplied role(s): Lead. Project(s): SO FAR GONE (2009). Source title: Best I Ever Had.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Best I Ever Had](https://musicbrainz.org/recording/7d1aca00-bce1-4eda-b1a9-032079b1aad4), Throwback R&B; 257690 ms; ISRC USCM51900178. This is a proposal, not an automatic new canonical song.
  - [Best I Ever Had](https://musicbrainz.org/recording/9ca21b6d-60cf-41fd-8cf2-49b0404f2224), Rnb Superclub, Volume 10; 252000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Best I Ever Had](https://musicbrainz.org/recording/c1a00fbf-cde8-407b-8d1d-5719ff1d984e), Beam Me Up Scotty; 325760 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 35. Uptown — Eligible catalog candidate

UUID: 136f79e1-ff2f-43a8-bde2-d0d47cf32c88. Supplied role(s): Lead. Project(s): SO FAR GONE (2009). Source title: Uptown.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Uptown](https://musicbrainz.org/recording/3fc91e8a-fc6f-4cd3-bbb6-855a41151ed3), Thank Me Later; 382000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 36. I'm Goin' In — Eligible catalog candidate

UUID: ca0ad5c5-b5b6-4c9c-8926-5d1819a8552b. Supplied role(s): Lead. Project(s): SO FAR GONE (2009). Source title: I’m Goin’ In.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [I'm Goin' In](https://musicbrainz.org/recording/ee161555-a02e-46f2-ac12-e85bc6fe1f9c), Trappin' Aint Dead; 203000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 37. Brand New — Eligible catalog candidate

UUID: 29ad1965-5b9f-4841-8400-f2d2f1ea0b0e. Supplied role(s): Lead. Project(s): SO FAR GONE (2009). Source title: Brand New.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Brand New](https://musicbrainz.org/recording/bdd59055-daf4-4df9-8238-62d182574636), Heartbreak Drake; 156000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Brand New](https://musicbrainz.org/recording/eb3e4340-8d5c-4670-8cf1-79854ce24c57), Ready; 222000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 38. So So Fresh — Held for review

UUID: 97571702-5150-448f-8e81-24efbab4d91a. Supplied role(s): Lead. Project(s): SO FAR GONE (2009). Source title: Not verified.

- **No verified title/version match in available metadata** (blocking). 

### 39. A Night Off — Eligible catalog candidate

UUID: 93376653-b196-4568-afa8-65373989c76d. Supplied role(s): Lead. Project(s): SO FAR GONE (2009). Source title: A Night Off.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [A Night Off](https://musicbrainz.org/recording/8e9153f0-4271-433a-8001-34781188d224), Lloyd & Friends; 193000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [A Night Off](https://musicbrainz.org/recording/8078ee7a-6e65-445f-8793-cd1f5b7f889a), Like Me: The Young Goldie EP; 194000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 40. Say What's Real — Eligible catalog candidate

UUID: 8447710d-7623-4ade-8185-fd391370a37f. Supplied role(s): Lead. Project(s): SO FAR GONE (2009). Source title: Say What’s Real.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Say What's Real](https://musicbrainz.org/recording/04365cf0-5afb-4c77-b821-b3d5b0a8edff), Heartbreak Drake; 205000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Say What's Real](https://musicbrainz.org/recording/c44b37a6-282b-4397-beb1-826c91b7f03e), Young & Successful; 154000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 41. BedRock — Eligible catalog candidate

UUID: cf58caf7-f436-48eb-a57b-7c27645ca648. Supplied role(s): Group / Joint. Project(s): WE ARE YOUNG MONEY — DRAKE PERFORMANCES (2009). Source title: BedRock.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Young Money feat. Lloyd. Source: Lil Wayne (primary), Gudda Gudda (primary), Nicki Minaj (primary), Drake (primary), Tyga (primary), Jae Millz (primary), Lloyd (featured). [Evidence](https://musicbrainz.org/recording/18fb72d5-6d29-4eb6-85ae-5fe213e03c8c).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [Bedrock](https://musicbrainz.org/recording/18e20614-b5d9-4a61-956a-7e4f90c38e8e), Guddaville; 274000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Bed Rock](https://musicbrainz.org/recording/707f743e-fc63-439d-a72d-aa7ec082f742), R&B in the Mix 2010; 195000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [BedRock](https://musicbrainz.org/recording/7ad6a8c6-a6ad-444f-8dc9-e32ad071971e), Weekend Anthems; 289253 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 42. Every Girl — Eligible catalog candidate

UUID: 97557118-0158-4da0-a46e-17ea71a7580a. Supplied role(s): Group / Joint. Project(s): WE ARE YOUNG MONEY — DRAKE PERFORMANCES (2009). Source title: Every Girl.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Young Money. Source: Lil Wayne (primary), Drake (primary), Jae Millz (primary), Gudda Gudda (primary), Mack Maine (primary). [Evidence](https://musicbrainz.org/recording/d932d38b-5f3b-487f-b311-cfb518b95e07).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [Every Girl](https://musicbrainz.org/recording/5ca28d7e-6384-4d04-9241-8278e20569a2), Young Money Millionaire 5; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Every Girl](https://musicbrainz.org/recording/b8f4ad90-b23c-45fb-8d9f-349be0b50e3e), The Weezy Effects 2; 286000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 43. Pass the Dutch — Eligible catalog candidate

UUID: 1d9d3b56-6ea8-40e2-b2e0-bb304c04c75d. Supplied role(s): Group / Joint. Project(s): WE ARE YOUNG MONEY — DRAKE PERFORMANCES (2009). Source title: Pass the Dutch.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Young Money feat. Short Dawg. Source: Lil Wayne (primary), Gudda Gudda (primary), Drake (primary), Short Dawg (featured). [Evidence](https://musicbrainz.org/recording/63f21ad8-ba6b-45a2-b069-dbd8b4fc8bef).

### 44. Fuck da Bullshit — Eligible catalog candidate

UUID: 8d2b6871-0fa8-484c-a2a2-12af8ed0ec5d. Supplied role(s): Group / Joint. Project(s): WE ARE YOUNG MONEY — DRAKE PERFORMANCES (2009). Source title: Fuck da Bullshit.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Young Money feat. Birdman. Source: Nicki Minaj (primary), Gudda Gudda (primary), Lil Wayne (primary), Drake (primary), Birdman (featured). [Evidence](https://musicbrainz.org/recording/eaa0cf71-c719-4962-89c7-cd17d20b6852).

### 45. Over — Eligible catalog candidate

UUID: ba5afb48-8f35-446a-9e57-820340b6d86a. Supplied role(s): Lead. Project(s): THANK ME LATER (2010). Source title: Over.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Over (Explicit)](https://musicbrainz.org/recording/0eec5586-50f5-4b17-bb0a-bde99474cd26), Hits May 10; 232813 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Over](https://musicbrainz.org/recording/efe491dc-0779-4c39-b61e-5f2b351283e6), LOFI PAPI; 117424 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Over](https://musicbrainz.org/recording/13ead4b9-3bf5-4b08-b778-3b45470cf006), NBA2K11; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 46. Fancy — Eligible catalog candidate

UUID: ae39acf0-7302-4b65-935b-539139971cd3. Supplied role(s): Lead. Project(s): THANK ME LATER (2010). Source title: Fancy.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Fancy](https://musicbrainz.org/recording/2c42ca62-5713-4130-b47d-1ee672098b2e), Now That’s What I Call Club Hits 2014; 199000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Fancy](https://musicbrainz.org/recording/cf965b8c-bb5c-4047-be05-c31f895fdf4b), R&B The Collection Summer 2011; 319000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 47. Unforgettable — Eligible catalog candidate

UUID: bd98fb21-c453-4e86-9394-42d3f0fcab8d. Supplied role(s): Lead. Project(s): THANK ME LATER (2010). Source title: Unforgettable.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake feat. Young Jeezy. Source: Drake (primary), Jeezy (featured). [Evidence](https://musicbrainz.org/recording/32d23efe-3256-4973-8221-ef47b5c38013).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [Unforgettable](https://musicbrainz.org/recording/33aac383-5a3e-4622-b433-4efdd2c8bf74), All White Everything (B.M.F. Edition); 188000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 48. Light Up — Eligible catalog candidate

UUID: b7656122-a880-4d47-9c31-5a4b9a70af1f. Supplied role(s): Lead. Project(s): THANK ME LATER (2010). Source title: Light Up.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Light Up](https://musicbrainz.org/recording/6bce059c-b4c2-49d0-bdf2-4727c349ec2b), Can't Ban Tha Truth (S.L.A.B.-ed by Pollie Pop); 391000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Light Up](https://musicbrainz.org/recording/3ccc60b7-97b5-4c3f-a95b-d6bf93edc6df), No More Thank Yous; 274000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Light Up](https://musicbrainz.org/recording/71a3bc23-83b2-493c-a9bf-364f137c4b83), Award Tour: The 2011 Grammy Remix; 215000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 49. Miss Me — Eligible catalog candidate

UUID: 9547fbee-1f3f-468a-bc0d-a55849ee8b2c. Supplied role(s): Lead. Project(s): THANK ME LATER (2010). Source title: Miss Me.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Miss Me](https://musicbrainz.org/recording/57b12380-6eea-48c6-bce5-a63ddd6df91f), No More Thank Yous; 306000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Miss Me](https://musicbrainz.org/recording/610d030c-9bf1-4f9e-8659-04c6f68b30cb), R&B Collection; 201280 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 50. Find Your Love — Eligible catalog candidate

UUID: c3986701-714e-4eb5-80f1-ef45ff080789. Supplied role(s): Lead. Project(s): THANK ME LATER (2010). Source title: Find Your Love.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Find Your Love](https://musicbrainz.org/recording/25ae59b4-f8be-4b0b-a003-939bb599e5b0), Best of Black '10; 208160 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Find Your Love](https://musicbrainz.org/recording/28bd3b7f-7bc0-452e-9c87-b67e3744a7a0), Find Your Love; 209000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Find Your Love](https://musicbrainz.org/recording/3493b354-90f7-45d6-bb35-76ceffd45975), Essential Hits 64; 204000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Find Your Love](https://musicbrainz.org/recording/37623042-3b26-4b8a-a700-56b45c5b8bb8), R&B in the Mix 2010; 205173 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Find Your Love](https://musicbrainz.org/recording/87704405-6b8a-4122-82d0-06d7aa041429), NOW 16; 209106 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Find Your Love](https://musicbrainz.org/recording/fd32d01a-40be-4771-b0a5-1e031089af53), R&B Lovesongs 2011; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Find Your Love (album version)](https://musicbrainz.org/recording/99654d26-0a3e-495e-870e-a62235f83485), Anthems: R&B; 202386 ms; ISRC USCM51200014. This is a proposal, not an automatic new canonical song.
  - [Find Your Love](https://musicbrainz.org/recording/c467d7a5-2108-4f59-9a27-ab8d6ca4340a), Bravo Black Hits, Vol. 23; 209000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Find Your Love](https://musicbrainz.org/recording/c6dadefd-4fa0-437a-9da6-6995f11a6842), Crave, Volume 5; 206000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Find Your Love](https://musicbrainz.org/recording/df0dcde1-6515-4024-a18c-5c6fb394df6b), Best of Black Summer Party Vol. 8; 208946 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Find Your Love](https://musicbrainz.org/recording/dc373202-0f15-40dd-bfc8-662e2ff755e9), Hits July 10; 206226 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 51. 9AM in Dallas — Eligible catalog candidate

UUID: f39df696-e355-4feb-83ea-53a432ab60e7. Supplied role(s): Lead. Project(s): THANK ME LATER (2010). Source title: 9AM in Dallas.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [9AM in Dallas](https://musicbrainz.org/recording/23d8bc4d-b33d-4e7b-90e0-73a771fb790f), Lost Tracks; 167601 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 52. Headlines — Eligible catalog candidate

UUID: 6effb45f-d46b-40af-b90b-228ec525485c. Supplied role(s): Lead. Project(s): TAKE CARE (2011). Source title: Headlines.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Headlines](https://musicbrainz.org/recording/09da4d70-a268-4481-abae-a73b576248b0), Once Upon a Time in 2011; 235000 ms; ISRC FR0Z50036512. This is a proposal, not an automatic new canonical song.
  - [Headlines](https://musicbrainz.org/recording/a9dbaf4c-ea48-48c7-bbe3-c3657d4f3e01), Take Care; 206306 ms; ISRC USCM51100591. This is a proposal, not an automatic new canonical song.
  - [Headlines](https://musicbrainz.org/recording/e113fc43-f1b0-4288-9990-182d8cf3f534), Anthems Hip-Hop II; 206093 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Headlines](https://musicbrainz.org/recording/53e58043-b6aa-4dd5-b103-3e69f102efac), Headlines; 214746 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Headlines](https://musicbrainz.org/recording/b8fa8a10-bb53-49d2-b38d-756098446561), R&B Collection 2012; 236280 ms; ISRC USCM51100289. This is a proposal, not an automatic new canonical song.
  - [Headlines](https://musicbrainz.org/recording/e501febf-2b62-44b6-a7f0-ceed7a65670c), Juno Awards 2012; 236720 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 53. Crew Love — Eligible catalog candidate

UUID: e554ae20-6750-498c-b405-472d5a08e137. Supplied role(s): Lead. Project(s): TAKE CARE (2011). Source title: Crew Love.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Crew Love](https://musicbrainz.org/recording/dc1f32d1-f427-4117-8d75-8007ef45d32b), Once Upon a Time in 2012; 208000 ms; ISRC FR0Z50037090. This is a proposal, not an automatic new canonical song.
  - [Crew Love](https://musicbrainz.org/recording/c1fa871b-914f-4c12-8e52-517eeeb24321), Leaking Thoughts da Pre-Mixtape; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 54. Take Care — Eligible catalog candidate

UUID: af9b20b9-502d-4f01-9e81-c7346a25312a. Supplied role(s): Lead. Project(s): TAKE CARE (2011). Source title: Take Care.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Take Care](https://musicbrainz.org/recording/21e17580-5928-4b74-a6ce-251ad1ad3480), Heart & Soul; 280000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Take Care](https://musicbrainz.org/recording/6e6d5c1e-f295-4a6b-a83c-100076bf3443), Twerk It; 277546 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Take Care](https://musicbrainz.org/recording/b260786c-457f-41ce-82ff-4e63b81cbf11), Striscia la compilation 2012; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Take Care](https://musicbrainz.org/recording/c70ed9c3-ebe6-400f-87e2-33ebcbf1fd91), Now That’s What I Call Music! 81; 277373 ms; ISRC USCM51100552. This is a proposal, not an automatic new canonical song.
  - [Take Care](https://musicbrainz.org/recording/d4299f26-8ea1-4bc1-8348-f0a105cfa4ef), So Fresh: The Hits of Autumn 2012; 277000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Take Care](https://musicbrainz.org/recording/d39f9772-8516-4149-8505-37320b57cade), Just the Hits Vol. 4; 278465 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 55. Marvins Room — Eligible catalog candidate

UUID: d5e1f3c8-9957-4b22-b30a-644793eefdbf. Supplied role(s): Lead. Project(s): TAKE CARE (2011). Source title: Marvins Room.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Marvins Room](https://musicbrainz.org/recording/522a5641-99e3-48ba-8255-27378aab2959), Marvins Room; 287000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Marvin’s Room](https://musicbrainz.org/recording/be31cb6b-ea6d-428f-b9c4-f979a87f93e1), Ultimate R&B: Love 2012; 344373 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 56. Buried Alive Interlude — Held for review

UUID: c220ba06-8885-456c-a85a-7c0f84af26b5. Supplied role(s): Review. Project(s): TAKE CARE (2011). Source title: Buried Alive Interlude.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake album track / Kendrick Lamar performance. Source: Drake (primary), Kendrick Lamar (featured). [Evidence](https://musicbrainz.org/recording/24bda462-c32c-434a-9170-908a65b4c7ac).
- **Explicit Review role: Drake performance must be verified** (blocking). 

### 57. Doing It Wrong — Eligible catalog candidate

UUID: 7f325f9d-a482-423a-9065-493a324e0815. Supplied role(s): Lead. Project(s): TAKE CARE (2011). Source title: Doing It Wrong.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake. Source: Drake (primary), Stevie Wonder (featured). [Evidence](https://musicbrainz.org/recording/1b8f69c3-584b-4f60-8bf4-69c5f6427ecf).

### 58. HYFR (Hell Ya Fucking Right) — Eligible catalog candidate

UUID: 8ce1bbdf-049d-4d5f-9f88-2f290f6c8637. Supplied role(s): Lead. Project(s): TAKE CARE (2011). Source title: HYFR (Hell Ya Fuckin’ Right).

- **Supplied title differs from source title** (non-blocking). Supplied: HYFR (Hell Ya Fucking Right). Source: HYFR (Hell Ya Fuckin’ Right). [Evidence](https://musicbrainz.org/recording/de5cfcd1-6001-4b5f-80e4-1f57605cebd1).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [HYFR (Hell Ya Fucking Right)](https://musicbrainz.org/recording/2a5ef9dd-1348-4f4f-9a54-f36bd2fc0f67), HYFR (Hell Ya Fucking Right); 231000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 59. The Motto — Eligible catalog candidate

UUID: b550b766-73e8-4ae3-9c78-63a4c85c49a7. Supplied role(s): Lead. Project(s): TAKE CARE (2011). Source title: The Motto.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [The Motto](https://musicbrainz.org/recording/561b13c3-1b07-415f-8ad9-665c9edddad9), #BitchImTheShit; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [The Motto](https://musicbrainz.org/recording/ce7465ed-1a13-449d-8501-99e151bc6407), Feel Good Friday; 164818 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 60. Started from the Bottom — Eligible catalog candidate

UUID: ebb64857-503a-428c-b40c-2704fdb47c37. Supplied role(s): Lead. Project(s): NOTHING WAS THE SAME (2013). Source title: Started From the Bottom.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Started from the Bottom](https://musicbrainz.org/recording/2b5a1e7e-d708-47ca-99bc-213d8b380d8b), The England Players' Playlist: The Road to Brazil; 174000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Started From the Bottom](https://musicbrainz.org/recording/3139c0e3-9bb8-41a3-b005-bfd0be107852), 5 AM in Toronto; 221000 ms; ISRC FR6V81679098. This is a proposal, not an automatic new canonical song.
  - [Started From the Bottom](https://musicbrainz.org/recording/2a05a47f-6bbb-424e-bb0b-b4325bfa57d2), Leijonat 2014; 174147 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Started From the Bottom](https://musicbrainz.org/recording/4636fc00-b9f5-4c23-98f4-11b3ac17f223), Rich Gang Allstars; 180000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Started From the Bottom](https://musicbrainz.org/recording/623601e9-20d4-4a45-89e8-4f3a3731b7c8), Anthems: Hip-Hop IV; 173200 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Started From the Bottom](https://musicbrainz.org/recording/ae3015bc-c5f5-434a-94d3-0ff3c2ceaece), Ministry of Sound: Anthems: Hip-Hop III; 171626 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Started From the Bottom](https://musicbrainz.org/recording/bdbc68e0-9bad-416e-b935-c7c6d42c0dcc), Ministry of Sound: Rappers Delight; 169853 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 61. From Time — Eligible catalog candidate

UUID: a34a5b1f-ee2b-4a9a-a144-983c623b4d7d. Supplied role(s): Lead. Project(s): NOTHING WAS THE SAME (2013). Source title: From Time.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [From Time](https://musicbrainz.org/recording/42838276-df49-4b5d-ba09-7c1f6d658bff), Radio RAM & Magic Records Present RAM Café 9; 318453 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 62. Hold On, We're Going Home — Eligible catalog candidate

UUID: 1e89dc87-89b6-4705-aa60-ef9fac21eadd. Supplied role(s): Lead. Project(s): NOTHING WAS THE SAME (2013). Source title: Hold On, We’re Going Home.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Hold on We’re Going Home](https://musicbrainz.org/recording/092ff03f-2254-4be3-8ddb-b3278694d94f), Promo Only: Mainstream Radio, September 2013; 223451 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Hold On, We're Going Home (Album Version)](https://musicbrainz.org/recording/3a3db9d2-3f62-43ec-a994-7cab30256d7b), Don’t Worry Be Happy; 233000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Hold On, We’re Going Home](https://musicbrainz.org/recording/38af714c-6ae7-4df9-bb59-956da82f8c9a), Radio 538: Hitzone 68; 224000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Hold On, We’re Going Home](https://musicbrainz.org/recording/427a889e-f5a1-4cd8-86f9-ad239dbb3d75), Hits 2014: 20 Massive Chart Hits!; 228293 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Hold On, We’re Going Home](https://musicbrainz.org/recording/ab5f2bb2-2d89-433b-bbf0-feb689cd94e2), RnB Fridays; 228000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Hold On, We’re Going Home](https://musicbrainz.org/recording/ac12b76e-9fe9-476f-b240-9836198960d9), Now That’s What I Call Club Hits; 221000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Hold On, We’re Going Home](https://musicbrainz.org/recording/bcf9768d-6dd0-4aba-a83e-4f2bc2a94e7c), Energy NRJ: Hit Music Only! Best of 2014, Vol. 1; 228000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Hold On, We're Going Home](https://musicbrainz.org/recording/ccf45a07-c649-49b7-877a-34a975b5d7e6), Black Winter Party (Best Of - 2014); unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 63. Come Thru — Eligible catalog candidate

UUID: 756304f7-8a22-4bf6-9d24-5219e05e7154. Supplied role(s): Lead. Project(s): NOTHING WAS THE SAME (2013). Source title: Come Thru.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Come Thru](https://musicbrainz.org/recording/83f61277-ed51-41d1-98e9-8dfb98cf9dd7), Over It; 181013 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Come Thru](https://musicbrainz.org/recording/99e549be-7e4b-46a7-9345-c3c1f247ddd6), Edgewood; 201717 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 64. All Me — Eligible catalog candidate

UUID: 39e3d5eb-03e0-4aa5-81da-d90b8b6c698d. Supplied role(s): Lead. Project(s): NOTHING WAS THE SAME (2013). Source title: All Me.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [All Me](https://musicbrainz.org/recording/bd5edfe6-3bde-49c1-8eba-03a80c65ab67), Nothing Was the Same; 268253 ms; ISRC USCM51300759. This is a proposal, not an automatic new canonical song.
  - [All Me](https://musicbrainz.org/recording/97d97816-4ce9-4458-a7d8-aa3d333803f9), All Me; 331000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 65. Energy — Eligible catalog candidate

UUID: 78f18bf4-bc5d-4c01-a516-3027407f6b60. Supplied role(s): Lead. Project(s): IF YOU'RE READING THIS IT'S TOO LATE (2015). Source title: Energy.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Energy](https://musicbrainz.org/recording/96a01ff7-f562-49a4-9f44-241b73a624c4), R&B Collection; 210000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Energy](https://musicbrainz.org/recording/cf65744a-566f-4ec5-af59-cbe9c1f1b54a), R&B Lovesongs 2010; 208867 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Energy](https://musicbrainz.org/recording/7b83979f-74d1-4111-9b3c-03b0e397925e), Weekend Anthems; 210000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 66. Madonna — Eligible catalog candidate

UUID: bd4c3a41-ab72-408f-8f4a-e545543c0762. Supplied role(s): Lead. Project(s): IF YOU'RE READING THIS IT'S TOO LATE (2015). Source title: Madonna.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Madonna](https://musicbrainz.org/recording/5c6fa5fa-04e5-4ac5-b36a-d76300e610f8), If You’re Reading This It’s Too Late; 177837 ms; ISRC USCM51500020. This is a proposal, not an automatic new canonical song.

### 67. Used To — Eligible catalog candidate

UUID: 43383a18-085c-4e5a-866b-abbba45ca691. Supplied role(s): Lead. Project(s): IF YOU'RE READING THIS IT'S TOO LATE (2015). Source title: Used To.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Used To](https://musicbrainz.org/recording/2eec11d7-301f-414f-ab76-9c67b221b3f4), Sorry 4 the Wait 2; 262922 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Used To](https://musicbrainz.org/recording/de7b4a04-feef-416c-8ccc-9f63d8ffd15b), Sorry 4 the Wait 2; 272000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 68. Company — Eligible catalog candidate

UUID: 979b7128-98a9-469e-926c-1a5e169fe373. Supplied role(s): Lead. Project(s): IF YOU'RE READING THIS IT'S TOO LATE (2015). Source title: Company.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Company](https://musicbrainz.org/recording/23b798ad-635e-45c9-9667-e37a928f494d), Now That’s What I Call Music! 94; 208000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 69. How About Now — Eligible catalog candidate

UUID: 8e27b63e-b087-4894-9401-f8f600504799. Supplied role(s): Lead. Project(s): IF YOU'RE READING THIS IT'S TOO LATE (2015); CARE PACKAGE (2019). Source title: How About Now.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [How About Now](https://musicbrainz.org/recording/1fe6b719-ce3e-4981-837d-fb574a8afb5d), How About Now; 240000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [How Bout Now](https://musicbrainz.org/recording/7c87565f-9fee-4b46-b874-291c9429749f), 6 God; 235566 ms; ISRC USUG11902745. This is a proposal, not an automatic new canonical song.

### 70. My Side — Eligible catalog candidate

UUID: 36a3fb1b-c163-41a0-baa1-5466b9885ab6. Supplied role(s): Lead. Project(s): IF YOU'RE READING THIS IT'S TOO LATE (2015); CARE PACKAGE (2019). Source title: My Side.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [My Side](https://musicbrainz.org/recording/9d7cda0a-0955-4c70-9dfa-3427a579ff74), If You’re Reading This It’s Too Late; 280626 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 71. Digital Dash — Eligible catalog candidate

UUID: aa367037-242c-417a-8206-a5bc5da439df. Supplied role(s): Joint-Primary. Project(s): WHAT A TIME TO BE ALIVE — WITH FUTURE (2015). Source title: Digital Dash.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Digital Dash](https://musicbrainz.org/recording/e9131df4-db79-4f86-aa2f-554eff1268d1), Dr. Pepper; 223000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 72. Change Locations — Eligible catalog candidate

UUID: 1a5e76cc-08b8-48b4-be1a-ff0d7c0022a2. Supplied role(s): Joint-Primary. Project(s): WHAT A TIME TO BE ALIVE — WITH FUTURE (2015). Source title: Change Locations.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Change Locations](https://musicbrainz.org/recording/80fc3822-3ab4-48be-9d1f-376e01434347), Dr. Pepper; 190000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 73. Keep the Family Close — Eligible catalog candidate

UUID: a5239f0a-6947-4796-8b68-dbeeb556ae82. Supplied role(s): Lead. Project(s): VIEWS (2016). Source title: Keep the Family Close.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Keep the Family Close](https://musicbrainz.org/recording/63364c7d-f362-432c-aa2a-33fef7907fc5), Views; 329000 ms; ISRC USCM51600062. This is a proposal, not an automatic new canonical song.

### 74. 9 — Eligible catalog candidate

UUID: 56f8b1ce-8417-4a6c-9a55-64520218cbcd. Supplied role(s): Lead. Project(s): VIEWS (2016). Source title: 9.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [9](https://musicbrainz.org/recording/dee038a9-9f1a-4d9d-b882-7521cff9b1ca), Views; 256000 ms; ISRC USCM51600064. This is a proposal, not an automatic new canonical song.
  - [9](https://musicbrainz.org/recording/40fae8e0-16e7-4e96-869a-704ce98e776f), Views; 256000 ms; ISRC USCM51600063. This is a proposal, not an automatic new canonical song.

### 75. U With Me? — Eligible catalog candidate

UUID: 7682d520-5292-4a51-afa1-453317c582c5. Supplied role(s): Lead. Project(s): VIEWS (2016). Source title: U With Me?.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [U With Me?](https://musicbrainz.org/recording/1d7d039f-f2d4-4f5b-bcda-ef3f934d9d79), Views; 297000 ms; ISRC USCM51600066. This is a proposal, not an automatic new canonical song.

### 76. Hype — Eligible catalog candidate

UUID: 67024ac3-058e-4dc2-bdcd-e82dc8b643f6. Supplied role(s): Lead. Project(s): VIEWS (2016). Source title: Hype.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Hype](https://musicbrainz.org/recording/428df8d7-21fc-4b6f-90a7-0d309b841b10), NBA2K17; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 77. With You — Eligible catalog candidate

UUID: f5941473-41c9-4ee6-867b-3bac01668050. Supplied role(s): Lead. Project(s): VIEWS (2016). Source title: With You.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [With You](https://musicbrainz.org/recording/d35aa3b0-8371-4ea4-a0ba-83baf489193d), I Am Not a Human Being; 230000 ms; ISRC USCM51000571. This is a proposal, not an automatic new canonical song.
  - [With You](https://musicbrainz.org/recording/4c88b2c8-2426-4960-9057-733eb1c679cf), Memoirs of a Playbwoy; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 78. Faithful — Eligible catalog candidate

UUID: 5f399add-3afb-4237-90ff-502f6508986f. Supplied role(s): Lead. Project(s): VIEWS (2016). Source title: Faithful.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Faithful](https://musicbrainz.org/recording/864f4ffb-b6b0-4a32-b5e8-23846edfcb34), Views; 290000 ms; ISRC USCM51600077. This is a proposal, not an automatic new canonical song.

### 79. Still Here — Eligible catalog candidate

UUID: 40e8b847-ba80-4787-9d0a-5b022037192d. Supplied role(s): Lead. Project(s): VIEWS (2016). Source title: Still Here.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Still Here](https://musicbrainz.org/recording/5509fa6f-5593-49e9-9b1e-a0ce437a1f03), Views; 190000 ms; ISRC USCM51600079. This is a proposal, not an automatic new canonical song.
  - [Still Here](https://musicbrainz.org/recording/d82913bb-b79b-4655-ab21-600bf4a70717), Views; 190000 ms; ISRC USCM51600078. This is a proposal, not an automatic new canonical song.

### 80. One Dance — Eligible catalog candidate

UUID: 8c7e5c5f-4558-4c6a-8ca0-5a02b06671e8. Supplied role(s): Lead. Project(s): VIEWS (2016). Source title: One Dance.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [One Dance](https://musicbrainz.org/recording/be9e4a6b-3f56-468a-aa61-b1bcb6fc277f), Bravo Hits 94; 174000 ms; ISRC USCM51600028. This is a proposal, not an automatic new canonical song.

### 81. Pop Style — Eligible catalog candidate

UUID: 3245e04b-760e-44b0-8487-2238b119b7b2. Supplied role(s): Lead. Project(s): VIEWS (2016). Source title: Pop Style.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Pop Style](https://musicbrainz.org/recording/3fd0f129-c2a0-4c63-8ac4-21ee75c476be), NBA2K17; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Pop Style](https://musicbrainz.org/recording/c47859a1-f576-471f-aad3-66e8660cad6b), Pop Style; 209000 ms; ISRC USCM51600032. This is a proposal, not an automatic new canonical song.

### 82. Summers Over Interlude — Eligible catalog candidate

UUID: beae6635-1cd1-4edb-8369-7e1d4f1047fe. Supplied role(s): Lead. Project(s): VIEWS (2016). Source title: Summers Over (interlude).

- **Supplied title differs from source title** (non-blocking). Supplied: Summers Over Interlude. Source: Summers Over (interlude). [Evidence](https://musicbrainz.org/recording/2ca9724a-b2d6-4ddc-aedb-652b47edd37f).

### 83. Views — Eligible catalog candidate

UUID: 246a5546-453c-42aa-8f0d-b48b637e2cd0. Supplied role(s): Lead. Project(s): VIEWS (2016). Source title: Views.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Views](https://musicbrainz.org/recording/c1b069c4-df5b-433b-b660-ff9273aaf0b2), Views; 312000 ms; ISRC USCM51600095. This is a proposal, not an automatic new canonical song.

### 84. Hotline Bling — Eligible catalog candidate

UUID: 2abcd45a-4e84-4f17-bd19-dd2b44cfdd59. Supplied role(s): Lead. Project(s): VIEWS (2016). Source title: Hotline Bling.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Hotline Bling](https://musicbrainz.org/recording/e288e33a-5c40-4b9f-98f6-0062be760e4a), Hotline Bling; 267000 ms; ISRC USCM51500238. This is a proposal, not an automatic new canonical song.
  - [Hotline Bling](https://musicbrainz.org/recording/a9370ccb-dd67-4357-b9ec-6c9e6cabec06), R&B + Chill; 268520 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 85. Free Smoke — Eligible catalog candidate

UUID: 538c9165-cbd7-4445-ae51-2e82f07c756c. Supplied role(s): Lead. Project(s): MORE LIFE (2017). Source title: Free Smoke.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Free Smoke](https://musicbrainz.org/recording/18d1ef5a-1dd6-4768-b9b8-33868c7e3c50), two tens mellow rap; 134382 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 86. Jorja Interlude — Held for review

UUID: 29e75856-47e7-4fbc-a42e-363006b83d9c. Supplied role(s): Lead. Project(s): MORE LIFE (2017). Source title: Jorja Interlude.

- **Vocal relationships are incomplete or contradictory; check actual Drake performance** (blocking). [Performance metadata](https://musicbrainz.org/recording/d9849651-5e88-4334-9eba-d194db6a12dc): listed vocal performers Jorja Smith; absence of a Drake relationship is not proof of no Drake vocals.

### 87. 4422 — Held for review

UUID: 6e831e62-6838-4df1-831f-144567395137. Supplied role(s): Review. Project(s): MORE LIFE (2017). Source title: 4422.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake project track / Sampha performance. Source: Drake (primary), Sampha (featured). [Evidence](https://musicbrainz.org/recording/c45aa034-6f24-46a3-8d68-b4c55283d9dc).
- **Explicit Review role: Drake performance must be verified** (blocking). 

### 88. Skepta Interlude — Held for review

UUID: 417c95c9-5e60-4928-b560-3a579dc8432d. Supplied role(s): Review. Project(s): MORE LIFE (2017). Source title: Skepta Interlude.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake project track / Skepta performance. Source: Drake (primary). [Evidence](https://musicbrainz.org/recording/cbdd5561-3b0d-4038-b937-bf01424e13c8).
- **Explicit Review role: Drake performance must be verified** (blocking). 
- **Vocal relationships are incomplete or contradictory; check actual Drake performance** (blocking). [Performance metadata](https://musicbrainz.org/recording/cbdd5561-3b0d-4038-b937-bf01424e13c8): listed vocal performers Skepta; absence of a Drake relationship is not proof of no Drake vocals.

### 89. Glow — Eligible catalog candidate

UUID: aeef3c25-82f3-4bf5-a789-ed46acfca267. Supplied role(s): Lead. Project(s): MORE LIFE (2017). Source title: Glow.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake feat. Kanye West. Source: Drake (primary), Ye (featured). [Evidence](https://musicbrainz.org/recording/76c0fb32-c829-4c8b-bd6e-bd55c5959964).

### 90. Fake Love — Eligible catalog candidate

UUID: da61afe8-711f-4972-b227-516798c7b5e9. Supplied role(s): Lead. Project(s): MORE LIFE (2017). Source title: Fake Love.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Fake Love](https://musicbrainz.org/recording/22b82553-fd97-448e-a8d2-2c98a6b233c1), Fake Love; 207000 ms; ISRC USCM51600333. This is a proposal, not an automatic new canonical song.

### 91. God's Plan — Eligible catalog candidate

UUID: 6d954d50-72a1-4a96-8617-7754cf53ab36. Supplied role(s): Lead. Project(s): SCORPION (2018). Source title: God’s Plan.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [GODsPlan](https://musicbrainz.org/recording/55d548b4-d55a-4daf-999b-0372550bda26), LOFI PAPI; 164384 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [God’s Plan](https://musicbrainz.org/recording/841bb140-860a-44d6-b212-84ffeb7d8fdc), The No.1 DJ Collection: 2010s, Volume 12; 198973 ms; ISRC USCM51800005. This is a proposal, not an automatic new canonical song.

### 92. Talk Up — Eligible catalog candidate

UUID: 0545a848-8304-4cf6-856e-40503a18e318. Supplied role(s): Lead. Project(s): SCORPION (2018). Source title: Talk Up.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Talk Up](https://musicbrainz.org/recording/d3dc2e8a-9945-46dd-be8c-f92e197b62d3), Scorpion; 223240 ms; ISRC USCM51800205. This is a proposal, not an automatic new canonical song.

### 93. Nice for What — Eligible catalog candidate

UUID: 0de3519e-b2d5-4c48-b439-e15532f3a921. Supplied role(s): Lead. Project(s): SCORPION (2018). Source title: Nice for What.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Nice for What](https://musicbrainz.org/recording/f9782a27-8a01-4b83-bcc3-5236701465ab), Nice for What; 210747 ms; ISRC USCM51800078. This is a proposal, not an automatic new canonical song.

### 94. In My Feelings — Eligible catalog candidate

UUID: 2af63744-bd3e-48e4-8957-6e3209d25fde. Supplied role(s): Lead. Project(s): SCORPION (2018). Source title: In My Feelings.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [In My Feelings](https://musicbrainz.org/recording/62b7aaee-840c-4b92-8ada-33fa30e5e69a), The No.1 DJ Collection: 2010s, Volume 13; 217933 ms; ISRC USCM51800207. This is a proposal, not an automatic new canonical song.
  - [In My Feelings](https://musicbrainz.org/recording/bdefbb4a-c8ec-40c1-a192-9659e6140909), NRJ Music Awards: 20th Edition; 218000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 95. Dreams Money Can Buy — Eligible catalog candidate

UUID: f75b3c98-f323-4b8d-ae32-20531d117f8c. Supplied role(s): Lead. Project(s): CARE PACKAGE (2019). Source title: Dreams Money Can Buy.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Dreams Money Can Buy](https://musicbrainz.org/recording/6f8408ed-94ae-4921-994e-92afaaed62a6), Heartbreaks and Earthquakes - The Mixtape; 261000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 96. The Motion — Eligible catalog candidate

UUID: 99d7dee8-7d93-4fda-8bf5-31879930b798. Supplied role(s): Lead. Project(s): CARE PACKAGE (2019). Source title: The Motion.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake feat. Sampha. Source: Drake (primary). [Evidence](https://musicbrainz.org/recording/8ed55739-b0b0-4964-9065-a90d846563e9).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [The Motion](https://musicbrainz.org/recording/b8d1b38e-b615-4f7c-9099-4d4e191b38c8), Nothing Was the Same; 240957 ms; ISRC USCM51300761. This is a proposal, not an automatic new canonical song.

### 97. Draft Day — Eligible catalog candidate

UUID: 96acfe14-92d9-4acb-9e4c-d469f4e11bd3. Supplied role(s): Lead. Project(s): CARE PACKAGE (2019). Source title: Draft Day.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Draft Day](https://musicbrainz.org/recording/c15b36fd-3e8a-4059-93bd-6a3289f7ea7e), Draft Day; 295000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 98. 5AM in Toronto — Eligible catalog candidate

UUID: 8a61fcff-b598-44b1-b8d4-286539116e15. Supplied role(s): Lead. Project(s): CARE PACKAGE (2019). Source title: 5 Am in Toronto.

- **Supplied title differs from source title** (non-blocking). Supplied: 5AM in Toronto. Source: 5 Am in Toronto. [Evidence](https://musicbrainz.org/recording/6b1156d4-4cdb-4ec6-8402-3c565790c48e).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [5 AM in Toronto](https://musicbrainz.org/recording/0e488164-7d4d-452d-b7f4-51cb0b6bbcd6), 5 AM in Toronto; 182000 ms; ISRC FR6V81679093. This is a proposal, not an automatic new canonical song.

### 99. Jodeci Freestyle — Eligible catalog candidate

UUID: 6d47168a-3e14-45ed-ade1-79219a04f3bd. Supplied role(s): Lead. Project(s): CARE PACKAGE (2019). Source title: Jodeci Freestyle.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Jodeci Freestyle](https://musicbrainz.org/recording/236ac059-23b0-4135-8b4f-99e4ecff303f), Jodeci Freestyle; 274000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 100. Can I — Eligible catalog candidate

UUID: 9c004e1e-97d1-4dae-97bf-92f72a5927bd. Supplied role(s): Lead. Project(s): CARE PACKAGE (2019). Source title: Can I.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Can I](https://musicbrainz.org/recording/d1d74c8a-d7c2-42bc-a803-70b4d5002b69), Now or Never; 214720 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Can I](https://musicbrainz.org/recording/534a54d6-45cc-4eb0-8e69-7388549a696f), Now or Never; 214000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 101. When to Say When — Eligible catalog candidate

UUID: e9310c29-105b-4948-850b-cf27e22aedde. Supplied role(s): Lead. Project(s): DARK LANE DEMO TAPES (2020). Source title: When to Say When.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [When To Say When](https://musicbrainz.org/recording/5893d21b-d0f1-49c2-8bff-91256dda65e3), When To Say When; 296000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 102. Chicago Freestyle — Eligible catalog candidate

UUID: c07ca5e4-6544-4790-843b-8aa64fd864a3. Supplied role(s): Lead. Project(s): DARK LANE DEMO TAPES (2020). Source title: Chicago Freestyle.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Chicago Freestyle](https://musicbrainz.org/recording/91d78d25-ff37-4a55-a51b-c1d03d682985), Chicago Freestyle; 218000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 103. D4L — Eligible catalog candidate

UUID: 1a98afbd-e7cc-482c-bc00-0a1d7d0421df. Supplied role(s): Lead. Project(s): DARK LANE DEMO TAPES (2020). Source title: D4L.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [D4L](https://musicbrainz.org/recording/e7bed863-9a98-49f6-a211-5ff36fde7fe8), Dark Lane Demo Tapes; 184879 ms; ISRC USSM12002339. This is a proposal, not an automatic new canonical song.

### 104. War — Eligible catalog candidate

UUID: 4b24ee02-b443-42de-8c07-2d293a4d3bae. Supplied role(s): Lead. Project(s): DARK LANE DEMO TAPES (2020). Source title: War.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [War](https://musicbrainz.org/recording/aca951ae-679c-4f12-897e-dd1dd88f8cc0), Hottest Nigga Under the Sun; 208000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 105. N 2 Deep — Eligible catalog candidate

UUID: a480f1d3-909f-4352-baf9-d0c447f4575a. Supplied role(s): Lead. Project(s): CERTIFIED LOVER BOY (2021). Source title: N 2 Deep.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake feat. Future. Source: Drake (primary). [Evidence](https://musicbrainz.org/recording/c8b5b9cd-0852-4edf-b203-c85fa0e5e997).

### 106. Yebba's Heartbreak — Held for review

UUID: c7987f55-caed-423a-ae6b-293392e9da48. Supplied role(s): Drake-project guest performance / Review. Project(s): CERTIFIED LOVER BOY (2021). Source title: Yebba’s Heartbreak.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Yebba. Source: Drake (primary), Yebba (primary). [Evidence](https://musicbrainz.org/recording/27cda0ff-1053-4bce-8f72-815cf3f3df10).
- **Explicit Review role: Drake performance must be verified** (blocking). 

### 107. Intro — Eligible catalog candidate

UUID: f7a3f7d2-fb56-4e85-8af7-beb6acd3966c. Supplied role(s): Lead. Project(s): HONESTLY, NEVERMIND (2022). Source title: Intro.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Intro](https://musicbrainz.org/recording/624e6816-a6a5-43df-9ed8-5344dc0e1fb0), Comeback Season; 30000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/e1c9acdb-8e32-437d-840b-d29b0333d3d4), Young & Successful; 35000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/dd59d9a4-a7d6-4cb5-88dc-c91e40daa576), Tha Carter IV; 172000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/aeb3d678-e2ea-4bc4-9929-e78a7890edc5), Soul Movement, Volume 1; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/1ea33c6b-7370-4d2e-8182-ecd460e8b403), Soul Movement, Volume 1; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/70407848-29ff-44ee-ae0d-2833a1bd3ed0), Room for Improvement; 52000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/052e1d8f-00a3-4b26-acbd-d67399c079e8), Cole World: The Sideline Story; 82000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/2d3fa3e2-a992-4a9f-989a-a0ddfb72de4c), Harder Than Ever; 93000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/7e25cf46-01dc-42d9-bda3-0ee5ff41be78), Championships; 213402 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/db00c3d7-119a-4653-9ae2-34906e988a19), Last Train to Paris; 93693 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/3c081789-5ada-4f57-9d04-3bfb25fab959), Last Train to Paris; 93000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/b1fcad1f-bc65-4afb-aadb-f27909f0f32d), The Inkwell; 181271 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/ff564f09-887c-4f15-8655-dad250f81e5e), Harder Than Ever; 93338 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/0ec96420-dcb3-4c9a-b555-31e4cf0b39de), Pricele$$; 108000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/672f1b30-a2e3-4bb6-b8f8-1ca40b9363ef), Savage Mode II; 70044 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/4b5290c8-822f-4796-8b10-625255057b7e), Love Thy Brother; 38000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/36b71361-4910-4a14-9020-5deb7bb0afef), The Weezy Effects 2; 92000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/f88a4e75-bd64-4c8d-b775-768c40dccb0d), Fórmula, vol. 2; 71000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/0bde26eb-0f3a-4d37-b37f-347b82c3d74d), Das ist der Remix; 102000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/e1c8e321-1b01-4b3f-8eda-968bdb6a525f), Shock Value II; 48853 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/be45ef9e-09c5-40ff-98f2-5ad0be63d4ac), Victory; 153992 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/09a8bfe1-3bd7-4cfd-9dd7-482d0b1f47af), Twitter Music, Vol. 3; 44000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro (Dear America)](https://musicbrainz.org/recording/4c28cd05-15ce-40b7-a8c0-f2575d190f40), Dear America; 67660 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/bbdce017-506f-4d40-aa83-5d4aad11eafb), SAVAGE MODE II; 70044 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/bd4b47d6-6e20-4873-bb64-552f7e6b233f), Victory; 154000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Intro](https://musicbrainz.org/recording/5a814d02-3c2d-4395-ac40-2e22883f161d), Beam Me Up Scotty; 63791 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 108. Rich Flex — Eligible catalog candidate

UUID: f7fbe40d-3f3c-4a24-abf6-308713a34bc8. Supplied role(s): Joint-Primary. Project(s): HER LOSS — WITH 21 SAVAGE (2022). Source title: Rich Flex.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Rich Flex](https://musicbrainz.org/recording/239bf00c-2a75-49e1-9efa-8a2f4e7e2002), UK Official Singles Chart Top40; unknown ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 109. 3AM on Glenwood — Held for review

UUID: 6267da99-cfe5-4c2a-a783-4847f606c00d. Supplied role(s): Drake-project guest performance / Review. Project(s): HER LOSS — WITH 21 SAVAGE (2022). Source title: 3AM on Glenwood.

- **Source credit does not establish Drake performance** (blocking). [Evidence](https://musicbrainz.org/recording/fcb5964b-dd3e-4cc1-ae64-8ff1267d9b7f).
- **Explicit Review role: Drake performance must be verified** (blocking). 

### 110. Amen — Eligible catalog candidate

UUID: 6df38fcf-5692-451e-984d-4e03ad5a4d36. Supplied role(s): Lead. Project(s): FOR ALL THE DOGS + SCARY HOURS EDITION (2023). Source title: Amen.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Amen](https://musicbrainz.org/recording/03b33d21-aadb-487c-8fee-22d6d372ee5e), Once Upon a Time in 2012; 287000 ms; ISRC FR0Z50037101. This is a proposal, not an automatic new canonical song.
  - [Amen](https://musicbrainz.org/recording/5ee0a701-1a96-41e6-9de9-f9a9053c642f), Dreamchasers 2; 287266 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Amen](https://musicbrainz.org/recording/953f4e07-ad57-490f-b1dc-7916ff97510e), Dreams and Nightmares; 287957 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Amen](https://musicbrainz.org/recording/c5078312-97d5-41ad-8b72-b56fee37ca5e), Dreams and Nightmares; 287951 ms; ISRC USWB11201519. This is a proposal, not an automatic new canonical song.

### 111. Daylight — Eligible catalog candidate

UUID: 6d6ec1be-71f9-44cd-baf9-c7057fdd94e9. Supplied role(s): Lead. Project(s): FOR ALL THE DOGS + SCARY HOURS EDITION (2023). Source title: Daylight.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Daylight](https://musicbrainz.org/recording/69a76314-be3f-499c-84fd-4c564694cc67), So Fresh: The Hits of Summer 2013 + The Best of 2012; 225853 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 112. IDGAF — Eligible catalog candidate

UUID: 613146f8-05aa-4f87-8440-fd1fb61c8e06. Supplied role(s): Lead. Project(s): FOR ALL THE DOGS + SCARY HOURS EDITION (2023). Source title: IDGAF.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [IDGAF](https://musicbrainz.org/recording/3e0c2100-4b7a-4f1d-94a4-0b4470c4a28d), Now That’s What I Call Music! 99; 216000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 113. Slime You Out — Eligible catalog candidate

UUID: 330d5e56-70b1-4f21-9821-896cb6021a1f. Supplied role(s): Lead. Project(s): FOR ALL THE DOGS + SCARY HOURS EDITION (2023). Source title: Slime You Out.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Slime You Out](https://musicbrainz.org/recording/e8df4d05-84de-4f7d-b5c6-d4693f113e86), Slime You Out; 310000 ms; ISRC USUG12306065. This is a proposal, not an automatic new canonical song.

### 114. Screw the World – Interlude — Held for review

UUID: 47f914ef-b1cc-4c19-8d10-6046fc438305. Supplied role(s): Interlude / Review. Project(s): FOR ALL THE DOGS + SCARY HOURS EDITION (2023). Source title: Screw the World (interlude).

- **Supplied title differs from source title** (non-blocking). Supplied: Screw the World – Interlude. Source: Screw the World (interlude). [Evidence](https://musicbrainz.org/recording/dd4b3016-f02b-4ffe-899a-362c729515f6).
- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake project track. Source: Drake (primary). [Evidence](https://musicbrainz.org/recording/dd4b3016-f02b-4ffe-899a-362c729515f6).
- **Explicit Review role: Drake performance must be verified** (blocking). 

### 115. Rich Baby Daddy — Eligible catalog candidate

UUID: f9fffded-6d82-4456-ae6b-6c0f1f66d7db. Supplied role(s): Lead. Project(s): FOR ALL THE DOGS + SCARY HOURS EDITION (2023). Source title: Rich Baby Daddy.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [RICH BABY DADDY](https://musicbrainz.org/recording/e3186279-310b-440f-87a1-04c43db399dd), RICH BABY DADDY (PREPMODE IDKWTF MIX); 240214 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 116. Family Matters — Eligible catalog candidate

UUID: 775ff58a-4623-4e5e-a9c4-35e39b9d3695. Supplied role(s): Lead. Project(s): 2024 LEAD / PRIMARY RELEASES. Source title: Family Matters.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Family Matters](https://musicbrainz.org/recording/cae68313-6568-407d-9b27-e225fc970381), Family Matters; 456933 ms; ISRC USUG12402985. This is a proposal, not an automatic new canonical song.

### 117. The Heart Part 6 — Eligible catalog candidate

UUID: ee266903-716d-47be-ab11-c61d9ac19c02. Supplied role(s): Lead. Project(s): 2024 LEAD / PRIMARY RELEASES. Source title: The Heart, Part 6.

- **Supplied title differs from source title** (non-blocking). Supplied: The Heart Part 6. Source: The Heart, Part 6. [Evidence](https://musicbrainz.org/recording/c9c571c6-ab09-4d77-a460-63b062b531c9).

### 118. It's Up — Eligible catalog candidate

UUID: ff4b13ff-0261-49a1-8575-c07a64470b15. Supplied role(s): Lead. Project(s): 2024 LEAD / PRIMARY RELEASES. Source title: It’s Up.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake feat. Young Thug & 21 Savage. Source: Drake (primary). [Evidence](https://musicbrainz.org/recording/af839e1a-b934-482e-9438-848061760f06).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [It’s Up](https://musicbrainz.org/recording/e8e02a38-12de-45df-974c-eb667fb736d2), 100 GIGS; 278000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [It’s Up](https://musicbrainz.org/recording/52a90270-ad58-4aa2-9f08-46fdc432736b), 100 GIGS; 278000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [It’s Up](https://musicbrainz.org/recording/96a37721-4e9e-4bd2-902a-a8db5c5f93a8), 100 GIGS; 278000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 119. Blue Green Red — Eligible catalog candidate

UUID: 0d04c7b8-ca0b-4020-a362-2b1ffcd421b7. Supplied role(s): Lead. Project(s): 2024 LEAD / PRIMARY RELEASES. Source title: Blue Green Red.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Blue Green Red](https://musicbrainz.org/recording/71162845-d198-42bd-8f42-1555829911f8), 100 GIGS; 217846 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 120. Housekeeping Knows — Eligible catalog candidate

UUID: 3940560c-6ea1-4fe2-b9bf-a2748ad91cc8. Supplied role(s): Lead. Project(s): 2024 LEAD / PRIMARY RELEASES. Source title: Housekeeping Knows.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake feat. Latto. Source: Drake (primary). [Evidence](https://musicbrainz.org/recording/e3582979-661a-4ab0-859a-8ed6cc3b69d2).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [Housekeeping Knows](https://musicbrainz.org/recording/43b7bc44-2292-4693-b9db-d06c5698020d), 100 GIGS; 187000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Housekeeping Knows](https://musicbrainz.org/recording/a4f60d4e-e36f-4b23-9103-e47b7423f5e3), 100 GIGS; 186692 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Housekeeping Knows](https://musicbrainz.org/recording/a4abc94d-6b76-434d-a436-f12d401682ea), 100 GIGS; 186692 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 121. Circadian Rhythm — Eligible catalog candidate

UUID: 1db359bf-972d-4d3e-ac4e-e1997d3247c1. Supplied role(s): Lead. Project(s): 2024 LEAD / PRIMARY RELEASES. Source title: Circadian Rhythm.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Circadian Rhythm](https://musicbrainz.org/recording/8f9299b9-039d-4ad1-a65c-8d1d75a3fa8f), 100 GIGS; 126000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 122. Sideways — Eligible catalog candidate

UUID: f281384f-da09-4922-be98-bbce618917ef. Supplied role(s): Joint-Primary. Project(s): 2024 LEAD / PRIMARY RELEASES. Source title: Sideways.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Sideways](https://musicbrainz.org/recording/d5eade85-60c3-401c-8d68-c461934a2791), Sideways; 253000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 123. SPIDER-MAN SUPERMAN — Eligible catalog candidate

UUID: 2fef2930-d69f-4c47-b526-7e53c7372e8e. Supplied role(s): Joint-Primary. Project(s): $OME $EXY $ONGS 4 U — WITH PARTYNEXTDOOR (2025). Source title: SPIDER‐MAN SUPERMAN.

- **Supplied title differs from source title** (non-blocking). Supplied: SPIDER-MAN SUPERMAN. Source: SPIDER‐MAN SUPERMAN. [Evidence](https://musicbrainz.org/recording/44e6ed1d-bf05-425d-aa58-a40ba0aa18ee).

### 124. PIMMIE'S DILEMMA — Eligible catalog candidate

UUID: ec2f552b-a4b8-4538-9f92-cabebf76cc2f. Supplied role(s): Joint-Primary. Project(s): $OME $EXY $ONGS 4 U — WITH PARTYNEXTDOOR (2025). Source title: PIMMIE’S DILEMMA.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Pimmie, PARTYNEXTDOOR & Drake. Source: PARTYNEXTDOOR (primary), Drake (primary), Pim (primary). [Evidence](https://musicbrainz.org/recording/b89edcb5-1af3-45aa-8f10-5f584ec20f25).

### 125. What Did I Miss? — Eligible catalog candidate

UUID: dd443986-718b-48b7-a2fe-4967bb17805f. Supplied role(s): Lead. Project(s): ICEMAN (2026). Source title: What Did I Miss?.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [What Did I Miss?](https://musicbrainz.org/recording/91122b81-a76e-482c-b6ff-44a0b2ee6fce), What Did I Miss?; 194324 ms; ISRC USUG12505775. This is a proposal, not an automatic new canonical song.

### 126. Slap The City — Eligible catalog candidate

UUID: 5cf9b0e7-c4bd-4a46-9cf9-48d60d60fb0d. Supplied role(s): Lead. Project(s): HABIBTI (2026). Source title: Slap the City.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake. Source: Drake (primary), Qendresa (featured). [Evidence](https://musicbrainz.org/recording/3a79e5c9-a23d-439b-a1d8-ae3ae80e39ba).

### 127. Forever — Eligible catalog candidate

UUID: 2c87ba43-33ef-4403-84cc-e41b19ef0d8b. Supplied role(s): Joint-Primary. Project(s): OTHER STANDALONE LEAD / JOINT-PRIMARY RELEASES. Source title: Forever.

- **Supplied artist credit differs from source credit** (non-blocking). Supplied: Drake, Kanye West, Lil Wayne & Eminem. Source: Drake (primary), Ye (primary), Lil Wayne (primary), Eminem (primary). [Evidence](https://musicbrainz.org/recording/54c0f950-b904-4bfd-8ee5-34ea742bee8f).
- **Other source recording identities require review before attachment** (non-blocking). 
  - [Forever](https://musicbrainz.org/recording/3c66e72a-5e2b-441d-be6a-96cdca0e077d), Heartbreak Drake; 251000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Forever](https://musicbrainz.org/recording/2ec4fe6b-b158-4cd6-808c-1c769eb5d36f), R&B Lovesongs 2010; 278000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Forever](https://musicbrainz.org/recording/3df4a833-611f-4c89-85a8-72dab03e8d94), Lloyd & Friends; 150000 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Forever](https://musicbrainz.org/recording/b937fd6d-797c-4b12-9b91-7cebe8930197), Relapse: Refill; 357333 ms; ISRC USUM70920708, USUM70985366. This is a proposal, not an automatic new canonical song.

### 128. 0 to 100 / The Catch Up — Eligible catalog candidate

UUID: 78a27dd2-f1f4-424d-8bcf-80be9cb6c1f8. Supplied role(s): Lead. Project(s): OTHER STANDALONE LEAD / JOINT-PRIMARY RELEASES. Source title: 0 to 100 / The Catch Up.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [0 to 100 / The Catch Up (Clean)](https://musicbrainz.org/recording/4d83f91a-11a9-48c6-8a6c-efe8048b1611), NBA2K16; 275226 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.

### 129. Diplomatic Immunity — Eligible catalog candidate

UUID: 2019168d-fe73-4687-9980-372b3a93fc06. Supplied role(s): Lead. Project(s): OTHER STANDALONE LEAD / JOINT-PRIMARY RELEASES. Source title: Diplomatic Immunity.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Diplomatic Immunity](https://musicbrainz.org/recording/774b8656-124e-4869-8254-d95e2cbc45c6), Scary Hours; 255828 ms; ISRC USCM51800007. This is a proposal, not an automatic new canonical song.

### 130. Omertà — Eligible catalog candidate

UUID: 41cce609-7802-41c5-9042-299d31d144df. Supplied role(s): Lead. Project(s): OTHER STANDALONE LEAD / JOINT-PRIMARY RELEASES. Source title: Omertà.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Omertà](https://musicbrainz.org/recording/c88a8359-5313-4597-9286-c2602fe107f2), The Best in the World Pack; 219506 ms; ISRC not supplied. This is a proposal, not an automatic new canonical song.
  - [Omertà](https://musicbrainz.org/recording/59d0cfbe-276d-4bef-beb1-098253bca51f), The Best in the World Pack; 219506 ms; ISRC USCM51900313. This is a proposal, not an automatic new canonical song.

### 131. Money in the Grave — Eligible catalog candidate

UUID: e6c9b4c3-a37c-4ac1-89a2-c647d37b64f9. Supplied role(s): Lead. Project(s): OTHER STANDALONE LEAD / JOINT-PRIMARY RELEASES. Source title: Money in the Grave.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Money in the Grave](https://musicbrainz.org/recording/63b31e5c-df3f-4900-9d86-ebf31f753102), The Best in the World Pack; 205369 ms; ISRC USCM51900319. This is a proposal, not an automatic new canonical song.

### 132. Laugh Now Cry Later — Eligible catalog candidate

UUID: 6b8d36e7-161e-4d7a-ab64-b64d54a0aa6f. Supplied role(s): Lead. Project(s): OTHER STANDALONE LEAD / JOINT-PRIMARY RELEASES. Source title: Laugh Now Cry Later.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Laugh Now Cry Later](https://musicbrainz.org/recording/a2a0b641-694a-4603-9919-807bcb919dbd), Laugh Now Cry Later; 261000 ms; ISRC USUG12001749. This is a proposal, not an automatic new canonical song.

### 133. What's Next — Eligible catalog candidate

UUID: ee7404b6-cec7-45d9-9800-fca530b4e997. Supplied role(s): Lead. Project(s): OTHER STANDALONE LEAD / JOINT-PRIMARY RELEASES. Source title: What’s Next.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [What’s Next](https://musicbrainz.org/recording/6a4e186a-d0ff-4091-a2f7-e86fdfa7dac0), Scary Hours 2; 178153 ms; ISRC USUG12101044. This is a proposal, not an automatic new canonical song.

### 134. Wants and Needs — Eligible catalog candidate

UUID: c4c61561-cd8b-4429-8e55-38470da84e81. Supplied role(s): Lead. Project(s): OTHER STANDALONE LEAD / JOINT-PRIMARY RELEASES. Source title: Wants and Needs.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Wants and Needs](https://musicbrainz.org/recording/72551c68-65f3-42e5-be3a-23fae53eeb31), Scary Hours 2; 192956 ms; ISRC USUG12101042. This is a proposal, not an automatic new canonical song.

### 135. Lemon Pepper Freestyle — Eligible catalog candidate

UUID: f374dd81-d3f4-43b9-b568-08b617b1e0ee. Supplied role(s): Lead. Project(s): OTHER STANDALONE LEAD / JOINT-PRIMARY RELEASES. Source title: Lemon Pepper Freestyle.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Lemon Pepper Freestyle](https://musicbrainz.org/recording/d01670df-6b8c-421a-9ec6-f84d55785758), Scary Hours 2; 383036 ms; ISRC USUG12101043. This is a proposal, not an automatic new canonical song.

### 136. Search & Rescue — Eligible catalog candidate

UUID: 81da92e4-47b1-4fa5-882c-735f5d060211. Supplied role(s): Lead. Project(s): OTHER STANDALONE LEAD / JOINT-PRIMARY RELEASES. Source title: Search & Rescue.

- **Other source recording identities require review before attachment** (non-blocking). 
  - [Search & Rescue](https://musicbrainz.org/recording/bce7bb1d-e46a-4bf8-a587-d7c5b42b2297), Search & Rescue; 272113 ms; ISRC USUG12301602. This is a proposal, not an automatic new canonical song.

Part 2 guest/features is awaiting the user's separate list. No unreleased catalog or Phase 3 work was started.
