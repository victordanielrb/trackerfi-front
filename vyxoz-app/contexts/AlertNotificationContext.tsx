import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { Platform, Vibration } from 'react-native';
import { useAuth } from './AuthContext';
import { API_CONFIG } from '../constants/api';

// Alert event from backend WebSocket
export interface AlertTriggeredEvent {
  type: 'alert_triggered';
  data: {
    token_name: string;
    token_symbol: string;
    alert_type: 'price_above' | 'price_below';
    threshold_price: number;
    current_price: number;
    triggered_at: string;
  };
}

// Notification to display in UI
export interface AlertNotification {
  id: string;
  token_name: string;
  token_symbol: string;
  alert_type: 'price_above' | 'price_below';
  threshold_price: number;
  current_price: number;
  triggered_at: string;
  read: boolean;
}

interface AlertNotificationContextType {
  notifications: AlertNotification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  dismissNotification: (id: string) => void;
}

const AlertNotificationContext = createContext<AlertNotificationContextType | undefined>(undefined);

interface AlertNotificationProviderProps {
  children: ReactNode;
}

export const AlertNotificationProvider: React.FC<AlertNotificationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  // Get WebSocket URL from API base URL
  const getWsUrl = useCallback(() => {
    const baseUrl = API_CONFIG.BASE_URL || 'http://localhost:3000';
    // Convert http(s) to ws(s)
    const wsUrl = baseUrl.replace(/^http/, 'ws');
    return `${wsUrl}/ws`;
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!isAuthenticated || !user?.id) {
      console.log('[AlertWS] Not authenticated, skipping connection');
      return;
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const wsUrl = getWsUrl();
      console.log('[AlertWS] Connecting to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[AlertWS] Connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // Identify ourselves with user ID
        ws.send(JSON.stringify({ type: 'hello', userId: user.id }));
        console.log('[AlertWS] Sent hello with userId:', user.id);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          console.log('[AlertWS] Received:', data);
          
          if (data.type === 'alert_triggered') {
            handleAlertTriggered(data as AlertTriggeredEvent);
          }
        } catch (e) {
          console.warn('[AlertWS] Failed to parse message:', event.data);
        }
      };

      ws.onerror = (error) => {
        console.warn('[AlertWS] Error:', error);
      };

      ws.onclose = (event) => {
        console.log('[AlertWS] Disconnected, code:', event.code);
        setIsConnected(false);
        wsRef.current = null;
        
        // Attempt to reconnect if authenticated
        if (isAuthenticated && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(`[AlertWS] Reconnecting in ${RECONNECT_DELAY}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        }
      };
    } catch (e) {
      console.warn('[AlertWS] Failed to create WebSocket:', e);
    }
  }, [isAuthenticated, user?.id, getWsUrl]);

  // Handle incoming alert
  const handleAlertTriggered = (event: AlertTriggeredEvent) => {
    const notification: AlertNotification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      token_name: event.data.token_name,
      token_symbol: event.data.token_symbol,
      alert_type: event.data.alert_type,
      threshold_price: event.data.threshold_price,
      current_price: event.data.current_price,
      triggered_at: event.data.triggered_at,
      read: false,
    };

    console.log('[AlertWS] New notification:', notification);

    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);

    // Vibrate on mobile
    if (Platform.OS !== 'web') {
      Vibration.vibrate([0, 200, 100, 200]);
    }

    // Show native alert for immediate feedback
    const direction = event.data.alert_type === 'price_above' ? '📈 above' : '📉 below';
    const message = `${event.data.token_symbol} is now ${direction} $${event.data.threshold_price.toLocaleString()}\nCurrent price: $${event.data.current_price.toLocaleString()}`;
    
    if (Platform.OS === 'web') {
      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🚨 ${event.data.token_name} Alert`, { body: message });
      } else {
        console.log('🚨 Alert:', message);
      }
    } else {
      // React Native Alert
      const { Alert } = require('react-native');
      Alert.alert(`🚨 ${event.data.token_name} Alert`, message);
    }
  };

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connect();
    } else {
      // Disconnect when logged out
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated, user?.id, connect]);

  // Request browser notification permission
  useEffect(() => {
    if (Platform.OS === 'web' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value: AlertNotificationContextType = {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    dismissNotification,
  };

  return (
    <AlertNotificationContext.Provider value={value}>
      {children}
    </AlertNotificationContext.Provider>
  );
};

export const useAlertNotifications = (): AlertNotificationContextType => {
  const context = useContext(AlertNotificationContext);
  if (context === undefined) {
    throw new Error('useAlertNotifications must be used within an AlertNotificationProvider');
  }
  return context;
};

export default AlertNotificationContext;
