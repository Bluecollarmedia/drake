import { createHash } from 'node:crypto';
import { normalized } from './musicbrainz-identity.mjs';

export const masterTitleKey = value => normalized(value).normalize('NFKD').replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]/gu, '');

export function parseCuratedMaster(text, scope = 'lead_joint_primary') {
  let project = null; let projectPosition = 0;
  const entries = []; const notes = [];
  for (const [index, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line || /^=+$/.test(line)) continue;
    if (line.startsWith('"')) {
      const match = line.match(/^"([^"]+)"\s*(.*?)\s*\|\s*(?:Primary:\s*(.*?)\s*\|\s*)?Credit:\s*(.*?)\s*\|\s*Role:\s*([^|]+?)(?:\s*\|\s*(.+))?$/);
      if (!match || !project) throw new Error(`invalid_master_entry_at_line_${index + 1}`);
      const [, title, qualifier, primary = null, credit, role, suppliedVersion] = match;
      const versionNotes = suppliedVersion || 'Unspecified — requires review';
      if (!suppliedVersion && !/review/i.test(role)) throw new Error(`missing_master_version_at_line_${index + 1}`);
      if (scope === 'feature_guest' && !primary) throw new Error(`missing_primary_at_line_${index + 1}`);
      if (!title.trim() || !credit.trim() || !role.trim()) throw new Error(`empty_master_field_at_line_${index + 1}`);
      const version = !suppliedVersion ? 'unspecified' : /alternate|remix/i.test(versionNotes) ? `remix:${masterTitleKey(qualifier || versionNotes)}` : 'original';
      // Generic names on different projects do not identify the same underlying song.
      const contextual = /^(intro|outro|interlude)$/i.test(title.trim()) ? `:${masterTitleKey(project)}` : '';
      entries.push({ ordinal: entries.length + 1, sourceLine: index + 1, raw: line, title: title.trim(), primary, qualifier: qualifier.trim(), credit: credit.trim(), role: role.trim(), versionNotes: versionNotes.trim(), version,
        project, projectPosition: ++projectPosition, year: Number(project.match(/\b(19|20)\d{2}\b/)?.[0]) || null,
        candidateKey: `${scope}:${masterTitleKey(title)}:${version}${contextual}${primary ? ':' + masterTitleKey(primary) : ''}`, explicitlyReview: /review/i.test(role), nonDsp: /non-DSP/i.test(versionNotes) });
    } else if (/^NOTE:|^SCARY HOURS 3 ADDITIONS:/.test(line)) notes.push({ line: index + 1, text: line, project });
    else if (/^[^a-z]+$/.test(line) && !/^DRAKE — MASTER/.test(line)) { project = line; projectPosition = 0; }
    else notes.push({ line: index + 1, text: line, project });
  }
  if (!entries.length) throw new Error('empty_curated_master');
  const grouped = new Map(); const rawGroups = new Map();
  for (const entry of entries) { grouped.set(entry.candidateKey, [...(grouped.get(entry.candidateKey) || []), entry]); rawGroups.set(entry.raw, [...(rawGroups.get(entry.raw) || []), entry]); }
  const candidates = [...grouped].map(([key, items]) => ({ key, entries: items, title: items[0].title, version: items[0].version, roles: [...new Set(items.map(e => e.role))], explicitlyReview: items.some(e => e.explicitlyReview),
    conflicts: new Set(items.map(e => normalized(e.credit))).size > 1 || new Set(items.map(e => e.role)).size > 1 ? ['master_entries_disagree_on_credit_or_role'] : [] }));
  return { scope, hash: createHash('sha256').update(text).digest('hex'), rawText: text, entries, candidates, notes,
    counts: { totalEntries: entries.length, uniqueCanonicalCandidates: candidates.length, repeatedCanonicalEntries: entries.length - candidates.length, explicitReviewCandidates: candidates.filter(c => c.explicitlyReview).length },
    exactRepeatedText: [...rawGroups.values()].filter(g => g.length > 1).map(g => ({ title: g[0].title, entries: g.map(e => ({ ordinal: e.ordinal, project: e.project, candidateKey: e.candidateKey })), sameCanonicalCandidate: new Set(g.map(e => e.candidateKey)).size === 1 })),
    conflictingCandidates: candidates.filter(c => c.conflicts.length) };
}
