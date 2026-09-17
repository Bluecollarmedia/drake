export interface PrivateStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Small native Keychain entries, atomic manifest switch, and serialized reads/writes.
// Large Auth sessions must not rely on historically limited single Keychain values.
export function createChunkedStorage(storage: PrivateStorage, revision: () => string): PrivateStorage {
  let tail: Promise<unknown> = Promise.resolve();
  function serial<T>(operation: () => Promise<T>) {
    const result = tail.then(operation);
    tail = result.catch(() => {});
    return result;
  }
  function parse(raw: string | null): { revision: string; count: number } | null {
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || !('revision' in value) || !('count' in value)
      || typeof value.revision !== 'string' || !/^[a-f0-9-]{36}$/.test(value.revision)
      || typeof value.count !== 'number' || !Number.isInteger(value.count) || value.count < 1 || value.count > 128) {
      throw new Error('Secure session manifest is invalid.');
    }
    return { revision: value.revision, count: value.count };
  }
  const manifestKey = (key: string) => `${key}.manifest`;
  const chunkKey = (key: string, version: string, index: number) => `${key}.${version}.${index}`;
  const clean = async (key: string, manifest: { revision: string; count: number } | null) => {
    if (manifest) for (let index = 0; index < manifest.count; index++) {
      await storage.removeItem(chunkKey(key, manifest.revision, index));
    }
  };
  return {
    getItem: key => serial(async () => {
      const manifest = parse(await storage.getItem(manifestKey(key)));
      if (!manifest) return null;
      const chunks: string[] = [];
      for (let index = 0; index < manifest.count; index++) {
        const value = await storage.getItem(chunkKey(key, manifest.revision, index));
        if (value === null) throw new Error('Secure session storage is incomplete.');
        chunks.push(value);
      }
      return chunks.join('');
    }),
    setItem: (key, value) => serial(async () => {
      const previous = parse(await storage.getItem(manifestKey(key)));
      const points = Array.from(value);
      const chunks: string[] = [];
      for (let index = 0; index < points.length; index += 384) chunks.push(points.slice(index,index+384).join(''));
      if (!chunks.length) chunks.push('');
      if (chunks.length > 128) throw new Error('Secure session is too large.');
      const next = { revision: revision(), count: chunks.length };
      try {
        for (let index = 0; index < chunks.length; index++) await storage.setItem(chunkKey(key, next.revision, index), chunks[index]);
        await storage.setItem(manifestKey(key), JSON.stringify(next));
      } catch (error) {
        await clean(key, next).catch(() => {});
        throw error;
      }
      // A committed session remains valid even if stale-entry cleanup fails.
      await clean(key, previous).catch(() => {});
    }),
    removeItem: key => serial(async () => {
      const previous = parse(await storage.getItem(manifestKey(key)));
      await storage.removeItem(manifestKey(key));
      await clean(key, previous).catch(() => {});
    }),
  };
}
