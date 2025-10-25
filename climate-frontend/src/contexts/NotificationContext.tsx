import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { NotificationData, EmergencyAlert } from '../lib/websocket';

export interface Notification extends Omit<NotificationData, 'id'> {
  id: string;
  timestamp: string;
  isRead?: boolean;
}

export interface EmergencyAlertState extends Omit<EmergencyAlert, 'id'> {
  id: string;
  timestamp: string;
  isRead?: boolean;
}

interface NotificationState {
  notifications: Notification[];
  alerts: EmergencyAlertState[];
  unreadCount: number;
  toasts: Notification[];
}

type NotificationAction =
  | { type: 'ADD_NOTIFICATION'; payload: NotificationData }
  | { type: 'ADD_ALERT'; payload: EmergencyAlert }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'CLEAR_OLD_NOTIFICATIONS' };

const initialState: NotificationState = {
  notifications: [],
  alerts: [],
  unreadCount: 0,
  toasts: []
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const notification: Notification = {
        ...action.payload,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      return {
        ...state,
        notifications: [notification, ...state.notifications].slice(0, 100), // Keep max 100
        unreadCount: state.unreadCount + 1,
        toasts: action.payload.type === 'emergency' || action.payload.priority === 'critical' 
          ? [notification, ...state.toasts]
          : [...state.toasts, notification]
      };
    }
    
    case 'ADD_ALERT': {
      const alert: EmergencyAlertState = {
        ...action.payload,
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      return {
        ...state,
        alerts: [alert, ...state.alerts].slice(0, 50), // Keep max 50 alerts
        toasts: [{ 
          ...alert, 
          type: 'emergency' as const,
          message: alert.message,
          title: alert.title 
        }, ...state.toasts]
      };
    }
    
    case 'MARK_READ': {
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
        alerts: state.alerts.map(a => 
          a.id === action.payload ? { ...a, isRead: true } : a
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    }
    
    case 'MARK_ALL_READ': {
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        alerts: state.alerts.map(a => ({ ...a, isRead: true })),
        unreadCount: 0
      };
    }
    
    case 'REMOVE_TOAST': {
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload)
      };
    }
    
    case 'CLEAR_OLD_NOTIFICATIONS': {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return {
        ...state,
        notifications: state.notifications.filter(n => 
          new Date(n.timestamp) > oneDayAgo
        ),
        alerts: state.alerts.filter(a => 
          new Date(a.timestamp) > oneDayAgo
        )
      };
    }
    
    default:
      return state;
  }
}

interface NotificationContextType {
  state: NotificationState;
  addNotification: (notification: NotificationData) => void;
  addAlert: (alert: EmergencyAlert) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeToast: (id: string) => void;
  clearOldNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  
  const addNotification = (notification: NotificationData) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };
  
  const addAlert = (alert: EmergencyAlert) => {
    dispatch({ type: 'ADD_ALERT', payload: alert });
  };
  
  const markAsRead = (id: string) => {
    dispatch({ type: 'MARK_READ', payload: id });
  };
  
  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_READ' });
  };
  
  const removeToast = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };
  
  const clearOldNotifications = () => {
    dispatch({ type: 'CLEAR_OLD_NOTIFICATIONS' });
  };
  
  const contextValue: NotificationContextType = {
    state,
    addNotification,
    addAlert,
    markAsRead,
    markAllAsRead,
    removeToast,
    clearOldNotifications
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}