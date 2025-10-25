import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import DisasterAlerts from '../DisasterAlerts';
import DashboardAlertBanner from '../DashboardAlertBanner';
import { 
  Heart,
  Users, 
  Package, 
  MapPin,
  Calendar,
  TrendingUp,
  AlertCircle,
  Truck,
  Target
} from 'lucide-react';

interface NGODashboardProps {
  user: any;
  stats: any;
}

const NGODashboard: React.FC<NGODashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Critical Disaster Alert Banner */}
      <DashboardAlertBanner />
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Welcome, {user?.full_name || 'NGO Representative'}</h1>
            <p className="text-green-100 mt-1">NGO Operations Dashboard</p>
            <p className="text-green-200 text-sm mt-2">
              Organization: {user?.organization || 'Food Aid NGO'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => window.location.href = '/disasters'}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Report Disaster
            </Button>
            <Heart className="h-16 w-16 text-green-200" />
          </div>
        </div>
      </div>

      {/* NGO-specific Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">People Served</p>
                <p className="text-2xl font-bold text-gray-900">2,847</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Food Distributed</p>
                <p className="text-2xl font-bold text-gray-900">12.5K</p>
                <p className="text-xs text-blue-600">
                  kg this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Locations</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
                <p className="text-xs text-purple-600">
                  distribution points
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Urgent Requests</p>
                <p className="text-2xl font-bold text-gray-900">6</p>
                <p className="text-xs text-orange-600">
                  need immediate attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disaster Alerts - Visible to All Users */}
      <DisasterAlerts maxAlerts={4} />

      {/* Current Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Active Distributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Khayelitsha Food Drive</p>
                  <p className="text-sm text-gray-600">Expected: 500 families</p>
                </div>
                <Badge variant="default">In Progress</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Soweto Emergency Aid</p>
                  <p className="text-sm text-gray-600">Scheduled: Tomorrow 9 AM</p>
                </div>
                <Badge variant="secondary">Scheduled</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium">Rural Limpopo Support</p>
                  <p className="text-sm text-gray-600">Planning stage</p>
                </div>
                <Badge variant="warning">Planning</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Impact Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Meals Provided</p>
                  <p className="text-sm text-gray-600">This month</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">8,432</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Families Assisted</p>
                  <p className="text-sm text-gray-600">Total registered</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Emergency Responses</p>
                  <p className="text-sm text-gray-600">Past 30 days</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">12</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events & Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Events & Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">This Week</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Food inventory check</p>
                    <p className="text-xs text-gray-600">Today, 2:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Community meeting</p>
                    <p className="text-xs text-gray-600">Friday, 10:00 AM</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Volunteer training</p>
                    <p className="text-xs text-gray-600">Saturday, 9:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Priority Tasks</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-red-50 rounded">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Emergency food request</p>
                    <p className="text-xs text-gray-600">50 families in Alexandra</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-yellow-50 rounded">
                  <Target className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Update donor report</p>
                    <p className="text-xs text-gray-600">Due in 2 days</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded">
                  <Package className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Restock warehouse</p>
                    <p className="text-xs text-gray-600">Low inventory alert</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions for NGO */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <Package className="h-6 w-6" />
              <span className="text-sm">New Distribution</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Register Family</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <AlertCircle className="h-6 w-6" />
              <span className="text-sm">Emergency Request</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NGODashboard;