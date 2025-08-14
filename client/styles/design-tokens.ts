// Unified design tokens for consistent web and mobile experience
export const designTokens = {
  // Colors - matching both web and mobile versions
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
      accent: "#10B981",
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
  
  // Typography - unified for both platforms
  typography: {
    h1: { fontSize: 32, fontWeight: "bold", lineHeight: 1.2 },
    h2: { fontSize: 24, fontWeight: "bold", lineHeight: 1.3 },
    h3: { fontSize: 20, fontWeight: "600", lineHeight: 1.4 },
    h4: { fontSize: 18, fontWeight: "600", lineHeight: 1.4 },
    body: { fontSize: 16, fontWeight: "normal", lineHeight: 1.5 },
    bodySm: { fontSize: 14, fontWeight: "normal", lineHeight: 1.5 },
    caption: { fontSize: 12, fontWeight: "normal", lineHeight: 1.4 },
    button: { fontSize: 16, fontWeight: "500", lineHeight: 1 },
    buttonSm: { fontSize: 14, fontWeight: "500", lineHeight: 1 },
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
  
  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
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
  
  // Animation and transitions
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    }
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  // Layout constants
  layout: {
    maxWidth: 448, // max-w-md (matches mobile)
    containerPadding: 24,
    sectionSpacing: 32,
  }
};

// Helper functions for consistent styling
export const getColor = (path: string) => {
  const keys = path.split('.');
  let result: any = designTokens.colors;
  
  for (const key of keys) {
    result = result[key];
    if (result === undefined) break;
  }
  
  return result || path;
};

export const getSpacing = (size: keyof typeof designTokens.spacing) => {
  return designTokens.spacing[size];
};

export const getTypography = (variant: keyof typeof designTokens.typography) => {
  return designTokens.typography[variant];
};

// CSS custom properties for web
export const cssVariables = `
  :root {
    --color-primary: ${designTokens.colors.primary};
    --color-secondary: ${designTokens.colors.secondary};
    --color-accent: ${designTokens.colors.accent};
    --color-text-primary: ${designTokens.colors.text.primary};
    --color-text-secondary: ${designTokens.colors.text.secondary};
    --color-bg-primary: ${designTokens.colors.background.primary};
    --color-bg-secondary: ${designTokens.colors.background.secondary};
    --spacing-xs: ${designTokens.spacing.xs}px;
    --spacing-sm: ${designTokens.spacing.sm}px;
    --spacing-md: ${designTokens.spacing.md}px;
    --spacing-lg: ${designTokens.spacing.lg}px;
    --spacing-xl: ${designTokens.spacing.xl}px;
    --border-radius-md: ${designTokens.borderRadius.md}px;
    --border-radius-lg: ${designTokens.borderRadius.lg}px;
    --layout-max-width: ${designTokens.layout.maxWidth}px;
  }
`;
