export interface WebSocketMessage {
  type: string;
  data?: any;
  notification?: any;
  timestamp?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationData {
  id?: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'emergency';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  action_url?: string;
  created_at?: string;
}

export interface EmergencyAlert {
  id?: number;
  title: string;
  message: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  latitude?: number;
  longitude?: number;
  emergency_contact?: string;
  response_instructions?: string;
  created_at?: string;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private connectionId: string;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isManuallyDisconnected = false;
  
  // Event handlers
  public onNotification?: (notification: NotificationData) => void;
  public onEmergencyAlert?: (alert: EmergencyAlert) => void;
  public onSystemUpdate?: (update: any) => void;
  public onConnectionChange?: (connected: boolean) => void;
  public onError?: (error: string) => void;
  
  constructor(baseUrl: string = 'ws://localhost:8000') {
    this.connectionId = this.generateConnectionId();
    this.url = `${baseUrl}/api/v1/realtime/ws/${this.connectionId}`;
  }
  
  private generateConnectionId(): string {
    return 'client_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  connect(token?: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }
    
    this.isManuallyDisconnected = false;
    
    try {
      let wsUrl = this.url;
      if (token) {
        wsUrl += `?token=${encodeURIComponent(token)}`;
      }
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.onConnectionChange?.(true);
        
        // Send initial ping
        this.send({
          type: 'ping'
        });
        
        // Subscribe to notifications
        this.send({
          type: 'subscribe_notifications'
        });
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.onConnectionChange?.(false);
        
        if (!this.isManuallyDisconnected) {
          this.attemptReconnect();
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError?.('WebSocket connection error');
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.onError?.('Failed to establish WebSocket connection');
    }
  }
  
  private handleMessage(message: WebSocketMessage): void {
    console.log('WebSocket message received:', message);
    
    switch (message.type) {
      case 'notification':
        if (message.data && this.onNotification) {
          this.onNotification(message.data as NotificationData);
        }
        break;
        
      case 'disaster_alert':
        // Handle disaster alert - trigger both notification and emergency alert
        if (message.data && message.notification) {
          // Show as notification
          if (this.onNotification) {
            this.onNotification(message.notification as NotificationData);
          }
          
          // Also show as emergency alert for high/critical severity
          if (message.data.severity === 'high' || message.data.severity === 'critical') {
            if (this.onEmergencyAlert) {
              this.onEmergencyAlert({
                id: message.data.id,
                title: message.data.title,
                message: message.data.description,
                alert_type: message.data.disaster_type,
                severity: message.data.severity,
                location: message.data.location,
                latitude: message.data.latitude,
                longitude: message.data.longitude,
                created_at: message.data.created_at
              } as EmergencyAlert);
            }
          }
        }
        break;
        
      case 'emergency_alert':
        if (message.data && this.onEmergencyAlert) {
          this.onEmergencyAlert(message.data as EmergencyAlert);
        }
        break;
        
      case 'system_update':
        if (message.data && this.onSystemUpdate) {
          this.onSystemUpdate(message.data);
        }
        break;
        
      case 'connection_established':
        console.log('WebSocket connection established:', message.data);
        break;
        
      case 'pong':
        // Handle ping response
        break;
        
      case 'subscription_confirmed':
        console.log('Subscription confirmed:', message.data);
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.onError?.('Connection lost - maximum reconnection attempts exceeded');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isManuallyDisconnected) {
        this.connect();
      }
    }, delay);
  }
  
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  }
  
  disconnect(): void {
    this.isManuallyDisconnected = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
  
  // Send user activity update
  sendActivity(activity: { page?: string; action?: string; timestamp?: string }): void {
    this.send({
      type: 'user_activity',
      data: {
        ...activity,
        timestamp: activity.timestamp || new Date().toISOString()
      }
    });
  }
}

// Global WebSocket client instance
export const wsClient = new WebSocketClient();