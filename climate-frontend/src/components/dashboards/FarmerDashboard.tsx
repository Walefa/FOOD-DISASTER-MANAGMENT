import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import FoodDonationForm from '../FoodDonationForm';
import DisasterAlerts from '../DisasterAlerts';
import DashboardAlertBanner from '../DashboardAlertBanner';
import { 
  Wheat, 
  Package, 
  TrendingUp, 
  Heart,
  Truck,
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Leaf,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertTriangle
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
  expiry_date?: string;
  available_until?: string;
  urgency: string;
  farm_location: string;
  status: string;
  claimed_by?: number;
  claimed_at?: string;
  collected_at?: string;
  estimated_people_fed?: number;
  is_urgent: boolean;
  created_at: string;
  updated_at: string;
  claimed_by_name?: string;
  claimed_by_organization?: string;
}

interface FarmerDashboardProps {
  user: any;
  stats: any;
}

const FarmerDashboard: React.FC<FarmerDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'produce' | 'delivery'>('overview');
  const [showAddForm, setShowAddForm] = useState(false);
  const [donations, setDonations] = useState<FoodDonation[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Enhanced farmer data with donation stats
  const farmerData = {
    farmName: "Green Valley Farm",
    location: "Western Cape, South Africa", 
    farmType: "Mixed Crop & Livestock",
    totalDonations: 12,
    totalKgDonated: 850,
    beneficiariesReached: 420,
    currentSurplus: 3,
    activeDonations: 2,
    claimedDonations: 1,
    collectedDonations: 9
  };

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const fetchMyDonations = async () => {
    setLoading(true);
    try {
      // Mock donations data for the farmer
      const mockDonations: FoodDonation[] = [
        {
          id: 1,
          title: "Fresh Tomatoes - 50kg Available",
          description: "High-quality Roma tomatoes just harvested this morning.",
          produce_type: "vegetables",
          variety: "Roma Tomatoes",
          quantity: 50,
          unit: "kg",
          quality_grade: "A",
          expiry_date: "2024-01-25T23:59:59Z",
          available_until: "2024-01-24T18:00:00Z",
          urgency: "high",
          farm_location: "Western Cape, South Africa",
          status: "claimed",
          claimed_at: "2024-01-21T10:30:00Z",
          estimated_people_fed: 100,
          is_urgent: true,
          created_at: "2024-01-20T08:00:00Z",
          updated_at: "2024-01-21T10:30:00Z",
          claimed_by_name: "City Food Bank",
          claimed_by_organization: "Cape Town NGO Network"
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
          farm_location: "Western Cape, South Africa",
          status: "available",
          estimated_people_fed: 60,
          is_urgent: false,
          created_at: "2024-01-19T10:30:00Z",
          updated_at: "2024-01-19T10:30:00Z"
        }
      ];
      
      setDonations(mockDonations);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDonation = async (donationId: number) => {
    if (!confirm('Are you sure you want to cancel this donation?')) {
      return;
    }

    setDeletingId(donationId);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDonations(prev => prev.filter(d => d.id !== donationId));
      alert('✅ Donation cancelled successfully');
    } catch (error) {
      alert('❌ Failed to cancel donation');
    } finally {
      setDeletingId(null);
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

  const getProduceIcon = (type: string) => {
    const icons = {
      grains: '🌾',
      vegetables: '🥬', 
      fruits: '🍎',
      legumes: '🌰',
      tubers: '🥔',
      herbs: '🌿',
      dairy: '🥛',
      meat: '🥩',
      other: '📦'
    };
    return icons[type as keyof typeof icons] || '📦';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (showAddForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <FoodDonationForm
          onSuccess={() => {
            setShowAddForm(false);
            fetchMyDonations();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      </div>
    );
  }

  const surplusProduce = [
    {
      id: 1,
      name: "Fresh Tomatoes",
      quantity: 500,
      unit: "kg",
      harvestDate: "2025-10-10",
      expiryDate: "2025-10-25",
      quality: "Grade A",
      status: "available",
      estimatedValue: 2500
    },
    {
      id: 2,
      name: "Sweet Potatoes",
      quantity: 800,
      unit: "kg",
      harvestDate: "2025-10-05",
      expiryDate: "2025-11-20",
      quality: "Grade A",
      status: "available",
      estimatedValue: 4000
    },
    {
      id: 3,
      name: "Cabbage",
      quantity: 300,
      unit: "kg",
      harvestDate: "2025-10-12",
      expiryDate: "2025-10-30",
      quality: "Grade B",
      status: "donated",
      estimatedValue: 900
    },
    {
      id: 4,
      name: "Carrots",
      quantity: 600,
      unit: "kg",
      harvestDate: "2025-10-08",
      expiryDate: "2025-11-15",
      quality: "Grade A",
      status: "pending_pickup",
      estimatedValue: 1800
    }
  ];

  const recentDonations = [
    {
      id: 1,
      produce: "Mixed Vegetables",
      quantity: "1200 kg",
      recipient: "Khayelitsha Food Bank",
      date: "2025-10-14",
      status: "delivered",
      beneficiaries: 400
    },
    {
      id: 2,
      produce: "Fresh Fruits",
      quantity: "800 kg",
      recipient: "Ubuntu Community Center",
      date: "2025-10-12",
      status: "delivered",
      beneficiaries: 250
    },
    {
      id: 3,
      produce: "Root Vegetables",
      quantity: "1500 kg",
      recipient: "Cape Town Emergency Relief",
      date: "2025-10-10",
      status: "delivered",
      beneficiaries: 600
    }
  ];

  const upcomingPickups = [
    {
      id: 1,
      produce: "Carrots",
      quantity: "600 kg",
      scheduledDate: "2025-10-18",
      timeSlot: "10:00 - 12:00",
      organization: "Western Cape Food Network",
      status: "confirmed"
    },
    {
      id: 2,
      produce: "Tomatoes",
      quantity: "500 kg",
      scheduledDate: "2025-10-20",
      timeSlot: "14:00 - 16:00",
      organization: "Stellenbosch Relief Fund",
      status: "pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'donated': return 'bg-blue-100 text-blue-800';
      case 'pending_pickup': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <Leaf className="h-4 w-4" />;
      case 'donated': return <Heart className="h-4 w-4" />;
      case 'pending_pickup': return <Clock className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Total Donations</h3>
                <p className="text-3xl font-bold text-green-600">{farmerData.totalDonations}</p>
                <p className="text-sm text-gray-500">Completed donations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Total Donated</h3>
                <p className="text-3xl font-bold text-blue-600">{(farmerData.totalKgDonated || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Kilograms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">People Helped</h3>
                <p className="text-3xl font-bold text-purple-600">{(farmerData.beneficiariesReached || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-500">Beneficiaries reached</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Wheat className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Current Surplus</h3>
                <p className="text-3xl font-bold text-orange-600">{farmerData.currentSurplus}</p>
                <p className="text-sm text-gray-500">Items available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Farm Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wheat className="h-5 w-5" />
              Farm Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{farmerData.farmName}</h4>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {farmerData.location}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Farm Type</p>
                <p className="font-medium">{farmerData.farmType}</p>
              </div>
              <div className="pt-4">
                <Button className="w-full">
                  <Wheat className="h-4 w-4 mr-2" />
                  Update Farm Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Impact Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Environmental Impact</span>
                <Badge className="bg-green-100 text-green-800">Excellent</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Food Waste Reduced</span>
                <span className="font-bold">89%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Community Rating</span>
                <span className="font-bold">4.8/5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Value Donated</span>
                <span className="font-bold text-green-600">R{((farmerData.totalKgDonated || 0) * 2.5).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDonations.slice(0, 3).map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{donation.produce}</h4>
                    <p className="text-sm text-gray-600">{donation.recipient}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{donation.quantity}</p>
                  <p className="text-sm text-gray-500">{donation.beneficiaries} people helped</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSurplusProduce = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Surplus Produce Management</h2>
        <Button>
          <Package className="h-4 w-4 mr-2" />
          Add New Produce
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surplusProduce.map((produce) => (
          <Card key={produce.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{produce.name}</CardTitle>
                <Badge className={getStatusColor(produce.status)}>
                  {getStatusIcon(produce.status)}
                  <span className="ml-1 capitalize">{produce.status.replace('_', ' ')}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <span className="font-medium">{produce.quantity} {produce.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quality:</span>
                  <span className="font-medium">{produce.quality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Harvest Date:</span>
                  <span className="font-medium">{produce.harvestDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Best Before:</span>
                  <span className="font-medium">{produce.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Est. Value:</span>
                  <span className="font-medium text-green-600">R{produce.estimatedValue}</span>
                </div>
                
                {produce.status === 'available' && (
                  <div className="pt-3 space-y-2">
                    <Button className="w-full" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Donate Now
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Pickup
                    </Button>
                  </div>
                )}
                
                {produce.status === 'pending_pickup' && (
                  <div className="pt-3">
                    <Button variant="outline" className="w-full" size="sm">
                      <Clock className="h-4 w-4 mr-2" />
                      View Pickup Details
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderUpcomingDeliveries = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Upcoming Pickups & Deliveries</h2>

      <div className="space-y-4">
        {upcomingPickups.map((pickup) => (
          <Card key={pickup.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{pickup.produce} - {pickup.quantity}</h4>
                    <p className="text-gray-600">{pickup.organization}</p>
                    <p className="text-sm text-gray-500">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      {pickup.scheduledDate} • {pickup.timeSlot}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(pickup.status)}>
                    {getStatusIcon(pickup.status)}
                    <span className="ml-1 capitalize">{pickup.status}</span>
                  </Badge>
                  <div className="mt-2 space-x-2">
                    <Button size="sm">Contact</Button>
                    <Button variant="outline" size="sm">Reschedule</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Critical Disaster Alert Banner */}
      <DashboardAlertBanner />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Wheat className="h-8 w-8" />
            Farmer Dashboard
          </h1>
          <p className="text-green-100">Manage your surplus produce and make a difference in your community</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('produce')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'produce'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Surplus Produce
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'delivery'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pickups & Deliveries
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'donations'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Donation History
          </button>
        </nav>
      </div>

      {/* Disaster Alerts - Visible to All Users */}
      <DisasterAlerts maxAlerts={3} />

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'produce' && renderSurplusProduce()}
      {activeTab === 'delivery' && renderUpcomingDeliveries()}
      {activeTab === 'donations' && (
        <div className="space-y-6">
          {/* Donation Actions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>My Food Donations</CardTitle>
                <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Donation
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Donation Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{farmerData.activeDonations}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{farmerData.claimedDonations}</div>
                  <div className="text-sm text-gray-600">Claimed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{farmerData.collectedDonations}</div>
                  <div className="text-sm text-gray-600">Collected</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{farmerData.beneficiariesReached}</div>
                  <div className="text-sm text-gray-600">People Fed</div>
                </div>
              </div>

              {/* Donations List */}
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                  <p className="mt-2 text-gray-600">Loading your donations...</p>
                </div>
              ) : donations.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No donations yet</h3>
                  <p className="text-gray-600 mb-4">Start helping your community by creating your first food donation.</p>
                  <Button onClick={() => setShowAddForm(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Donation
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className={`border rounded-lg p-4 ${donation.is_urgent ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl">{getProduceIcon(donation.produce_type)}</span>
                            <h3 className="text-lg font-semibold">{donation.title}</h3>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusBadge(donation.status)}
                            <Badge className={`${donation.urgency === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'} ${donation.is_urgent ? 'animate-pulse' : ''}`}>
                              {donation.is_urgent && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {donation.urgency.charAt(0).toUpperCase() + donation.urgency.slice(1)}
                            </Badge>
                            {donation.quality_grade && (
                              <Badge variant="outline">Grade {donation.quality_grade}</Badge>
                            )}
                          </div>
                          {donation.description && (
                            <p className="text-gray-600 text-sm mb-2">{donation.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">{donation.quantity} {donation.unit}</div>
                          <div className="text-sm text-gray-600 capitalize">{donation.produce_type}</div>
                          {donation.variety && (
                            <div className="text-xs text-gray-500">{donation.variety}</div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{donation.farm_location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Created {formatDate(donation.created_at)}</span>
                        </div>
                        {donation.estimated_people_fed && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>~{donation.estimated_people_fed} people</span>
                          </div>
                        )}
                      </div>

                      {/* Claimed/Collected Info */}
                      {(donation.status === 'claimed' || donation.status === 'collected') && donation.claimed_by_name && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              {donation.status === 'collected' ? 'Collected' : 'Claimed'} by {donation.claimed_by_name}
                            </span>
                          </div>
                          {donation.claimed_by_organization && (
                            <div className="text-xs text-blue-600 ml-6">
                              {donation.claimed_by_organization}
                            </div>
                          )}
                          {donation.claimed_at && (
                            <div className="text-xs text-blue-600 ml-6">
                              on {formatDate(donation.claimed_at)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-xs text-gray-500">
                          Last updated {formatDate(donation.updated_at)}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          {donation.status === 'available' && (
                            <>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteDonation(donation.id)}
                                disabled={deletingId === donation.id}
                              >
                                {deletingId === donation.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-1" />
                                )}
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;