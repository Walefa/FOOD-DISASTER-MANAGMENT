import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  ArrowLeft,
  MapPin, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  Share,
  Download,
  MessageCircle,
  Navigation,
  Calendar,
  Info,
  Shield,
  Zap
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { formatDate, formatRelativeTime, getDisasterIcon } from '../lib/utils';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DisasterDetail {
  id: number;
  title: string;
  description: string;
  disaster_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  created_by_username?: string;
  created_by_role?: string;
  created_by_organization?: string;
  start_time?: string;
  end_time?: string;
  source?: string;
  confidence_score?: number;
}

const DisasterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [disaster, setDisaster] = useState<DisasterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisasterDetail = async () => {
      if (!id) {
        setError('No disaster ID provided');
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        
        // Try API first
        try {
          const response = await fetch(`http://localhost:8000/api/v1/disasters/alerts/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const disasterData = await response.json();
            console.log('Fetched disaster detail from API:', disasterData);
            setDisaster(disasterData);
            setLoading(false);
            return;
          } else if (response.status === 404) {
            setError('Disaster not found');
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.warn('API not available, using mock data:', apiError);
        }
        
        // Fallback to mock data based on ID
        const mockDisasters: DisasterDetail[] = [
          {
            id: 1,
            title: 'Flash Flood Alert - Eastern Cape',
            description: 'Severe flooding due to heavy rains affecting multiple communities in the Eastern Cape region. Water levels have risen rapidly, affecting roads, bridges, and residential areas. Emergency evacuation procedures are in effect for low-lying areas.',
            disaster_type: 'flood',
            severity: 'high',
            location: 'Eastern Cape, Port Elizabeth',
            latitude: -33.9608,
            longitude: 25.6022,
            radius_km: 25,
            is_active: true,
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T12:15:00Z',
            created_by: 1,
            created_by_role: 'ngo',
            created_by_organization: 'Eastern Cape Relief Fund',
            start_time: '2024-01-15T08:00:00Z',
            source: 'Weather Service + Field Reports',
            confidence_score: 0.92
          },
          {
            id: 2,
            title: 'Emergency Food Shortage - Soweto',
            description: 'Critical food shortage affecting 2000+ families in Soweto area. Immediate food aid needed. Contact local food banks and emergency services. Distribution points have been established at community centers.',
            disaster_type: 'food_shortage',
            severity: 'critical',
            location: 'Soweto, Johannesburg',
            latitude: -26.2678,
            longitude: 27.8546,
            radius_km: 15,
            is_active: true,
            created_at: '2024-01-13T08:20:00Z',
            created_by: 1,
            created_by_role: 'ngo',
            created_by_organization: 'Limpopo Food Aid Network',
            start_time: '2024-01-10T00:00:00Z',
            source: 'Community Assessment',
            confidence_score: 0.95
          },
          {
            id: 3,
            title: 'Drought Warning - Western Cape',
            description: 'Extended dry period threatening agricultural areas and water supplies in the Western Cape. Dam levels are critically low and water restrictions are in effect. Agricultural yields are expected to be severely impacted.',
            disaster_type: 'drought',
            severity: 'medium',
            location: 'Western Cape, Cape Town',
            latitude: -33.9249,
            longitude: 18.4241,
            radius_km: 50,
            is_active: true,
            created_at: '2024-01-14T15:45:00Z',
            created_by: 2,
            created_by_role: 'emergency_responder',
            created_by_organization: 'Cape Town Emergency Services',
            start_time: '2023-12-01T00:00:00Z',
            source: 'Weather Monitoring + Satellite Data',
            confidence_score: 0.88
          }
        ];
        
        const mockDisaster = mockDisasters.find(d => d.id === parseInt(id));
        if (mockDisaster) {
          console.log('Using mock disaster detail');
          setDisaster(mockDisaster);
        } else {
          setError('Disaster not found');
        }
        
      } catch (error) {
        console.error('Failed to fetch disaster detail:', error);
        setError('Failed to load disaster details');
      } finally {
        setLoading(false);
      }
    };

    fetchDisasterDetail();
  }, [id]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <Zap className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <Shield className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const handleShare = async () => {
    if (navigator.share && disaster) {
      try {
        await navigator.share({
          title: disaster.title,
          text: disaster.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownloadReport = () => {
    if (!disaster) return;
    
    const reportContent = `
DISASTER ALERT REPORT
====================

Title: ${disaster.title}
Type: ${disaster.disaster_type.toUpperCase()}
Severity: ${disaster.severity.toUpperCase()}
Location: ${disaster.location}
Status: ${disaster.is_active ? 'ACTIVE' : 'INACTIVE'}

Description:
${disaster.description}

Details:
- Reported: ${formatDate(disaster.created_at)}
- Source: ${disaster.source || 'N/A'}
- Confidence: ${disaster.confidence_score ? (disaster.confidence_score * 100).toFixed(1) + '%' : 'N/A'}
${disaster.radius_km ? `- Affected Radius: ${disaster.radius_km} km` : ''}

Coordinates:
- Latitude: ${disaster.latitude || 'N/A'}
- Longitude: ${disaster.longitude || 'N/A'}

Reported by:
- Organization: ${disaster.created_by_organization || 'N/A'}
- Role: ${disaster.created_by_role || 'N/A'}

Generated: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disaster-report-${disaster.id}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading disaster details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/disasters')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Disasters
          </Button>
        </div>
      </div>
    );
  }

  if (!disaster) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Disaster Not Found</h2>
          <p className="text-gray-600 mb-4">The requested disaster could not be found.</p>
          <Button onClick={() => navigate('/disasters')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Disasters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/disasters')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Disasters
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center mb-2">
              <span className="text-3xl mr-3">{getDisasterIcon(disaster.disaster_type)}</span>
              <h1 className="text-3xl font-bold text-gray-900">{disaster.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={`${getSeverityColor(disaster.severity)} flex items-center`}>
                {getSeverityIcon(disaster.severity)}
                <span className="ml-1">{disaster.severity.toUpperCase()}</span>
              </Badge>
              <Badge variant="outline">
                {disaster.disaster_type.toUpperCase()}
              </Badge>
              <Badge variant={disaster.is_active ? "default" : "secondary"}>
                {disaster.is_active ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleShare}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{disaster.description}</p>
            </CardContent>
          </Card>

          {/* Map */}
          {disaster.latitude && disaster.longitude && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Location & Affected Area
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 rounded-lg overflow-hidden">
                  <MapContainer
                    key={`disaster-map-${disaster.id}`}
                    center={[disaster.latitude, disaster.longitude]}
                    zoom={10}
                    className="h-full w-full"
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    <Marker position={[disaster.latitude, disaster.longitude]}>
                      <Popup>
                        <div className="text-center">
                          <strong>{disaster.title}</strong><br />
                          {disaster.location}
                        </div>
                      </Popup>
                    </Marker>
                    {disaster.radius_km && (
                      <Circle
                        center={[disaster.latitude, disaster.longitude]}
                        radius={disaster.radius_km * 1000} // Convert km to meters
                        pathOptions={{
                          fillColor: disaster.severity === 'critical' ? '#dc2626' : 
                                    disaster.severity === 'high' ? '#ea580c' : 
                                    disaster.severity === 'medium' ? '#d97706' : '#eab308',
                          fillOpacity: 0.2,
                          stroke: true,
                          color: disaster.severity === 'critical' ? '#dc2626' : 
                                disaster.severity === 'high' ? '#ea580c' : 
                                disaster.severity === 'medium' ? '#d97706' : '#eab308'
                        }}
                      />
                    )}
                  </MapContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Coordinates:</strong><br />
                    {disaster.latitude?.toFixed(4)}, {disaster.longitude?.toFixed(4)}
                  </div>
                  {disaster.radius_km && (
                    <div>
                      <strong>Affected Radius:</strong><br />
                      {disaster.radius_km} km
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Disaster Reported</p>
                    <p className="text-sm text-gray-600">{formatDate(disaster.created_at)} ({formatRelativeTime(disaster.created_at)})</p>
                  </div>
                </div>
                {disaster.start_time && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Disaster Started</p>
                      <p className="text-sm text-gray-600">{formatDate(disaster.start_time)} ({formatRelativeTime(disaster.start_time)})</p>
                    </div>
                  </div>
                )}
                {disaster.updated_at && disaster.updated_at !== disaster.created_at && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-sm text-gray-600">{formatDate(disaster.updated_at)} ({formatRelativeTime(disaster.updated_at)})</p>
                    </div>
                  </div>
                )}
                {disaster.end_time && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Disaster Ended</p>
                      <p className="text-sm text-gray-600">{formatDate(disaster.end_time)} ({formatRelativeTime(disaster.end_time)})</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{disaster.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{disaster.disaster_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Severity:</span>
                <Badge className={getSeverityColor(disaster.severity)}>
                  {disaster.severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={disaster.is_active ? "default" : "secondary"}>
                  {disaster.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              {disaster.confidence_score && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-medium">{(disaster.confidence_score * 100).toFixed(1)}%</span>
                </div>
              )}
              {disaster.source && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Source:</span>
                  <span className="font-medium text-sm">{disaster.source}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reported By */}
          {(disaster.created_by_organization || disaster.created_by_role) && (
            <Card>
              <CardHeader>
                <CardTitle>Reported By</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {disaster.created_by_organization && (
                  <div>
                    <p className="text-sm text-gray-600">Organization</p>
                    <p className="font-medium">{disaster.created_by_organization}</p>
                  </div>
                )}
                {disaster.created_by_role && (
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium capitalize">{disaster.created_by_role.replace('_', ' ')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="default">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Response Team
              </Button>
              <Button className="w-full" variant="outline">
                <Navigation className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
              <Button className="w-full" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Map App
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DisasterDetail;