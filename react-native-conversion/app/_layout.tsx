import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

// Import shared contexts
import { AuthProvider } from "../src/shared/contexts/AuthContext";
import { ActivitiesProvider } from "../src/shared/contexts/ActivitiesContext";

// Import platform configuration
import { configureApiServiceForReactNative } from "../src/shared/services/configureApiService";
import { loadFonts } from "../src/shared/fonts";

export default function RootLayout() {
  useEffect(() => {
    // Configure the app for React Native platform
    const initializeApp = async () => {
      try {
        // Configure API service for React Native
        configureApiServiceForReactNative();

        // Load custom fonts (if any)
        await loadFonts();

        console.log("React Native app initialized successfully");
      } catch (error) {
        console.error("Failed to initialize React Native app:", error);
      }
    };

    initializeApp();
  }, []);

  return (
    <AuthProvider>
      <ActivitiesProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="activity/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
        </Stack>
      </ActivitiesProvider>
    </AuthProvider>
  );
}
