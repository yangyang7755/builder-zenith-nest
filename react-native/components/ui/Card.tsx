import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { designTokens, getShadowStyle } from "../../styles/designTokens";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof designTokens.spacing | number;
  shadow?: "none" | "sm" | "md" | "lg";
  borderRadius?: keyof typeof designTokens.borderRadius | number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = "lg",
  shadow = "md",
  borderRadius = "lg",
}) => {
  const cardStyle = [
    styles.base,
    shadow !== "none" && getShadowStyle(shadow),
    {
      padding:
        typeof padding === "number" ? padding : designTokens.spacing[padding],
      borderRadius:
        typeof borderRadius === "number"
          ? borderRadius
          : designTokens.borderRadius[borderRadius],
    },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: designTokens.colors.card,
    borderRadius: designTokens.borderRadius.lg,
  },
});

export default Card;
