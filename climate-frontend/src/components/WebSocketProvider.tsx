import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  // This hook will initialize the WebSocket connection
  useWebSocket();
  
  return <>{children}</>;
};

export default WebSocketProvider;