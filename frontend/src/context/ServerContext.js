import React, { createContext, useState, useContext, useEffect } from 'react';
import { showMessage } from 'react-native-flash-message';

// Services
import api from '../services/api';
import socketService from '../services/socket';

// Context
import { AuthContext } from './AuthContext';

// Create context
export const ServerContext = createContext();

export const ServerProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [serverLogs, setServerLogs] = useState({});

  // Load user's servers
  useEffect(() => {
    if (user) {
      loadServers();
      setupSocketListeners();
    }
  }, [user]);

  const setupSocketListeners = () => {
    // Listen for server status updates
    socketService.addListener('server-status', (data) => {
      if (data.serverId) {
        updateServerStatus(data.serverId, data.status);
      }
    });

    // Listen for server logs
    socketService.addListener('log', (data) => {
      if (data.serverId) {
        addServerLog(data.serverId, data);
      }
    });
  };

  const loadServers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/servers');
      setServers(response.servers || []);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load servers');
      showMessage({
        message: 'Failed to load servers',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshServers = async () => {
    await loadServers();
  };

  const createServer = async (serverData) => {
    try {
      setLoading(true);
      const response = await api.post('/servers/create', serverData);
      
      // Add new server to list
      setServers(prev => [...prev, response.server]);
      
      showMessage({
        message: 'Server created successfully',
        type: 'success',
      });
      
      return response.server;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to create server';
      setError(errorMsg);
      showMessage({
        message: errorMsg,
        type: 'danger',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const startServer = async (serverId) => {
    try {
      const response = await api.post(`/servers/${serverId}/start`);
      
      // Update server status
      updateServerStatus(serverId, 'starting');
      
      // Join server room for real-time updates
      socketService.joinServerRoom(serverId);
      
      showMessage({
        message: 'Server starting...',
        type: 'info',
      });
      
      return response;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to start server';
      showMessage({
        message: errorMsg,
        type: 'danger',
      });
      throw error;
    }
  };

  const stopServer = async (serverId) => {
    try {
      const response = await api.post(`/servers/${serverId}/stop`);
      
      // Update server status
      updateServerStatus(serverId, 'stopping');
      
      showMessage({
        message: 'Server stopping...',
        type: 'info',
      });
      
      return response;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to stop server';
      showMessage({
        message: errorMsg,
        type: 'danger',
      });
      throw error;
    }
  };

  const restartServer = async (serverId) => {
    try {
      const response = await api.post(`/servers/${serverId}/restart`);
      
      // Update server status
      updateServerStatus(serverId, 'restarting');
      
      showMessage({
        message: 'Server restarting...',
        type: 'info',
      });
      
      return response;
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to restart server';
      showMessage({
        message: errorMsg,
        type: 'danger',
      });
      throw error;
    }
  };

  const deleteServer = async (serverId) => {
    try {
      await api.delete(`/servers/${serverId}`);
      
      // Remove server from list
      setServers(prev => prev.filter(server => server._id !== serverId));
      
      // Leave server room
      socketService.leaveServerRoom(serverId);
      
      showMessage({
        message: 'Server deleted successfully',
        type: 'success',
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to delete server';
      showMessage({
        message: errorMsg,
        type: 'danger',
      });
      throw error;
    }
  };

  const updateServerStatus = (serverId, status) => {
    setServers(prev => prev.map(server => {
      if (server._id === serverId) {
        return { ...server, status };
      }
      return server;
    }));
  };

  const addServerLog = (serverId, log) => {
    setServerLogs(prev => {
      const currentLogs = prev[serverId] || [];
      return {
        ...prev,
        [serverId]: [...currentLogs, log],
      };
    });
  };

  const getServerLogs = (serverId) => {
    return serverLogs[serverId] || [];
  };

  const clearServerLogs = (serverId) => {
    setServerLogs(prev => {
      const newLogs = { ...prev };
      delete newLogs[serverId];
      return newLogs;
    });
  };

  const selectServer = (server) => {
    setSelectedServer(server);
    // Join server room for real-time updates
    if (server) {
      socketService.joinServerRoom(server._id);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    servers,
    loading,
    error,
    selectedServer,
    serverLogs,
    loadServers,
    refreshServers,
    createServer,
    startServer,
    stopServer,
    restartServer,
    deleteServer,
    getServerLogs,
    clearServerLogs,
    selectServer,
    clearError,
  };

  return (
    <ServerContext.Provider value={value}>
      {children}
    </ServerContext.Provider>
  );
};
