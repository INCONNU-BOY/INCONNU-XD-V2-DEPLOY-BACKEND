import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import StatusBadge from './StatusBadge';

const ServerCard = ({
  server,
  onPress,
  onStart,
  onStop,
  onRestart,
  onDelete,
  style,
}) => {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (server.status) {
      case 'running':
        return theme.colors.success;
      case 'stopped':
        return theme.colors.error;
      case 'starting':
      case 'stopping':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatUptime = (ms) => {
    if (!ms) return '0s';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[theme.colors.card, theme.colors.card + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, style]}
      >
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Icon name="server" size={24} color={theme.colors.primary} />
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                {server.name}
              </Text>
              <Text style={[styles.port, { color: theme.colors.textSecondary }]}>
                Port: {server.port}
              </Text>
            </View>
          </View>
          <StatusBadge status={server.status} />
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Icon name="clock" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {server.lastStarted
                ? new Date(server.lastStarted).toLocaleDateString()
                : 'Never started'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="timer" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {formatUptime(server.totalUptime)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="file-document" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {server.logs?.length || 0} logs
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {server.status === 'stopped' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.success + '20' }]}
              onPress={() => onStart(server._id)}
            >
              <Icon name="play" size={18} color={theme.colors.success} />
              <Text style={[styles.actionText, { color: theme.colors.success }]}>
                Start
              </Text>
            </TouchableOpacity>
          )}

          {server.status === 'running' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.warning + '20' }]}
                onPress={() => onRestart(server._id)}
              >
                <Icon name="refresh" size={18} color={theme.colors.warning} />
                <Text style={[styles.actionText, { color: theme.colors.warning }]}>
                  Restart
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.error + '20' }]}
                onPress={() => onStop(server._id)}
              >
                <Icon name="stop" size={18} color={theme.colors.error} />
                <Text style={[styles.actionText, { color: theme.colors.error }]}>
                  Stop
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.error + '20' }]}
            onPress={() => onDelete(server._id)}
          >
            <Icon name="delete" size={18} color={theme.colors.error} />
            <Text style={[styles.actionText, { color: theme.colors.error }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  port: {
    fontSize: 12,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ServerCard;
