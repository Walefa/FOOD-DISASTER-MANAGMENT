import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import ApiTest from '../components/ApiTest';
import { formatNumber, formatDate, getDisasterIcon } from '../lib/utils';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import NGODashboard from '../components/dashboards/NGODashboard';
import EmergencyResponderDashboard from '../components/dashboards/EmergencyResponderDashboard';
import CommunityLeaderDashboard from '../components/dashboards/CommunityLeaderDashboard';
import FarmerDashboard from '../components/dashboards/FarmerDashboard';
import { 
  AlertTriangle, 
  Package, 
  Users, 
  TrendingUp,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';

interface DashboardStats {
  activeDisasters: number;
  foodInventoryItems: number;
  vulnerablePopulation: number;
  coordinationProjects: number;
}

interface RecentDisaster {
  id: number;
  title: string;
  disaster_type: string;
  severity: string;
  location: string;
  created_at: string;
}

interface FoodInventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiry_date: string | null;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState<DashboardStats>({
    activeDisasters: 0,
    foodInventoryItems: 0,
    vulnerablePopulation: 0,
    coordinationProjects: 0,
  });
  
  const [recentDisasters, setRecentDisasters] = React.useState<RecentDisaster[]>([]);
  const [lowStockItems, setLowStockItems] = React.useState<FoodInventoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);

  // Get current user from localStorage
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Loading user from localStorage:', storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Parsed user:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    } else {
      console.log('No user found in localStorage');
    }
    setLoading(false); // Set loading to false after attempting to load user
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      
      // Try to fetch real data from API
      try {
        const [disastersRes, foodRes, vulnRes, coordRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/disasters/alerts'),
          fetch('http://localhost:8000/api/v1/food/inventory'),
          fetch('http://localhost:8000/api/v1/vulnerability/assessments'),
          fetch('http://localhost:8000/api/v1/coordination/emergency-responses')
        ]);

        const [disasters, food, vuln, coord] = await Promise.all([
          disastersRes.ok ? disastersRes.json() : [],
          foodRes.ok ? foodRes.json() : [],
          vulnRes.ok ? vulnRes.json() : [],
          coordRes.ok ? coordRes.json() : []
        ]);

        setStats({
          activeDisasters: disasters.length || 12,
          foodInventoryItems: food.length || 342,
          vulnerablePopulation: vuln.length * 50 || 1250, // Estimate based on assessments
          coordinationProjects: coord.length || 8,
        });

        // Set recent disasters from API if available
        if (disasters.length > 0) {
          setRecentDisasters(disasters.slice(0, 3));
        }

      } catch (apiError) {
        console.log('Using mock data due to API error:', apiError);
        // Fallback to mock data
        setStats({
          activeDisasters: 12,
          foodInventoryItems: 342,
          vulnerablePopulation: 1250,
          coordinationProjects: 8,
        });
      }

      setRecentDisasters([
        {
          id: 1,
          title: 'Flash Flood in Eastern Cape',
          disaster_type: 'flood',
          severity: 'high',
          location: 'Eastern Cape, SA',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          title: 'Drought Warning - Western Cape',
          disaster_type: 'drought',
          severity: 'medium',
          location: 'Western Cape, SA',
          created_at: '2024-01-14T15:45:00Z'
        },
        {
          id: 3,
          title: 'Food Shortage Alert - Limpopo',
          disaster_type: 'food_shortage',
          severity: 'critical',
          location: 'Limpopo, SA',
          created_at: '2024-01-13T08:20:00Z'
        }
      ]);

      setLowStockItems([
        {
          id: 1,
          name: 'Rice (White)',
          category: 'grains',
          quantity: 15,
          unit: 'kg',
          expiry_date: '2024-02-28'
        },
        {
          id: 2,
          name: 'Canned Beans',
          category: 'proteins',
          quantity: 8,
          unit: 'cans',
          expiry_date: '2024-03-15'
        },
        {
          id: 3,
          name: 'Powdered Milk',
          category: 'dairy',
          quantity: 5,
          unit: 'packages',
          expiry_date: '2024-02-10'
        }
      ]);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Debug: Check if user is loaded
  console.log('Dashboard user:', user);
  console.log('Dashboard loading:', loading);

  // Show loading while user data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Role-based dashboard rendering
  if (user?.role) {
    console.log('Rendering role-based dashboard for:', user.role);
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} stats={stats} />;
      case 'ngo':
        return <NGODashboard user={user} stats={stats} />;
      case 'emergency_responder':
        return <EmergencyResponderDashboard user={user} stats={stats} />;
      case 'community_leader':
        return <CommunityLeaderDashboard user={user} stats={stats} />;
      case 'farmer':
        return <FarmerDashboard user={user} stats={stats} />;
      case 'donor':
      case 'researcher':
        // For donor and researcher roles, show the default dashboard for now
        console.log('Using default dashboard for donor/researcher');
        break;
      default:
        console.log('Unknown role, using default dashboard');
        break;
    }
  } else {
    console.log('No user role found, using default dashboard');
  }

  // Default dashboard for users without specific roles or unsupported roles
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Climate Resilience Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor disasters, food security, and community vulnerability in real-time
        </p>
        {user && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Logged in as: <strong>{user.full_name || user.username}</strong> 
              {user.role && ` (${user.role.replace('_', ' ').toUpperCase()})`}
            </p>
          </div>
        )}
      </div>

      {/* API Integration Test */}
      <ApiTest />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Disasters</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.activeDisasters)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Food Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.foodInventoryItems)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vulnerable Population</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.vulnerablePopulation)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.coordinationProjects)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Disasters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
              Recent Disasters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDisasters.map((disaster) => (
                <div
                  key={disaster.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="text-2xl">
                    {getDisasterIcon(disaster.disaster_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {disaster.title}
                      </p>
                      <Badge
                        variant={disaster.severity === 'critical' ? 'destructive' : 
                               disaster.severity === 'high' ? 'warning' : 'default'}
                        className="ml-2"
                      >
                        {disaster.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="mr-3">{disaster.location}</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(disaster.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-yellow-600" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-600 capitalize">
                      {item.category} • {item.quantity} {item.unit} remaining
                    </p>
                    {item.expiry_date && (
                      <p className="text-xs text-red-600 mt-1">
                        Expires: {formatDate(item.expiry_date)}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant="warning">
                      Low Stock
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              <AlertTriangle className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-medium text-blue-900">Report Disaster</p>
              <p className="text-xs text-blue-700">Create new disaster alert</p>
            </button>
            
            <button className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <Package className="h-6 w-6 text-green-600 mb-2" />
              <p className="font-medium text-green-900">Add Food Item</p>
              <p className="text-xs text-green-700">Update inventory</p>
            </button>
            
            <button className="p-4 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors">
              <Users className="h-6 w-6 text-yellow-600 mb-2" />
              <p className="font-medium text-yellow-900">Assess Vulnerability</p>
              <p className="text-xs text-yellow-700">Community assessment</p>
            </button>
            
            <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
              <p className="font-medium text-purple-900">View Analytics</p>
              <p className="text-xs text-purple-700">Data insights</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;