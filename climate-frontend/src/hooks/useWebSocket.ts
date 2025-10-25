import { useEffect, useRef } from 'react';
import { wsClient } from '../lib/websocket';
import { useNotifications } from '../contexts/NotificationContext';

export function useWebSocket() {
  const { addNotification, addAlert } = useNotifications();
  const isInitialized = useRef(false);
  
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    // Set up WebSocket event handlers
    wsClient.onNotification = (notification) => {
      console.log('Received notification:', notification);
      try { addNotification(notification); } catch (e) { console.warn('addNotification failed', e); }
    };

    wsClient.onEmergencyAlert = (alert) => {
      console.log('Received emergency alert:', alert);
      try { addAlert(alert); } catch (e) { console.warn('addAlert failed', e); }
    };

    wsClient.onSystemUpdate = (update) => {
      console.log('Received system update:', update);
      // Handle system updates - refresh data, update UI, etc.
      if (update.event_type === 'data_update') {
        // Could trigger data refreshes here
        try {
          addNotification({
            title: 'Data Updated',
            message: `${update.data_type} has been ${update.change_type}d`,
            type: 'info',
            category: 'system'
          } as any);
        } catch (e) {
          console.warn('addNotification in system update failed', e);
        }
      }
    };

    wsClient.onConnectionChange = (connected) => {
      if (connected) {
        try {
          addNotification({
            title: 'Connected',
            message: 'Real-time updates enabled',
            type: 'success',
            priority: 'low'
          } as any);
        } catch (e) { console.warn('addNotification on connect failed', e); }
      } else {
        try {
          addNotification({
            title: 'Disconnected',
            message: 'Real-time updates disabled. Attempting to reconnect...',
            type: 'warning',
            priority: 'medium'
          } as any);
        } catch (e) { console.warn('addNotification on disconnect failed', e); }
      }
    };

    wsClient.onError = (error) => {
      try {
        addNotification({
          title: 'Connection Error',
          message: typeof error === 'string' ? error : String(error),
          type: 'error',
          priority: 'medium'
        } as any);
      } catch (e) { console.warn('addNotification on error failed', e); }
    };

    // Connect with auth token if available
    try {
      const token = localStorage.getItem('access_token');
      wsClient.connect(token || undefined);
    } catch (e) {
      console.warn('WebSocket connect failed', e);
    }

    // Cleanup on unmount
    return () => {
      try { wsClient.disconnect(); } catch (e) { /* ignore */ }
    };
  }, [addNotification, addAlert]);
  
  return {
    isConnected: wsClient.isConnected(),
    sendActivity: wsClient.sendActivity.bind(wsClient),
    disconnect: wsClient.disconnect.bind(wsClient),
    connect: wsClient.connect.bind(wsClient)
  };
}