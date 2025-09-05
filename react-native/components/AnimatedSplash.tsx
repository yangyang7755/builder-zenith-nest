import React from "react";
import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Video, ResizeMode } from "expo-av";
import { designTokens } from "../styles/designTokens";

interface AnimatedSplashProps {
  sourceUrl: string;
  onFinish: () => void;
}

const AnimatedSplash: React.FC<AnimatedSplashProps> = ({ sourceUrl, onFinish }) => {
  const videoRef = React.useRef<Video | null>(null);
  const [readyForDisplay, setReadyForDisplay] = React.useState(false);

  const handleReady = React.useCallback(async () => {
    if (!readyForDisplay) {
      setReadyForDisplay(true);
      try {
        await SplashScreen.hideAsync();
      } catch {}
    }
  }, [readyForDisplay]);

  return (
    <View style={styles.container} onLayout={handleReady}>
      {!readyForDisplay && (
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
      )}
      <Video
        ref={(ref) => (videoRef.current = ref)}
        style={styles.video}
        source={{ uri: sourceUrl }}
        shouldPlay
        isMuted
        isLooping={false}
        resizeMode={ResizeMode.COVER}
        onReadyForDisplay={handleReady}
        onPlaybackStatusUpdate={(status) => {
          const s = status as any;
          if (s?.didJustFinish) {
            onFinish();
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loader: {
    position: "absolute",
    zIndex: 1,
  },
});

export default AnimatedSplash;
