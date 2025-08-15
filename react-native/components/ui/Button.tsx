import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { designTokens } from "../../styles/designTokens";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const buttonTextStyle = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" ? "#FFFFFF" : designTokens.colors.primary
          }
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={buttonTextStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: designTokens.borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  // Variants
  primary: {
    backgroundColor: designTokens.colors.primary,
  },
  secondary: {
    backgroundColor: designTokens.colors.secondary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: designTokens.colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
  },

  // Sizes
  size_sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
  size_md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 40,
  },
  size_lg: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 48,
  },

  // Disabled state
  disabled: {
    opacity: 0.5,
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
  outlineText: {
    color: designTokens.colors.primary,
  },
  ghostText: {
    color: designTokens.colors.primary,
  },

  // Text sizes
  smText: {
    fontSize: designTokens.typography.fontSize.sm,
  },
  mdText: {
    fontSize: designTokens.typography.fontSize.base,
  },
  lgText: {
    fontSize: designTokens.typography.fontSize.lg,
  },

  disabledText: {
    opacity: 0.7,
  },
});

export default Button;
