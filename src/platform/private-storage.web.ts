import type { PrivateStorage } from '@/data/private-storage';

// Browser preview uses origin-scoped storage. This does not provide native Keychain guarantees.
export const privateStorage: PrivateStorage = {
  async getItem(key) { return typeof window === 'undefined' ? null : window.localStorage.getItem(key); },
  async setItem(key, value) {
    if (typeof window === 'undefined') throw new Error('Browser storage is unavailable.');
    window.localStorage.setItem(key, value);
  },
  async removeItem(key) { if (typeof window !== 'undefined') window.localStorage.removeItem(key); },
};
export const sessionStorage = privateStorage;
