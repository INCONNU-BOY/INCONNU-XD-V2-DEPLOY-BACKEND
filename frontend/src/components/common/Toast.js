import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const Toast = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'top',
  style,
}) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: theme.colors.success,
          icon: 'check-circle',
        };
      case 'error':
        return {
          backgroundColor: theme.colors.error,
          icon: 'alert-circle',
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.warning,
          icon: 'alert',
        };
      case 'info':
        return {
          backgroundColor: theme.colors.info,
          icon: 'information',
        };
      default:
        return {
          backgroundColor: theme.colors.info,
          icon: 'information',
        };
    }
  };

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose && onClose();
    });
  };

  const typeStyles = getTypeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: typeStyles.backgroundColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          top: position === 'top' ? 60 : undefined,
          bottom: position === 'bottom' ? 60 : undefined,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <Icon
          name={typeStyles.icon}
          size={20}
          color="#ffffff"
          style={styles.icon}
        />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="close" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
});

export default Toast;
