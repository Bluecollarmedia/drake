# Part 2 — Drake feature / guest catalog audit

Imported into the same canonical Supabase catalog as Part 1. Curated entries decide membership; MusicBrainz supplies factual evidence only. No new artist-wide discovery and no AI analysis.

| Measure | Result |
|---|---:|
| Entries received | 96 |
| Distinct canonical candidates | 96 |
| New canonical songs | 96 |
| Recording overlaps with Part 1 | 0 |
| Exact duplicates | 0 |
| Metadata-enriched candidates | 95 |
| Part 2 eligible candidates | 75 |
| Part 2 candidates held | 21 |
| Combined canonical candidates | 499 |
| Combined eligible candidates | 457 |
| Combined held candidates | 42 |
| Part 2 matched appearances | 646 |
| Part 2 attached MusicBrainz recording IDs | 141 |
| Combined release editions | 931 |
| Combined appearances | 3416 |
| Current metadata review cases | 95 |
| Candidates with any review case | 61 |
| Candidates with unattached recording proposals | 49 |

**499 includes held candidates. It is not a claim of 499 verified Drake-performing songs, or a complete discography.** “Never Hating” is retained solely as an ineligible review candidate. MusicBrainz performing credits establish Drake for 93 Part 2 matches; performing credit and manual verification are distinct.

## Overlaps and identity

No attached recording IDs overlap Part 1. Meek Mill’s “Amen” (2012) is distinct from Drake’s “Amen” (2023). DJ Khaled’s “I’m on One” (2011) and Future’s “I’m on One” (2022) are distinct. Primary artist is part of Part 2 candidate identity. Remixes are separate intended versions; clean/explicit and reissue appearances share the canonical song. Sped-up/live/edit variants are not silently attached to the supplied remix. “Blessings” prioritizes the supplied Big Sean / Drake recording over the expanded Kanye credit.

Part 1’s 403 song UUIDs, song records, memberships and artist-credit rows were compared before/after and remained identical. If a future Part 2 entry matches a Part 1 provider recording, the importer reuses its internal UUID, preserves Part 1’s canonical fields/source metadata, and holds the Part 2 role discrepancy for review.

## Blocking review items — all 21

| Song | Supplied primary | Why held | Evidence |
|---|---|---|---|
| You Got Me | Lil Wayne | no_verified_metadata_match_in_cached_sources | No verified match |
| Say Something | Timbaland | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/9dc51669-f015-484c-a164-3b61f822f5fd |
| Loving You No More | Diddy – Dirty Money | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/3f3ab44b-8c96-4a33-967b-ca5b9a6124d7 |
| She Will | Lil Wayne | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/958cfb5e-0f39-45b0-87d8-990d8dc0528f |
| It's Good | Lil Wayne | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/22b9f806-0866-4302-8e9e-77e6310991e0 |
| Amen | Meek Mill | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/03b33d21-aadb-487c-8fee-22d6d372ee5e |
| Diced Pineapples | Rick Ross | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/0dcca9c5-31bf-45c0-aea3-2b406c96fc4a |
| Poetic Justice | Kendrick Lamar | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/5c2f2e54-328f-4fe6-b3bd-d8a50a1c815e |
| Tuesday | ILoveMakonnen | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/be904dde-a764-48dd-9d00-dadaab7cd70c |
| No Frauds | Nicki Minaj | feature_list_conflicts_with_joint_primary_source_billing; master_list_requires_performing_credit_verification | https://musicbrainz.org/recording/e51b8bca-1c55-4a5c-97c3-c8ca2df171e0 |
| Yes Indeed | Lil Baby | feature_list_conflicts_with_joint_primary_source_billing; master_list_requires_performing_credit_verification | https://musicbrainz.org/recording/26458ed5-62fd-4132-9e9a-11c74d27d24d |
| Bigger Than You | 2 Chainz | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/fe57f19b-f4bb-4492-b8c5-a235a6780069 |
| SICKO MODE | Travis Scott | source_credit_does_not_establish_drake_performance; master_list_requires_performing_credit_verification | https://musicbrainz.org/recording/b7326a80-8332-4ee0-8238-d6737efba347 |
| Never Recover | Lil Baby & Gunna | feature_list_conflicts_with_joint_primary_source_billing; master_list_requires_performing_credit_verification | https://musicbrainz.org/recording/764944d6-f45f-497b-a695-edb30100e13c |
| Girls Need Love (Remix) | Summer Walker | feature_list_conflicts_with_joint_primary_source_billing; master_list_requires_performing_credit_verification | https://musicbrainz.org/recording/7af02def-5946-4ac9-9478-a3de97ee497e |
| No Guidance | Chris Brown | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/73fa99d7-300f-4779-9156-c683f7df82d1 |
| Ela É do Tipo (Remix) | Kevin O Chris | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/9ba76ea9-65cc-4183-b9c7-30ea61d9dc03 |
| Bubbly | Young Thug | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/9271a20b-e5f5-4aaa-875d-5d8cdb979696 |
| Stars Align | Majid Jordan | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/d50d37e2-f5cc-4d1b-9d41-166aa2af7b12 |
| Never Hating | Lil Baby | source_credit_does_not_establish_drake_performance; master_list_requires_performing_credit_verification | https://musicbrainz.org/recording/a6dd2f0b-e7ad-4ff8-87c6-ecfb1bcd69d5 |
| Modo Capone | Chino Pacas | feature_list_conflicts_with_joint_primary_source_billing | https://musicbrainz.org/recording/796dd771-4a2f-4678-a3a6-1db66840dbcc |

MusicBrainz join phrases can differ between recording and track credits. “Primary” in these responses is not independent proof of official joint billing. Billing discrepancies remain pending rather than silently reclassifying or deleting entries. The six explicitly marked Review candidates remain ineligible even if metadata identifies Drake.

