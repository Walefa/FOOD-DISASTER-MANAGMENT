import React from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';
import { useNotifications } from '../../contexts/NotificationContext';

const ToastContainer: React.FC = () => {
  const { state, removeToast } = useNotifications();
  
  if (state.toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {state.toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-right-full duration-300"
        >
          <Toast
            notification={toast}
            onClose={removeToast}
            autoClose={toast.type !== 'emergency'}
            autoCloseDelay={toast.type === 'error' ? 8000 : 5000}
          />
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;