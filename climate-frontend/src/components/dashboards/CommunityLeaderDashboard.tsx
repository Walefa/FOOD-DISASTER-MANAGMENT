import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import DisasterAlerts from '../DisasterAlerts';
import { 
  Users, 
  Home, 
  AlertCircle, 
  MessageSquare,
  Calendar,
  TrendingUp,
  Bell,
  Heart,
  Megaphone
} from 'lucide-react';

interface CommunityLeaderDashboardProps {
  user: any;
  stats: any;
}

const CommunityLeaderDashboard: React.FC<CommunityLeaderDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.full_name || 'Community Leader'}</h1>
            <p className="text-purple-100 mt-1">Community Leadership Dashboard</p>
            <p className="text-purple-200 text-sm mt-2">
              Community: {user?.organization || 'Local Community Council'}
            </p>
          </div>
          <Users className="h-16 w-16 text-purple-200" />
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Households</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
                <p className="text-xs text-purple-600">
                  in our community
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Population</p>
                <p className="text-2xl font-bold text-gray-900">4,850</p>
                <p className="text-xs text-green-600">
                  registered residents
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
                <p className="text-sm font-medium text-gray-500">Active Issues</p>
                <p className="text-2xl font-bold text-gray-900">7</p>
                <p className="text-xs text-orange-600">
                  need attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Aid Recipients</p>
                <p className="text-2xl font-bold text-gray-900">342</p>
                <p className="text-xs text-red-600">
                  this month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disaster Alerts - Visible to All Users */}
      <DisasterAlerts maxAlerts={4} />

      {/* Community Needs & Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Priority Community Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-800">Water shortage in Sector C</p>
                    <p className="text-sm text-red-600">Affecting 150+ families</p>
                    <p className="text-xs text-gray-600">Reported 2 days ago</p>
                  </div>
                  <Badge variant="destructive">Urgent</Badge>
                </div>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-orange-800">Food distribution delays</p>
                    <p className="text-sm text-orange-600">Weekly distribution behind schedule</p>
                    <p className="text-xs text-gray-600">Since Monday</p>
                  </div>
                  <Badge variant="warning">High</Badge>
                </div>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-800">Road repair needed</p>
                    <p className="text-sm text-yellow-600">Main access road deteriorating</p>
                    <p className="text-xs text-gray-600">Ongoing concern</p>
                  </div>
                  <Badge variant="secondary">Medium</Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                <AlertCircle className="h-4 w-4 mr-2" />
                Report New Issue
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Community Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Food Distribution Today</p>
                    <p className="text-sm text-blue-600">Community center, 2 PM - 6 PM</p>
                    <p className="text-xs text-gray-600">2 hours ago</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Users className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Community Meeting Success</p>
                    <p className="text-sm text-green-600">85 residents attended last night's meeting</p>
                    <p className="text-xs text-gray-600">Yesterday</p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Heart className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-purple-800">New Volunteer Program</p>
                    <p className="text-sm text-purple-600">Youth leadership initiative launched</p>
                    <p className="text-xs text-gray-600">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                <Megaphone className="h-4 w-4 mr-2" />
                Post Community Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Events & Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Community Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">This Week</h4>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <p className="font-medium text-blue-800">Community Health Screening</p>
                  <p className="text-sm text-blue-600">Friday, 9 AM - 3 PM</p>
                  <p className="text-xs text-gray-600">Community Hall</p>
                </div>
                
                <div className="p-3 border-l-4 border-green-500 bg-green-50">
                  <p className="font-medium text-green-800">Youth Soccer Tournament</p>
                  <p className="text-sm text-green-600">Saturday, 10 AM</p>
                  <p className="text-xs text-gray-600">Local Sports Field</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Resources Available</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Food Packages</span>
                  <Badge variant="default">Available</Badge>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Medical Supplies</span>
                  <Badge variant="secondary">Limited</Badge>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Educational Materials</span>
                  <Badge variant="default">Available</Badge>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">Emergency Kits</span>
                  <Badge variant="warning">Low Stock</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Community Stats</h4>
              <div className="space-y-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">73%</div>
                  <div className="text-xs text-blue-600">Vaccination Rate</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">89</div>
                  <div className="text-xs text-green-600">Active Volunteers</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">15</div>
                  <div className="text-xs text-purple-600">Community Projects</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Community Leadership Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Schedule Meeting</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <AlertCircle className="h-6 w-6" />
              <span className="text-sm">Report Issue</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <MessageSquare className="h-6 w-6" />
              <span className="text-sm">Contact NGOs</span>
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

export default CommunityLeaderDashboard;