// Unified design tokens for React Native
// Mirrors client/styles/design-tokens.ts for consistency

export const designTokens = {
  // Colors - matching web version exactly
  colors: {
    primary: "#1F381F", // dark explore-green
    secondary: "#3B82F6", // blue
    accent: "#F59E0B", // orange
    purple: "#8B5CF6",
    success: "#10B981",
    warning: "#F59E0B", 
    error: "#EF4444",
    
    // Grays
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
    
    white: "#FFFFFF",
    black: "#000000",
    
    // Semantic colors
    text: {
      primary: "#000000",
      secondary: "#6B7280",
      tertiary: "#9CA3AF",
      accent: "#1F381F",
    },
    
    background: {
      primary: "#FFFFFF",
      secondary: "#F9FAFB",
      tertiary: "#F3F4F6",
      accent: "#F0FDF4",
    },
    
    border: {
      light: "#F3F4F6",
      medium: "#E5E7EB",
      dark: "#D1D5DB",
    }
  },
  
  // Typography - React Native compatible
  typography: {
    h1: { fontSize: 32, fontWeight: "bold", lineHeight: 38 },
    h2: { fontSize: 24, fontWeight: "bold", lineHeight: 30 },
    h3: { fontSize: 20, fontWeight: "600", lineHeight: 28 },
    h4: { fontSize: 18, fontWeight: "600", lineHeight: 25 },
    body: { fontSize: 16, fontWeight: "normal", lineHeight: 24 },
    bodySm: { fontSize: 14, fontWeight: "normal", lineHeight: 21 },
    caption: { fontSize: 12, fontWeight: "normal", lineHeight: 18 },
    button: { fontSize: 16, fontWeight: "500", lineHeight: 16 },
    buttonSm: { fontSize: 14, fontWeight: "500", lineHeight: 14 },
  },
  
  // Spacing - consistent spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 9999,
  },
  
  // Component specific tokens
  components: {
    header: {
      height: 64,
      paddingX: 24,
      paddingY: 16,
    },
    
    tabBar: {
      height: 70,
      paddingX: 16,
      paddingY: 8,
    },
    
    card: {
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
    },
    
    button: {
      paddingX: 16,
      paddingY: 12,
      borderRadius: 8,
    },
    
    buttonSm: {
      paddingX: 12,
      paddingY: 8,
      borderRadius: 6,
    },
    
    input: {
      paddingX: 16,
      paddingY: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
  },
  
  // Shadows for React Native
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
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
    },
  },
  
  // Layout constants
  layout: {
    screenPadding: 24,
    sectionSpacing: 32,
    cardSpacing: 16,
  }
};

// Helper functions for React Native styling
export const getColor = (path) => {
  const keys = path.split('.');
  let result = designTokens.colors;
  
  for (const key of keys) {
    result = result[key];
    if (result === undefined) break;
  }
  
  return result || path;
};

export const getSpacing = (size) => {
  return designTokens.spacing[size] || 0;
};

export const getTypography = (variant) => {
  return designTokens.typography[variant] || designTokens.typography.body;
};

export const getShadow = (variant) => {
  return designTokens.shadows[variant] || {};
};

// Pre-built style objects for common patterns
export const commonStyles = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: designTokens.colors.background.primary,
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: designTokens.colors.background.primary,
    paddingHorizontal: designTokens.layout.screenPadding,
  },
  
  // Header styles
  header: {
    height: designTokens.components.header.height,
    paddingHorizontal: designTokens.components.header.paddingX,
    paddingVertical: designTokens.components.header.paddingY,
    backgroundColor: designTokens.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: designTokens.colors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  headerTitle: {
    ...designTokens.typography.h3,
    color: designTokens.colors.text.primary,
  },
  
  headerSubtitle: {
    ...designTokens.typography.bodySm,
    color: designTokens.colors.text.secondary,
  },
  
  // Button styles
  buttonPrimary: {
    paddingHorizontal: designTokens.components.button.paddingX,
    paddingVertical: designTokens.components.button.paddingY,
    backgroundColor: designTokens.colors.primary,
    borderRadius: designTokens.components.button.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    ...designTokens.shadows.sm,
  },
  
  buttonPrimaryText: {
    ...designTokens.typography.button,
    color: designTokens.colors.white,
  },
  
  buttonSecondary: {
    paddingHorizontal: designTokens.components.button.paddingX,
    paddingVertical: designTokens.components.button.paddingY,
    backgroundColor: designTokens.colors.background.tertiary,
    borderRadius: designTokens.components.button.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonSecondaryText: {
    ...designTokens.typography.button,
    color: designTokens.colors.text.primary,
  },
  
  // Card styles
  card: {
    backgroundColor: designTokens.colors.background.primary,
    borderRadius: designTokens.components.card.borderRadius,
    borderWidth: designTokens.components.card.borderWidth,
    borderColor: designTokens.colors.border.medium,
    padding: designTokens.components.card.padding,
    marginBottom: designTokens.layout.cardSpacing,
    ...designTokens.shadows.sm,
  },
  
  // Input styles
  input: {
    paddingHorizontal: designTokens.components.input.paddingX,
    paddingVertical: designTokens.components.input.paddingY,
    borderWidth: designTokens.components.input.borderWidth,
    borderColor: designTokens.colors.border.medium,
    borderRadius: designTokens.components.input.borderRadius,
    backgroundColor: designTokens.colors.background.primary,
    ...designTokens.typography.body,
    color: designTokens.colors.text.primary,
  },
  
  inputFocused: {
    borderColor: designTokens.colors.primary,
    borderWidth: 2,
  },
  
  // Text styles
  textPrimary: {
    ...designTokens.typography.body,
    color: designTokens.colors.text.primary,
  },
  
  textSecondary: {
    ...designTokens.typography.bodySm,
    color: designTokens.colors.text.secondary,
  },
  
  textAccent: {
    ...designTokens.typography.body,
    color: designTokens.colors.text.accent,
    fontWeight: '500',
  },
};
