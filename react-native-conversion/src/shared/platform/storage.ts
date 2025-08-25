// React Native storage adapter (localStorage → AsyncStorage)
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

// React Native AsyncStorage implementation
class ReactNativeStorage implements Storage {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      return [];
    }
  }
}

// Web localStorage implementation for comparison
class WebStorage implements Storage {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('localStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('localStorage setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('localStorage clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('localStorage getAllKeys error:', error);
      return [];
    }
  }
}

// Platform-specific storage instance
export const storage: Storage = new ReactNativeStorage();

// Helper functions with error handling and type safety
export const storageHelpers = {
  // Store JSON data
  async setJSON<T>(key: string, data: T): Promise<void> {
    try {
      const jsonString = JSON.stringify(data);
      await storage.setItem(key, jsonString);
    } catch (error) {
      console.error(`Failed to store JSON for key ${key}:`, error);
      throw error;
    }
  },

  // Retrieve JSON data
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await storage.getItem(key);
      if (jsonString === null) return null;
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`Failed to retrieve JSON for key ${key}:`, error);
      return null;
    }
  },

  // Store with expiration
  async setWithExpiry<T>(key: string, data: T, expiryInMs: number): Promise<void> {
    try {
      const expiryTime = Date.now() + expiryInMs;
      const dataWithExpiry = {
        data,
        expiry: expiryTime,
      };
      await storageHelpers.setJSON(key, dataWithExpiry);
    } catch (error) {
      console.error(`Failed to store data with expiry for key ${key}:`, error);
      throw error;
    }
  },

  // Get with expiration check
  async getWithExpiry<T>(key: string): Promise<T | null> {
    try {
      const dataWithExpiry = await storageHelpers.getJSON<{data: T; expiry: number}>(key);
      if (!dataWithExpiry) return null;

      if (Date.now() > dataWithExpiry.expiry) {
        // Data has expired, remove it
        await storage.removeItem(key);
        return null;
      }

      return dataWithExpiry.data;
    } catch (error) {
      console.error(`Failed to retrieve data with expiry for key ${key}:`, error);
      return null;
    }
  },

  // Batch operations
  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await Promise.all(
        keyValuePairs.map(([key, value]) => storage.setItem(key, value))
      );
    } catch (error) {
      console.error('Failed to perform multiSet:', error);
      throw error;
    }
  },

  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    try {
      const results = await Promise.all(
        keys.map(async (key) => {
          const value = await storage.getItem(key);
          return [key, value] as [string, string | null];
        })
      );
      return results;
    } catch (error) {
      console.error('Failed to perform multiGet:', error);
      return keys.map(key => [key, null]);
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map(key => storage.removeItem(key)));
    } catch (error) {
      console.error('Failed to perform multiRemove:', error);
      throw error;
    }
  },

  // Get storage info
  async getStorageSize(): Promise<number> {
    try {
      const keys = await storage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await storage.getItem(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  },

  // Clear expired items
  async clearExpired(): Promise<number> {
    try {
      const keys = await storage.getAllKeys();
      let clearedCount = 0;
      
      for (const key of keys) {
        try {
          const value = await storage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            if (parsed.expiry && Date.now() > parsed.expiry) {
              await storage.removeItem(key);
              clearedCount++;
            }
          }
        } catch {
          // Not a JSON value with expiry, skip
        }
      }
      
      return clearedCount;
    } catch (error) {
      console.error('Failed to clear expired items:', error);
      return 0;
    }
  },
};

export default storage;
