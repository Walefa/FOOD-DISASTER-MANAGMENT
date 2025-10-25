import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';

interface DashboardAlertBanner {
  id: number;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  created_at: string;
  created_by_role?: string;
  created_by_organization?: string;
}

const DashboardAlertBanner: React.FC = () => {
  const [alerts, setAlerts] = useState<DashboardAlertBanner[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  useEffect(() => {
    // Fetch latest critical/high priority disasters
    const fetchCriticalAlerts = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        // Try API first
        try {
          const response = await fetch('http://localhost:8000/api/v1/disasters/alerts?active_only=true&limit=5', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const alertData = await response.json();
            setAlerts(alertData.filter((alert: any) => alert.severity === 'high' || alert.severity === 'critical'));
            return; // Exit if API works
          }
        } catch (apiError) {
          console.warn('API not available for critical alerts, using mock data:', apiError);
        }
        
        // Fallback to mock critical alerts
        const mockCriticalAlerts: DashboardAlertBanner[] = [
          {
            id: 3,
            title: 'Food Shortage Crisis - Limpopo',
            message: 'Critical food supply shortage affecting rural communities. Immediate intervention required.',
            severity: 'critical',
            location: 'Limpopo, Polokwane',
            created_at: '2024-01-13T08:20:00Z',
            created_by_role: 'ngo',
            created_by_organization: 'Limpopo Food Aid Network'
          },
          {
            id: 1,
            title: 'Flash Flood Alert - Eastern Cape',
            message: 'Severe flooding due to heavy rains affecting multiple communities.',
            severity: 'high',
            location: 'Eastern Cape, Port Elizabeth',
            created_at: '2024-01-15T10:30:00Z',
            created_by_role: 'ngo',
            created_by_organization: 'Eastern Cape Relief Fund'
          }
        ];
        
        console.log('Using mock critical alerts');
        setAlerts(mockCriticalAlerts);
        
      } catch (error) {
        console.error('Failed to fetch critical alerts:', error);
      }
    };

    fetchCriticalAlerts();
  }, []);

  const dismissAlert = (alertId: number) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 border-red-700 text-white';
      case 'high': return 'bg-orange-600 border-orange-700 text-white';
      default: return 'bg-yellow-600 border-yellow-700 text-white';
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {visibleAlerts.map((alert) => (
        <div 
          key={alert.id}
          className={`${getAlertColor(alert.severity)} rounded-lg p-4 border-l-4`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-lg">{alert.title}</h3>
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm opacity-90 mb-2">{alert.message}</p>
                <div className="flex items-center text-xs opacity-80 space-x-4">
                  {alert.location && (
                    <span>📍 {alert.location}</span>
                  )}
                  {alert.created_by_role && (
                    <span>
                      Posted by {alert.created_by_role === 'ngo' ? 'NGO' : alert.created_by_role}
                      {alert.created_by_organization && ` (${alert.created_by_organization})`}
                    </span>
                  )}
                  <span>
                    {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'Unknown date'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = `/disasters/alerts/${alert.id}`}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border-opacity-30"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Details
              </Button>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardAlertBanner;