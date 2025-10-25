import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import DisasterAlerts from '../DisasterAlerts';
import DashboardAlertBanner from '../DashboardAlertBanner';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Settings,
  Database,
  BarChart3,
  UserCheck,
  Lock,
  Activity
} from 'lucide-react';

interface AdminDashboardProps {
  user: any;
  stats: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, stats }) => {
  const downloadJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleManageUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/api/v1/auth/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
      const users = await res.json();
      downloadJson(users, `users-${new Date().toISOString()}.json`);
    } catch (e) {
      console.error(e);
      alert(`Manage Users failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/api/v1/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Failed to generate report: ${res.status}`);
      const report = await res.json();
      downloadJson(report, `dashboard-report-${new Date().toISOString()}.json`);
    } catch (e) {
      console.error(e);
      alert(`Generate Report failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const handleDataBackup = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:8000/api/v1/admin/backup', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Backup failed: ${res.status}`);
      const snapshot = await res.json();
      downloadJson(snapshot, `backup-snapshot-${new Date().toISOString()}.json`);
      alert('Backup snapshot downloaded');
    } catch (e) {
      console.error(e);
      alert(`Data Backup failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  };
  return (
    <div className="space-y-6">
      {/* Critical Disaster Alert Banner */}
      <DashboardAlertBanner />
      
      {/* Debug: Test API Connection */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <Button 
            onClick={async () => {
              try {
                const token = localStorage.getItem('access_token');
                console.log('Token:', token);
                const response = await fetch('http://localhost:8000/api/v1/disasters/alerts', {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                console.log('Response status:', response.status);
                if (response.ok) {
                  const data = await response.json();
                  console.log('Disaster alerts from API:', data);
                  alert(`Found ${data.length} disaster alerts`);
                } else {
                  console.error('API Error:', response.statusText);
                  alert(`API Error: ${response.status} ${response.statusText}`);
                }
              } catch (error) {
                console.error('Fetch error:', error);
                alert(`Fetch error: ${error}`);
              }
            }}
          >
            🧪 Test Disaster API
          </Button>
        </CardContent>
      </Card>
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.full_name || 'Admin'}</h1>
            <p className="text-blue-100 mt-1">System Administrator Dashboard</p>
            <p className="text-blue-200 text-sm mt-2">
              Organization: {user?.organization || 'FOOD & DISASTER MANGEMENT'}
            </p>
          </div>
          <Shield className="h-16 w-16 text-blue-200" />
        </div>
      </div>

      {/* Admin-specific Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">247</p>
                <p className="text-xs text-green-600 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  12 new this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">System Health</p>
                <p className="text-2xl font-bold text-gray-900">98%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  All systems operational
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Data Points</p>
                <p className="text-2xl font-bold text-gray-900">15.2K</p>
                <p className="text-xs text-blue-600">
                  Across all modules
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
                <p className="text-sm font-medium text-gray-500">Alerts Pending</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-orange-600">
                  Requires attention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disaster Alerts - Visible to All Users */}
      <DisasterAlerts maxAlerts={5} />

      {/* Admin Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active Users</p>
                  <p className="text-sm text-gray-600">Currently online: 23 users</p>
                </div>
                <Badge variant="default">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Pending Approvals</p>
                  <p className="text-sm text-gray-600">2 NGOs awaiting verification</p>
                </div>
                <Badge variant="warning">2 Pending</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Role Distribution</p>
                  <p className="text-sm text-gray-600">NGO: 89, Responders: 45, Community: 108</p>
                </div>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Security Settings</p>
                  <p className="text-sm text-gray-600">2FA enabled, SSL active</p>
                </div>
                <Lock className="h-5 w-5 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Backup Status</p>
                  <p className="text-sm text-gray-600">Last backup: 2 hours ago</p>
                </div>
                <Badge variant="default">Current</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">API Rate Limits</p>
                  <p className="text-sm text-gray-600">1000 req/min per user</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats?.activeDisasters || 8}</div>
              <p className="text-sm text-gray-600">Active Disasters</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats?.foodInventoryItems || 1847}</div>
              <p className="text-sm text-gray-600">Food Inventory Items</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats?.vulnerablePopulation || 245800}</div>
              <p className="text-sm text-gray-600">Population Assessed</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats?.coordinationProjects || 34}</div>
              <p className="text-sm text-gray-600">Active Projects</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2" onClick={handleManageUsers}>
              <Users className="h-6 w-6" />
              <span className="text-sm">Manage Users</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Settings className="h-6 w-6" />
              <span className="text-sm">System Config</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={handleGenerateReport}>
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Generate Reports</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2" onClick={handleDataBackup}>
              <Database className="h-6 w-6" />
              <span className="text-sm">Data Backup</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;