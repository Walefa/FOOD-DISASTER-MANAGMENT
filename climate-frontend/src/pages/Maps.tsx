import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  MapPin, 
  AlertTriangle, 
  Package, 
  Shield, 
  Navigation,
  Users
} from 'lucide-react';

// Fix for default markers in React Leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DisasterLocation {
  id: number;
  name: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  coordinates: [number, number];
  affectedRadius: number;
  description: string;
  status: 'active' | 'resolved' | 'monitoring';
}

interface FoodDistributionPoint {
  id: number;
  name: string;
  coordinates: [number, number];
  capacity: number;
  currentStock: number;
  nextDelivery: string;
  status: 'operational' | 'low_stock' | 'closed';
  contactInfo: string;
}

interface VulnerableArea {
  id: number;
  name: string;
  coordinates: [number, number];
  populationAtRisk: number;
  vulnerabilityLevel: 'low' | 'medium' | 'high' | 'very_high';
  primaryRisks: string[];
  evacuationRoute?: [number, number][];
}

const MapComponent: React.FC = () => {
  // Sample data - in a real app, this would come from APIs
  const [activeLayer, setActiveLayer] = React.useState<'disasters' | 'food' | 'vulnerability' | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = React.useState<any>(null);
  const [mapKey, setMapKey] = React.useState(0);

  // Force map reinitialization on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapKey(prev => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  // South African coordinates - centered for optimal viewing
  const defaultCenter: LatLngExpression = [-29.0, 25.0]; // Optimized center showing major population areas
  
  const disasterLocations: DisasterLocation[] = [
    {
      id: 1,
      name: 'Durban Floods',
      type: 'flood',
      severity: 'critical',
      coordinates: [-29.8587, 31.0218], // Durban
      affectedRadius: 15000,
      description: 'Severe flooding affecting coastal areas and informal settlements',
      status: 'active'
    },
    {
      id: 2,
      name: 'Eastern Cape Drought',
      type: 'drought',
      severity: 'high',
      coordinates: [-32.2968, 26.4194], // East London area
      affectedRadius: 50000,
      description: 'Extended drought conditions affecting agricultural areas',
      status: 'monitoring'
    },
    {
      id: 3,
      name: 'Cape Town Fire Risk',
      type: 'wildfire',
      severity: 'medium',
      coordinates: [-33.9249, 18.4241], // Cape Town
      affectedRadius: 8000,
      description: 'High fire risk due to strong winds and dry conditions',
      status: 'monitoring'
    },
    {
      id: 4,
      name: 'Johannesburg Food Crisis',
      type: 'food_shortage',
      severity: 'high',
      coordinates: [-26.2041, 28.0473], // Johannesburg
      affectedRadius: 12000,
      description: 'Critical food shortage in informal settlements',
      status: 'active'
    }
  ];

  const foodDistributionPoints: FoodDistributionPoint[] = [
    {
      id: 1,
      name: 'Khayelitsha Community Center',
      coordinates: [-34.0351, 18.6941], // Cape Town - Khayelitsha
      capacity: 500,
      currentStock: 320,
      nextDelivery: '2025-01-20',
      status: 'operational',
      contactInfo: 'Sarah Johnson - Red Cross'
    },
    {
      id: 2,
      name: 'Soweto Distribution Hub',
      coordinates: [-26.2678, 27.8546], // Johannesburg - Soweto
      capacity: 800,
      currentStock: 150,
      nextDelivery: '2025-01-18',
      status: 'low_stock',
      contactInfo: 'John Mthembu - NGO Alliance'
    },
    {
      id: 3,
      name: 'Pietermaritzburg Relief Center',
      coordinates: [-29.6006, 30.3794], // KZN - Pietermaritzburg
      capacity: 400,
      currentStock: 380,
      nextDelivery: '2025-01-22',
      status: 'operational',
      contactInfo: 'Mary Williams - Food Bank'
    },
    {
      id: 4,
      name: 'Bloemfontein Food Bank',
      coordinates: [-29.0852, 26.1596], // Free State - Bloemfontein
      capacity: 300,
      currentStock: 280,
      nextDelivery: '2025-01-25',
      status: 'operational',
      contactInfo: 'Peter van der Merwe - Gift of the Givers'
    },
    {
      id: 5,
      name: 'Polokwane Distribution Point',
      coordinates: [-23.9045, 29.4689], // Limpopo - Polokwane
      capacity: 250,
      currentStock: 90,
      nextDelivery: '2025-01-19',
      status: 'low_stock',
      contactInfo: 'Nomsa Mbeki - Community Kitchen'
    }
  ];

  const vulnerableAreas: VulnerableArea[] = [
    {
      id: 1,
      name: 'Alexandra Township',
      coordinates: [-26.1017, 28.0900], // Johannesburg - Alexandra
      populationAtRisk: 12000,
      vulnerabilityLevel: 'very_high',
      primaryRisks: ['flooding', 'food_insecurity', 'infrastructure'],
      evacuationRoute: [
        [-26.1017, 28.0900],
        [-26.0800, 28.1100],
        [-26.0500, 28.1300]
      ]
    },
    {
      id: 2,
      name: 'Rural Eastern Cape',
      coordinates: [-31.8986, 26.8753], // Eastern Cape - Rural areas
      populationAtRisk: 25000,
      vulnerabilityLevel: 'high',
      primaryRisks: ['drought', 'food_insecurity', 'remote_access']
    },
    {
      id: 3,
      name: 'Gqeberha (Port Elizabeth) Coastal',
      coordinates: [-33.9608, 25.6022], // Eastern Cape - Gqeberha
      populationAtRisk: 8500,
      vulnerabilityLevel: 'medium',
      primaryRisks: ['storm_surge', 'flooding']
    },
    {
      id: 4,
      name: 'Limpopo Rural Communities',
      coordinates: [-24.4669, 29.4419], // Limpopo Province
      populationAtRisk: 18500,
      vulnerabilityLevel: 'high',
      primaryRisks: ['drought', 'food_insecurity', 'water_scarcity']
    }
  ];

  // Major South African cities for reference
  const majorCities = [
    { name: 'Cape Town', coordinates: [-33.9249, 18.4241] as LatLngExpression, province: 'Western Cape' },
    { name: 'Johannesburg', coordinates: [-26.2041, 28.0473] as LatLngExpression, province: 'Gauteng' },
    { name: 'Pretoria', coordinates: [-25.7479, 28.2293] as LatLngExpression, province: 'Gauteng' },
    { name: 'Durban', coordinates: [-29.8587, 31.0218] as LatLngExpression, province: 'KwaZulu-Natal' },
    { name: 'Bloemfontein', coordinates: [-29.0852, 26.1596] as LatLngExpression, province: 'Free State' },
    { name: 'Port Elizabeth (Gqeberha)', coordinates: [-33.9608, 25.6022] as LatLngExpression, province: 'Eastern Cape' },
    { name: 'East London', coordinates: [-33.0153, 27.9116] as LatLngExpression, province: 'Eastern Cape' },
    { name: 'Polokwane', coordinates: [-23.9045, 29.4689] as LatLngExpression, province: 'Limpopo' },
    { name: 'Nelspruit (Mbombela)', coordinates: [-25.4753, 30.9699] as LatLngExpression, province: 'Mpumalanga' }
  ];

  // South African provincial boundaries (simplified outline)
  const provincialBoundaries: LatLngExpression[][] = [
    // Western Cape outline (major points)
    [[-34.8, 18.0], [-33.9, 18.4], [-32.8, 18.8], [-31.5, 19.5], [-30.5, 21.0], [-29.5, 22.5], [-32.0, 25.0], [-34.0, 23.0], [-34.8, 18.0]],
    // Gauteng outline (small but important)  
    [[-25.5, 27.5], [-25.5, 28.5], [-26.5, 28.5], [-26.5, 27.5], [-25.5, 27.5]],
    // KwaZulu-Natal coastal outline
    [[-28.0, 29.0], [-28.0, 32.5], [-31.0, 30.0], [-31.0, 29.0], [-28.0, 29.0]]
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#DC2626';
      case 'high': return '#EA580C';
      case 'medium': return '#D97706';
      case 'low': return '#16A34A';
      default: return '#6B7280';
    }
  };

  // Helper: build a list of visible entries and group by exact coordinates so we
  // can jitter markers that would otherwise overlap exactly.
  const displayedEntries = React.useMemo(() => {
    const entries: { uid: string; key: string; coords: [number, number]; type: string }[] = [];

    const push = (uid: string, coords: [number, number], type: string) => {
      const key = `${coords[0].toFixed(6)},${coords[1].toFixed(6)}`;
      entries.push({ uid, key, coords, type });
    };

    if (activeLayer === 'all' || activeLayer === 'disasters') {
      disasterLocations.forEach(d => push(`disaster-${d.id}`, d.coordinates, 'disaster'));
    }

    if (activeLayer === 'all' || activeLayer === 'food') {
      foodDistributionPoints.forEach(p => push(`food-${p.id}`, p.coordinates, 'food'));
    }

    if (activeLayer === 'all' || activeLayer === 'vulnerability') {
      vulnerableAreas.forEach(a => push(`vulnerable-${a.id}`, a.coordinates, 'vulnerable'));
    }

    // Include cities only when showing all layers to reduce clutter
    if (activeLayer === 'all') {
      majorCities.forEach((c, i) => push(`city-${i}`, c.coordinates as [number, number], 'city'));
    }

    return entries;
  }, [activeLayer, disasterLocations, foodDistributionPoints, vulnerableAreas, majorCities]);

  const groupedByKey = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const e of displayedEntries) {
      if (!map[e.key]) map[e.key] = [];
      map[e.key].push(e.uid);
    }
    return map;
  }, [displayedEntries]);

  const uidIndexMap = React.useMemo(() => {
    const m: Record<string, number> = {};
    for (const key of Object.keys(groupedByKey)) {
      groupedByKey[key].forEach((uid, idx) => { m[uid] = idx; });
    }
    return m;
  }, [groupedByKey]);

  const jitterCoords = (coords: [number, number], uid: string) => {
    const key = `${coords[0].toFixed(6)},${coords[1].toFixed(6)}`;
    const group = groupedByKey[key];
    if (!group || group.length <= 1) return coords;

    const idx = uidIndexMap[uid] ?? 0;
    const total = group.length;

    // small offset in degrees (~50-150m depending on latitude). Spread evenly.
    const baseDelta = 0.00045; // ~50m
    const layer = Math.floor(idx / total);
    const delta = baseDelta * (1 + layer * 0.6);
    const angle = (2 * Math.PI * idx) / total;
    const lat = coords[0] + delta * Math.cos(angle);
    const lng = coords[1] + delta * Math.sin(angle);
    return [lat, lng] as [number, number];
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interactive Maps</h1>
          <p className="text-gray-600">Geographic visualization of disasters, resources, and vulnerable areas</p>
        </div>
      </div>

      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Map Layers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeLayer === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveLayer('all')}
            >
              <MapPin className="h-4 w-4 mr-1" />
              All Layers
            </Button>
            <Button
              variant={activeLayer === 'disasters' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveLayer('disasters')}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Disasters ({disasterLocations.length})
            </Button>
            <Button
              variant={activeLayer === 'food' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveLayer('food')}
            >
              <Package className="h-4 w-4 mr-1" />
              Food Distribution ({foodDistributionPoints.length})
            </Button>
            <Button
              variant={activeLayer === 'vulnerability' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveLayer('vulnerability')}
            >
              <Shield className="h-4 w-4 mr-1" />
              Vulnerable Areas ({vulnerableAreas.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px] rounded-lg overflow-hidden">
                <MapContainer
                  key={mapKey}
                  center={defaultCenter}
                  zoom={6}
                  minZoom={5}
                  maxZoom={12}
                  maxBounds={[[-35.5, 16.0], [-22.0, 33.0]]} // South Africa bounds
                  maxBoundsViscosity={0.9}
                  style={{ height: '100%', width: '100%' }}
                >
                  {/* High-quality detailed map specifically good for South Africa */}
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">Carto</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />

                  {/* Provincial Boundaries */}
                  {provincialBoundaries.map((boundary, index) => (
                    <Polyline 
                      key={`boundary-${index}`}
                      positions={boundary}
                      color="#4B5563"
                      weight={2}
                      opacity={0.6}
                      dashArray="5, 5"
                    />
                  ))}

                  {/* Major South African Cities (subtle reference points) */}
                  {majorCities.map((city, index) => {
                    const uid = `city-${index}`;
                    const pos = jitterCoords(city.coordinates as [number, number], uid);
                    return (
                      <Marker
                        key={uid}
                        position={pos}
                        icon={L.divIcon({
                          html: `<div style="
                            background: #374151; 
                            color: white; 
                            padding: 2px 6px; 
                            border-radius: 4px; 
                            font-size: 11px; 
                            font-weight: 500;
                            white-space: nowrap;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                          ">${city.name}</div>`,
                          className: 'city-label',
                          iconSize: [0, 0],
                          iconAnchor: [0, 0]
                        })}
                      />
                    );
                  })}

                  {/* Disaster Markers and Affected Areas */}
                  {(activeLayer === 'all' || activeLayer === 'disasters') &&
                    disasterLocations.map((disaster) => {
                      const uid = `disaster-${disaster.id}`;
                      const pos = jitterCoords(disaster.coordinates, uid);
                      return (
                      <React.Fragment key={uid}>
                        <Circle
                          center={pos}
                          radius={disaster.affectedRadius}
                          color={getSeverityColor(disaster.severity)}
                          fillColor={getSeverityColor(disaster.severity)}
                          fillOpacity={0.2}
                        />
                        <Marker
                          position={pos}
                          eventHandlers={{
                            click: () => setSelectedLocation(disaster),
                          }}
                        >
                          <Popup>
                            <div className="min-w-[200px]">
                              <h3 className="font-semibold flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                {disaster.name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">{disaster.description}</p>
                              <div className="mt-2 space-y-1">
                                <Badge variant={disaster.severity === 'critical' ? 'destructive' : 'secondary'}>
                                  {disaster.severity.toUpperCase()}
                                </Badge>
                                <p className="text-xs text-gray-500">Status: {disaster.status}</p>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      </React.Fragment>
                      );
                    })}

                  {/* Food Distribution Points */}
                  {(activeLayer === 'all' || activeLayer === 'food') &&
                    foodDistributionPoints.map((point) => {
                      const uid = `food-${point.id}`;
                      const pos = jitterCoords(point.coordinates, uid);
                      return (
                      <Marker
                        key={uid}
                        position={pos}
                        eventHandlers={{
                          click: () => setSelectedLocation(point),
                        }}
                      >
                        <Popup>
                          <div className="min-w-[200px]">
                            <h3 className="font-semibold flex items-center gap-2">
                              <Package className="h-4 w-4 text-green-500" />
                              {point.name}
                            </h3>
                            <div className="mt-2 space-y-1 text-sm">
                              <p>Capacity: {point.capacity} families</p>
                              <p>Current Stock: {point.currentStock} packages</p>
                              <p>Next Delivery: {point.nextDelivery}</p>
                              <p className="text-xs text-gray-500">{point.contactInfo}</p>
                              <Badge 
                                variant={point.status === 'operational' ? 'default' : 'destructive'}
                              >
                                {point.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                      );
                    })}

                  {/* Vulnerable Areas */}
                  {(activeLayer === 'all' || activeLayer === 'vulnerability') &&
                    vulnerableAreas.map((area) => {
                      const uid = `vulnerable-${area.id}`;
                      const pos = jitterCoords(area.coordinates, uid);
                      return (
                      <React.Fragment key={uid}>
                        <Marker
                          position={pos}
                          eventHandlers={{
                            click: () => setSelectedLocation(area),
                          }}
                        >
                          <Popup>
                            <div className="min-w-[200px]">
                              <h3 className="font-semibold flex items-center gap-2">
                                <Shield className="h-4 w-4 text-orange-500" />
                                {area.name}
                              </h3>
                              <div className="mt-2 space-y-1 text-sm">
                                <p>Population at Risk: {(area.populationAtRisk || 0).toLocaleString()}</p>
                                <p>Risks: {(area.primaryRisks || []).join(', ')}</p>
                                <Badge 
                                  variant={area.vulnerabilityLevel === 'very_high' ? 'destructive' : 'secondary'}
                                >
                                  {area.vulnerabilityLevel.replace('_', ' ').toUpperCase()} RISK
                                </Badge>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                        
                        {/* Evacuation Routes */}
                        {area.evacuationRoute && (
                          <Polyline
                            positions={area.evacuationRoute}
                            color="#3B82F6"
                            weight={3}
                            opacity={0.7}
                            dashArray="10, 10"
                          />
                        )}
                      </React.Fragment>
                      );
                    })}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Map Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm">Disasters & Affected Areas</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                <span className="text-sm">Food Distribution Points</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Vulnerable Communities</span>
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Evacuation Routes</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Active Disasters</span>
                </div>
                <Badge variant="destructive">
                  {disasterLocations.filter(d => d.status === 'active').length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Distribution Points</span>
                </div>
                <Badge>
                  {foodDistributionPoints.filter(p => p.status === 'operational').length}/{foodDistributionPoints.length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">People at Risk</span>
                </div>
                <Badge variant="secondary">
                  {vulnerableAreas.reduce((sum, area) => sum + (area.populationAtRisk || 0), 0).toLocaleString()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Selected Location Details */}
          {selectedLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Location Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-medium">{selectedLocation.name}</h3>
                  {selectedLocation.description && (
                    <p className="text-sm text-gray-600">{selectedLocation.description}</p>
                  )}
                  {selectedLocation.severity && (
                    <Badge variant={selectedLocation.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {selectedLocation.severity.toUpperCase()}
                    </Badge>
                  )}
                  {selectedLocation.capacity && (
                    <p className="text-sm">Capacity: {selectedLocation.capacity} families</p>
                  )}
                  {selectedLocation.populationAtRisk && (
                    <p className="text-sm">At Risk: {(selectedLocation.populationAtRisk || 0).toLocaleString()} people</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const Maps: React.FC = () => {
  try {
    return <MapComponent />;
  } catch (error) {
    console.error('Maps component error:', error);
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Map Loading Error</h2>
            <p className="text-gray-600 mb-4">
              There was an error loading the interactive map. This may be due to a connectivity issue or browser compatibility.
            </p>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default Maps;