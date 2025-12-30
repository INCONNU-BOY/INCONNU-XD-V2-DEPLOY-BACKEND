import { useContext } from 'react';
import { ServerContext } from '../context/ServerContext';

export const useServers = () => {
  const context = useContext(ServerContext);
  
  if (!context) {
    throw new Error('useServers must be used within a ServerProvider');
  }
  
  return context;
};
