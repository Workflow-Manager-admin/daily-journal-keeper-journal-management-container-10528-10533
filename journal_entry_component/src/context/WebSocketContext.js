import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import websocketService from '../services/websocketService';

/**
 * Context for WebSocket state and methods
 */
const WebSocketContext = createContext(null);

// PUBLIC_INTERFACE
export const WebSocketProvider = ({ children }) => {
  const [connectionState, setConnectionState] = useState('disconnected');
  const [error, setError] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [lastConnected, setLastConnected] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    let mounted = true;
    let retryTimeout;
    // Set up event listeners
    const onConnect = () => {
      if (mounted) {
        setConnectionState('connected');
        setError(null);
        setLastConnected(new Date().toISOString());
        setConnectionAttempts(0);
        setReconnectAttempt(0);
      }
    };

    const onDisconnect = (reason) => {
      if (mounted) {
        setConnectionState('disconnected');
        setError(`Disconnected: ${reason || 'Unknown reason'}`);
        setConnectionAttempts(prev => prev + 1);
        
        // Log disconnect event for debugging
        console.warn('WebSocket disconnected:', {
          reason,
          lastConnected,
          connectionAttempts: connectionAttempts + 1,
          reconnectAttempt
        });
      }
    };

    const onError = (err) => {
      if (mounted) {
        setError(err.message);
      }
    };

    const onReconnectAttempt = (attemptNumber) => {
      if (mounted) {
        setConnectionState('connecting');
        setReconnectAttempt(attemptNumber);
      }
    };

    const onReconnectFailed = () => {
      if (mounted) {
        setConnectionState('disconnected');
        setError('Failed to reconnect after maximum attempts');
      }
    };

    // Register listeners
    websocketService.on('connect', onConnect);
    websocketService.on('disconnect', onDisconnect);
    websocketService.on('error', onError);
    websocketService.on('reconnect_attempt', onReconnectAttempt);
    websocketService.on('reconnect_failed', onReconnectFailed);

    // Connect to WebSocket server with retry mechanism
    const connectWithRetry = () => {
      if (!mounted) return;
      
      try {
        websocketService.connect();
      } catch (err) {
        console.error('Failed to connect:', err);
        if (mounted) {
          retryTimeout = setTimeout(connectWithRetry, 5000);
        }
      }
    };

    connectWithRetry();

    // Cleanup on unmount
    return () => {
      mounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      websocketService.off('connect', onConnect);
      websocketService.off('disconnect', onDisconnect);
      websocketService.off('error', onError);
      websocketService.off('reconnect_attempt', onReconnectAttempt);
      websocketService.off('reconnect_failed', onReconnectFailed);
      websocketService.disconnect();
    };
  }, []);

  const value = useMemo(() => ({
    connectionState,
    error,
    reconnectAttempt,
    lastConnected,
    connectionAttempts,
    isConnected: websocketService.isConnected(),
    emit: websocketService.emit.bind(websocketService),
    on: websocketService.on.bind(websocketService),
    off: websocketService.off.bind(websocketService),
    connect: websocketService.connect.bind(websocketService),
    disconnect: websocketService.disconnect.bind(websocketService),
    getConnectionState: websocketService.getConnectionState.bind(websocketService),
  }), [connectionState, error, reconnectAttempt, lastConnected, connectionAttempts]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

WebSocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// PUBLIC_INTERFACE
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
