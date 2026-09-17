import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { createChunkedStorage, type PrivateStorage } from '@/data/private-storage';

const options: SecureStore.SecureStoreOptions = {
  keychainService: 'com.whichdrake.private', keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};
export const privateStorage: PrivateStorage = {
  getItem: key => SecureStore.getItemAsync(key, options),
  setItem: (key, value) => SecureStore.setItemAsync(key, value, options),
  removeItem: key => SecureStore.deleteItemAsync(key, options),
};
export const sessionStorage = createChunkedStorage(privateStorage, Crypto.randomUUID);
