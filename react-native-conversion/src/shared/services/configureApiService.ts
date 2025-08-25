// Configure the shared API service for React Native platform
import { setPlatformFetch, setAuthTokenGetter } from './apiService';
import { platformFetch } from '../platform/fetch';
import { storage } from '../platform/storage';
import { STORAGE_KEYS } from '../constants';

// Configure platform-specific fetch for React Native
export const configureApiServiceForReactNative = () => {
  // Set the React Native fetch implementation
  setPlatformFetch(platformFetch);

  // Set the auth token getter for React Native (AsyncStorage)
  setAuthTokenGetter(async () => {
    try {
      return await storage.getItem(STORAGE_KEYS.authToken);
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  });

  console.log('API service configured for React Native platform');
};

// Auth token management for React Native
export const authTokenManager = {
  async setToken(token: string): Promise<void> {
    try {
      await storage.setItem(STORAGE_KEYS.authToken, token);
    } catch (error) {
      console.error('Failed to store auth token:', error);
      throw error;
    }
  },

  async getToken(): Promise<string | null> {
    try {
      return await storage.getItem(STORAGE_KEYS.authToken);
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  },

  async removeToken(): Promise<void> {
    try {
      await storage.removeItem(STORAGE_KEYS.authToken);
    } catch (error) {
      console.error('Failed to remove auth token:', error);
      throw error;
    }
  },

  async hasValidToken(): Promise<boolean> {
    const token = await authTokenManager.getToken();
    return token !== null && token.length > 0;
  },
};

export default {
  configureApiServiceForReactNative,
  authTokenManager,
};
