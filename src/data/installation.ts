import type { PrivateStorage } from './private-storage.ts';
export interface InstallationIdentity { version: 1; id: string; token: string }
export const INSTALLATION_KEY = 'which-drake.installation.v1';
export function decodeInstallation(raw: string): InstallationIdentity {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object') throw new Error('Installation identity is invalid.');
  const record = value as Record<string, unknown>;
  if (record.version !== 1 || typeof record.id !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(record.id)
    || typeof record.token !== 'string' || !/^[a-f0-9]{64}$/.test(record.token)) throw new Error('Installation identity is invalid.');
  return { version: 1, id: record.id, token: record.token };
}
export function createInstallationRepository(storage: PrivateStorage, generate: () => Promise<InstallationIdentity>) {
  let pending: Promise<InstallationIdentity> | null = null;
  return {
    get(): Promise<InstallationIdentity> {
      if (!pending) pending = (async () => {
        const raw = await storage.getItem(INSTALLATION_KEY);
        if (raw !== null) return decodeInstallation(raw);
        const identity = decodeInstallation(JSON.stringify(await generate()));
        await storage.setItem(INSTALLATION_KEY, JSON.stringify(identity));
        return identity;
      })().catch(error => { pending = null; throw error; });
      return pending;
    },
  };
}
