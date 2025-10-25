import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { 
  Search,
  MapPin, 
  Package,
  Phone,
  Mail,
  Truck,
  AlertTriangle,
  CheckCircle,
  User,
  Building,
  Filter,
  Navigation,
  Loader2,
  Heart
} from 'lucide-react';

interface FoodDonation {
  id: number;
  title: string;
  description?: string;
  produce_type: string;
  variety?: string;
  quantity: number;
  unit: string;
  quality_grade?: string;
  harvest_date?: string;
  expiry_date?: string;
  available_until?: string;
  urgency: string;
  farm_location: string;
  latitude: number;
  longitude: number;
  pickup_instructions?: string;
  transportation_available: boolean;
  contact_phone?: string;
  contact_email?: string;
  preferred_contact_method: string;
  storage_requirements?: string;
  packaging_type?: string;
  handling_notes?: string;
  status: string;
  claimed_by?: number;
  claimed_at?: string;
  collected_at?: string;
  intended_beneficiaries?: string;
  estimated_people_fed?: number;
  certification?: string;
  is_verified: boolean;
  is_active: boolean;
  is_urgent: boolean;
  created_at: string;
  updated_at: string;
  farmer_id: number;
  farmer_name?: string;
  farmer_organization?: string;
  claimed_by_name?: string;
  claimed_by_organization?: string;
}

