import * as Crypto from 'expo-crypto';
import { createInstallationRepository } from '@/data/installation';
import { privateStorage } from './private-storage';
export async function randomToken() {
  // Async API uses native secure entropy, including in development; no Math.random fallback.
  return Array.from(await Crypto.getRandomBytesAsync(32), value => value.toString(16).padStart(2, '0')).join('');
}
export const installationRepository = createInstallationRepository(privateStorage, async () => ({
  version: 1, id: Crypto.randomUUID(), token: await randomToken(),
}));
