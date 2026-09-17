import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLocalRepository, decodeLocalState, STORAGE_KEY } from '../src/data/local-state.ts';

test('first install and corrupt storage return an unselected music service', () => {
  for (const value of [null, '', '{bad', 'null', '42', '{"version":2,"musicService":"spotify"}']) {
    assert.deepEqual(decodeLocalState(value), { version: 1, musicService: null, savedSongIds: [] });
  }
});
test('invalid providers and malformed saved records cannot enter application state', () => {
  assert.deepEqual(decodeLocalState(JSON.stringify({ version: 1, musicService: 'unknown', savedSongIds: ['one', 'one', null, 5, 'two'] })), {
    version: 1, musicService: null, savedSongIds: ['one', 'two'],
  });
});
test('provider changes and saved songs survive a repository reload', async () => {
  const memory = new Map<string, string>();
  const repository = createLocalRepository({ getItem: async key => memory.get(key) ?? null, setItem: async (key, value) => { memory.set(key, value); } });
  await repository.save({ version: 1, musicService: 'spotify', savedSongIds: ['phase1-take-care'] });
  assert.equal((await repository.load()).musicService, 'spotify');
  await repository.save({ version: 1, musicService: 'apple', savedSongIds: ['phase1-take-care'] });
  assert.deepEqual(await repository.load(), { version: 1, musicService: 'apple', savedSongIds: ['phase1-take-care'] });
  assert.ok(memory.has(STORAGE_KEY));
});
test('storage failures propagate so the UI does not claim a change was saved', async () => {
  const repository = createLocalRepository({ getItem: async () => { throw new Error('read failed'); }, setItem: async () => { throw new Error('disk full'); } });
  await assert.rejects(repository.load(), /read failed/);
  await assert.rejects(repository.save({ version: 1, musicService: 'apple', savedSongIds: [] }), /disk full/);
});