const FoodDonationsMarketplace: React.FC = () => {
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('available');
  const [produceTypeFilter, setProduceTypeFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  
  const [stats, setStats] = useState({
    total_donations: 0,
    available_donations: 0,
    claimed_donations: 0,
    collected_donations: 0,
    urgent_donations: 0,
    completion_rate: 0
  });

  const produceTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'grains', label: '🌾 Grains' },
    { value: 'vegetables', label: '🥬 Vegetables' },
    { value: 'fruits', label: '🍎 Fruits' },
    { value: 'legumes', label: '🌰 Legumes' },
    { value: 'tubers', label: '🥔 Tubers' },
    { value: 'herbs', label: '🌿 Herbs' },
    { value: 'dairy', label: '🥛 Dairy' },
    { value: 'meat', label: '🥩 Meat' },
    { value: 'other', label: '📦 Other' }
  ];

  const urgencyLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchDonations();
    fetchStats();
  }, [statusFilter, produceTypeFilter, urgencyFilter, locationFilter]);

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        if (statusFilter === 'available') {
          params.append('available_only', 'true');
        } else {
          params.append('status', statusFilter);
          params.append('available_only', 'false');
        }
      }
      
      if (produceTypeFilter !== 'all') {
        params.append('produce_type', produceTypeFilter);
      }
      
      if (urgencyFilter !== 'all') {
        params.append('urgency', urgencyFilter);
      }
      
      if (locationFilter) {
        params.append('location', locationFilter);
      }
      
      params.append('limit', '50');

      const response = await fetch(`http://localhost:8000/api/v1/food-donations/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch food donations');
      }

      const data = await response.json();
      setDonations(data);
      
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError('Failed to load food donations');
      
      // Mock data for development
      const mockDonations: FoodDonation[] = [
        {
          id: 1,
          title: "Fresh Tomatoes - 50kg Available",
          description: "High-quality Roma tomatoes just harvested this morning. Perfect for cooking and processing.",
          produce_type: "vegetables",
          variety: "Roma Tomatoes",
          quantity: 50,
          unit: "kg",
          quality_grade: "A",
          harvest_date: "2024-01-20T06:00:00Z",
          expiry_date: "2024-01-25T23:59:59Z",
          available_until: "2024-01-24T18:00:00Z",
          urgency: "high",
          farm_location: "Johannesburg, Gauteng",
          latitude: -26.2041,
          longitude: 28.0473,
          pickup_instructions: "Farm gate is open 8AM-6PM. Look for the red barn.",
          transportation_available: true,
          contact_phone: "+27 123 456 7890",
          contact_email: "farmer@example.com",
          preferred_contact_method: "phone",
          storage_requirements: "Keep in cool, dry place",
          packaging_type: "Wooden crates",
          handling_notes: "Handle gently to avoid bruising",
          status: "available",
          intended_beneficiaries: "Local communities affected by food shortage",
          estimated_people_fed: 100,
          certification: "Organic",
          is_verified: true,
          is_active: true,
          is_urgent: true,
          created_at: "2024-01-20T08:00:00Z",
          updated_at: "2024-01-20T08:00:00Z",
          farmer_id: 1,
          farmer_name: "John Farmer",
          farmer_organization: "Sunset Valley Farm"
        },
        {
          id: 2,
          title: "Sweet Potatoes - 30kg",
          description: "Freshly harvested sweet potatoes, excellent for nutrition programs.",
          produce_type: "tubers",
          variety: "Orange Sweet Potatoes",
          quantity: 30,
          unit: "kg",
          quality_grade: "A",
          urgency: "medium",
          farm_location: "Cape Town, Western Cape",
          latitude: -33.9249,
          longitude: 18.4241,
          transportation_available: false,
          contact_phone: "+27 987 654 3210",
          preferred_contact_method: "whatsapp",
          status: "available",
          estimated_people_fed: 60,
          is_verified: true,
          is_active: true,
          is_urgent: false,
          created_at: "2024-01-19T10:30:00Z",
          updated_at: "2024-01-19T10:30:00Z",
          farmer_id: 2,
          farmer_name: "Mary Smith",
          farmer_organization: "Coastal Organic Farm"
        }
      ];
      
      setDonations(mockDonations);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/v1/food-donations/stats/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use mock stats
      setStats({
        total_donations: 25,
        available_donations: 12,
        claimed_donations: 8,
        collected_donations: 5,
        urgent_donations: 3,
        completion_rate: 20.0
      });
    }
  };

  const handleClaimDonation = async (donationId: number) => {
    setClaimingId(donationId);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/v1/food-donations/${donationId}/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to claim donation');
      }

      // Refresh donations list
      await fetchDonations();
      await fetchStats();
      
      alert('✅ Donation claimed successfully! The farmer will be notified.');
      
    } catch (error) {
      console.error('Error claiming donation:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Failed to claim donation'}`);
    } finally {
      setClaimingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'claimed':
        return <Badge className="bg-blue-100 text-blue-800">Claimed</Badge>;
      case 'collected':
        return <Badge className="bg-gray-100 text-gray-800">Collected</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string, isUrgent: boolean) => {
    const level = urgencyLevels.find(l => l.value === urgency);
    const colorClass = level?.color || 'bg-gray-100 text-gray-800';
    
    return (
      <Badge className={`${colorClass} ${isUrgent ? 'animate-pulse' : ''}`}>
        {isUrgent && <AlertTriangle className="h-3 w-3 mr-1" />}
        {level?.label || urgency}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredDonations = donations.filter(donation => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        donation.title.toLowerCase().includes(searchLower) ||
        donation.farm_location.toLowerCase().includes(searchLower) ||
        donation.produce_type.toLowerCase().includes(searchLower) ||
        donation.variety?.toLowerCase().includes(searchLower) ||
        donation.farmer_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading food donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Donations Marketplace</h1>
        <p className="text-gray-600">Browse and claim surplus produce donations from local farmers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total_donations}</div>
            <div className="text-sm text-gray-600">Total Donations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.available_donations}</div>
            <div className="text-sm text-gray-600">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.claimed_donations}</div>
            <div className="text-sm text-gray-600">Claimed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.collected_donations}</div>
            <div className="text-sm text-gray-600">Collected</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.urgent_donations}</div>
            <div className="text-sm text-gray-600">Urgent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.completion_rate}%</div>
            <div className="text-sm text-gray-600">Completion</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search donations..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Available Only</option>
                <option value="all">All Statuses</option>
                <option value="claimed">Claimed</option>
                <option value="collected">Collected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Produce Type</label>
              <select
                value={produceTypeFilter}
                onChange={(e) => setProduceTypeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {produceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Urgency</label>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {urgencyLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Filter by location..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Donations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDonations.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No donations found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new donations.</p>
          </div>
        ) : (
          filteredDonations.map((donation) => (
            <Card key={donation.id} className={`${donation.is_urgent ? 'border-red-300 border-2' : ''} hover:shadow-lg transition-shadow`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{donation.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      {getStatusBadge(donation.status)}
                      {getUrgencyBadge(donation.urgency, donation.is_urgent)}
                      {donation.is_verified && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div className="font-medium">{donation.quantity} {donation.unit}</div>
                    <div className="capitalize">{donation.produce_type}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {donation.description && (
                  <p className="text-gray-700 mb-4">{donation.description}</p>
                )}

                <div className="space-y-3">
                  {/* Farmer Info */}
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{donation.farmer_name || 'Anonymous Farmer'}</span>
                    {donation.farmer_organization && (
                      <>
                        <Building className="h-4 w-4 text-gray-400" />
                        <span>{donation.farmer_organization}</span>
                      </>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{donation.farm_location}</span>
                    {donation.transportation_available && (
                      <>
                        <Truck className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Transportation available</span>
                      </>
                    )}
                  </div>

                  {/* Quality & Variety */}
                  <div className="flex items-center space-x-4 text-sm">
                    {donation.variety && (
                      <div className="flex items-center space-x-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span>{donation.variety}</span>
                      </div>
                    )}
                    {donation.quality_grade && (
                      <Badge variant="outline">Grade {donation.quality_grade}</Badge>
                    )}
                    {donation.certification && (
                      <Badge className="bg-green-100 text-green-800">{donation.certification}</Badge>
                    )}
                  </div>

                  {/* Timing */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                    {donation.harvest_date && (
                      <div>
                        <strong>Harvested:</strong> {formatDate(donation.harvest_date)}
                      </div>
                    )}
                    {donation.expiry_date && (
                      <div>
                        <strong>Expires:</strong> {formatDate(donation.expiry_date)}
                      </div>
                    )}
                    {donation.available_until && (
                      <div>
                        <strong>Available until:</strong> {formatDate(donation.available_until)}
                      </div>
                    )}
                    {donation.estimated_people_fed && (
                      <div>
                        <strong>Can feed:</strong> ~{donation.estimated_people_fed} people
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center space-x-4 text-sm">
                    {donation.contact_phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{donation.contact_phone}</span>
                      </div>
                    )}
                    {donation.contact_email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{donation.contact_email}</span>
                      </div>
                    )}
                  </div>

                  {/* Special Notes */}
                  {(donation.storage_requirements || donation.handling_notes || donation.pickup_instructions) && (
                    <div className="bg-gray-50 rounded-md p-3 text-sm">
                      {donation.storage_requirements && (
                        <div><strong>Storage:</strong> {donation.storage_requirements}</div>
                      )}
                      {donation.handling_notes && (
                        <div><strong>Handling:</strong> {donation.handling_notes}</div>
                      )}
                      {donation.pickup_instructions && (
                        <div><strong>Pickup:</strong> {donation.pickup_instructions}</div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-xs text-gray-500">
                      Posted {formatDate(donation.created_at)}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://maps.google.com?q=${donation.latitude},${donation.longitude}`, '_blank')}
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Directions
                      </Button>
                      
                      {donation.status === 'available' ? (
                        <Button
                          size="sm"
                          onClick={() => handleClaimDonation(donation.id)}
                          disabled={claimingId === donation.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {claimingId === donation.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Claiming...
                            </>
                          ) : (
                            <>
                              <Heart className="h-4 w-4 mr-1" />
                              Claim Donation
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="text-sm text-gray-600">
                          {donation.status === 'claimed' && donation.claimed_by_name && (
                            <span>Claimed by {donation.claimed_by_name}</span>
                          )}
                          {donation.status === 'collected' && (
                            <span className="text-green-600">✅ Collected</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FoodDonationsMarketplace;