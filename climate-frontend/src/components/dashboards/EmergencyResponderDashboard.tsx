import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import DisasterAlerts from '../DisasterAlerts';
import { 
  Truck, 
  Radio, 
  AlertTriangle, 
  MapPin,
  Clock,
  Users,
  Shield,
  Phone,
  Navigation
} from 'lucide-react';

interface EmergencyResponderDashboardProps {
  user: any;
  stats: any;
}

const EmergencyResponderDashboard: React.FC<EmergencyResponderDashboardProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.full_name || 'Emergency Responder'}</h1>
            <p className="text-red-100 mt-1">Emergency Response Dashboard</p>
            <p className="text-red-200 text-sm mt-2">
              Unit: {user?.organization || 'Emergency Services'}
            </p>
          </div>
          <Shield className="h-16 w-16 text-red-200" />
        </div>
      </div>

      {/* Emergency Status Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Emergencies</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-red-600 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                  2 critical alerts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">People Evacuated</p>
                <p className="text-2xl font-bold text-gray-900">847</p>
                <p className="text-xs text-orange-600">
                  This month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Response Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-xs text-blue-600">
                  8 available, 4 deployed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">7.2</p>
                <p className="text-xs text-green-600">
                  minutes (target: &lt;10)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disaster Alerts - Critical for Emergency Responders */}
      <DisasterAlerts maxAlerts={6} />

      {/* Active Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Radio className="h-5 w-5 mr-2" />
              Active Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-800">Flood - Khayelitsha</p>
                    <p className="text-sm text-red-600">200 people affected</p>
                    <p className="text-xs text-gray-600">Dispatched: 15:30</p>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-orange-800">Fire Risk - Stellenbosch</p>
                    <p className="text-sm text-orange-600">High wind conditions</p>
                    <p className="text-xs text-gray-600">Monitoring since: 14:00</p>
                  </div>
                  <Badge variant="warning">High</Badge>
                </div>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-800">Drought - Limpopo</p>
                    <p className="text-sm text-yellow-600">Water shortage reported</p>
                    <p className="text-xs text-gray-600">Ongoing assessment</p>
                  </div>
                  <Badge variant="secondary">Medium</Badge>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button className="w-full" variant="outline">
                <Radio className="h-4 w-4 mr-2" />
                View All Incidents
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Resource Deployment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Available Resources</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Truck className="h-6 w-6 mx-auto text-green-600 mb-1" />
                    <div className="text-2xl font-bold text-green-700">8</div>
                    <div className="text-xs text-green-600">Vehicles Ready</div>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                    <div className="text-2xl font-bold text-blue-700">24</div>
                    <div className="text-xs text-blue-600">Personnel On-Duty</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Current Deployments</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rescue Team Alpha</span>
                    <Badge variant="default">Khayelitsha</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Medical Unit 2</span>
                    <Badge variant="secondary">Stellenbosch</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Supply Convoy</span>
                    <Badge variant="outline">En Route</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communication Center */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Phone className="h-5 w-5 mr-2" />
            Emergency Communications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recent Updates</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">CRITICAL: Flash flood warning</p>
                    <p className="text-gray-600 text-xs">16:45 - Western Cape</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">UPDATE: Evacuation in progress</p>
                    <p className="text-gray-600 text-xs">16:30 - Khayelitsha</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium">RESOLVED: Road clearance</p>
                    <p className="text-gray-600 text-xs">16:15 - N1 Highway</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Coordination Partners</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">Provincial Disaster Mgmt</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">Local Police</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm">Medical Emergency</span>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">NGO Network</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Weather Alerts</h4>
              <div className="space-y-2">
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <p className="text-sm font-medium text-red-800">Severe Weather Warning</p>
                  <p className="text-xs text-red-600">Heavy rainfall expected 18:00-02:00</p>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <p className="text-sm font-medium text-orange-800">Wind Advisory</p>
                  <p className="text-xs text-orange-600">Gusts up to 65 km/h tonight</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Response Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2 bg-red-600 hover:bg-red-700">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-sm">Report Incident</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Truck className="h-6 w-6" />
              <span className="text-sm">Deploy Resources</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Radio className="h-6 w-6" />
              <span className="text-sm">Radio Dispatch</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Navigation className="h-6 w-6" />
              <span className="text-sm">Live Map</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencyResponderDashboard;