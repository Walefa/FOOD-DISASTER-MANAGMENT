import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Eye,
  ExternalLink,
  Siren
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

interface DisasterAlert {
  id: number;
  title: string;
  description: string;
  disaster_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
  created_by: number;
  created_by_username?: string;
  created_by_role?: string;
  created_by_organization?: string;
}

interface DisasterAlertsProps {
  userRole?: string;
  maxAlerts?: number;
}

const DisasterAlerts: React.FC<DisasterAlertsProps> = ({ maxAlerts = 3 }) => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { state } = useNotifications();

  // Fetch latest disaster alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        // Try API first
        try {
          const response = await fetch(`http://localhost:8000/api/v1/disasters/alerts?active_only=true&limit=${maxAlerts}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const alertData = await response.json();
            console.log('Fetched disaster alerts from API:', alertData);
            setAlerts(alertData);
            return; // Exit if API works
          }
        } catch (apiError) {
          console.warn('API not available, using mock data:', apiError);
        }
        
        // Fallback to mock data
        const mockAlerts: DisasterAlert[] = [
          {
            id: 1,
            title: 'Flash Flood Alert - Eastern Cape',
            description: 'Severe flooding due to heavy rains affecting multiple communities.',
            disaster_type: 'flood',
            severity: 'high',
            location: 'Eastern Cape, Port Elizabeth',
            latitude: -33.9608,
            longitude: 25.6022,
            is_active: true,
            created_at: '2024-01-15T10:30:00Z',
            created_by: 1,
            created_by_role: 'ngo',
            created_by_organization: 'Eastern Cape Relief Fund'
          },
          {
            id: 3,
            title: 'Food Shortage Crisis - Limpopo',
            description: 'Critical food supply shortage affecting rural communities.',
            disaster_type: 'food_shortage',
            severity: 'critical',
            location: 'Limpopo, Polokwane',
            latitude: -23.9045,
            longitude: 29.4689,
            is_active: true,
            created_at: '2024-01-13T08:20:00Z',
            created_by: 1,
            created_by_role: 'ngo',
            created_by_organization: 'Limpopo Food Aid Network'
          },
          {
            id: 2,
            title: 'Drought Warning - Western Cape',
            description: 'Extended dry period threatening agricultural areas and water supplies.',
            disaster_type: 'drought',
            severity: 'medium',
            location: 'Western Cape, Cape Town',
            latitude: -33.9249,
            longitude: 18.4241,
            is_active: true,
            created_at: '2024-01-14T15:45:00Z',
            created_by: 2,
            created_by_role: 'emergency_responder',
            created_by_organization: 'Cape Town Emergency Services'
          }
        ];
        
        console.log('Using mock disaster alerts');
        setAlerts(mockAlerts.slice(0, maxAlerts));
        
      } catch (error) {
        console.error('Failed to fetch disaster alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [maxAlerts]);

  // Listen for real-time disaster alerts from notifications
  useEffect(() => {
    const disasterNotifications = state.notifications.filter((n: any) => 
      n.category === 'disaster_alert' || n.type === 'emergency'
    );
    
    // If we have new disaster notifications, refetch alerts
    if (disasterNotifications.length > 0) {
      // Refresh alerts when new disaster notifications arrive
      const timer = setTimeout(() => {
        const fetchAlerts = async () => {
          try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`http://localhost:8000/api/v1/disasters/alerts?active_only=true&limit=${maxAlerts}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const alertData = await response.json();
              console.log('Refreshed disaster alerts:', alertData);
              setAlerts(alertData);
            } else {
              console.error('Failed to refresh alerts:', response.status, response.statusText);
            }
          } catch (error) {
            console.error('Failed to fetch disaster alerts:', error);
          }
        };
        
        fetchAlerts();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state.notifications, maxAlerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDisasterIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'flood': return '🌊';
      case 'drought': return '🌵';
      case 'wildfire': return '🔥';
      case 'storm': return '⛈️';
      case 'earthquake': return '🏚️';
      default: return '⚠️';
    }
  };

  const formatTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'ngo': return 'NGO';
      case 'emergency_responder': return 'Emergency Responder';
      case 'community_leader': return 'Community Leader';
      case 'farmer': return 'Farmer';
      case 'admin': return 'Administrator';
      default: return role?.replace('_', ' ').toUpperCase() || 'User';
    }
  };

  if (loading) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Siren className="h-5 w-5 text-orange-600 mr-2" />
            Active Disaster Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading alerts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${alerts.length > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Siren className={`h-5 w-5 mr-2 ${alerts.length > 0 ? 'text-red-600' : 'text-green-600'}`} />
            Active Disaster Alerts
            {alerts.length > 0 && (
              <Badge className="ml-2 bg-red-600 text-white">
                {alerts.length}
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setLoading(true);
                const fetchAlerts = async () => {
                  try {
                    const token = localStorage.getItem('access_token');
                    const response = await fetch(`http://localhost:8000/api/v1/disasters/alerts?active_only=true&limit=${maxAlerts}`, {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    });
                    
                    if (response.ok) {
                      const alertData = await response.json();
                      console.log('Manual refresh - disaster alerts:', alertData);
                      setAlerts(alertData);
                    }
                  } catch (error) {
                    console.error('Failed to manually refresh alerts:', error);
                  } finally {
                    setLoading(false);
                  }
                };
                fetchAlerts();
              }}
            >
              🔄 Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/disasters'}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              View All
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center text-green-700 py-4">
            <AlertTriangle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="font-medium">No Active Disasters</p>
            <p className="text-sm">All clear in your monitored areas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="bg-white rounded-lg border border-red-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">
                        {getDisasterIcon(alert.disaster_type)}
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {alert.disaster_type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">
                      {alert.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      {alert.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {alert.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(alert.created_at)}
                      </div>
                      {(alert.created_by_role || alert.created_by_organization) && (
                        <div className="flex items-center">
                          <span className="font-medium">
                            Posted by {getRoleDisplayName(alert.created_by_role)}
                            {alert.created_by_organization && ` (${alert.created_by_organization})`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/disasters/${alert.id}`)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DisasterAlerts;