import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const Card = ({
  children,
  style,
  onPress,
  variant = 'default',
  gradient = false,
  gradientColors,
  disabled = false,
  ...props
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.shadow,
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.background,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
        };
      default:
        return {
          backgroundColor: theme.colors.card,
        };
    }
  };

  const cardStyles = [
    styles.card,
    getVariantStyles(),
    style,
  ];

  const content = (
    <View style={[styles.content]} {...props}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {gradient ? (
          <LinearGradient
            colors={gradientColors || [theme.colors.primary + '20', theme.colors.secondary + '20']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={cardStyles}
          >
            {content}
          </LinearGradient>
        ) : (
          <View style={cardStyles}>{content}</View>
        )}
      </TouchableOpacity>
    );
  }

  if (gradient) {
    return (
      <LinearGradient
        colors={gradientColors || [theme.colors.primary + '20', theme.colors.secondary + '20']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={cardStyles}
      >
        {content}
      </LinearGradient>
    );
  }

  return <View style={cardStyles}>{content}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
  content: {
    flex: 1,
  },
});

export default Card;
