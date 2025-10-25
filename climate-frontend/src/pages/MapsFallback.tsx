import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { MapPin, AlertTriangle, Package, Shield } from 'lucide-react';

const MapsFallback: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Interactive Maps</h1>
          <p className="text-blue-100">Geographic visualization of disasters, resources, and vulnerable areas</p>
        </div>
      </div>

      {/* Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Interactive Map View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-600">Map is Loading...</h3>
              <p className="text-gray-500">The interactive map will appear here.</p>
              <p className="text-sm text-gray-400">
                This includes disaster locations, food distribution points, and vulnerable areas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Active Disasters</h3>
                <p className="text-3xl font-bold text-red-600">8</p>
                <p className="text-sm text-gray-500">Floods, droughts, storms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Distribution Points</h3>
                <p className="text-3xl font-bold text-green-600">24</p>
                <p className="text-sm text-gray-500">Food & supply centers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Vulnerable Areas</h3>
                <p className="text-3xl font-bold text-orange-600">15</p>
                <p className="text-sm text-gray-500">High-risk communities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Map Features (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Disaster Monitoring
              </h4>
              <ul className="text-sm text-gray-600 ml-6 space-y-1">
                <li>• Real-time disaster locations</li>
                <li>• Severity indicators and affected areas</li>
                <li>• Evacuation route planning</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                Resource Distribution
              </h4>
              <ul className="text-sm text-gray-600 ml-6 space-y-1">
                <li>• Food distribution centers</li>
                <li>• Supply inventory tracking</li>
                <li>• Delivery route optimization</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                Vulnerability Assessment
              </h4>
              <ul className="text-sm text-gray-600 ml-6 space-y-1">
                <li>• High-risk community identification</li>
                <li>• Population density mapping</li>
                <li>• Climate risk visualization</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                Interactive Controls
              </h4>
              <ul className="text-sm text-gray-600 ml-6 space-y-1">
                <li>• Layer filtering and selection</li>
                <li>• Location details and statistics</li>
                <li>• Real-time data updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapsFallback;