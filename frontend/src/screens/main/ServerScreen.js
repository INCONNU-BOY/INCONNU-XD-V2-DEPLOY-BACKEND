frontend/src/screens/main/ServerScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal as RNModal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import CustomModal from '../../components/common/Modal';
import Terminal from '../../components/custom/Terminal';
import StatusBadge from '../../components/custom/StatusBadge';

// Hooks
import { useServers } from '../../hooks/useServers';
import { useAuth } from '../../hooks/useAuth';

// Services
import { getServerLogs, getServerStatus, updateServer } from '../../services/api';

const ServerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { serverId } = route.params;

  const { servers, loading, refreshServers, startServer, stopServer, restartServer, deleteServer } = useServers();
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [server, setServer] = useState(null);
  const [logs, setLogs] = useState([]);
  const [detailedStatus, setDetailedStatus] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEnvModal, setShowEnvModal] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [command, setCommand] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    loadServer();
    loadServerDetails();
  }, [serverId, servers]);

  useEffect(() => {
    // Set up polling for server status if it's running
    let interval;
    if (server?.status === 'running') {
      interval = setInterval(() => {
        loadServerDetails();
      }, 5000); // Poll every 5 seconds
    }

    return () => { 
      if (interval) clearInterval(interval); 
    };
  }, [server?.status]);

  const loadServer = () => {
    const foundServer = servers?.find(s => s._id === serverId);
    setServer(foundServer);
    if (foundServer) {
      setEditingServer({ ...foundServer });
    }
  };

  const loadServerDetails = async () => {
    try {
      const [statusData, logsData] = await Promise.all([
        getServerStatus(serverId),
        getServerLogs(serverId, 100),
      ]);

      if (statusData.success) { 
        setDetailedStatus(statusData); 
      } 
      if (logsData.success) { 
        setLogs(logsData.logs); 
      } 
    } catch (error) { 
      console.error('Failed to load server details:', error); 
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshServers(), loadServerDetails()]);
    setRefreshing(false);
  };

  const handleStart = async () => {
    try {
      await startServer(serverId);
      showMessage({
        message: 'Server starting...',
        type: 'info',
      });
      await refreshServers();
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to start server',
        type: 'danger',
      });
    }
  };

  const handleStop = async () => {
    try {
      await stopServer(serverId);
      showMessage({
        message: 'Server stopping...',
        type: 'info',
      });
      await refreshServers();
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to stop server',
        type: 'danger',
      });
    }
  };

  const handleRestart = async () => {
    try {
      await restartServer(serverId);
      showMessage({
        message: 'Server restarting...',
        type: 'info',
      });
      await refreshServers();
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to restart server',
        type: 'danger',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteServer(serverId);
      showMessage({
        message: 'Server deleted successfully',
        type: 'success',
      });
      navigation.goBack();
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to delete server',
        type: 'danger',
      });
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateServer(serverId, editingServer);
      showMessage({
        message: 'Server updated successfully',
        type: 'success',
      });
      await refreshServers();
      setShowEditModal(false);
    } catch (error) {
      showMessage({
        message: error.response?.data?.error || 'Failed to update server',
        type: 'danger',
      });
    }
  };

  const handleSendCommand = async () => {
    if (!command.trim()) return;

    // Add command to logs 
    const newLog = { 
      timestamp: new Date(), 
      level: 'info', 
      message: `$ ${command}`,
    }; 
    setLogs(prev => [...prev, newLog]); 
    setCommand(''); 
    // TODO: Send command to server via API
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (!server) {
    return (
      <Layout headerProps={{ title: 'Server Not Found' }}>
        <View style={styles.notFoundContainer}>
          <Icon name="server-off" size={64} color="#666" />
          <Text style={styles.notFoundText}>Server not found</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="primary"
            style={styles.backButton}
          />
        </View>
      </Layout>
    );
  }

  return (
    <Layout headerProps={{ title: server.name }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667eea']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Server Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.headerInfo}>
              <View style={styles.titleSection}>
                <Icon name="server" size={32} color="#667eea" />
                <View style={styles.titleContainer}>
                  <Text style={styles.serverName}>{server.name}</Text>
                  <Text style={styles.serverPort}>Port: {server.port}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="clock" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.statText}>
                  Uptime: {formatUptime(server.totalUptime)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="calendar" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.statText}>
                  Created: {new Date(server.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Server Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Server Actions</Text>
          <View style={styles.actionsGrid}>
            {server.status === 'stopped' && (
              <Button
                title="Start Server"
                onPress={handleStart}
                variant="success"
                icon="play"
                size="large"
                style={styles.actionButton}
              />
            )}
            {server.status === 'running' && (
              <>
                <Button
                  title="Restart"
                  onPress={handleRestart}
                  variant="warning"
                  icon="refresh"
                  style={styles.actionButton}
                />
                <Button
                  title="Stop"
                  onPress={handleStop}
                  variant="danger"
                  icon="stop"
                  style={styles.actionButton}
                />
              </>
            )}
            <Button
              title="Edit"
              onPress={() => setShowEditModal(true)}
              variant="outline"
              icon="pencil"
              style={styles.actionButton}
            />
            <Button
              title="Delete"
              onPress={() => setShowDeleteModal(true)}
              variant="danger"
              icon="delete"
              style={styles.actionButton}
            />
          </View>
        </Card>

        {/* Server Details */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Server Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Icon name="identifier" size={20} color="#667eea" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Server ID</Text>
                <Text style={styles.detailValue}>{server._id}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="network" size={20} color="#10b981" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Port</Text>
                <Text style={styles.detailValue}>{server.port}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="power" size={20} color="#f59e0b" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Status</Text>
                <StatusBadge status={server.status} size="small" />
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="clock-start" size={20} color="#3b82f6" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Last Started</Text>
                <Text style={styles.detailValue}>
                  {formatDate(server.lastStarted)}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="clock-stop" size={20} color="#ef4444" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Last Stopped</Text>
                <Text style={styles.detailValue}>
                  {formatDate(server.lastStopped)}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="timer" size={20} color="#8b5cf6" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Total Uptime</Text>
                <Text style={styles.detailValue}>
                  {formatUptime(server.totalUptime)}
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.envButton} 
            onPress={() => setShowEnvModal(true)}
          >
            <Icon name="code-braces" size={20} color="#667eea" />
            <Text style={styles.envButtonText}>View Environment Variables</Text>
            <Icon name="chevron-right" size={20} color="#667eea" />
          </TouchableOpacity>
        </Card>

        {/* Server Terminal */}
        <Card style={styles.terminalCard}>
          <View style={styles.terminalHeader}>
            <Text style={styles.sectionTitle}>Server Terminal</Text>
            <TouchableOpacity onPress={loadServerDetails}>
              <Icon name="refresh" size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
          <Terminal 
            logs={logs} 
            onSendCommand={handleSendCommand}
            style={styles.terminal}
            title={`${server.name} - Logs`}
          />
        </Card>

        {/* Detailed Status */}
        {detailedStatus && (
          <Card style={styles.statusCard}>
            <Text style={styles.sectionTitle}>Detailed Status</Text>
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Process ID</Text>
                <Text style={styles.statusValue}>
                  {detailedStatus.processId || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Is Running</Text>
                <Text 
                  style={[
                    styles.statusValue,
                    detailedStatus.isRunning ? styles.runningText : styles.stoppedText,
                  ]}
                >
                  {detailedStatus.isRunning ? 'Yes' : 'No'}
                </Text>
              </View>
              
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Log Count</Text>
                <Text style={styles.statusValue}>
                  {detailedStatus.logs?.length || 0}
                </Text>
              </View>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Edit Server Modal */}
      <CustomModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Server"
      >
        {editingServer && (
          <View style={styles.modalContent}>
            <Input
              label="Server Name"
              value={editingServer.name}
              onChangeText={(text) => setEditingServer({ ...editingServer, name: text })}
              placeholder="Enter server name"
            />
            <Button
              title="Save Changes"
              onPress={handleUpdate}
              variant="primary"
              size="large"
              style={styles.modalButton}
            />
            <Button
              title="Cancel"
              onPress={() => setShowEditModal(false)}
              variant="outline"
              style={styles.modalButton}
            />
          </View>
        )}
      </CustomModal>

      {/* Delete Confirmation Modal */}
      <CustomModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Server"
      >
        <View style={styles.modalContent}>
          <Icon name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.deleteText}>
            Are you sure you want to delete this server?
          </Text>
          <Text style={styles.deleteWarning}>
            This action cannot be undone. All server data and logs will be permanently deleted.
          </Text>
          <View style={styles.deleteActions}>
            <Button
              title="Delete Server"
              onPress={handleDelete}
              variant="danger"
              size="large"
              style={styles.deleteButton}
            />
            <Button
              title="Cancel"
              onPress={() => setShowDeleteModal(false)}
              variant="outline"
              style={styles.deleteButton}
            />
          </View>
        </View>
      </CustomModal>

      {/* Environment Variables Modal */}
      <CustomModal
        visible={showEnvModal}
        onClose={() => setShowEnvModal(false)}
        title="Environment Variables"
      >
        <ScrollView style={styles.envModalContent}>
          {server.environment && Object.entries(server.environment).map(([key, value]) => (
            <View key={key} style={styles.envItem}>
              <Text style={styles.envKey}>{key}</Text>
              <Input
                value={String(value)}
                editable={false}
                secureTextEntry={key.includes('SESSION') || key.includes('KEY')}
                style={styles.envValue}
              />
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => {
                  // Implement copy to clipboard
                  showMessage({
                    message: 'Copied to clipboard',
                    type: 'success',
                  });
                }}
              >
                <Icon name="content-copy" size={20} color="#667eea" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </CustomModal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notFoundText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    minWidth: 200,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerContent: {
    padding: 16,
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  serverName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  serverPort: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  actionsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
  },
  detailsCard: {
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  envButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  envButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
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
  terminal: {
    height: 400,
  },
  statusCard: {
    marginBottom: 32,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statusItem: {
    width: '33%',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  runningText: {
    color: '#10b981',
  },
  stoppedText: {
    color: '#ef4444',
  },
  modalContent: {
    padding: 20,
  },
  modalButton: {
    marginBottom: 12,
  },
  deleteText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 16,
  },
  deleteWarning: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  deleteActions: {
    gap: 12,
  },
  deleteButton: {
    width: '100%',
  },
  envModalContent: {
    maxHeight: 500,
  },
  envItem: {
    marginBottom: 12,
  },
  envKey: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  envValue: {
    position: 'relative',
  },
  copyButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    padding: 4,
  },
});

export default ServerScreen;