“Never Hating”: [Apple Music official listing](https://music.apple.com/us/song/1649121018) and [MusicBrainz official release tracklist](https://musicbrainz.org/release/379b0b6f-612a-42c3-af84-d31850f000a1) credit Lil Baby / Young Thug, not Drake. The targeted recording/performing relationship response was preserved. This entry is excluded from eligibility.

“You Got Me”: no exact recording result for MusicBrainz query recording:"You Got Me" AND artist:"Lil Wayne"; no verified official-release match in the preserved sources. This is unresolved, not proof that the song never existed. “With You” is a different, source-backed Lil Wayne / Drake title that is absent from Part 2; it was not silently substituted.

“SICKO MODE”: the selected recording’s retail-style credit lists Travis Scott alone; a targeted artist-relationship lookup did not establish Drake’s vocals. Missing relationships are not evidence of no Drake performance. The supplied guest-performance claim remains intact, pending verification.

## Suspected inventory gaps — proposals only

These bounded examples came from preserved official release/recording metadata. They were not imported. They are not an exhaustive generated feature list. Confirm billing and intended version before extending the curated master.

| Song | Other performing artist | Source release | Evidence |
|---|---|---|---|
| With You | Lil Wayne | I Am Not a Human Being | https://musicbrainz.org/recording/d35aa3b0-8371-4ea4-a0ba-83baf489193d |
| Gonorrhea | Lil Wayne | I Am Not a Human Being | https://musicbrainz.org/recording/4c1d98ea-e723-4570-9aa0-e33de1928d1d |
| The Zone | The Weeknd | Trilogy | https://musicbrainz.org/recording/91168a22-2f79-40bd-9c8d-8263f38cc6b9 |
| My Love | Majid Jordan | Majid Jordan | https://musicbrainz.org/recording/2b1b0052-302c-4985-b4b2-9f30f43f091d |
| Cabaret | Justin Timberlake | The 20/20 Experience (2 of 2) | https://musicbrainz.org/recording/fdae1add-570d-4869-b7e7-fdfb1bcfabc4 |
| Know Bout Me | Timbaland | Know Bout Me | https://musicbrainz.org/recording/c4d344ca-5c3a-4e77-964e-4baac8188fa9 |
| Won’t Be Late | Swae Lee | Won’t Be Late | https://musicbrainz.org/recording/d91fbda0-efac-49a8-90fe-d72ca8f88e58 |
| Seeing Green | Nicki Minaj | Queen Radio, Volume 1 | https://musicbrainz.org/recording/20c130a9-929b-4203-a60a-4a4fb97057c8 |
| Versace | Migos | Versace | https://musicbrainz.org/recording/411f628a-980b-41f1-ad4b-dab1cfbd759f |
| Un-Thinkable (I’m Ready) (remix) | Alicia Keys | Un-Thinkable (I’m Ready) (remix) | https://musicbrainz.org/recording/00024c77-f734-47d3-8771-911b1e8932a5 |

## Verification

Seven migrations applied; 31 tables have RLS. A normal authenticated client cannot write songs, master lists, memberships, master entries or metadata reviews. An unlisted song cannot enter the eligible view. The performance-review CHECK rejects approval without verification. The full real persistence SQL was rehearsed twice inside a rolled-back transaction, then imported live and repeated: zero new songs/releases, identical UUID fingerprint and counts. Profiles, scenarios, embeddings and analysis jobs contain zero rows; their schema remains available. pgvector is prepared independently of catalog membership. Phase 1 UI/navigation files were not changed for this import.

## Coverage and metadata limits

Only the supplied 96 entries were imported; none were deleted on source disagreement. 95 have factual source matches, one does not. Official/Withdrawn release metadata is community maintained and can contain omissions/errors. Artwork is a Cover Art Archive reference only when source metadata confirms it. Spotify/Apple Music IDs and links are not fabricated; this enrichment primarily supplies MusicBrainz identifiers, source credits, dates, durations, ISRCs and track appearances. Earliest matched dates describe known appearances, not necessarily original song release dates. Source year discrepancies are retained as reviews, including “Love Me” (supplied 2012; matched 2013 appearance), “Going Bad” (supplied 2019; matched 2018 appearance), and limited older coverage for “Moment 4 Life” / “No Shopping.” List headings are inventory years, not album projects or asserted official track numbers. No lyrics were scraped/stored.

## Full 96-entry catalog

[CSV export](curated-feature-catalog.csv) preserves supplied primary artist, credit, role, version and inventory year beside factual matches and review reasons.

## Every uncertain recording proposal

These are unattached source recording identities, not extra catalog members. Some have plainly conflicting artist credits, titles or durations; they must not be assumed to be duplicates. 49 canonical candidates have proposals. All proposal IDs/evidence are below.

### Invented Sex — Trey Songz

Selected recording: https://musicbrainz.org/recording/c2859d6d-5bd4-4681-9213-e65df08f00ba; internal UUID: a8f1d862-cc47-410d-9cd4-1ed36426ee27.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [4075bfac-c675-46dc-9fb5-ec68c3614764](https://musicbrainz.org/recording/4075bfac-c675-46dc-9fb5-ec68c3614764) | I Invented Sex |  |  | Trey Songz | R&B Lovesongs 2011 |

### Money to Blow — Birdman

Selected recording: https://musicbrainz.org/recording/64f98716-85db-45fd-b6a7-fca62a4a24ee; internal UUID: 62f6bd19-902d-4a36-87f1-a908ff408d91.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [46cde008-325a-4adc-b9f0-05c0a120091f](https://musicbrainz.org/recording/46cde008-325a-4adc-b9f0-05c0a120091f) | Money to Blow | 262000 |  | Birdman, Drake, Lil Wayne | Money to Blow |
| [9d74b64f-5824-4157-8185-a29551d99346](https://musicbrainz.org/recording/9d74b64f-5824-4157-8185-a29551d99346) | Money to Blow | 260000 |  | Birdman, Lil Wayne, Drake | Massive R&B: Spring 2010 |

### Fed Up — DJ Khaled

Selected recording: https://musicbrainz.org/recording/f5f82e06-4861-46cb-9c11-a07a5a01cc3c; internal UUID: ddf52b50-8c9e-49d5-aaaf-ebe8fc4fcf2e.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [cacf514d-d6f6-4c8b-81c5-767ba3ce54a8](https://musicbrainz.org/recording/cacf514d-d6f6-4c8b-81c5-767ba3ce54a8) | Fed Up | 248000 |  | DJ Khaled, Usher, Jeezy, Rick Ross, Drake | A Timeless Audemars Piguet Collection |

### Say Something — Timbaland

Selected recording: https://musicbrainz.org/recording/9dc51669-f015-484c-a164-3b61f822f5fd; internal UUID: a9b4c453-89b4-43d9-a097-a4980b159d4e.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [6b7e6590-e079-4fe9-a560-cbb1b5f429c6](https://musicbrainz.org/recording/6b7e6590-e079-4fe9-a560-cbb1b5f429c6) | Say Something | 278000 |  | Justin Timberlake, Chris Stapleton | Now That’s What I Call Music! 99 |

### Aston Martin Music — Rick Ross

Selected recording: https://musicbrainz.org/recording/568c7362-5ea8-4a8e-a2fe-23c18da2407b; internal UUID: c5380a4e-faa3-40f2-891f-c7ec0b33e493.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [50436ebf-b9d9-4104-afcd-367b8c2662c3](https://musicbrainz.org/recording/50436ebf-b9d9-4104-afcd-367b8c2662c3) | Aston Martin Music | 418000 |  | Rick Ross, Drake, Chrisette Michele | Rick Ross |
| [5722b9f0-93df-44d9-8291-f1112c58d354](https://musicbrainz.org/recording/5722b9f0-93df-44d9-8291-f1112c58d354) | Aston Martin Music | 251000 |  | Drake | No More Thank Yous |
| [72946f0c-a16c-4c2b-9e19-67525f0fe913](https://musicbrainz.org/recording/72946f0c-a16c-4c2b-9e19-67525f0fe913) | Aston Martin Music | 271000 | USUM71017798 | Rick Ross, Drake, Chrisette Michele | Teflon Don |
| [ad5fa0df-1ad0-4d23-ac53-5e545e900f81](https://musicbrainz.org/recording/ad5fa0df-1ad0-4d23-ac53-5e545e900f81) | Aston Martin Music | 213000 |  | Thai Viet G, Drake | The Statement |

### What's My Name? — Rihanna

Selected recording: https://musicbrainz.org/recording/2eab2264-5b01-4454-b66c-3eeb46d37e0c; internal UUID: cf740739-9ae7-43fc-ac52-8b83a264cf0d.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [2acde8a6-de32-4723-8c79-fe40d389234e](https://musicbrainz.org/recording/2acde8a6-de32-4723-8c79-fe40d389234e) | What’s My Name? | 264000 |  | Rihanna, Drake | Chilled R&B: Smooth Classics |
| [644223cc-8a3a-4b79-8c93-f2b3e27b96fa](https://musicbrainz.org/recording/644223cc-8a3a-4b79-8c93-f2b3e27b96fa) | What's My Name? | 263026 |  | Rihanna, Drake | Now 24 |
| [8ed0faa8-a12a-4319-a1ff-8ec7b63a0454](https://musicbrainz.org/recording/8ed0faa8-a12a-4319-a1ff-8ec7b63a0454) | What’s My Name |  |  | Rihanna, Drake | R&B Lovesongs 2011 |
| [9f383da8-0d8f-4f15-b882-df01126025c7](https://musicbrainz.org/recording/9f383da8-0d8f-4f15-b882-df01126025c7) | What's My Name? | 230000 | USUM71120315 | Rihanna, Drake | 2012 GRAMMY Nominees |
| [c5c27388-d941-4c60-b341-006470fca515](https://musicbrainz.org/recording/c5c27388-d941-4c60-b341-006470fca515) | What's My Name |  |  | Rihanna, Drake | Striscia la compilation 2011 |
| [daa6ec03-ea1b-48e1-be35-d8694b7403a7](https://musicbrainz.org/recording/daa6ec03-ea1b-48e1-be35-d8694b7403a7) | What’s My Name? | 265000 |  | Rihanna, Drake | NRJ Dance 2011 |

### Fall for Your Type — Jamie Foxx

Selected recording: https://musicbrainz.org/recording/e125e9bb-aeda-448e-807f-fd206c48c56f; internal UUID: bf6feb14-d75c-44c2-b11b-68589ec98651.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [b96df068-691b-45c0-aa85-cac8310eeae4](https://musicbrainz.org/recording/b96df068-691b-45c0-aa85-cac8310eeae4) | Fall for Your Type | 98925 |  | Drake | Lost Tracks |

### Moment 4 Life — Nicki Minaj

Selected recording: https://musicbrainz.org/recording/263f39c4-f34d-4521-bdc4-05eb30d2d022; internal UUID: 40d6235f-ce06-4388-8615-226b0f089f6f.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [4fbe060d-7f40-49c2-b085-ffe67b368d2d](https://musicbrainz.org/recording/4fbe060d-7f40-49c2-b085-ffe67b368d2d) | Moment 4 Life | 279293 | USCM51000722 | Nicki Minaj, Drake | Pink Friday |
| [9e110460-0b11-4401-88ab-4cd880dc63e6](https://musicbrainz.org/recording/9e110460-0b11-4401-88ab-4cd880dc63e6) | Moment 4 Life | 279307 | USCM51000721 | Nicki Minaj, Drake | Pink Friday |

### In the Morning — J. Cole

Selected recording: https://musicbrainz.org/recording/27cab0a4-ee48-44c8-b5c4-ad091bce6ffa; internal UUID: 3f1d9505-08bd-4f91-860f-905901bc6b6b.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [ba697d17-5a09-4dee-94ec-fa72651bd651](https://musicbrainz.org/recording/ba697d17-5a09-4dee-94ec-fa72651bd651) | In the Morning | 239000 |  | Big Sean, YG, Big K.R.I.T., Ty Dolla $ign | Finally Famous, Volume 3 |
| [313b6c22-eeda-4d60-b630-11682d140778](https://musicbrainz.org/recording/313b6c22-eeda-4d60-b630-11682d140778) | In the Morning | 275773 |  | Mary J. Blige | Stronger with Each Tear |

### Poppin' Bottles — T.I.

Selected recording: https://musicbrainz.org/recording/fe334df0-f6e2-4cab-8fbb-827afa6a0530; internal UUID: c18618fc-11dc-42cd-992f-8843e8987d7f.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [c20e7289-3338-4dd2-ad7d-13ef031c4f05](https://musicbrainz.org/recording/c20e7289-3338-4dd2-ad7d-13ef031c4f05) | Poppin' Bottles | 197000 |  | Rick Ross, OJ da Juiceman | A Timeless Audemars Piguet Collection |

### I'm on One — DJ Khaled

Selected recording: https://musicbrainz.org/recording/83fdc5df-fd83-40e1-8d27-0cc23c39a25c; internal UUID: d87ac5b7-d27c-47c0-a0d0-6698c43b559d.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [cb300141-1bfb-4e6e-9f6d-e7365501005e](https://musicbrainz.org/recording/cb300141-1bfb-4e6e-9f6d-e7365501005e) | I'm On One | 298000 | FR0Z50036503 | DJ Khaled, Drake | Once Upon a Time in 2011 |
| [0307e822-2973-49bf-a364-db0e90bcb81d](https://musicbrainz.org/recording/0307e822-2973-49bf-a364-db0e90bcb81d) | I'm on One (explicit) | 297813 |  | DJ Khaled, Drake, Rick Ross, Lil Wayne | Best of Black '11 |
| [3c91bfc8-a493-452b-86d9-a9420b9c2ed3](https://musicbrainz.org/recording/3c91bfc8-a493-452b-86d9-a9420b9c2ed3) | I’M ON ONE | 236000 | USSM12203797 | Future, Drake | I NEVER LIKED YOU |
| [3b7c6f9d-67c4-4bb5-8835-75a9fa706317](https://musicbrainz.org/recording/3b7c6f9d-67c4-4bb5-8835-75a9fa706317) | I’m on One | 319000 | USQY51100695 | DJ Hard Hitta, Drake, Trae, Rick Ross, Lil Wayne | Street Work, Volume 7: Beat the Heat (Edition) |
| [bed262ed-7949-46ea-8bd8-3b91658b2559](https://musicbrainz.org/recording/bed262ed-7949-46ea-8bd8-3b91658b2559) | I’M ON ONE | 236187 | USSM12203886 | Future, Drake | I NEVER LIKED YOU |
| [40a162ab-cc70-46f8-b70b-b8458099065b](https://musicbrainz.org/recording/40a162ab-cc70-46f8-b70b-b8458099065b) | I’m on One | 299893 |  | DJ Khaled, Drake, Rick Ross, Lil Wayne | Anthems: Hip-Hop III |
| [4ed60ca6-d696-40e8-9903-9866eae16b2b](https://musicbrainz.org/recording/4ed60ca6-d696-40e8-9903-9866eae16b2b) | I’m On One (clean) | 296000 |  | DJ Khaled, Drake, Lil Wayne, Rick Ross | Promo Only: Urban Radio, July 2011 |
| [46ad6352-3475-4561-a09b-86be41315fdc](https://musicbrainz.org/recording/46ad6352-3475-4561-a09b-86be41315fdc) | I'm On One | 294333 |  | DJ Khaled, Drake, Rick Ross, Lil Wayne | Anthems Hip-Hop II |
| [6283a923-45d7-48ad-b98d-3eae0dfae438](https://musicbrainz.org/recording/6283a923-45d7-48ad-b98d-3eae0dfae438) | I’m on One | 296133 |  | DJ Khaled, Drake, Rick Ross, Lil Wayne | We the Best Forever |
| [63cb5144-3a6e-4e35-ac58-5cf51a99cd6a](https://musicbrainz.org/recording/63cb5144-3a6e-4e35-ac58-5cf51a99cd6a) | I’m on One | 277000 |  | Big Sloan, Drake, Lil Wayne, D-Rado | Exacta Standardz |
| [ad2f9751-3db7-4c55-ace1-8853f2a585e9](https://musicbrainz.org/recording/ad2f9751-3db7-4c55-ace1-8853f2a585e9) | I'M ON ONE | 236000 |  | Future, Drake | I NEVER LIKED YOU |

### She Will — Lil Wayne

Selected recording: https://musicbrainz.org/recording/958cfb5e-0f39-45b0-87d8-990d8dc0528f; internal UUID: 10387e8e-2311-4b7e-b67d-5f60bb6cf8c6.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [13c15cb3-c6b4-4ba2-b253-5e1ee7bebcaa](https://musicbrainz.org/recording/13c15cb3-c6b4-4ba2-b253-5e1ee7bebcaa) | She Will | 306000 | USCM52100121 | Lil Wayne, Drake | Tha Carter IV (deluxe edition) |
| [139b03c4-3b7d-4407-ae71-711d122acdba](https://musicbrainz.org/recording/139b03c4-3b7d-4407-ae71-711d122acdba) | She Will | 305840 | USCM51100308 | Lil Wayne, Drake | I Am Music |
| [d6d14048-69fc-49d9-b95c-524e0bb7e40b](https://musicbrainz.org/recording/d6d14048-69fc-49d9-b95c-524e0bb7e40b) | She Will | 306000 | USUG12105017 | Lil Wayne, Drake | Tha Carter IV (deluxe edition) |
| [9ce9a47d-2cd7-42f4-9b8b-27bb2c40b31d](https://musicbrainz.org/recording/9ce9a47d-2cd7-42f4-9b8b-27bb2c40b31d) | She Will | 305840 | USCM51100309 | Lil Wayne, Drake | Tha Carter IV (deluxe edition) |
| [d1d6d828-f34a-42d9-b558-be333e620cdb](https://musicbrainz.org/recording/d1d6d828-f34a-42d9-b558-be333e620cdb) | She Will | 307000 |  | Lil Wayne, Drake | She Will |

### Round of Applause — Waka Flocka Flame

Selected recording: https://musicbrainz.org/recording/029d1cf6-da74-48a3-bd11-a3e4f8657a9c; internal UUID: 20c48ebf-7c40-4a2c-b373-3af34dd22ec4.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [d77bb8c5-c062-4128-a8ca-cb4f8d0b911c](https://musicbrainz.org/recording/d77bb8c5-c062-4128-a8ca-cb4f8d0b911c) | Round of Applause | 265000 | FR0Z50036508 | Waka Flocka Flame, Drake | Once Upon a Time in 2011 |
| [04ab88ef-b303-49fe-932a-eadbd0b5a4f0](https://musicbrainz.org/recording/04ab88ef-b303-49fe-932a-eadbd0b5a4f0) | Round of Applause | 248790 |  | Waka Flocka Flame, Drake | Waka Flocka Myers 3 |
| [12a29efe-f5a4-4478-b2d1-7d75c0ac751f](https://musicbrainz.org/recording/12a29efe-f5a4-4478-b2d1-7d75c0ac751f) | Round of Applause | 258000 |  | Waka Flocka Flame, Drake | LeBron Flocka James 3 |
| [8c6d81ef-a24d-435d-a0b9-4e28b881e26a](https://musicbrainz.org/recording/8c6d81ef-a24d-435d-a0b9-4e28b881e26a) | Round of Applause | 256333 |  | The Nextmen, Dynamite MC | R&B Anthems: The Ultimate Collection |
| [8393f5e8-1c02-43f1-ac3c-484f7c9daee0](https://musicbrainz.org/recording/8393f5e8-1c02-43f1-ac3c-484f7c9daee0) | Round of Applause | 248000 |  | Waka Flocka Flame, Drake | Waka Flocka Myers 3 |
| [bd01ce30-909d-47bb-9b60-45c6fc281575](https://musicbrainz.org/recording/bd01ce30-909d-47bb-9b60-45c6fc281575) | Round of Applause | 247000 |  | Waka Flocka Flame, Drake | Waka Texas Ranger |

### No Lie — 2 Chainz

Selected recording: https://musicbrainz.org/recording/411b6199-49a7-4a4f-8ef8-a0938af3e1c7; internal UUID: 091fd00f-b473-4cc6-bfda-b124940b70d6.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [1087c148-efa6-4202-80d9-9f8fbabba701](https://musicbrainz.org/recording/1087c148-efa6-4202-80d9-9f8fbabba701) | No Lie | 238000 | USUM72211034 | 2 Chainz, Drake | Based on a T.R.U. Story |
| [5c434c15-bc9b-41c3-bc44-5c9c6ab25459](https://musicbrainz.org/recording/5c434c15-bc9b-41c3-bc44-5c9c6ab25459) | No Lie | 237880 | USUM71204667 | 2 Chainz, Drake | Based on a T.R.U. Story |
| [a19e0418-36f2-40dc-9c15-fdd4347c42f1](https://musicbrainz.org/recording/a19e0418-36f2-40dc-9c15-fdd4347c42f1) | No Lie | 213000 |  | 2 Chainz, Drake | Est. in 1989, Pt. 2 |

### Amen — Meek Mill

Selected recording: https://musicbrainz.org/recording/03b33d21-aadb-487c-8fee-22d6d372ee5e; internal UUID: 112b24a6-d695-4986-af53-e6f87ba6a978.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [bfc2799f-54cd-4b8a-8919-31d30ac130d8](https://musicbrainz.org/recording/bfc2799f-54cd-4b8a-8919-31d30ac130d8) | Amen | 141212 | USUG12306067 | Drake, Teezo Touchdown | For All the Dogs |
| [1f4c6038-03da-4f96-8ed6-ca95f31c0e6a](https://musicbrainz.org/recording/1f4c6038-03da-4f96-8ed6-ca95f31c0e6a) | Amen | 141008 | USUG12306090 | Drake, Teezo Touchdown | For All the Dogs |
| [5ee0a701-1a96-41e6-9de9-f9a9053c642f](https://musicbrainz.org/recording/5ee0a701-1a96-41e6-9de9-f9a9053c642f) | Amen | 287266 |  | Meek Mill, Drake, Jeremih | Dreamchasers 2 |
| [953f4e07-ad57-490f-b1dc-7916ff97510e](https://musicbrainz.org/recording/953f4e07-ad57-490f-b1dc-7916ff97510e) | Amen | 287957 |  | Meek Mill, Drake | Dreams and Nightmares |
| [c5078312-97d5-41ad-8b72-b56fee37ca5e](https://musicbrainz.org/recording/c5078312-97d5-41ad-8b72-b56fee37ca5e) | Amen | 287951 | USWB11201519 | Meek Mill, Drake | Dreams and Nightmares |

### Enough Said — Aaliyah

Selected recording: https://musicbrainz.org/recording/77106502-60f7-41fd-a348-e1d90dadcbdf; internal UUID: a55c980f-138f-41a0-aa5a-d4ecc2cf76a5.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [abc1119c-d048-406a-8428-c7109c286f38](https://musicbrainz.org/recording/abc1119c-d048-406a-8428-c7109c286f38) | Enough Said | 230000 | FR6V81679102 | Drake | 5 AM in Toronto |

### Diced Pineapples — Rick Ross

Selected recording: https://musicbrainz.org/recording/0dcca9c5-31bf-45c0-aea3-2b406c96fc4a; internal UUID: 576c13c0-3725-4fa9-8f73-b553f5dbb03b.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [e2e96222-072d-4d04-b33b-65c8e7a75879](https://musicbrainz.org/recording/e2e96222-072d-4d04-b33b-65c8e7a75879) | Diced Pineapples | 180741 |  | Drake | The Graduate |
| [5e5b3dc6-e52f-4604-8ac1-c17285b91892](https://musicbrainz.org/recording/5e5b3dc6-e52f-4604-8ac1-c17285b91892) | Diced Pineapples | 277000 | USUM72201259 | Rick Ross, Wale, Drake | God Forgives, I Don’t (deluxe version) |
| [b3dca62b-b506-470d-a42d-7f4d14108146](https://musicbrainz.org/recording/b3dca62b-b506-470d-a42d-7f4d14108146) | Diced Pineapples | 276200 | USUM71207230 | Rick Ross, Wale, Drake | God Forgives, I Don’t (deluxe version) |
| [d120b033-27b9-45af-8954-bc9bfa9b3bce](https://musicbrainz.org/recording/d120b033-27b9-45af-8954-bc9bfa9b3bce) | Diced Pineapples | 276160 | USUM71207096 | Rick Ross, Wale, Drake | God Forgives, I Don’t (deluxe version) |
| [f96e613c-3fdb-4df4-8de7-5e2b2a4752ed](https://musicbrainz.org/recording/f96e613c-3fdb-4df4-8de7-5e2b2a4752ed) | Diced Pineapples | 277000 | USUM72201312 | Rick Ross, Wale, Drake | God Forgives, I Don’t (deluxe version) |

### Love Me — Lil Wayne

Selected recording: https://musicbrainz.org/recording/37458f0b-7160-4914-9124-9f74370e3a1c; internal UUID: e0e97e6e-f96e-4236-bf2b-10e12b3a0159.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [36d14d4c-4ea8-4f57-8670-568bd7fec097](https://musicbrainz.org/recording/36d14d4c-4ea8-4f57-8670-568bd7fec097) | Love Me | 267937 |  | Drake | The Graduate |
| [b5fb8692-8934-4b76-a3a6-0fa34589f8ca](https://musicbrainz.org/recording/b5fb8692-8934-4b76-a3a6-0fa34589f8ca) | Love Me | 254000 |  | Lil Wayne, Drake, Future | R&B Collection 2014 |

### Poetic Justice — Kendrick Lamar

Selected recording: https://musicbrainz.org/recording/5c2f2e54-328f-4fe6-b3bd-d8a50a1c815e; internal UUID: 50b26808-9f87-44a9-99fd-8ba0fcbd6b2d.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [61e680da-87a4-4cab-b83e-08d7b8b44142](https://musicbrainz.org/recording/61e680da-87a4-4cab-b83e-08d7b8b44142) | Poetic Justice | 258560 |  | Drake | The Graduate |

### Who Do You Love? — YG

Selected recording: https://musicbrainz.org/recording/3864aa9f-1ad9-49c6-aa61-6a91eb89aa0b; internal UUID: 2a3c1d4f-82e1-42f9-abba-bcc82fb17dc7.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [9881d7bb-ac1c-4f0d-af88-3793cf9ea288](https://musicbrainz.org/recording/9881d7bb-ac1c-4f0d-af88-3793cf9ea288) | Who Do You Love? | 233507 | USUM71400720 | YG, Drake | My Krazy Life |

### Believe Me — Lil Wayne

Selected recording: https://musicbrainz.org/recording/95dfd1ce-688d-486b-9489-dc242e096b62; internal UUID: d4a2e489-7c4e-4217-ac8f-ddbebdc12f02.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [e7daf41f-9a81-4e2c-84e9-2cd2e0d2508c](https://musicbrainz.org/recording/e7daf41f-9a81-4e2c-84e9-2cd2e0d2508c) | Believe Me | 337000 | USCM51400173 | Lil Wayne, Drake | Believe Me |

### Grindin' — Lil Wayne

Selected recording: https://musicbrainz.org/recording/67d92df9-d6ba-464a-b6ca-f6f899254e36; internal UUID: d0bb3bdd-5d10-44d2-b5e5-b6f46a7cf3d0.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [2a9d0b6c-657b-4e61-a93a-23da4e058e17](https://musicbrainz.org/recording/2a9d0b6c-657b-4e61-a93a-23da4e058e17) | Grindin’ | 239493 |  | Clipse | Ministry of Sound: Rappers Delight |

### Tuesday — ILoveMakonnen

Selected recording: https://musicbrainz.org/recording/be904dde-a764-48dd-9d00-dadaab7cd70c; internal UUID: b31e5f1f-8c3f-4387-bc99-bdc8ff19dbe2.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [28795394-5970-49ad-8851-6300b5e79e7c](https://musicbrainz.org/recording/28795394-5970-49ad-8851-6300b5e79e7c) | Tuesday |  |  | iLoveMakonnen, Drake | NBA2K17 |

### Truffle Butter — Nicki Minaj

Selected recording: https://musicbrainz.org/recording/04466588-422a-423e-8f3e-10d50b2ea117; internal UUID: e2691858-c3f4-4fe6-8d68-d379bd3cd029.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [043209e5-bdd6-4149-b053-a2254ed6ca7f](https://musicbrainz.org/recording/043209e5-bdd6-4149-b053-a2254ed6ca7f) | Truffle Butter (clean) | 215235 |  | Nicki Minaj, Drake, Lil Wayne | Promo Only: Mainstream Radio, March 2015 |
| [2c999a32-865d-464f-aeb6-d4ed294bf553](https://musicbrainz.org/recording/2c999a32-865d-464f-aeb6-d4ed294bf553) | Truffle Butter | 220467 | USUM72200272 | Nicki Minaj, Drake, Lil Wayne | Queen Radio, Volume 1 |
| [30da682f-ad1e-4b7b-9d0b-425bdff05688](https://musicbrainz.org/recording/30da682f-ad1e-4b7b-9d0b-425bdff05688) | Truffle Butter | 220467 | USUM72200326 | Nicki Minaj, Drake, Lil Wayne | Queen Radio, Volume 1 |
| [3fc03e58-cf7f-41d5-a856-87af2cdddd93](https://musicbrainz.org/recording/3fc03e58-cf7f-41d5-a856-87af2cdddd93) | Truffle Butter | 217000 |  | Nicki Minaj, Drake, Lil Wayne | W9 Hits 2015, Volume 2 |
| [df9979ed-54ed-49eb-8da6-956e49fc4ed5](https://musicbrainz.org/recording/df9979ed-54ed-49eb-8da6-956e49fc4ed5) | Truffle Butter | 220467 | USCM51400406 | Nicki Minaj, Drake, Lil Wayne | Queen Radio, Volume 1 |

### Blessings — Big Sean

Selected recording: https://musicbrainz.org/recording/c2dc3c93-b409-4abc-8ffc-292847b0ce1f; internal UUID: acfeaf9b-f82e-47ad-80c9-8643bb18d130.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [024de126-e1b0-4dc4-8deb-8be929703e4f](https://musicbrainz.org/recording/024de126-e1b0-4dc4-8deb-8be929703e4f) | Blessings | 301000 | USUM71501601 | Big Sean, Drake, Ye | Blessings |
| [9a543e34-6b74-4b55-b34a-5dbfa16016ab](https://musicbrainz.org/recording/9a543e34-6b74-4b55-b34a-5dbfa16016ab) | Blessings | 252000 |  | Big Sean, Drake | Bravo Black Hits, Vol. 32 |
| [dd12720f-a60d-4fc1-8b4c-1cbca843b493](https://musicbrainz.org/recording/dd12720f-a60d-4fc1-8b4c-1cbca843b493) | Blessings | 252133 | USUM71501158 | Big Sean, Drake | Dark Sky Paradise |

### 100 — The Game

Selected recording: https://musicbrainz.org/recording/43086aa9-ea7b-4178-9a5c-97fdc4999db6; internal UUID: 4a516f57-790e-4dcf-8d5b-8b5c1fc536bb.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [dd3e0246-db32-4e13-aea7-e73890167d55](https://musicbrainz.org/recording/dd3e0246-db32-4e13-aea7-e73890167d55) | 100 | 244000 |  | DJ Hard Hitta, Boo Rossini, 2 Chainz, Yo Gotti | Street Work, Volume 7: Beat the Heat (Edition) |

### My Way (Remix) — Fetty Wap

Selected recording: https://musicbrainz.org/recording/10be3c23-69ea-4d13-8311-2e64ce0dfa81; internal UUID: 0773eed9-9077-47f8-a29d-b70f4c42c853.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [ca2740fb-f22f-4d88-88b3-9b7a44b07f44](https://musicbrainz.org/recording/ca2740fb-f22f-4d88-88b3-9b7a44b07f44) | My Way (Flosstradamus x 4B remix) | 245000 |  | Fetty Wap, Drake | My Way (Flosstradamus x 4B remix) |
| [d303b62a-c9f9-4292-a767-8054b0a84e38](https://musicbrainz.org/recording/d303b62a-c9f9-4292-a767-8054b0a84e38) | My Way (PhatCap! remix) | 154000 |  | Fetty Wap, Drake | International Club Mix (Hosted By Amelia Maltepe) |

### Work — Rihanna

Selected recording: https://musicbrainz.org/recording/771e2d85-e47a-4438-bfd4-c760b97786cf; internal UUID: ac82427e-d761-4269-820d-4d5af0c526d5.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [36c030de-a2d9-4fce-bf89-9581914e4b0a](https://musicbrainz.org/recording/36c030de-a2d9-4fce-bf89-9581914e4b0a) | Work | 219339 | QM5FT1600103 | Rihanna, Drake | ANTI |
| [0ddf6048-e60a-4b1c-9acb-101dc6783d4a](https://musicbrainz.org/recording/0ddf6048-e60a-4b1c-9acb-101dc6783d4a) | Work | 245000 |  | Ciara, Missy Elliott | Once Upon a Time in 2009 |
| [a9d4f1a1-f4ca-43c8-9e49-866dce848fdd](https://musicbrainz.org/recording/a9d4f1a1-f4ca-43c8-9e49-866dce848fdd) | Work | 219000 | USUG12300748 | Rihanna, Drake | ANTI |

### Come and See Me — PARTYNEXTDOOR

Selected recording: https://musicbrainz.org/recording/d2bb360e-d567-4ab2-8d64-21c00c7ad894; internal UUID: c91b251d-ad89-4e91-aa7a-9554e54704e3.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [c510d883-272a-45e9-9fd0-2abfe0718ba7](https://musicbrainz.org/recording/c510d883-272a-45e9-9fd0-2abfe0718ba7) | Come and See Me |  |  | PARTYNEXTDOOR, Drake | NBA2K17 |
| [d540c381-3c28-4c92-84ec-13dc3ba9100a](https://musicbrainz.org/recording/d540c381-3c28-4c92-84ec-13dc3ba9100a) | Come and See Me | 235000 |  | PARTYNEXTDOOR, Drake | Come and See Me |

### Why You Always Hatin? — YG

Selected recording: https://musicbrainz.org/recording/1b863fcd-15a1-499d-9c0c-3a6c0b2bc966; internal UUID: 92896e31-88d7-4831-aa07-50244b9da08c.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [f9819f04-52e3-4617-a40b-cc513fada6df](https://musicbrainz.org/recording/f9819f04-52e3-4617-a40b-cc513fada6df) | Why You Always Hatin? | 198000 |  | YG, Drake, Kamaiyah | Why You Always Hatin? |

### No Shopping — French Montana

Selected recording: https://musicbrainz.org/recording/19a5617b-b7dc-459a-8512-f772c1217b10; internal UUID: 3ea2420a-5758-4b2e-b479-91b332952809.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [36026c75-57ae-422b-a527-7af09ced40d8](https://musicbrainz.org/recording/36026c75-57ae-422b-a527-7af09ced40d8) | No Shopping | 227000 | USCM51600277 | French Montana, Drake | MC4 |

### Big Amount — 2 Chainz

Selected recording: https://musicbrainz.org/recording/69887b08-5c6f-407b-a357-40bae6d6fcf1; internal UUID: 2a47ed29-f4a7-4e36-a33d-cdb68a8df789.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [143dd067-0de7-480b-9e66-5c95601ff833](https://musicbrainz.org/recording/143dd067-0de7-480b-9e66-5c95601ff833) | Big Amount | 193000 |  | 2 Chainz, Drake | Daniel Son Necklace Don, Vol. 2 |
| [ad93defb-bfee-4ac4-94da-3d6d551686e8](https://musicbrainz.org/recording/ad93defb-bfee-4ac4-94da-3d6d551686e8) | Big Amount | 187000 |  | 2 Chainz, Drake | Big Amount |

### Look Alive — BlocBoy JB

Selected recording: https://musicbrainz.org/recording/6f059dc4-3541-498c-b2ac-4adbf3bd3a7f; internal UUID: 06597c9d-d344-4418-97d2-1f49ce578d42.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [5eac11db-866f-4d06-9254-66d81bb9cb26](https://musicbrainz.org/recording/5eac11db-866f-4d06-9254-66d81bb9cb26) | LookAlive | 169600 |  | Cookin’ Soul, Drake | LOFI PAPI |
| [ad527ac2-8130-4e07-bc0b-944c6d571b5b](https://musicbrainz.org/recording/ad527ac2-8130-4e07-bc0b-944c6d571b5b) | Look Alive | 182200 | USWB11800247 | BlocBoy JB, Drake | Now That’s What I Call Music! 99 |

### Yes Indeed — Lil Baby

Selected recording: https://musicbrainz.org/recording/26458ed5-62fd-4132-9e9a-11c74d27d24d; internal UUID: b87e7c19-65c5-43dc-8335-123e9a4c3020.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [956cd6c6-5bf0-459f-893d-b36ba6f9908f](https://musicbrainz.org/recording/956cd6c6-5bf0-459f-893d-b36ba6f9908f) | YesIndeed | 156000 |  | Cookin’ Soul, Drake | LOFI PAPI |

### SICKO MODE — Travis Scott

Selected recording: https://musicbrainz.org/recording/b7326a80-8332-4ee0-8238-d6737efba347; internal UUID: 5e9e294a-7e5b-4f3b-9133-0eb3727a7f71.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [695f4cb9-3389-4e96-9ee8-7f43694e7f4d](https://musicbrainz.org/recording/695f4cb9-3389-4e96-9ee8-7f43694e7f4d) | SickoMode | 155676 |  | Cookin’ Soul, Drake | LOFI PAPI |

### No Stylist — French Montana

Selected recording: https://musicbrainz.org/recording/31ecbfef-cc37-4a81-9a2d-17feff942c11; internal UUID: 35208067-c804-4eea-987d-b1f6925e936c.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [c444e189-3407-4775-9563-5775b93d4341](https://musicbrainz.org/recording/c444e189-3407-4775-9563-5775b93d4341) | NoStylist | 150769 |  | Cookin’ Soul, Drake | LOFI PAPI |
| [a67ee637-e35b-4fec-a1bc-62b88bea5722](https://musicbrainz.org/recording/a67ee637-e35b-4fec-a1bc-62b88bea5722) | No Stylist | 192000 | USSM11807535 | French Montana, Drake | No Stylist |
| [1501809f-f64f-4294-902f-17f12cc612ad](https://musicbrainz.org/recording/1501809f-f64f-4294-902f-17f12cc612ad) | No Stylist | 192000 | USSM11807536 | French Montana, Drake | No Stylist |
| [4eb10ad1-1955-4ef8-9386-982eed35b2ef](https://musicbrainz.org/recording/4eb10ad1-1955-4ef8-9386-982eed35b2ef) | No Stylist | 243640 | QZ22B2022999 | French Montana, Drake, Freszko | No Stylist |

### MIA — Bad Bunny

Selected recording: https://musicbrainz.org/recording/9611378b-f76b-4795-b61d-da9e0ee07850; internal UUID: 60d23d99-139a-44b3-b929-62f8ec04f2c4.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [90f8520c-561a-47c8-a2ef-51dc231954cb](https://musicbrainz.org/recording/90f8520c-561a-47c8-a2ef-51dc231954cb) | M.I.A. | 237000 |  | Omarion, Wale | two tens mellow rap |

### Girls Need Love (Remix) — Summer Walker

Selected recording: https://musicbrainz.org/recording/7af02def-5946-4ac9-9478-a3de97ee497e; internal UUID: aea36d5c-cd6b-4255-9bf1-632e2cfa221a.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [63abc389-28b5-4734-8677-405768ae1064](https://musicbrainz.org/recording/63abc389-28b5-4734-8677-405768ae1064) | Girls Need Love (remix) | 222374 | USUM71903144 | Summer Walker, Drake | Last Day of Summer |

### Going Bad — Meek Mill

Selected recording: https://musicbrainz.org/recording/db552013-745d-457b-bc23-94369888d6d6; internal UUID: 5bef0935-9c38-4434-b0cf-027a9782d34a.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [33ea0ad8-80c0-4308-b964-9177526a7a94](https://musicbrainz.org/recording/33ea0ad8-80c0-4308-b964-9177526a7a94) | Going Bad | 180522 | USAT21812711 | Meek Mill, Drake | Championships |
| [f83cb6ef-6f71-4f2e-a5e9-25d98b12dfe3](https://musicbrainz.org/recording/f83cb6ef-6f71-4f2e-a5e9-25d98b12dfe3) | Going Bad | 180522 | USAT21812711 | Meek Mill, Drake | This Is Hip Hop |

### No Guidance — Chris Brown

Selected recording: https://musicbrainz.org/recording/73fa99d7-300f-4779-9156-c683f7df82d1; internal UUID: 9ff0cb5b-12d9-424f-b30a-ca835bdbab6a.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [f039e164-384a-454f-b7d1-7a7595fec344](https://musicbrainz.org/recording/f039e164-384a-454f-b7d1-7a7595fec344) | No Guidance | 260645 | USRC11901584 | Chris Brown, Drake | Indigo |

### Gold Roses — Rick Ross

Selected recording: https://musicbrainz.org/recording/e633a96a-4941-4772-81c1-611e084e66b7; internal UUID: c284ec6f-f002-47a0-9d25-762328bb3344.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [201ef778-21fc-4e3d-9390-77e3ca88b078](https://musicbrainz.org/recording/201ef778-21fc-4e3d-9390-77e3ca88b078) | Gold Roses | 348120 | USSM11904588 | Rick Ross, Drake | Port of Miami 2 |

### Life Is Good — Future

Selected recording: https://musicbrainz.org/recording/df9467b2-f33f-418b-8c0e-33e1da78f5b8; internal UUID: 842e337c-a2e8-4b3f-8a04-f456d6ffd104.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [03365c43-b4d2-4a8d-9ba9-96440afb4d66](https://musicbrainz.org/recording/03365c43-b4d2-4a8d-9ba9-96440afb4d66) | Life Is Good | 237918 | USSM11914963 | Future, Drake | High Off Life |

### Oprah's Bank Account — Lil Yachty

Selected recording: https://musicbrainz.org/recording/345b5b2c-6dad-4273-b953-fb76d9627857; internal UUID: 444e412b-38e2-49e7-ae93-254be4bd0867.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [c8cb1e13-6727-4c00-a51e-84e3d54bddb5](https://musicbrainz.org/recording/c8cb1e13-6727-4c00-a51e-84e3d54bddb5) | Oprah’s Bank Account | 544638 |  | Lil Yachty | Lil Boat 3.5 |
| [a5b8c284-72a4-49c8-8e9d-199a5bd7142d](https://musicbrainz.org/recording/a5b8c284-72a4-49c8-8e9d-199a5bd7142d) | Oprah’s Bank Account | 205000 | USUG11902885 | Lil Yachty, Drake, DaBaby | Oprah’s Bank Account |

### BB King Freestyle — Lil Wayne

Selected recording: https://musicbrainz.org/recording/79a6ee71-55b0-4d60-a793-af2fde24835c; internal UUID: 1106d257-f889-409e-b445-76a4f0009aa9.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [8aaea0de-ef1a-401f-8a88-ce0e7b52ed00](https://musicbrainz.org/recording/8aaea0de-ef1a-401f-8a88-ce0e7b52ed00) | BB KING FREESTYLE | 272000 |  | Lil Wayne, Drake | No Ceilings 3 |

### Over the Top — Smiley

Selected recording: https://musicbrainz.org/recording/6769ead0-b1a2-4573-aa07-1ffde349dd6f; internal UUID: 13c7404e-5902-410b-b0b9-599b792b703a.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [72f36b54-38b6-4bb7-8fc0-b90363e62fd9](https://musicbrainz.org/recording/72f36b54-38b6-4bb7-8fc0-b90363e62fd9) | Over the Top | 153406 | USWB12102368 | Smiley, Drake | Over the Top |

### I'm on One — Future

Selected recording: https://musicbrainz.org/recording/3c91bfc8-a493-452b-86d9-a9420b9c2ed3; internal UUID: 77de7ee3-2af4-4085-aabc-1f53fe2b761e.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [cb300141-1bfb-4e6e-9f6d-e7365501005e](https://musicbrainz.org/recording/cb300141-1bfb-4e6e-9f6d-e7365501005e) | I'm On One | 298000 | FR0Z50036503 | DJ Khaled, Drake | Once Upon a Time in 2011 |
| [0307e822-2973-49bf-a364-db0e90bcb81d](https://musicbrainz.org/recording/0307e822-2973-49bf-a364-db0e90bcb81d) | I'm on One (explicit) | 297813 |  | DJ Khaled, Drake, Rick Ross, Lil Wayne | Best of Black '11 |
| [3b7c6f9d-67c4-4bb5-8835-75a9fa706317](https://musicbrainz.org/recording/3b7c6f9d-67c4-4bb5-8835-75a9fa706317) | I’m on One | 319000 | USQY51100695 | DJ Hard Hitta, Drake, Trae, Rick Ross, Lil Wayne | Street Work, Volume 7: Beat the Heat (Edition) |
| [40a162ab-cc70-46f8-b70b-b8458099065b](https://musicbrainz.org/recording/40a162ab-cc70-46f8-b70b-b8458099065b) | I’m on One | 299893 |  | DJ Khaled, Drake, Rick Ross, Lil Wayne | Anthems: Hip-Hop III |
| [4ed60ca6-d696-40e8-9903-9866eae16b2b](https://musicbrainz.org/recording/4ed60ca6-d696-40e8-9903-9866eae16b2b) | I’m On One (clean) | 296000 |  | DJ Khaled, Drake, Lil Wayne, Rick Ross | Promo Only: Urban Radio, July 2011 |
| [46ad6352-3475-4561-a09b-86be41315fdc](https://musicbrainz.org/recording/46ad6352-3475-4561-a09b-86be41315fdc) | I'm On One | 294333 |  | DJ Khaled, Drake, Rick Ross, Lil Wayne | Anthems Hip-Hop II |
| [6283a923-45d7-48ad-b98d-3eae0dfae438](https://musicbrainz.org/recording/6283a923-45d7-48ad-b98d-3eae0dfae438) | I’m on One | 296133 |  | DJ Khaled, Drake, Rick Ross, Lil Wayne | We the Best Forever |
| [63cb5144-3a6e-4e35-ac58-5cf51a99cd6a](https://musicbrainz.org/recording/63cb5144-3a6e-4e35-ac58-5cf51a99cd6a) | I’m on One | 277000 |  | Big Sloan, Drake, Lil Wayne, D-Rado | Exacta Standardz |
| [83fdc5df-fd83-40e1-8d27-0cc23c39a25c](https://musicbrainz.org/recording/83fdc5df-fd83-40e1-8d27-0cc23c39a25c) | I’m on One | 296000 | USCM51100126 | DJ Khaled, Drake, Rick Ross, Lil Wayne | I’m on One |

### WAIT FOR U — Future

Selected recording: https://musicbrainz.org/recording/1185dba0-4802-48a4-9441-e6259a3d84b0; internal UUID: 02a01dcc-fa15-470b-8e36-929d304a6a3c.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [413a7bba-e136-4524-9c53-ab0f8c051681](https://musicbrainz.org/recording/413a7bba-e136-4524-9c53-ab0f8c051681) | WAIT FOR U | 189893 | USSM12203878 | Future, Drake, Tems | I NEVER LIKED YOU |
| [acdd2f28-0fcc-4b89-8986-33aac90aa17a](https://musicbrainz.org/recording/acdd2f28-0fcc-4b89-8986-33aac90aa17a) | WAIT FOR U | 190000 |  | Future, Drake, Tems | I NEVER LIKED YOU |

### Churchill Downs — Jack Harlow

Selected recording: https://musicbrainz.org/recording/9973396c-6154-4e85-9016-bf5424aea466; internal UUID: 86f12330-d6ef-4780-b8e0-e05904c279e4.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [43318fd8-3d0f-40e1-88fe-6a3948206e36](https://musicbrainz.org/recording/43318fd8-3d0f-40e1-88fe-6a3948206e36) | Churchill Downs | 309327 | USAT22204919 | Jack Harlow, Drake | Come Home the Kids Miss You |

### STAYING ALIVE — DJ Khaled

Selected recording: https://musicbrainz.org/recording/1f626989-1f7c-428c-99ed-9d5954f30d2d; internal UUID: 782dd6ca-ddc0-4783-846f-07c3b1479204.

| Proposed ID | Source title | Duration ms | ISRC | Artists | Release |
|---|---|---:|---|---|---|
| [9be28dac-7816-43d4-a11f-ac32a2bfb55f](https://musicbrainz.org/recording/9be28dac-7816-43d4-a11f-ac32a2bfb55f) | STAYING ALIVE | 178000 | USSM12206683 | DJ Khaled, Drake, Lil Baby | STAYING ALIVE |

## Every current factual review case

Includes nonblocking spelling/credit/date discrepancies. Supplied fields are never replaced by these facts.

### Digital Girl (Remix) — Jamie Foxx

- Nonblocking: supplied_artist_credit_differs_from_source_credit

    {"supplied":"Jamie Foxx feat. Drake, Kanye West & The-Dream","source":[{"id":"15a5da16-8b89-4047-aefe-81473c97b5b2","name":"Jamie Foxx","creditedName":"Jamie Foxx","joinphrase":" feat. ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":", ","role":"featured","order":1},{"id":"164f0d73-1234-4e2c-8743-d77bf2191051","name":"Ye","creditedName":"Kanye West","joinphrase":" & ","role":"featured","order":2},{"id":"66a4b9d2-d5a6-40b8-93d5-0bdd1dbb4b43","name":"The‐Dream","creditedName":"The‐Dream","joinphrase":"","role":"featured","order":3}],"url":"https://musicbrainz.org/recording/eb72b86a-5d10-4af8-83f8-baacad0a0627","primaryArtists":["Jamie Foxx"]}

### Invented Sex — Trey Songz

- Nonblocking: supplied_title_differs_from_source_title

    {"supplied":"Invented Sex","source":"I Invented Sex","url":"https://musicbrainz.org/recording/c2859d6d-5bd4-4681-9213-e65df08f00ba"}
- Nonblocking: additional_recording_identities_require_review

### Money to Blow — Birdman

- Nonblocking: additional_recording_identities_require_review

### Fed Up — DJ Khaled

- Nonblocking: supplied_artist_credit_differs_from_source_credit

    {"supplied":"DJ Khaled feat. Usher, Young Jeezy, Rick Ross, Drake & Lil Wayne","source":[{"id":"081a2d60-9791-4e05-a075-f1890355eeee","name":"DJ Khaled","creditedName":"DJ Khaled","joinphrase":" feat. ","role":"primary","order":0},{"id":"3414d446-735a-443c-931f-10634f57e5b9","name":"Usher","creditedName":"Usher","joinphrase":", ","role":"featured","order":1},{"id":"dcad99e7-3c3e-4c78-bf8a-68203e17da48","name":"Jeezy","creditedName":"Young Jeezy","joinphrase":", ","role":"featured","order":2},{"id":"13bcb2bb-db37-4397-baf5-e0f085be2d64","name":"Rick Ross","creditedName":"Rick Ross","joinphrase":", ","role":"featured","order":3},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":" & ","role":"featured","order":4},{"id":"ac9a487a-d9d2-4f27-bb23-0f4686488345","name":"Lil Wayne","creditedName":"Lil Wayne","joinphrase":"","role":"featured","order":5}],"url":"https://musicbrainz.org/recording/f5f82e06-4861-46cb-9c11-a07a5a01cc3c","primaryArtists":["DJ Khaled"]}
- Nonblocking: additional_recording_identities_require_review
- Nonblocking: verified_appearance_year_differs_from_supplied_inventory_year

    {"suppliedYear":2009,"earliestMatchedAppearance":"2010-03-02","url":"https://musicbrainz.org/release/f68b6ae1-1ed5-4ae1-ae0a-c83ecfc1f06f","qualification":"Verified appearance date, not a claim about the first-ever release; supplied inventory year is preserved."}

### You Got Me — Lil Wayne

- **Blocking**: no_verified_metadata_match_in_cached_sources

    {"suppliedTitle":"You Got Me","projects":["2010"],"possibleMatches":[],"unverifiedTitleSuggestions":[]}

### Say Something — Timbaland

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Timbaland","suppliedRole":["Feature"],"source":[{"id":"daa09819-5da5-4c7a-8bef-eb372bb27ff1","name":"Timbaland","creditedName":"Timbaland","joinphrase":" with ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":"","role":"primary","order":1}],"url":"https://musicbrainz.org/recording/9dc51669-f015-484c-a164-3b61f822f5fd"}
- Nonblocking: additional_recording_identities_require_review
- Nonblocking: verified_appearance_year_differs_from_supplied_inventory_year

    {"suppliedYear":2010,"earliestMatchedAppearance":"2009-01-01","url":"https://musicbrainz.org/release/62f9e65f-ca17-4d69-ac17-cbea63830126","qualification":"Verified appearance date, not a claim about the first-ever release; supplied inventory year is preserved."}

### Aston Martin Music — Rick Ross

- Nonblocking: supplied_title_differs_from_source_title

    {"supplied":"Aston Martin Music","source":"Aston Martin Music (edit)","url":"https://musicbrainz.org/recording/568c7362-5ea8-4a8e-a2fe-23c18da2407b"}
- Nonblocking: additional_recording_identities_require_review
- Nonblocking: verified_appearance_year_differs_from_supplied_inventory_year

    {"suppliedYear":2010,"earliestMatchedAppearance":"2011","url":"https://musicbrainz.org/release/f74e39e2-0f5a-43d5-8e71-7ffcd4cc0370","qualification":"Verified appearance date, not a claim about the first-ever release; supplied inventory year is preserved."}

### Loving You No More — Diddy – Dirty Money

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Diddy – Dirty Money","suppliedRole":["Feature"],"source":[{"id":"480cdd78-e54e-4518-9ec9-572a62d7e1e1","name":"Diddy – Dirty Money","creditedName":"Diddy - Dirty Money","joinphrase":" & ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":"","role":"primary","order":1}],"url":"https://musicbrainz.org/recording/3f3ab44b-8c96-4a33-967b-ca5b9a6124d7"}

### What's My Name? — Rihanna

- Nonblocking: additional_recording_identities_require_review

### Fall for Your Type — Jamie Foxx

- Nonblocking: additional_recording_identities_require_review

### Moment 4 Life — Nicki Minaj

- Nonblocking: additional_recording_identities_require_review
- Nonblocking: verified_appearance_year_differs_from_supplied_inventory_year

    {"suppliedYear":2010,"earliestMatchedAppearance":"2022-08-26","url":"https://musicbrainz.org/release/ba1ec929-f805-49d0-84a2-6f5642b34154","qualification":"Verified appearance date, not a claim about the first-ever release; supplied inventory year is preserved."}

### In the Morning — J. Cole

- Nonblocking: additional_recording_identities_require_review
- Nonblocking: verified_appearance_year_differs_from_supplied_inventory_year

    {"suppliedYear":2011,"earliestMatchedAppearance":"2010-11-12","url":"https://musicbrainz.org/release/5d4d0579-202b-4b63-9e3b-e2d22c3c1cb5","qualification":"Verified appearance date, not a claim about the first-ever release; supplied inventory year is preserved."}

### Poppin' Bottles — T.I.

- Nonblocking: additional_recording_identities_require_review
- Nonblocking: verified_appearance_year_differs_from_supplied_inventory_year

    {"suppliedYear":2011,"earliestMatchedAppearance":"2010-12-02","url":"https://musicbrainz.org/release/eea749c6-96ed-40a8-99c2-048a44dd676f","qualification":"Verified appearance date, not a claim about the first-ever release; supplied inventory year is preserved."}

### I'm on One — DJ Khaled

- Nonblocking: additional_recording_identities_require_review

### She Will — Lil Wayne

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Lil Wayne","suppliedRole":["Feature"],"source":[{"id":"ac9a487a-d9d2-4f27-bb23-0f4686488345","name":"Lil Wayne","creditedName":"Lil Wayne","joinphrase":" & ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":"","role":"primary","order":1}],"url":"https://musicbrainz.org/recording/958cfb5e-0f39-45b0-87d8-990d8dc0528f"}
- Nonblocking: additional_recording_identities_require_review

### It's Good — Lil Wayne

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Lil Wayne","suppliedRole":["Feature"],"source":[{"id":"ac9a487a-d9d2-4f27-bb23-0f4686488345","name":"Lil Wayne","creditedName":"Lil Wayne","joinphrase":", ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":" & ","role":"primary","order":1},{"id":"83735edd-f2a3-41d0-a31d-652bc3cadb3e","name":"Jadakiss","creditedName":"Jadakiss","joinphrase":"","role":"primary","order":2}],"url":"https://musicbrainz.org/recording/22b9f806-0866-4302-8e9e-77e6310991e0"}

### Round of Applause — Waka Flocka Flame

- Nonblocking: additional_recording_identities_require_review

### No Lie — 2 Chainz

- Nonblocking: additional_recording_identities_require_review

### Amen — Meek Mill

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Meek Mill","suppliedRole":["Feature"],"source":[{"id":"31bcadcc-e1da-4cad-bec8-2f4f1d41b095","name":"Meek Mill","creditedName":"Meek Mill","joinphrase":" & ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":"","role":"primary","order":1}],"url":"https://musicbrainz.org/recording/03b33d21-aadb-487c-8fee-22d6d372ee5e"}
- Nonblocking: additional_recording_identities_require_review

### Enough Said — Aaliyah

- Nonblocking: additional_recording_identities_require_review

### Diced Pineapples — Rick Ross

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Rick Ross","suppliedRole":["Feature"],"source":[{"id":"13bcb2bb-db37-4397-baf5-e0f085be2d64","name":"Rick Ross","creditedName":"Rick Ross","joinphrase":", ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":" & ","role":"primary","order":1},{"id":"e34e41f2-f480-45d3-8190-a3ce5ab34fab","name":"Wale","creditedName":"Wale","joinphrase":"","role":"primary","order":2}],"url":"https://musicbrainz.org/recording/0dcca9c5-31bf-45c0-aea3-2b406c96fc4a"}
- Nonblocking: additional_recording_identities_require_review

### Love Me — Lil Wayne

- Nonblocking: additional_recording_identities_require_review
- Nonblocking: verified_appearance_year_differs_from_supplied_inventory_year

    {"suppliedYear":2012,"earliestMatchedAppearance":"2013-01-18","url":"https://musicbrainz.org/release/b66dc4ae-d5eb-48d4-81f1-07c007821307","qualification":"Verified appearance date, not a claim about the first-ever release; supplied inventory year is preserved."}

### Poetic Justice — Kendrick Lamar

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Kendrick Lamar","suppliedRole":["Feature"],"source":[{"id":"381086ea-f511-4aba-bdf9-71c753dc5077","name":"Kendrick Lamar","creditedName":"Kendrick Lamar","joinphrase":" & ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":"","role":"primary","order":1}],"url":"https://musicbrainz.org/recording/5c2f2e54-328f-4fe6-b3bd-d8a50a1c815e"}
- Nonblocking: additional_recording_identities_require_review

### Who Do You Love? — YG

- Nonblocking: supplied_title_differs_from_source_title

    {"supplied":"Who Do You Love?","source":"Who Do You Love","url":"https://musicbrainz.org/recording/3864aa9f-1ad9-49c6-aa61-6a91eb89aa0b"}
- Nonblocking: additional_recording_identities_require_review
- Nonblocking: verified_appearance_year_differs_from_supplied_inventory_year

    {"suppliedYear":2014,"earliestMatchedAppearance":"2015","url":"https://musicbrainz.org/release/011505e1-9dfe-49fd-8639-6cb11f65e1b6","qualification":"Verified appearance date, not a claim about the first-ever release; supplied inventory year is preserved."}

### Believe Me — Lil Wayne

- Nonblocking: additional_recording_identities_require_review

### Grindin' — Lil Wayne

- Nonblocking: additional_recording_identities_require_review

### Tuesday — ILoveMakonnen

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"ILoveMakonnen","suppliedRole":["Feature"],"source":[{"id":"047c7563-6c32-4619-a0b6-1dcf218b3e1b","name":"iLoveMakonnen","creditedName":"I LOVE MAKONNEN","joinphrase":" & ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":"","role":"primary","order":1}],"url":"https://musicbrainz.org/recording/be904dde-a764-48dd-9d00-dadaab7cd70c"}
- Nonblocking: additional_recording_identities_require_review

### Truffle Butter — Nicki Minaj

- Nonblocking: additional_recording_identities_require_review
- Nonblocking: verified_appearance_year_differs_from_supplied_inventory_year

    {"suppliedYear":2015,"earliestMatchedAppearance":"2014-12-12","url":"https://musicbrainz.org/release/beb47b58-7b33-425c-9a57-664c61717f07","qualification":"Verified appearance date, not a claim about the first-ever release; supplied inventory year is preserved."}

### Blessings — Big Sean

- Nonblocking: additional_recording_identities_require_review

### 100 — The Game

- Nonblocking: additional_recording_identities_require_review

### My Way (Remix) — Fetty Wap

- Nonblocking: additional_recording_identities_require_review

### Work — Rihanna

- Nonblocking: additional_recording_identities_require_review

### Come and See Me — PARTYNEXTDOOR

- Nonblocking: additional_recording_identities_require_review

### Why You Always Hatin? — YG

- Nonblocking: additional_recording_identities_require_review

### No Shopping — French Montana

- Nonblocking: additional_recording_identities_require_review
- Nonblocking: verified_appearance_year_differs_from_supplied_inventory_year

    {"suppliedYear":2016,"earliestMatchedAppearance":"2019-12-06","url":"https://musicbrainz.org/release/d13a8d0c-2507-458c-a8cf-95fcc266ca3a","qualification":"Verified appearance date, not a claim about the first-ever release; supplied inventory year is preserved."}

### Big Amount — 2 Chainz

- Nonblocking: additional_recording_identities_require_review

### No Frauds — Nicki Minaj

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Nicki Minaj","suppliedRole":["Feature / Credit Review"],"source":[{"id":"1036b808-f58c-4a3e-b461-a2c4492ecf1b","name":"Nicki Minaj","creditedName":"Nicki Minaj","joinphrase":", ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":" & ","role":"primary","order":1},{"id":"ac9a487a-d9d2-4f27-bb23-0f4686488345","name":"Lil Wayne","creditedName":"Lil Wayne","joinphrase":"","role":"primary","order":2}],"url":"https://musicbrainz.org/recording/e51b8bca-1c55-4a5c-97c3-c8ca2df171e0"}
- **Blocking**: master_list_requires_performing_credit_verification

    {"roles":["Feature / Credit Review"]}

### Look Alive — BlocBoy JB

- Nonblocking: additional_recording_identities_require_review

### Yes Indeed — Lil Baby

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Lil Baby","suppliedRole":["Feature / Credit Review"],"source":[{"id":"d42a5768-ada1-4fb6-85fd-f61aba6264e0","name":"Lil Baby","creditedName":"Lil Baby","joinphrase":" & ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":"","role":"primary","order":1}],"url":"https://musicbrainz.org/recording/26458ed5-62fd-4132-9e9a-11c74d27d24d"}
- Nonblocking: additional_recording_identities_require_review
- **Blocking**: master_list_requires_performing_credit_verification

    {"roles":["Feature / Credit Review"]}

### Bigger Than You — 2 Chainz

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"2 Chainz","suppliedRole":["Feature"],"source":[{"id":"dff0d392-4cd5-4052-9fbb-f485df3891e5","name":"2 Chainz","creditedName":"2 Chainz","joinphrase":", ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":" & ","role":"primary","order":1},{"id":"6143403a-df6c-429e-8ee6-ef869896b0da","name":"Quavo","creditedName":"Quavo","joinphrase":"","role":"primary","order":2}],"url":"https://musicbrainz.org/recording/fe57f19b-f4bb-4492-b8c5-a235a6780069"}

### SICKO MODE — Travis Scott

- **Blocking**: source_credit_does_not_establish_drake_performance

    {"artists":[{"id":"e4a51f17-a57b-47b1-b37b-f552d0f8e9e6","name":"Travis Scott","creditedName":"Travis Scott","joinphrase":"","role":"primary","order":0}],"url":"https://musicbrainz.org/recording/b7326a80-8332-4ee0-8238-d6737efba347"}
- Nonblocking: supplied_artist_credit_differs_from_source_credit

    {"supplied":"Travis Scott; Drake performs on recording","source":[{"id":"e4a51f17-a57b-47b1-b37b-f552d0f8e9e6","name":"Travis Scott","creditedName":"Travis Scott","joinphrase":"","role":"primary","order":0}],"url":"https://musicbrainz.org/recording/b7326a80-8332-4ee0-8238-d6737efba347","primaryArtists":["Travis Scott"]}
- Nonblocking: additional_recording_identities_require_review
- **Blocking**: master_list_requires_performing_credit_verification

    {"roles":["Guest Performance / Credit Review"]}

### No Stylist — French Montana

- Nonblocking: additional_recording_identities_require_review

### MIA — Bad Bunny

- Nonblocking: additional_recording_identities_require_review

### Never Recover — Lil Baby & Gunna

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Lil Baby & Gunna","suppliedRole":["Feature / Credit Review"],"source":[{"id":"d42a5768-ada1-4fb6-85fd-f61aba6264e0","name":"Lil Baby","creditedName":"Lil Baby","joinphrase":", ","role":"primary","order":0},{"id":"100b8734-f4f0-4536-9960-47f7c59d1b4c","name":"Gunna","creditedName":"Gunna","joinphrase":" & ","role":"primary","order":1},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":"","role":"primary","order":2}],"url":"https://musicbrainz.org/recording/764944d6-f45f-497b-a695-edb30100e13c"}
- **Blocking**: master_list_requires_performing_credit_verification

    {"roles":["Feature / Credit Review"]}

### Girls Need Love (Remix) — Summer Walker

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Summer Walker","suppliedRole":["Feature / Credit Review"],"source":[{"id":"9167f739-da47-4495-9d63-9c13b40114ac","name":"Summer Walker","creditedName":"Summer Walker","joinphrase":" x ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":"","role":"primary","order":1}],"url":"https://musicbrainz.org/recording/7af02def-5946-4ac9-9478-a3de97ee497e"}
- Nonblocking: additional_recording_identities_require_review
- **Blocking**: master_list_requires_performing_credit_verification

    {"roles":["Feature / Credit Review"]}

### Going Bad — Meek Mill

- Nonblocking: additional_recording_identities_require_review
- Nonblocking: verified_appearance_year_differs_from_supplied_inventory_year

    {"suppliedYear":2019,"earliestMatchedAppearance":"2018-11-30","url":"https://musicbrainz.org/release/c5cc4c1c-7a10-4457-a916-776de96029d1","qualification":"Verified appearance date, not a claim about the first-ever release; supplied inventory year is preserved."}

### No Guidance — Chris Brown

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Chris Brown","suppliedRole":["Feature"],"source":[{"id":"c234fa42-e6a6-443e-937e-2f4b073538a3","name":"Chris Brown","creditedName":"Chris Brown","joinphrase":" & ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":"","role":"primary","order":1}],"url":"https://musicbrainz.org/recording/73fa99d7-300f-4779-9156-c683f7df82d1"}
- Nonblocking: additional_recording_identities_require_review

### Gold Roses — Rick Ross

- Nonblocking: additional_recording_identities_require_review

### Ela É do Tipo (Remix) — Kevin O Chris

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Kevin O Chris","suppliedRole":["Feature"],"source":[{"id":"c5fcb6b9-b5c6-4a2a-a54d-3eff1926830d","name":"Kevin o Chris","creditedName":"Kevin o Chris","joinphrase":" & ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":"","role":"primary","order":1}],"url":"https://musicbrainz.org/recording/9ba76ea9-65cc-4183-b9c7-30ea61d9dc03"}

### Life Is Good — Future

- Nonblocking: additional_recording_identities_require_review

### Oprah's Bank Account — Lil Yachty

- Nonblocking: additional_recording_identities_require_review

### BB King Freestyle — Lil Wayne

- Nonblocking: supplied_title_differs_from_source_title

    {"supplied":"BB King Freestyle","source":"B.B. King Freestyle","url":"https://musicbrainz.org/recording/79a6ee71-55b0-4d60-a793-af2fde24835c"}
- Nonblocking: additional_recording_identities_require_review

### Over the Top — Smiley

- Nonblocking: additional_recording_identities_require_review

### Bubbly — Young Thug

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Young Thug","suppliedRole":["Feature"],"source":[{"id":"800760de-bdf8-43a2-8fe0-44a2401a5515","name":"Young Thug","creditedName":"Young Thug","joinphrase":" with ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":" & ","role":"primary","order":1},{"id":"e4a51f17-a57b-47b1-b37b-f552d0f8e9e6","name":"Travis Scott","creditedName":"Travis Scott","joinphrase":"","role":"primary","order":2}],"url":"https://musicbrainz.org/recording/9271a20b-e5f5-4aaa-875d-5d8cdb979696"}

### Stars Align — Majid Jordan

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Majid Jordan","suppliedRole":["Feature"],"source":[{"id":"abaa7001-0d80-4e58-be5d-d2d246fd9d87","name":"Majid Jordan","creditedName":"Majid Jordan","joinphrase":" with ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":"","role":"primary","order":1}],"url":"https://musicbrainz.org/recording/d50d37e2-f5cc-4d1b-9d41-166aa2af7b12"}

### I'm on One — Future

- Nonblocking: additional_recording_identities_require_review

### WAIT FOR U — Future

- Nonblocking: additional_recording_identities_require_review

### Churchill Downs — Jack Harlow

- Nonblocking: additional_recording_identities_require_review

### STAYING ALIVE — DJ Khaled

- Nonblocking: additional_recording_identities_require_review

### Never Hating — Lil Baby

- **Blocking**: source_credit_does_not_establish_drake_performance

    {"artists":[{"id":"d42a5768-ada1-4fb6-85fd-f61aba6264e0","name":"Lil Baby","creditedName":"Lil Baby","joinphrase":" & ","role":"primary","order":0},{"id":"800760de-bdf8-43a2-8fe0-44a2401a5515","name":"Young Thug","creditedName":"Young Thug","joinphrase":"","role":"primary","order":1}],"url":"https://musicbrainz.org/recording/a6dd2f0b-e7ad-4ff8-87c6-ecfb1bcd69d5"}
- **Blocking**: master_list_requires_performing_credit_verification

    {"roles":["REVIEW — verify Drake performance before import eligibility"]}

### Modo Capone — Chino Pacas

- **Blocking**: feature_list_conflicts_with_joint_primary_source_billing

    {"suppliedPrimary":"Chino Pacas","suppliedRole":["Feature"],"source":[{"id":"d4065b73-145c-4b82-a474-b622474dd5a1","name":"Chino Pacas","creditedName":"Chino Pacas","joinphrase":", ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":" & ","role":"primary","order":1},{"id":"e665ce26-6ce9-4c42-8f6a-7a361a0ba328","name":"Fuerza Regida","creditedName":"Fuerza Regida","joinphrase":"","role":"primary","order":2}],"url":"https://musicbrainz.org/recording/796dd771-4a2f-4678-a3a6-1db66840dbcc"}
- Nonblocking: supplied_artist_credit_differs_from_source_credit

    {"supplied":"Chino Pacas feat. Drake","source":[{"id":"d4065b73-145c-4b82-a474-b622474dd5a1","name":"Chino Pacas","creditedName":"Chino Pacas","joinphrase":", ","role":"primary","order":0},{"id":"9fff2f8a-21e6-47de-a2b8-7f449929d43f","name":"Drake","creditedName":"Drake","joinphrase":" & ","role":"primary","order":1},{"id":"e665ce26-6ce9-4c42-8f6a-7a361a0ba328","name":"Fuerza Regida","creditedName":"Fuerza Regida","joinphrase":"","role":"primary","order":2}],"url":"https://musicbrainz.org/recording/796dd771-4a2f-4678-a3a6-1db66840dbcc","primaryArtists":["Chino Pacas","Drake","Fuerza Regida"]}

