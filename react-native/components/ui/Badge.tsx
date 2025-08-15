import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { designTokens } from "../../styles/designTokens";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "outline";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  size = "md",
  style,
  textStyle,
}) => {
  const badgeStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    style,
  ];

  const badgeTextStyle = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <View style={badgeStyle}>
      <Text style={badgeTextStyle}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    borderRadius: designTokens.borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },

  // Variants
  primary: {
    backgroundColor: designTokens.colors.primary,
  },
  secondary: {
    backgroundColor: designTokens.colors.secondary,
  },
  success: {
    backgroundColor: designTokens.colors.success,
  },
  warning: {
    backgroundColor: designTokens.colors.warning,
  },
  error: {
    backgroundColor: designTokens.colors.error,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: designTokens.colors.border.medium,
  },

  // Sizes
  size_sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  size_md: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  size_lg: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  // Text styles
  baseText: {
    fontWeight: designTokens.typography.fontWeight.medium,
    textAlign: "center",
  },

  // Text variants
  primaryText: {
    color: designTokens.colors.white,
  },
  secondaryText: {
    color: designTokens.colors.white,
  },
  successText: {
    color: designTokens.colors.white,
  },
  warningText: {
    color: designTokens.colors.white,
  },
  errorText: {
    color: designTokens.colors.white,
  },
  outlineText: {
    color: designTokens.colors.text.secondary,
  },

  // Text sizes
  smText: {
    fontSize: 10,
  },
  mdText: {
    fontSize: 12,
  },
  lgText: {
    fontSize: 14,
  },
});

export default Badge;
