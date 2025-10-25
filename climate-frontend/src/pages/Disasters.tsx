import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { formatDate, getDisasterIcon } from '../lib/utils';
import { 
  AlertTriangle, 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  Phone,
  Edit,
  Trash2,
  Eye,
  Search,
  
} from 'lucide-react';

interface Disaster {
  id: number;
  title: string;
  description: string;
  disaster_type: string;
  severity: string;
  location: string;
  latitude?: number;
  longitude?: number;
  affected_population?: number;
  created_at?: string;
  status?: string;
  contact_info?: string;
  created_by?: number;
}

const DisasterManagement: React.FC = () => {
  const navigate = useNavigate();
  const [disasters, setDisasters] = React.useState<Disaster[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingDisaster, setEditingDisaster] = React.useState<Disaster | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterSeverity, setFilterSeverity] = React.useState('all');
  const [filterType, setFilterType] = React.useState('all');

  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    disaster_type: 'flood',
    severity: 'medium',
    location: '',
    latitude: '',
    longitude: '',
    affected_population: '',
    contact_info: ''
  });

  React.useEffect(() => {
    fetchDisasters();
  }, []);

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from real API first
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await fetch('http://localhost:8000/api/v1/disasters/alerts', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const apiDisasters = await response.json();
            console.log('Fetched disasters from API:', apiDisasters);
            setDisasters(apiDisasters);
            return; // Exit early if API works
          }
        } catch (apiError) {
          console.warn('API not available, using mock data:', apiError);
        }
      }
      
      // Fallback to mock data if API is not available
      const mockDisasters: Disaster[] = [
        {
          id: 1,
          title: 'Flash Flood Alert - Eastern Cape',
          description: 'Severe flooding due to heavy rains affecting multiple communities.',
          disaster_type: 'flood',
          severity: 'high',
          location: 'Eastern Cape, Port Elizabeth',
          latitude: -33.9608,
          longitude: 25.6022,
          affected_population: 1500,
          created_at: '2024-01-15T10:30:00Z',
          status: 'active',
          contact_info: '+27 41 506 9111',
          created_by: 1
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
          affected_population: 5000,
          created_at: '2024-01-14T15:45:00Z',
          status: 'monitoring',
          contact_info: '+27 21 400 4911',
          created_by: 2
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
          affected_population: 3200,
          created_at: '2024-01-13T08:20:00Z',
          status: 'active',
          contact_info: '+27 15 290 7000',
          created_by: 1
        },
        {
          id: 4,
          title: 'Wildfire Risk - Gauteng',
          description: 'High fire danger conditions due to dry weather and strong winds.',
          disaster_type: 'wildfire',
          severity: 'medium',
          location: 'Gauteng, Johannesburg',
          latitude: -26.2041,
          longitude: 28.0473,
          affected_population: 800,
          created_at: '2024-01-12T12:00:00Z',
          status: 'monitoring',
          contact_info: '+27 11 375 5911',
          created_by: 3
        }
      ];
      
      console.log('Using mock disaster data');
      setDisasters(mockDisasters);
    } catch (error) {
      console.error('Failed to fetch disasters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields including coordinates
    if (!formData.latitude || !formData.longitude) {
      alert('❌ Please provide both latitude and longitude coordinates. You can get these from Google Maps by right-clicking on a location.');
      return;
    }
    
    try {
      const latitude = parseFloat(formData.latitude);
      const longitude = parseFloat(formData.longitude);
      
      // Validate coordinate ranges
      if (isNaN(latitude) || isNaN(longitude)) {
        alert('❌ Invalid coordinates. Please enter valid decimal numbers for latitude and longitude.');
        return;
      }
      
      if (latitude < -90 || latitude > 90) {
        alert('❌ Latitude must be between -90 and 90 degrees.');
        return;
      }
      
      if (longitude < -180 || longitude > 180) {
        alert('❌ Longitude must be between -180 and 180 degrees.');
        return;
      }
    
      const newDisaster = {
        ...formData,
        latitude,
        longitude,
        affected_population: parseInt(formData.affected_population) || 0,
      };

      const token = localStorage.getItem('access_token');
      
      if (editingDisaster) {
        // Update existing disaster via API
        try {
          const response = await fetch(`http://localhost:8000/api/v1/disasters/alerts/${editingDisaster.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newDisaster)
          });

          if (response.ok) {
            const updatedDisaster = await response.json();
            setDisasters(prev => prev.map(d => d.id === editingDisaster.id ? updatedDisaster : d));
            alert('✅ Disaster updated successfully! All users have been notified.');
          } else {
            throw new Error(`Failed to update disaster: ${response.statusText}`);
          }
        } catch (apiError) {
          console.error('API update failed:', apiError);
          // Fallback to local update
          const updatedDisaster = { ...editingDisaster, ...newDisaster };
          setDisasters(prev => prev.map(d => d.id === editingDisaster.id ? updatedDisaster : d));
          alert('⚠️ Updated locally (API not available)');
        }
        setEditingDisaster(null);
      } else {
        // Create new disaster via API
        try {
          const response = await fetch('http://localhost:8000/api/v1/disasters/alerts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newDisaster)
          });

          if (response.ok) {
            const createdDisaster = await response.json();
            setDisasters(prev => [createdDisaster, ...prev]);
            alert('🚨 Disaster reported successfully! All users have been notified via real-time alerts.');
            console.log('Disaster created and broadcast to all users:', createdDisaster);
          } else {
            const errorText = await response.text();
            throw new Error(`Failed to create disaster: ${response.status} ${errorText}`);
          }
        } catch (apiError) {
          console.error('API creation failed:', apiError);
          alert(`❌ Failed to report disaster: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
          
          // Fallback to local creation for demo
          const disaster: Disaster = {
            id: Date.now(),
            ...newDisaster,
            created_at: new Date().toISOString(),
            status: 'active',
            created_by: 1
          } as Disaster;
          
          setDisasters(prev => [disaster, ...prev]);
          alert('⚠️ Created locally (API not available). Other users will not see this until API is running.');
        }
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        disaster_type: 'flood',
        severity: 'medium',
        location: '',
        latitude: '',
        longitude: '',
        affected_population: '',
        contact_info: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to save disaster:', error);
    }
  };

  const handleEdit = (disaster: Disaster) => {
    setEditingDisaster(disaster);
    setFormData({
      title: disaster.title,
      description: disaster.description,
      disaster_type: disaster.disaster_type,
      severity: disaster.severity,
      location: disaster.location,
      latitude: disaster.latitude?.toString() || '',
      longitude: disaster.longitude?.toString() || '',
  affected_population: (disaster.affected_population ?? 0).toString(),
      contact_info: disaster.contact_info || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this disaster alert?')) {
      setDisasters(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Filter disasters based on search and filters
  const filteredDisasters = disasters.filter(disaster => {
    const matchesSearch = (disaster.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (disaster.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || disaster.severity === filterSeverity;
    const matchesType = filterType === 'all' || disaster.disaster_type === filterType;
    return matchesSearch && matchesSeverity && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disaster Management</h1>
          <p className="mt-2 text-gray-600">Monitor and respond to climate-related disasters</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Report Disaster
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search disasters or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="all">All Types</option>
              <option value="flood">Flood</option>
              <option value="drought">Drought</option>
              <option value="wildfire">Wildfire</option>
              <option value="food_shortage">Food Shortage</option>
              <option value="extreme_heat">Extreme Heat</option>
              <option value="hurricane">Hurricane</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Disasters</p>
                <p className="text-2xl font-bold text-gray-900">
                  {disasters.filter(d => d.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">People Affected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {disasters.reduce((sum, d) => sum + (d.affected_population || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Severity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {disasters.filter(d => ['high', 'critical'].includes(d.severity)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(disasters.map(d => d.location.split(',')[0])).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingDisaster ? 'Edit Disaster Alert' : 'Report New Disaster'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Disaster alert title"
                    required
                  />
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Disaster Type
                    </label>
                    <select
                      name="disaster_type"
                      value={formData.disaster_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      required
                    >
                      <option value="flood">Flood</option>
                      <option value="drought">Drought</option>
                      <option value="wildfire">Wildfire</option>
                      <option value="food_shortage">Food Shortage</option>
                      <option value="extreme_heat">Extreme Heat</option>
                      <option value="hurricane">Hurricane</option>
                      <option value="earthquake">Earthquake</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Severity Level
                    </label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <Input
                    label="Affected Population"
                    name="affected_population"
                    type="number"
                    value={formData.affected_population}
                    onChange={handleChange}
                    placeholder="Number of people affected"
                  />
                </div>

                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Province, Country"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Latitude *"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="-26.2041 (South Africa example)"
                    required
                  />
                  
                  <Input
                    label="Longitude *"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="28.0473 (South Africa example)"
                    required
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="text-sm text-blue-800">
                      <strong>💡 How to get coordinates:</strong> Right-click on Google Maps at the disaster location and copy the coordinates.
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                setFormData(prev => ({
                                  ...prev,
                                  latitude: position.coords.latitude.toString(),
                                  longitude: position.coords.longitude.toString()
                                }));
                                alert('✅ Current location coordinates added!');
                              },
                              () => {
                                alert('❌ Could not get your location. Please enter coordinates manually.');
                              }
                            );
                          } else {
                            alert('❌ Geolocation not supported by this browser.');
                          }
                        }}
                        className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1"
                      >
                        📍 Use My Location
                      </Button>
                      <Button
                        type="button"
                        onClick={() => window.open('https://maps.google.com', '_blank')}
                        className="text-xs bg-green-600 hover:bg-green-700 px-3 py-1"
                      >
                        🗺️ Open Google Maps
                      </Button>
                    </div>
                  </div>
                  
                  <details className="mt-2">
                    <summary className="text-xs text-blue-700 cursor-pointer hover:underline">
                      📍 Click here for major South African city coordinates
                    </summary>
                    <div className="mt-2 text-xs text-blue-600 grid grid-cols-1 sm:grid-cols-2 gap-1">
                      <div>• Johannesburg: -26.2041, 28.0473</div>
                      <div>• Cape Town: -33.9249, 18.4241</div>
                      <div>• Durban: -29.8587, 31.0218</div>
                      <div>• Pretoria: -25.7479, 28.2293</div>
                      <div>• Port Elizabeth: -33.9608, 25.6022</div>
                      <div>• Bloemfontein: -29.0852, 26.1596</div>
                    </div>
                  </details>
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  * Required fields must be filled before submitting
                </div>

                <Input
                  label="Emergency Contact"
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleChange}
                  placeholder="+27 11 375 5911"
                />

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                    placeholder="Detailed description of the disaster situation..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingDisaster(null);
                      setFormData({
                        title: '',
                        description: '',
                        disaster_type: 'flood',
                        severity: 'medium',
                        location: '',
                        latitude: '',
                        longitude: '',
                        affected_population: '',
                        contact_info: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingDisaster ? 'Update Alert' : 'Create Alert'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Disasters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDisasters.map((disaster) => (
          <Card key={disaster.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getDisasterIcon(disaster.disaster_type)}</span>
                  <div>
                    <CardTitle className="text-lg">{disaster.title}</CardTitle>
                    <p className="text-sm text-gray-500 capitalize">
                      {(disaster.disaster_type || 'unknown').replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    disaster.severity === 'critical' ? 'destructive' :
                    disaster.severity === 'high' ? 'warning' : 'default'
                  }
                >
                  {disaster.severity || 'unknown'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                {disaster.description || 'No description available'}
              </p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{disaster.location || 'Unknown location'}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{(disaster.affected_population || 0).toLocaleString()} affected</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatDate(disaster.created_at)}</span>
                </div>
                {disaster.contact_info && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{disaster.contact_info}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Badge
                  variant={disaster.status === 'active' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {disaster.status}
                </Badge>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => navigate(`/disasters/${disaster.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(disaster)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(disaster.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDisasters.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No disasters found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterSeverity !== 'all' || filterType !== 'all'
                ? 'No disasters match your current filters.'
                : 'No disaster alerts have been reported yet.'}
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Report First Disaster
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DisasterManagement;