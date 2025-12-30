import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const StatusBadge = ({ status, size = 'medium' }) => {
  const { theme } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          color: theme.colors.success,
          icon: 'check-circle',
          label: 'Running',
        };
      case 'stopped':
        return {
          color: theme.colors.error,
          icon: 'stop-circle',
          label: 'Stopped',
        };
      case 'starting':
        return {
          color: theme.colors.warning,
          icon: 'play-circle',
          label: 'Starting',
        };
      case 'stopping':
        return {
          color: theme.colors.warning,
          icon: 'pause-circle',
          label: 'Stopping',
        };
      case 'error':
        return {
          color: theme.colors.error,
          icon: 'alert-circle',
          label: 'Error',
        };
      default:
        return {
          color: theme.colors.textSecondary,
          icon: 'help-circle',
          label: 'Unknown',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 8,
          paddingVertical: 4,
          fontSize: 10,
          iconSize: 12,
        };
      case 'large':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          fontSize: 14,
          iconSize: 16,
        };
      default:
        return {
          paddingHorizontal: 12,
          paddingVertical: 6,
          fontSize: 12,
          iconSize: 14,
        };
    }
  };

  const config = getStatusConfig();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.color + '20',
          borderColor: config.color + '40',
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
      ]}
    >
      <Icon
        name={config.icon}
        size={sizeStyles.iconSize}
        color={config.color}
        style={styles.icon}
      />
      <Text
        style={[
          styles.label,
          {
            color: config.color,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontWeight: '600',
  },
});

export default StatusBadge;
