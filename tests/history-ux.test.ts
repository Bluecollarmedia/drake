import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { chooseStarterPrompts, starterPromptPool } from '../src/features/recommendations/starter-prompts.ts';

test('starter prompts choose six unique situations from a curated session pool', () => {
  assert.ok(starterPromptPool.length >= 20 && starterPromptPool.length <= 30);
  const first = chooseStarterPrompts(() => 0.42);
  const second = chooseStarterPrompts(() => 0.42);
  assert.equal(first.length, 6);
  assert.equal(new Set(first).size, 6);
  assert.deepEqual(first, second);
});

test('starter prompt taps populate the draft without submitting', async () => {
  const source = await readFile(new URL('../src/app/(tabs)/home/index.tsx', import.meta.url), 'utf8');
  assert.match(source, /onPress=\{\(\) => recommendation\.setDraft\(example\)\}/);
  assert.doesNotMatch(source, /setDraft\(example\)[\s\S]{0,80}submit/);
});

test('History is owner-only and clients cannot insert or update it', async () => {
  const migration = await readFile(new URL('../supabase/migrations/20260916001400_recommendation_history.sql', import.meta.url), 'utf8');
  assert.match(migration, /enable row level security/);
  assert.match(migration, /grant select, delete on public\.recommendation_history to authenticated/);
  assert.doesNotMatch(migration, /grant[^;]*insert[^;]*authenticated/i);
  assert.match(migration, /for select to authenticated using \(user_id = auth\.uid\(\)\)/);
  assert.match(migration, /for delete to authenticated using \(user_id = auth\.uid\(\)\)/);
});

test('successful matches create History and reopened results do not call the model', async () => {
  const server = await readFile(new URL('../supabase/functions/recommend/index.ts', import.meta.url), 'utf8');
  const history = await readFile(new URL('../src/app/(tabs)/history.tsx', import.meta.url), 'utf8');
  assert.match(server, /from\('recommendation_history'\)\.upsert/);
  assert.match(server, /reranked\.result\.outcome==='match'/);
  assert.match(history, /recommendation\.showHistory\(song, item\.situation\)/);
  assert.doesNotMatch(history, /requestRecommendation|recommendation\.submit/);
});

test('clearing History cannot clear Saved', async () => {
  const source = await readFile(new URL('../src/data/recommendation-history.ts', import.meta.url), 'utf8');
  const clearFunction = source.slice(source.indexOf('export async function clearRecommendationHistory'));
  assert.match(clearFunction, /from\('recommendation_history'\)\.delete\(\)/);
  assert.doesNotMatch(clearFunction, /saved_recommendations/);
});

test('validation and backend failures use distinct copy and retry behavior', async () => {
  const data = await readFile(new URL('../src/data/recommendations.ts', import.meta.url), 'utf8');
  const state = await readFile(new URL('../src/state/recommendation-state.tsx', import.meta.url), 'utf8');
  const home = await readFile(new URL('../src/app/(tabs)/home/index.tsx', import.meta.url), 'utf8');
  assert.match(data, /Add a little more detail so we can find the right fit\./);
  assert.match(data, /recommendation service is temporarily unavailable/i);
  assert.match(state, /setDraftValue[\s\S]{0,180}setErrorText\(null\)/);
  assert.match(home, /neutral=\{recommendation\.errorCode==='too_short'\}/);
  assert.match(home, /\['network','timeout','busy','unavailable'\]/);
});

test('Expo Head handoff integration is absent when Handoff is not configured', async () => {
  const layout = await readFile(new URL('../src/app/_layout.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(layout, /expo-router\/head|<Head/);
});

test('complete legal drafts are synchronized into the app', async () => {
  const generated = await readFile(new URL('../src/legal/legal-documents.ts', import.meta.url), 'utf8');
  const terms = await readFile(new URL('../TERMS_OF_SERVICE.md', import.meta.url), 'utf8');
  const privacy = await readFile(new URL('../PRIVACY_POLICY.md', import.meta.url), 'utf8');
  assert.ok(generated.includes(JSON.stringify(terms)));
  assert.ok(generated.includes(JSON.stringify(privacy)));
  assert.match(generated, /LEGAL REVIEW REQUIRED BEFORE PAID PUBLIC LAUNCH/);
  assert.match(generated, /OWNER\/LEGAL ENTITY REQUIRED/);
});
