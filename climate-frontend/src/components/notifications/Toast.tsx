import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Notification } from '../../contexts/NotificationContext';

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  notification, 
  onClose, 
  autoClose = true,
  autoCloseDelay = 5000 
}) => {
  const timerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (autoClose && notification.type !== 'emergency') {
      timerRef.current = setTimeout(() => {
        onClose(notification.id);
      }, autoCloseDelay);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoClose, autoCloseDelay, notification.id, notification.type, onClose]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'emergency':
        return <Zap className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    const base = "relative flex items-start p-4 rounded-lg shadow-lg border-l-4 max-w-sm";
    
    switch (notification.type) {
      case 'success':
        return cn(base, "bg-green-50 border-green-400 text-green-900");
      case 'warning':
        return cn(base, "bg-yellow-50 border-yellow-400 text-yellow-900");
      case 'error':
        return cn(base, "bg-red-50 border-red-400 text-red-900");
      case 'emergency':
        return cn(base, "bg-red-100 border-red-600 text-red-900 animate-pulse");
      default:
        return cn(base, "bg-blue-50 border-blue-400 text-blue-900");
    }
  };

  const getIconStyles = () => {
    switch (notification.type) {
      case 'success':
        return "text-green-500";
      case 'warning':
        return "text-yellow-500";
      case 'error':
        return "text-red-500";
      case 'emergency':
        return "text-red-600";
      default:
        return "text-blue-500";
    }
  };

  return (
    <div className={getStyles()}>
      <div className={cn("flex-shrink-0", getIconStyles())}>
        {getIcon()}
      </div>
      
      <div className="ml-3 flex-1">
        <h4 className="text-sm font-medium mb-1">
          {notification.title}
        </h4>
        <p className="text-sm opacity-90">
          {notification.message}
        </p>
        
        {notification.priority === 'critical' && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-200 text-red-800">
              CRITICAL
            </span>
          </div>
        )}
        
        {notification.action_url && (
          <div className="mt-2">
            <button 
              onClick={() => window.location.href = notification.action_url!}
              className="text-xs font-medium underline hover:no-underline"
            >
              View Details
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => onClose(notification.id)}
        className="flex-shrink-0 ml-4 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;