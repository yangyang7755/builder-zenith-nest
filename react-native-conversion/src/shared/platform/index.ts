// Platform-specific API adapters for React Native
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as Location from 'expo-location';
import { Alert, Linking, Dimensions, Platform } from 'react-native';

// Storage
export { storage, storageHelpers } from './storage';

// Fetch
export { 
  platformFetch, 
  platformFetchWithRetry, 
  checkNetworkStatus,
  networkUtils,
  httpMethods,
  responseHelpers 
} from './fetch';

// Clipboard API adapter
export const clipboard = {
  async writeText(text: string): Promise<void> {
    try {
      await Clipboard.setStringAsync(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
  },

  async readText(): Promise<string> {
    try {
      return await Clipboard.getStringAsync();
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      return '';
    }
  },

  async hasClipboardPermission(): Promise<boolean> {
    try {
      // On React Native, clipboard access is generally allowed
      return true;
    } catch {
      return false;
    }
  },
};

// Haptic feedback API adapter
export const haptics = {
  light: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  },

  medium: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  },

  heavy: () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  },

  success: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  },

  warning: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  },

  error: () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  },
};

// Image picker API adapter
export const imagePicker = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request image permissions:', error);
      return false;
    }
  },

  async pickImage(): Promise<string | null> {
    try {
      const hasPermission = await imagePicker.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library.');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to pick image:', error);
      return null;
    }
  },

  async takePhoto(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your camera.');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to take photo:', error);
      return null;
    }
  },
};

// Geolocation API adapter
export const geolocation = {
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request location permissions:', error);
      return false;
    }
  },

  async getCurrentPosition(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const hasPermission = await geolocation.requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant permission to access your location.');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Failed to get current position:', error);
      return null;
    }
  },

  async watchPosition(
    callback: (position: { latitude: number; longitude: number }) => void,
    errorCallback?: (error: Error) => void
  ): Promise<{ remove: () => void }> {
    try {
      const hasPermission = await geolocation.requestPermissions();
      if (!hasPermission) {
        errorCallback?.(new Error('Location permission denied'));
        return { remove: () => {} };
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      return subscription;
    } catch (error) {
      console.error('Failed to watch position:', error);
      errorCallback?.(error as Error);
      return { remove: () => {} };
    }
  },
};

// Sharing API adapter
export const sharing = {
  async share(content: { title?: string; message?: string; url?: string }): Promise<boolean> {
    try {
      const shareContent = content.message || content.url || content.title || '';
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareContent, {
          dialogTitle: content.title,
        });
        return true;
      } else {
        // Fallback to clipboard
        await clipboard.writeText(shareContent);
        Alert.alert('Copied to Clipboard', 'Content has been copied to your clipboard.');
        return true;
      }
    } catch (error) {
      console.error('Failed to share:', error);
      return false;
    }
  },

  async canShare(): Promise<boolean> {
    return await Sharing.isAvailableAsync();
  },
};

// Navigation API adapter (URL opening)
export const navigation = {
  async openURL(url: string): Promise<boolean> {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        Alert.alert('Error', 'Cannot open this URL');
        return false;
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
      return false;
    }
  },

  async openSettings(): Promise<boolean> {
    try {
      await Linking.openSettings();
      return true;
    } catch (error) {
      console.error('Failed to open settings:', error);
      return false;
    }
  },

  async makePhoneCall(phoneNumber: string): Promise<boolean> {
    try {
      const url = `tel:${phoneNumber}`;
      return await navigation.openURL(url);
    } catch (error) {
      console.error('Failed to make phone call:', error);
      return false;
    }
  },

  async sendEmail(email: string, subject?: string, body?: string): Promise<boolean> {
    try {
      let url = `mailto:${email}`;
      const params = [];
      
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      return await navigation.openURL(url);
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  },
};

// Device info API adapter
export const deviceInfo = {
  getPlatform(): string {
    return Platform.OS;
  },

  getVersion(): string {
    return Platform.Version.toString();
  },

  getScreenDimensions(): { width: number; height: number } {
    return Dimensions.get('screen');
  },

  getWindowDimensions(): { width: number; height: number } {
    return Dimensions.get('window');
  },

  isTablet(): boolean {
    const { width, height } = deviceInfo.getScreenDimensions();
    const aspectRatio = Math.max(width, height) / Math.min(width, height);
    return aspectRatio < 1.6; // Tablets typically have aspect ratios closer to 4:3
  },

  supportsHaptics(): boolean {
    return Platform.OS === 'ios' || (Platform.OS === 'android' && Platform.Version >= 23);
  },
};

// Alert/Notification API adapter
export const alerts = {
  show(title: string, message?: string, buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>): void {
    const alertButtons = buttons?.map(button => ({
      text: button.text,
      onPress: button.onPress,
      style: button.style,
    })) || [{ text: 'OK' }];

    Alert.alert(title, message, alertButtons);
  },

  confirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void): void {
    Alert.alert(title, message, [
      { text: 'Cancel', onPress: onCancel, style: 'cancel' },
      { text: 'OK', onPress: onConfirm },
    ]);
  },

  prompt(title: string, message: string, onSubmit: (text: string) => void, onCancel?: () => void): void {
    Alert.prompt(title, message, [
      { text: 'Cancel', onPress: onCancel, style: 'cancel' },
      { text: 'OK', onPress: onSubmit },
    ]);
  },
};

// Network state adapter
export const networkState = {
  async isOnline(): Promise<boolean> {
    try {
      return await checkNetworkStatus();
    } catch {
      return false;
    }
  },

  // Listen to network state changes (simplified)
  addNetworkListener(callback: (isOnline: boolean) => void): () => void {
    let intervalId: NodeJS.Timeout;
    
    const checkNetwork = async () => {
      const isOnline = await networkState.isOnline();
      callback(isOnline);
    };
    
    // Check every 5 seconds
    intervalId = setInterval(checkNetwork, 5000);
    
    // Initial check
    checkNetwork();
    
    return () => clearInterval(intervalId);
  },
};

// Combine all platform APIs
export const platformAPI = {
  storage,
  clipboard,
  haptics,
  imagePicker,
  geolocation,
  sharing,
  navigation,
  deviceInfo,
  alerts,
  networkState,
};

export default platformAPI;
