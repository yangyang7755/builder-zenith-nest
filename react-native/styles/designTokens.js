export const designTokens = {
  colors: {
    // Primary colors
    primary: "#1F381F", // explore-green
    primaryHover: "#16A34A",
    primaryLight: "#86EFAC",

    // Secondary colors
    secondary: "#F97316",
    secondaryLight: "#FED7AA",

    // Neutral colors
    white: "#FFFFFF",
    black: "#000000",
    gray: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },

    // Status colors
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",

    // Background colors
    background: "#FFFFFF",
    surface: "#F9FAFB",
    card: "#FFFFFF",

    // Text colors
    text: {
      primary: "#000000",
      secondary: "#6B7280",
      light: "#9CA3AF",
      inverse: "#FFFFFF",
    },

    // Border colors
    border: {
      light: "#E5E7EB",
      medium: "#D1D5DB",
      dark: "#9CA3AF",
    },

    // Activity colors
    activity: {
      climbing: "#F97316",
      cycling: "#3B82F6",
      running: "#EF4444",
      hiking: "#84CC16",
      skiing: "#06B6D4",
      surfing: "#8B5CF6",
      tennis: "#EC4899",
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    "4xl": 40,
    "5xl": 48,
    "6xl": 64,
  },

  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 28,
      "4xl": 32,
      "5xl": 36,
      "6xl": 48,
    },
    fontWeight: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  borderRadius: {
    none: 0,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    "2xl": 16,
    "3xl": 24,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 5,
    },
  },

  layout: {
    containerPadding: 16,
    cardPadding: 16,
    headerHeight: 56,
    tabBarHeight: 70,
    bottomNavHeight: 60,
  },

  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: "ease",
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
    },
  },
};

// Helper functions for common styling patterns
export const getActivityColor = (activityType) => {
  return (
    designTokens.colors.activity[activityType.toLowerCase()] ||
    designTokens.colors.primary
  );
};

export const getShadowStyle = (level = "md") => {
  return designTokens.shadows[level] || designTokens.shadows.md;
};

export const getSpacing = (...values) => {
  if (values.length === 1) {
    return designTokens.spacing[values[0]] || values[0];
  }
  return values.map((value) => designTokens.spacing[value] || value);
};
