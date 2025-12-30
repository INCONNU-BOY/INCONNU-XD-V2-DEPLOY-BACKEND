import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  success,
  disabled = false,
  icon,
  iconPosition = 'left',
  onIconPress,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (success) return theme.colors.success;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.disabled;
    return theme.colors.background;
  };

  const renderIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.icon}
        >
          <Icon
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    if (icon) {
      return (
        <TouchableOpacity onPress={onIconPress} style={styles.icon}>
          <Icon
            name={icon}
            size={20}
            color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }, labelStyle]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
            borderWidth: isFocused ? 2 : 1,
            paddingLeft: icon && iconPosition === 'left' ? 12 : 16,
            paddingRight: icon && iconPosition === 'right' ? 12 : 16,
          },
        ]}
      >
        {icon && iconPosition === 'left' && renderIcon()}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={secureTextEntry && !showPassword}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              textAlignVertical: multiline ? 'top' : 'center',
              minHeight: multiline ? numberOfLines * 24 : 48,
            },
            inputStyle,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {icon && iconPosition === 'right' && renderIcon()}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={14} color={theme.colors.error} />
          <Text style={[styles.error, { color: theme.colors.error }, errorStyle]}>
            {error}
          </Text>
        </View>
      )}

      {success && !error && (
        <View style={styles.successContainer}>
          <Icon name="check-circle" size={14} color={theme.colors.success} />
          <Text style={[styles.success, { color: theme.colors.success }]}>
            {success}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  icon: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  error: {
    fontSize: 12,
    marginLeft: 4,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  success: {
    fontSize: 12,
    marginLeft: 4,
  },
});

export default Input;
