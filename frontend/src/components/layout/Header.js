import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';

const Header = ({
  title,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  showProfile = true,
  showCoins = true,
  style,
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, style]}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      <View style={styles.content}>
        <View style={styles.leftSection}>
          {leftIcon && (
            <TouchableOpacity onPress={onLeftPress} style={styles.iconButton}>
              <Icon name={leftIcon} size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{title || 'INCONNU HOSTING'}</Text>
        </View>

        <View style={styles.rightSection}>
          {showCoins && user && (
            <View style={styles.coinsContainer}>
              <Icon name="coin" size={16} color="#FFD700" />
              <Text style={styles.coinsText}>{user.coins || 0}</Text>
            </View>
          )}

          {showProfile && user && (
            <TouchableOpacity style={styles.profileButton} onPress={onRightPress}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {rightIcon && !showProfile && (
            <TouchableOpacity onPress={onRightPress} style={styles.iconButton}>
              <Icon name={rightIcon} size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: StatusBar.currentHeight,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconButton: {
    padding: 8,
    marginRight: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 12,
  },
  coinsText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  profileButton: {
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Header;
