// Font configuration for React Native
import { Platform } from "react-native";
import * as Font from "expo-font";

// Font families by platform (matching web design)
export const FONT_FAMILIES = {
  // Primary font family (matching web 'font-cabin')
  primary: Platform.select({
    ios: "SF Pro Text",
    android: "Roboto",
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: "System",
  }),

  // Secondary font family
  secondary: Platform.select({
    ios: "SF Pro Display",
    android: "Roboto",
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: "System",
  }),

  // Monospace font
  monospace: Platform.select({
    ios: "SF Mono",
    android: "Roboto Mono",
    web: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
    default: "monospace",
  }),
};

// Font weights (matching web font weights)
export const FONT_WEIGHTS = {
  light: "300" as const,
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  extrabold: "800" as const,
};

// Font sizes (matching web typography scale)
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 28,
  "4xl": 32,
  "5xl": 40,
  "6xl": 48,
  "7xl": 56,
  "8xl": 64,
  "9xl": 72,
};

// Line heights (matching web line-height values)
export const LINE_HEIGHTS = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
};

// Letter spacing
export const LETTER_SPACING = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
};

// Typography presets (matching web utility classes)
export const TYPOGRAPHY_PRESETS = {
  // Headings
  h1: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES["4xl"],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: LINE_HEIGHTS.tight,
  },
  h2: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES["3xl"],
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: LINE_HEIGHTS.tight,
  },
  h3: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES["2xl"],
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: LINE_HEIGHTS.tight,
  },
  h4: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: LINE_HEIGHTS.snug,
  },
  h5: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: LINE_HEIGHTS.snug,
  },
  h6: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: LINE_HEIGHTS.normal,
  },

  // Body text
  body: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: LINE_HEIGHTS.normal,
  },
  bodySmall: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: LINE_HEIGHTS.normal,
  },
  bodyLarge: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: LINE_HEIGHTS.relaxed,
  },

  // Captions and labels
  caption: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: LINE_HEIGHTS.normal,
  },
  label: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: LINE_HEIGHTS.normal,
  },

  // Buttons
  button: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: LINE_HEIGHTS.none,
  },
  buttonSmall: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: LINE_HEIGHTS.none,
  },
  buttonLarge: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: LINE_HEIGHTS.none,
  },

  // Special cases
  overline: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: LINE_HEIGHTS.normal,
    letterSpacing: LETTER_SPACING.wide,
  },
  subtitle: {
    fontFamily: FONT_FAMILIES.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: LINE_HEIGHTS.relaxed,
  },
};

// Custom fonts configuration (if you want to use custom fonts)
export const CUSTOM_FONTS = {
  // Add custom font configurations here
  // Example:
  // 'cabin-regular': require('../../assets/fonts/Cabin-Regular.ttf'),
  // 'cabin-bold': require('../../assets/fonts/Cabin-Bold.ttf'),
};

// Font loading function
export const loadFonts = async (): Promise<void> => {
  try {
    // Load custom fonts if any are defined
    if (Object.keys(CUSTOM_FONTS).length > 0) {
      await Font.loadAsync(CUSTOM_FONTS);
      console.log("Custom fonts loaded successfully");
    }
  } catch (error) {
    console.error("Failed to load custom fonts:", error);
  }
};

// Font utilities
export const fontUtils = {
  // Get font family with fallback
  getFontFamily(family: keyof typeof FONT_FAMILIES = "primary"): string {
    return FONT_FAMILIES[family] || FONT_FAMILIES.primary;
  },

  // Create typography style object
  createTypographyStyle(preset: keyof typeof TYPOGRAPHY_PRESETS) {
    return TYPOGRAPHY_PRESETS[preset];
  },

  // Create custom text style
  createTextStyle({
    size = "base",
    weight = "normal",
    family = "primary",
    lineHeight = "normal",
    letterSpacing = "normal",
  }: {
    size?: keyof typeof FONT_SIZES;
    weight?: keyof typeof FONT_WEIGHTS;
    family?: keyof typeof FONT_FAMILIES;
    lineHeight?: keyof typeof LINE_HEIGHTS;
    letterSpacing?: keyof typeof LETTER_SPACING;
  }) {
    return {
      fontFamily: FONT_FAMILIES[family],
      fontSize: FONT_SIZES[size],
      fontWeight: FONT_WEIGHTS[weight],
      lineHeight: FONT_SIZES[size] * LINE_HEIGHTS[lineHeight],
      letterSpacing: LETTER_SPACING[letterSpacing],
    };
  },

  // Check if font is loaded
  isFontLoaded(fontName: string): boolean {
    return Font.isLoaded(fontName);
  },

  // Get system font info
  getSystemFontInfo() {
    return {
      platform: Platform.OS,
      primaryFont: FONT_FAMILIES.primary,
      supportedWeights: Object.keys(FONT_WEIGHTS),
      supportedSizes: Object.keys(FONT_SIZES),
    };
  },
};

// Export everything for easy access
export default {
  FONT_FAMILIES,
  FONT_WEIGHTS,
  FONT_SIZES,
  LINE_HEIGHTS,
  LETTER_SPACING,
  TYPOGRAPHY_PRESETS,
  CUSTOM_FONTS,
  loadFonts,
  fontUtils,
};
