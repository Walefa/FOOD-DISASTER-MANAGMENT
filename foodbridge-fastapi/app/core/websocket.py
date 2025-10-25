from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Any, Optional
import json
import asyncio
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """WebSocket connection manager for real-time communication"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[int, str] = {}  # user_id -> connection_id
        
    async def connect(self, websocket: WebSocket, connection_id: str, user_id: Optional[int] = None):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[connection_id] = websocket
        
        if user_id:
            self.user_connections[user_id] = connection_id
            
        logger.info(f"WebSocket connected: {connection_id}, User: {user_id}")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "message": "Connected to FOOD & DISASTER MANGEMENT real-time updates",
            "timestamp": datetime.now().isoformat(),
            "connection_id": connection_id
        }, connection_id)
        
    def disconnect(self, connection_id: str, user_id: Optional[int] = None):
        """Remove a WebSocket connection"""
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
            
        if user_id and user_id in self.user_connections:
            del self.user_connections[user_id]
            
        logger.info(f"WebSocket disconnected: {connection_id}, User: {user_id}")
        
    async def send_personal_message(self, message: Dict[str, Any], connection_id: str):
        """Send a message to a specific connection"""
        if connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {connection_id}: {e}")
                self.disconnect(connection_id)
                
    async def send_user_message(self, message: Dict[str, Any], user_id: int):
        """Send a message to a specific user"""
        if user_id in self.user_connections:
            connection_id = self.user_connections[user_id]
            await self.send_personal_message(message, connection_id)
            
    async def broadcast(self, message: Dict[str, Any], exclude_connection: Optional[str] = None):
        """Broadcast a message to all connected clients"""
        message["timestamp"] = datetime.now().isoformat()
        disconnected_connections = []
        
        for connection_id, websocket in self.active_connections.items():
            if exclude_connection and connection_id == exclude_connection:
                continue
                
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error broadcasting to {connection_id}: {e}")
                disconnected_connections.append(connection_id)
                
        # Clean up disconnected connections
        for connection_id in disconnected_connections:
            self.disconnect(connection_id)
            
    async def broadcast_to_roles(self, message: Dict[str, Any], target_roles: List[str]):
        """Broadcast a message to users with specific roles"""
        # This would require role information in connections
        # For now, broadcast to all - can be enhanced later
        await self.broadcast(message)
        
    async def send_notification(self, notification_data: Dict[str, Any], user_id: Optional[int] = None):
        """Send a notification via WebSocket"""
        message = {
            "type": "notification",
            "data": notification_data,
            "timestamp": datetime.now().isoformat()
        }
        
        if user_id:
            await self.send_user_message(message, user_id)
        else:
            await self.broadcast(message)
            
    async def send_emergency_alert(self, alert_data: Dict[str, Any]):
        """Send an emergency alert to all connected users"""
        message = {
            "type": "emergency_alert",
            "data": alert_data,
            "priority": "high",
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast(message)
        logger.warning(f"Emergency alert broadcasted: {alert_data.get('title', 'Unknown')}")
        
    async def send_system_update(self, update_data: Dict[str, Any]):
        """Send system updates like dashboard refreshes"""
        message = {
            "type": "system_update",
            "data": update_data,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.broadcast(message)
        
    def get_connection_count(self) -> int:
        """Get the number of active connections"""
        return len(self.active_connections)
        
    def get_user_count(self) -> int:
        """Get the number of authenticated users connected"""
        return len(self.user_connections)

# Global connection manager instance
manager = ConnectionManager()

async def handle_websocket_message(websocket: WebSocket, connection_id: str, message: str):
    """Handle incoming WebSocket messages from clients"""
    try:
        data = json.loads(message)
        message_type = data.get("type", "unknown")
        
        if message_type == "ping":
            # Respond to ping with pong
            await manager.send_personal_message({
                "type": "pong",
                "timestamp": datetime.now().isoformat()
            }, connection_id)
            
        elif message_type == "subscribe_notifications":
            # Handle notification subscription
            await manager.send_personal_message({
                "type": "subscription_confirmed",
                "message": "Subscribed to real-time notifications"
            }, connection_id)
            
        elif message_type == "user_activity":
            # Handle user activity updates
            activity_data = data.get("data", {})
            # You can process user activity here
            logger.info(f"User activity from {connection_id}: {activity_data}")
            
        else:
            logger.warning(f"Unknown message type: {message_type} from {connection_id}")
            
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON message from {connection_id}: {message}")
    except Exception as e:
        logger.error(f"Error handling message from {connection_id}: {e}")

# Global websocket manager instance
websocket_manager = manager