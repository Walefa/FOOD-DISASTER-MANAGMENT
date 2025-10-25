import React from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle, Zap, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatRelativeTime } from '../../lib/utils';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { state, markAsRead, markAllAsRead, clearOldNotifications } = useNotifications();
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'emergency':
        return <Zap className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  const allItems = [
    ...state.alerts.map(alert => ({
      ...alert,
      type: 'emergency' as const,
      isAlert: true
    })),
    ...state.notifications.map(notification => ({
      ...notification,
      isAlert: false
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-25" 
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="absolute top-0 right-0 h-full w-96 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {state.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {state.unreadCount}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 py-2 border-b bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {allItems.length} total notifications
            </div>
            <button
              onClick={clearOldNotifications}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear old
            </button>
          </div>
          
          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {allItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Bell className="h-12 w-12 mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-1">
                {allItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors",
                      !item.isRead && "bg-blue-50"
                    )}
                    onClick={() => markAsRead(item.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(item.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={cn(
                            "text-sm font-medium text-gray-900 truncate",
                            !item.isRead && "font-semibold"
                          )}>
                            {item.title}
                          </h4>
                          
                          {('priority' in item && item.priority === 'critical') || 
                           ('severity' in item && item.severity === 'critical') ? (
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Critical
                            </span>
                          ) : null}
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {item.message}
                        </p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(item.timestamp)}
                          </span>
                          
                          {'category' in item && item.category && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                        
                        {item.isAlert && 'location' in item && item.location && (
                          <div className="mt-2 text-xs text-gray-500">
                            📍 {item.location}
                          </div>
                        )}
                      </div>
                      
                      <button className="flex-shrink-0 p-1 hover:bg-gray-200 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;