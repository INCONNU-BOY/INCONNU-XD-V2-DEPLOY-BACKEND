import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';

// Components
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ServerCard from '../../components/custom/ServerCard';
import Terminal from '../../components/custom/Terminal';

// Hooks
import { useAuth } from '../../hooks/useAuth';
import { useServers } from '../../hooks/useServers';

// Services
import { getSystemStats, getServerLogs } from '../../services/api';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { servers, loading, refreshServers, startServer, stopServer, restartServer, deleteServer } = useServers();
  
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [serverLogs, setServerLogs] = useState([]);
  const [timeRange, setTimeRange] = useState('day');

  useEffect(() => {
    loadStats();
    if (servers?.length > 0 && !selectedServer) {
      setSelectedServer(servers[0]);
      loadServerLogs(servers[0]._id);
    }
  }, [servers]);

  const loadStats = async () => {
    try {
      const data = await getSystemStats();
      setStats(data);
    } catch (error) {
      showMessage({
        message: 'Failed to load system stats',
        type: 'danger',
      });
    }
  };

  const loadServerLogs = async (serverId) => {
    try {
      const logs = await getServerLogs(serverId);
      setServerLogs(logs);
    } catch (error) {
      console.error('Failed to load server logs:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshServers(), loadStats()]);
    if (selectedServer) {
      await loadServerLogs(selectedServer._id);
    }
    setRefreshing(false);
  };

  const handleServerSelect = (server) => {
    setSelectedServer(server);
    loadServerLogs(server._id);
  };

  const handleStartServer = async (serverId) => {
    try {
      await startServer(serverId);
      showMessage({
        message: 'Server started successfully',
        type: 'success',
      });
      await refreshServers();
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to start server',
        type: 'danger',
      });
    }
  };

  const handleStopServer = async (serverId) => {
    try {
      await stopServer(serverId);
      showMessage({
        message: 'Server stopped successfully',
        type: 'success',
      });
      await refreshServers();
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to stop server',
        type: 'danger',
      });
    }
  };

  const handleRestartServer = async (serverId) => {
    try {
      await restartServer(serverId);
      showMessage({
        message: 'Server restarted successfully',
        type: 'success',
      });
      await refreshServers();
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to restart server',
        type: 'danger',
      });
    }
  };

  const handleDeleteServer = async (serverId) => {
    try {
      await deleteServer(serverId);
      showMessage({
        message: 'Server deleted successfully',
        type: 'success',
      });
      await refreshServers();
      if (selectedServer?._id === serverId) {
        setSelectedServer(servers?.find(s => s._id !== serverId) || null);
      }
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to delete server',
        type: 'danger',
      });
    }
  };

  const handleCreateServer = () => {
    navigation.navigate('CreateServer');
  };

  const handleViewServer = (server) => {
    navigation.navigate('ServerDetail', { serverId: server._id });
  };

  // Prepare chart data
  const prepareChartData = () => {
    const statusCounts = {
      running: 0,
      stopped: 0,
      starting: 0,
      stopping: 0,
      error: 0,
    };

    servers?.forEach(server => {
      statusCounts[server.status] = (statusCounts[server.status] || 0) + 1;
    });

    return {
      labels: Object.keys(statusCounts).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
      datasets: [
        {
          data: Object.values(statusCounts),
          colors: [
            (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
            (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
            (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
          ],
        },
      ],
    };
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#667eea',
    },
  };

  const runningServers = servers?.filter(s => s.status === 'running') || [];
  const totalUptime = servers?.reduce((sum, server) => sum + (server.totalUptime || 0), 0) || 0;

  const formatUptime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours}h`;
  };

  return (
    <Layout headerProps={{ title: 'Dashboard' }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="server" size={24} color="#667eea" />
              <Text style={styles.statValue}>{servers?.length || 0}</Text>
              <Text style={styles.statLabel}>Total Servers</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="play" size={24} color="#10b981" />
              <Text style={styles.statValue}>{runningServers.length}</Text>
              <Text style={styles.statLabel}>Running</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="clock" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{formatUptime(totalUptime)}</Text>
              <Text style={styles.statLabel}>Total Uptime</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Icon name="coin" size={24} color="#FFD700" />
              <Text style={styles.statValue}>{user?.coins || 0}</Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
          </Card>
        </View>

        {/* Server Status Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Server Status Distribution</Text>
          {servers?.length > 0 ? (
            <PieChart
              data={prepareChartData().datasets[0].data.map((value, index) => ({
                name: prepareChartData().labels[index],
                population: value,
                color: prepareChartData().datasets[0].colors[index](1),
                legendFontColor: '#7F7F7F',
                legendFontSize: 12,
              }))}
              width={width - 64}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <View style={styles.emptyChart}>
              <Icon name="chart-pie" size={48} color="#ccc" />
              <Text style={styles.emptyChartText}>No data available</Text>
              <Text style={styles.emptyChartSubtext}>
                Create servers to see statistics
              </Text>
            </View>
          )}
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCreateServer}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(102, 126, 234, 0.1)' }]}>
                <Icon name="plus" size={24} color="#667eea" />
              </View>
              <Text style={styles.actionText}>Create Server</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('SessionGenerator')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Icon name="key" size={24} color="#10b981" />
              </View>
              <Text style={styles.actionText}>Get Session</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Referrals')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Icon name="share-variant" size={24} color="#f59e0b" />
              </View>
              <Text style={styles.actionText}>Refer & Earn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Icon name="cog" size={24} color="#3b82f6" />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Server List */}
        <Card style={styles.serversCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Servers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Servers')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {servers?.length > 0 ? (
            servers.slice(0, 3).map((server) => (
              <TouchableOpacity
                key={server._id}
                style={[
                  styles.serverItem,
                  selectedServer?._id === server._id && styles.serverItemSelected,
                ]}
                onPress={() => handleServerSelect(server)}
              >
                <View style={styles.serverInfo}>
                  <Icon name="server" size={20} color="#667eea" />
                  <View style={styles.serverDetails}>
                    <Text style={styles.serverName}>{server.name}</Text>
                    <Text style={styles.serverPort}>Port: {server.port}</Text>
                  </View>
                </View>
                <View style={styles.serverActions}>
                  {server.status === 'running' ? (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}
                      onPress={() => handleRestartServer(server._id)}
                    >
                      <Icon name="refresh" size={16} color="#10b981" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}
                      onPress={() => handleStartServer(server._id)}
                    >
                      <Icon name="play" size={16} color="#10b981" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}
                    onPress={() => handleDeleteServer(server._id)}
                  >
                    <Icon name="delete" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="server-off" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No servers yet</Text>
              <Button
                title="Create Your First Server"
                onPress={handleCreateServer}
                variant="primary"
                style={styles.createButton}
              />
            </View>
          )}
        </Card>

        {/* Server Terminal */}
        {selectedServer && (
          <Card style={styles.terminalCard}>
            <View style={styles.terminalHeader}>
              <Text style={styles.sectionTitle}>
                Terminal - {selectedServer.name}
              </Text>
              <TouchableOpacity onPress={() => handleViewServer(selectedServer)}>
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
            <Terminal
              logs={serverLogs}
              onSendCommand={(command) => {
                // Handle command sending
                console.log('Command:', command);
              }}
              style={styles.terminal}
            />
          </Card>
        )}

        {/* System Status */}
        {stats && (
          <Card style={styles.systemCard}>
            <Text style={styles.sectionTitle}>System Status</Text>
            <View style={styles.systemStats}>
              <View style={styles.systemStat}>
                <Icon name="account-group" size={20} color="#667eea" />
                <Text style={styles.systemStatValue}>
                  {stats.totalUsers?.toLocaleString() || 0}
                </Text>
                <Text style={styles.systemStatLabel}>Total Users</Text>
              </View>
              <View style={styles.systemStat}>
                <Icon name="server-network" size={20} color="#10b981" />
                <Text style={styles.systemStatValue}>
                  {stats.totalServers?.toLocaleString() || 0}
                </Text>
                <Text style={styles.systemStatLabel}>Active Servers</Text>
              </View>
              <View style={styles.systemStat}>
                <Icon name="coin" size={20} color="#FFD700" />
                <Text style={styles.systemStatValue}>
                  {stats.totalCoins?.toLocaleString() || 0}
                </Text>
                <Text style={styles.systemStatLabel}>Total Coins</Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyChart: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChartText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyChartSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionButton: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  serversCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  serverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
  },
  serverItemSelected: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serverDetails: {
    marginLeft: 12,
  },
  serverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  serverPort: {
    fontSize: 12,
    color: '#666',
  },
  serverActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  createButton: {
    minWidth: 200,
  },
  terminalCard: {
    marginBottom: 16,
  },
  terminalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewDetailsText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  terminal: {
    height: 300,
  },
  systemCard: {
    marginBottom: 32,
  },
  systemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  systemStat: {
    alignItems: 'center',
    flex: 1,
  },
  systemStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  systemStatLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default DashboardScreen;
