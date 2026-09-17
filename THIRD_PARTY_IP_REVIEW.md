# Which Drake? — Third-Party IP and Platform Review

**Assessment date:** September 16, 2026  
**Status:** Internal issue inventory, not a legal opinion.

> **LEGAL REVIEW REQUIRED BEFORE PAID PUBLIC LAUNCH.** The product name and central experience identify a living artist and commercial recordings. A disclaimer alone does not resolve copyright, trademark, publicity, false-endorsement, or platform-contract risk.

| Element | Current source/use | Permission or license status | Material issue / action |
|---|---|---|---|
| “Drake” in **Which Drake?** | Product name, UI, recommendation output | No license documented | High false-affiliation, trademark, unfair-competition, and publicity-risk question. Counsel must assess the name and overall presentation before launch. |
| WD? logo | User-supplied image, packaged in app | Ownership/commission/license not documented | **OWNER CONFIRMATION REQUIRED:** preserve source agreement and confirm commercial rights; counsel should clear mark availability. |
| Song titles | Catalog and results | Factual/title use; no permission documented | Titles are generally treated differently from full works, but contextual trademark/consumer-confusion review remains necessary. |
| Album/project titles | Catalog/results | Factual metadata | Same clearance issue; avoid implying official status. |
| Artist names/credits | Catalog/results | Factual identification | Use accurate credits and avoid endorsement implications. Living-person/publicity issues require counsel review in the product context. |
| Album artwork | Runtime URLs derived from MusicBrainz/Cover Art Archive | No commercial artwork license documented | **Do not ship as cleared.** Metadata availability is not copyright permission. Obtain authorized provider artwork under applicable terms or use an owned placeholder. Review caching/cropping requirements. |
| Artist photographs | None intentionally packaged | None | Keep absent unless separately licensed. |
| OVO marks/imagery | None intentionally used | None | Keep absent unless licensed. |
| Spotify mark | Generated from Simple Icons; displayed with outbound service action | Simple Icons source; Spotify approval/compliance not established | Spotify's design guidance requires correct attribution and link-back when using Spotify metadata/content. Replace with an approved current asset/use or remove until reviewed. Do not recolor/distort/crop contrary to rules. |
| Apple Music mark | Generated from Simple Icons; displayed with outbound service action | Apple brand/API authorization not established | Follow Apple's current badge/identity guidelines and MusicKit/affiliate terms if used. Replace with official approved assets where required. |
| Spotify/Apple Music links | Provider URLs where present | Provider/API terms not fully configured | Deep links to publicly available pages still require accurate source and brand treatment. Provider SDK/API integrations need separate approval/configuration review. |
| Music metadata | Curated lists enriched using MusicBrainz and Cover Art Archive | MusicBrainz data licenses vary by dataset; attribution/commercial-use obligations need mapping | Preserve provenance per field and publish any required attribution. Do not assume artwork inherits MusicBrainz metadata licensing. |
| Lyrics | Not stored, scraped, displayed, or intentionally quoted | N/A | Keep excluded without a lyrics license. Audit generated explanations for accidental lyric reproduction. |
| Audio/snippets | None | N/A | Keep excluded unless licensed through an authorized service and its playback rules. |
| Recommendation explanations | Original AI-generated prose grounded in semantic profiles | OpenAI terms apply; underlying song-description risk remains | Add output review/anti-quotation tests and do not market explanations as official artist interpretations. |
| Screenshots/marketing | Not finalized | No clearance completed | Do not put uncleared artwork, artist photos, lyrics, Spotify/Apple marks, or endorsement-like copy in App Store or website assets. |

## Current implementation findings

- The repository no longer packages the temporary *Take Care* reference artwork. Runtime artwork URLs can still surface third-party cover images and remain unresolved.
- The UI does not intentionally contain Drake portraits, OVO imagery, lyrics, audio, or music snippets.
- The Terms draft states there is no endorsement, sponsorship, affiliation, or partnership. That statement is useful disclosure but does not itself cure a confusing product name or trade dress.
- Recommendations link to third-party services; Which Drake? must not imply control over availability or platform terms.

## Required owner records

1. Chain of title/license for the WD? logo and all app/marketing art.
2. A provider-by-provider metadata, artwork, badge, and link provenance register.
3. Written legal clearance for the product/app/company name and store listing.
4. A process to remove or replace disputed metadata/artwork promptly.
5. Final App Store screenshots and marketing copy reviewed with the same standards as the app.

## Current official references

- [Spotify Design & Branding Guidelines](https://developer.spotify.com/documentation/design)
- [Spotify Developer Terms](https://developer.spotify.com/terms)
- [Apple Music Identity Guidelines](https://help.apple.com/itc/musicspec/)
- [MusicBrainz database licensing](https://musicbrainz.org/doc/MusicBrainz_Database/License)
- [Cover Art Archive documentation](https://musicbrainz.org/doc/Cover_Art_Archive)

## Decision

The app is **not cleared for a paid public launch** based on this technical inventory. Attorney review is required for the artist-centered product name/branding and commercial use of artwork, artist/song references, and provider marks.
