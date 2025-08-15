import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { designTokens } from '../../styles/designTokens';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  fallbackStyle?: ViewStyle;
  textStyle?: any;
}

const Avatar: React.FC<AvatarProps> = ({
  uri,
  name = '',
  size = 'md',
  style,
  fallbackStyle,
  textStyle,
}) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const containerStyle = [
    styles.container,
    styles[`size_${size}`],
    style,
  ];

  const fallbackContainerStyle = [
    styles.fallback,
    styles[`size_${size}`],
    fallbackStyle,
  ];

  const fallbackTextStyle = [
    styles.fallbackText,
    styles[`${size}Text`],
    textStyle,
  ];

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={containerStyle}
        defaultSource={require('../../assets/placeholder-avatar.png')}
      />
    );
  }

  return (
    <View style={fallbackContainerStyle}>
      <Text style={fallbackTextStyle}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 9999,
    backgroundColor: designTokens.colors.gray[200],
  },
  
  fallback: {
    borderRadius: 9999,
    backgroundColor: designTokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Sizes
  size_sm: {
    width: 32,
    height: 32,
  },
  size_md: {
    width: 40,
    height: 40,
  },
  size_lg: {
    width: 48,
    height: 48,
  },
  size_xl: {
    width: 96,
    height: 96,
  },
  
  fallbackText: {
    color: designTokens.colors.white,
    fontWeight: designTokens.typography.fontWeight.bold,
  },
  
  // Text sizes
  smText: {
    fontSize: 12,
  },
  mdText: {
    fontSize: 14,
  },
  lgText: {
    fontSize: 16,
  },
  xlText: {
    fontSize: 32,
  },
});

export default Avatar;
