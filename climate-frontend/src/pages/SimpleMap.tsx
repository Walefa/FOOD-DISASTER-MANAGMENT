import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { 
  MapPin, 
  AlertTriangle, 
  Package, 
  Shield, 
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

interface MapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'disaster' | 'food' | 'vulnerable' | 'evacuation';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
}

interface MapBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

const SimpleMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'disasters' | 'food' | 'vulnerable'>('all');
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<MapPoint | null>(null);
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // South Africa bounds (approximate)
  const mapBounds: MapBounds = {
    minLat: -34.8,  // Southern tip
    maxLat: -22.0,  // Northern border
    minLng: 16.0,   // Western coast
    maxLng: 33.0    // Eastern border
  };

  // Sample data points for South Africa
  const mapPoints: MapPoint[] = [
    // Disasters
    {
      id: 'disaster-1',
      name: 'KwaZulu-Natal Floods',
      lat: -29.8587,
      lng: 31.0218,
      type: 'disaster',
      severity: 'critical',
      data: { affected: 15000, type: 'Flood', status: 'Active' }
    },
    {
      id: 'disaster-2',
      name: 'Eastern Cape Drought',
      lat: -32.2968,
      lng: 26.4194,
      type: 'disaster',
      severity: 'high',
      data: { affected: 8000, type: 'Drought', status: 'Ongoing' }
    },
    {
      id: 'disaster-3',
      name: 'Western Cape Fires',
      lat: -33.9249,
      lng: 18.4241,
      type: 'disaster',
      severity: 'medium',
      data: { affected: 3000, type: 'Wildfire', status: 'Contained' }
    },
    {
      id: 'disaster-4',
      name: 'Limpopo Storm',
      lat: -23.4013,
      lng: 29.4179,
      type: 'disaster',
      severity: 'high',
      data: { affected: 5500, type: 'Storm', status: 'Active' }
    },

    // Food Distribution Points
    {
      id: 'food-1',
      name: 'Johannesburg Food Bank',
      lat: -26.2041,
      lng: 28.0473,
      type: 'food',
      data: { capacity: 5000, stock: 4200, type: 'Central Hub' }
    },
    {
      id: 'food-2',
      name: 'Cape Town Distribution',
      lat: -33.9249,
      lng: 18.4241,
      type: 'food',
      data: { capacity: 3000, stock: 2800, type: 'Regional Center' }
    },
    {
      id: 'food-3',
      name: 'Durban Relief Center',
      lat: -29.8587,
      lng: 31.0218,
      type: 'food',
      data: { capacity: 4000, stock: 1500, type: 'Emergency Hub' }
    },
    {
      id: 'food-4',
      name: 'Port Elizabeth Depot',
      lat: -33.9608,
      lng: 25.6022,
      type: 'food',
      data: { capacity: 2000, stock: 1800, type: 'Local Center' }
    },
    {
      id: 'food-5',
      name: 'Bloemfontein Supply',
      lat: -29.0852,
      lng: 26.1596,
      type: 'food',
      data: { capacity: 1500, stock: 1200, type: 'Regional Hub' }
    },

    // Vulnerable Areas
    {
      id: 'vulnerable-1',
      name: 'Khayelitsha Township',
      lat: -34.0351,
      lng: 18.6920,
      type: 'vulnerable',
      severity: 'critical',
      data: { population: 391749, riskLevel: 'Very High', primaryRisks: ['Flooding', 'Food Security'] }
    },
    {
      id: 'vulnerable-2',
      name: 'Alexandra Township',
      lat: -26.1027,
      lng: 28.0967,
      type: 'vulnerable',
      severity: 'high',
      data: { population: 180000, riskLevel: 'High', primaryRisks: ['Drought', 'Infrastructure'] }
    },
    {
      id: 'vulnerable-3',
      name: 'Umlazi Township',
      lat: -29.9731,
      lng: 30.8829,
      type: 'vulnerable',
      severity: 'high',
      data: { population: 404811, riskLevel: 'High', primaryRisks: ['Flooding', 'Climate Change'] }
    },
    {
      id: 'vulnerable-4',
      name: 'Mdantsane Township',
      lat: -32.9833,
      lng: 27.6333,
      type: 'vulnerable',
      severity: 'medium',
      data: { population: 250000, riskLevel: 'Medium', primaryRisks: ['Water Scarcity', 'Economic'] }
    }
  ];

  // Convert lat/lng to canvas coordinates
  const latLngToCanvas = (lat: number, lng: number, canvasWidth: number, canvasHeight: number) => {
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * canvasWidth;
    const y = ((mapBounds.maxLat - lat) / (mapBounds.maxLat - mapBounds.minLat)) * canvasHeight;
    
    // Apply zoom and offset
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const zoomedX = centerX + (x - centerX) * zoom + offset.x;
    const zoomedY = centerY + (y - centerY) * zoom + offset.y;
    
    return { x: zoomedX, y: zoomedY };
  };

  // Draw the map
  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Draw background map image if loaded, otherwise fallback to drawn map
    if (mapImage && imageLoaded) {
      // Draw the South Africa map image as background
      // Scale and center the image to fit the canvas
      const aspectRatio = mapImage.width / mapImage.height;
      let drawWidth = width;
      let drawHeight = width / aspectRatio;
      
      if (drawHeight > height) {
        drawHeight = height;
        drawWidth = height * aspectRatio;
      }
      
      const offsetX = (width - drawWidth) / 2;
      const offsetY = (height - drawHeight) / 2;
      
      ctx.drawImage(mapImage, offsetX, offsetY, drawWidth, drawHeight);
      
      // Add semi-transparent overlay for better point visibility
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, width, height);
    } else {
      // Fallback: Draw background (ocean color)
      ctx.fillStyle = '#dbeafe';
      ctx.fillRect(0, 0, width, height);

      // Add subtle texture/gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#e0f2fe');
      gradient.addColorStop(1, '#bae6fd');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw South Africa outline (more detailed shape) - fallback drawing
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
    
    // More accurate South Africa border points (simplified but recognizable shape)
    const borderPoints = [
      // Northern border with Botswana/Zimbabwe
      [-22.0, 29.0], [-22.5, 27.5], [-23.0, 26.0], [-23.5, 25.0], [-24.0, 24.5],
      [-25.0, 25.0], [-26.0, 26.5], [-27.0, 28.0], [-28.0, 30.0], [-29.0, 31.5],
      // Eastern coast (Indian Ocean)
      [-29.5, 32.0], [-30.0, 31.8], [-31.0, 30.5], [-32.0, 29.0], [-33.0, 28.0],
      [-34.0, 26.5], [-34.5, 24.0], [-34.8, 22.0], [-34.5, 20.5], [-34.0, 19.5],
      // Southern coast
      [-33.5, 18.5], [-33.0, 18.0], [-32.0, 18.2], [-31.0, 18.5], [-30.0, 18.8],
      [-29.0, 18.6], [-28.0, 18.4], [-27.0, 18.2], [-26.0, 17.8], [-25.0, 17.5],
      // Western coast (Atlantic Ocean)
      [-24.0, 17.2], [-23.0, 16.8], [-22.5, 16.5], [-22.0, 17.0],
      // Back to start completing the border
      [-22.0, 18.0], [-22.0, 20.0], [-22.0, 22.0], [-22.0, 24.0], [-22.0, 26.0], [-22.0, 29.0]
    ];
    
      borderPoints.forEach(([lat, lng], index) => {
        const { x, y } = latLngToCanvas(lat, lng, width, height);
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Draw major cities as reference points
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    const majorCities = [
      { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
      { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
      { name: 'Durban', lat: -29.8587, lng: 31.0218 },
      { name: 'Pretoria', lat: -25.7479, lng: 28.2293 },
      { name: 'Port Elizabeth', lat: -33.9608, lng: 25.6022 },
      { name: 'Bloemfontein', lat: -29.0852, lng: 26.1596 }
    ];

    majorCities.forEach(city => {
      const { x, y } = latLngToCanvas(city.lat, city.lng, width, height);
      // Draw small circle for city
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
      // Draw city name
      ctx.fillText(city.name, x + 5, y - 3);
    });

    // Draw provinces boundaries (simplified)
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Western Cape
    ctx.beginPath();
    const wcBorder = [[-32.0, 18.0], [-33.5, 19.5], [-34.0, 22.0], [-32.5, 24.0], [-30.5, 21.5], [-29.5, 19.0], [-32.0, 18.0]];
    wcBorder.forEach(([lat, lng], index) => {
      const { x, y } = latLngToCanvas(lat, lng, width, height);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Gauteng (small province around Johannesburg)
    ctx.beginPath();
    const gautengBorder = [[-25.5, 27.5], [-26.5, 27.5], [-26.5, 28.5], [-25.5, 28.5], [-25.5, 27.5]];
    gautengBorder.forEach(([lat, lng], index) => {
      const { x, y } = latLngToCanvas(lat, lng, width, height);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.setLineDash([]); // Reset line dash

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let lat = -34; lat <= -22; lat += 2) {
      const { x: x1, y: y1 } = latLngToCanvas(lat, mapBounds.minLng, width, height);
      const { x: x2, y: y2 } = latLngToCanvas(lat, mapBounds.maxLng, width, height);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    
    for (let lng = 16; lng <= 33; lng += 2) {
      const { x: x1, y: y1 } = latLngToCanvas(mapBounds.minLat, lng, width, height);
      const { x: x2, y: y2 } = latLngToCanvas(mapBounds.maxLat, lng, width, height);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Filter points based on active layer
    const filteredPoints = mapPoints.filter(point => {
      if (activeLayer === 'all') return true;
      if (activeLayer === 'disasters') return point.type === 'disaster';
      if (activeLayer === 'food') return point.type === 'food';
      if (activeLayer === 'vulnerable') return point.type === 'vulnerable';
      return false;
    });

    // Draw points
    filteredPoints.forEach(point => {
      const { x, y } = latLngToCanvas(point.lat, point.lng, width, height);
      
      // Skip if point is outside visible area
      if (x < -50 || x > width + 50 || y < -50 || y > height + 50) return;

      let color = '#64748b';
      let size = 12;
      
      switch (point.type) {
        case 'disaster':
          color = point.severity === 'critical' ? '#dc2626' : 
                  point.severity === 'high' ? '#ea580c' :
                  point.severity === 'medium' ? '#f59e0b' : '#84cc16';
          size = point.severity === 'critical' ? 20 : 
                 point.severity === 'high' ? 18 :
                 point.severity === 'medium' ? 16 : 14;
          break;
        case 'food':
          color = '#16a34a';
          size = 16;
          break;
        case 'vulnerable':
          color = point.severity === 'critical' ? '#dc2626' : 
                  point.severity === 'high' ? '#ea580c' : '#f59e0b';
          size = 18;
          break;
      }

      // Draw point
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw icon in center
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const icon = point.type === 'disaster' ? '⚠' :
                   point.type === 'food' ? '📦' :
                   point.type === 'vulnerable' ? '🏠' : '📍';
      ctx.fillText(icon, x, y);
    });

    // Draw hovered point highlight
    if (hoveredPoint && hoveredPoint !== selectedPoint) {
      const { x, y } = latLngToCanvas(hoveredPoint.lat, hoveredPoint.lng, width, height);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw selected point highlight
    if (selectedPoint) {
      const { x, y } = latLngToCanvas(selectedPoint.lat, selectedPoint.lng, width, height);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw compass rose and scale
    drawMapDecorations(ctx, width, height);
  };

  // Draw compass rose and scale
  const drawMapDecorations = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Compass rose (top right)
    const compassX = width - 60;
    const compassY = 60;
    const compassSize = 40;

    ctx.strokeStyle = '#64748b';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Compass circle
    ctx.beginPath();
    ctx.arc(compassX, compassY, compassSize / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Compass points - North arrow (red)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - compassSize / 2 + 5);
    ctx.lineTo(compassX - 6, compassY - 8);
    ctx.lineTo(compassX, compassY - 15);
    ctx.lineTo(compassX + 6, compassY - 8);
    ctx.closePath();
    ctx.fill();

    // South arrow (gray)
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(compassX, compassY + compassSize / 2 - 5);
    ctx.lineTo(compassX - 6, compassY + 8);
    ctx.lineTo(compassX, compassY + 15);
    ctx.lineTo(compassX + 6, compassY + 8);
    ctx.closePath();
    ctx.fill();

    // N label
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', compassX, compassY - compassSize / 2 - 12);

    // Scale bar (bottom left)
    const scaleX = 40;
    const scaleY = height - 50;
    const scaleLength = 120;

    ctx.strokeStyle = '#374151';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Scale background
    ctx.fillRect(scaleX - 10, scaleY - 25, scaleLength + 40, 35);
    ctx.strokeRect(scaleX - 10, scaleY - 25, scaleLength + 40, 35);

    // Scale bar
    ctx.beginPath();
    ctx.moveTo(scaleX, scaleY);
    ctx.lineTo(scaleX + scaleLength, scaleY);
    ctx.stroke();

    // Scale markers and alternating colors
    for (let i = 0; i <= 4; i++) {
      const x = scaleX + (i * scaleLength / 4);
      
      // Alternating black/white segments
      if (i < 4) {
        ctx.fillStyle = i % 2 === 0 ? '#374151' : '#ffffff';
        ctx.fillRect(x, scaleY - 8, scaleLength / 4, 8);
        ctx.strokeRect(x, scaleY - 8, scaleLength / 4, 8);
      }

      // Scale tick marks
      ctx.strokeStyle = '#374151';
      ctx.beginPath();
      ctx.moveTo(x, scaleY - 8);
      ctx.lineTo(x, scaleY + 5);
      ctx.stroke();
    }

    // Scale labels
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#374151';
    ctx.fillText('0', scaleX, scaleY + 8);
    ctx.fillText('200km', scaleX + scaleLength / 2, scaleY + 8);
    ctx.fillText('400km', scaleX + scaleLength, scaleY + 8);
    
    // Scale title
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Scale', scaleX, scaleY - 18);
  };

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (hasDragged) return; // Don't process clicks if we just dragged
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    console.log('Canvas clicked at:', { clickX, clickY });

    // Filter points based on active layer first
    const filteredPoints = mapPoints.filter(point => {
      if (activeLayer === 'all') return true;
      if (activeLayer === 'disasters') return point.type === 'disaster';
      if (activeLayer === 'food') return point.type === 'food';
      if (activeLayer === 'vulnerable') return point.type === 'vulnerable';
      return false;
    });

    // Find clicked point
    let clickedPoint: MapPoint | null = null;
    let minDistance = Infinity;

    filteredPoints.forEach(point => {
      const { x, y } = latLngToCanvas(point.lat, point.lng, canvas.width, canvas.height);
      const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2);
      
      console.log(`Point ${point.name}: canvas coords (${x}, ${y}), distance: ${distance}`);
      
      if (distance < 30 && distance < minDistance) {
        minDistance = distance;
        clickedPoint = point;
      }
    });

    console.log('Selected point:', clickedPoint);
    setSelectedPoint(clickedPoint);
  };

  // Handle mouse events for panning
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setIsDragging(true);
    setHasDragged(false);
    setLastMousePos({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const deltaX = event.clientX - lastMousePos.x;
      const deltaY = event.clientY - lastMousePos.y;

      // If we moved more than a few pixels, consider it dragging
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        setHasDragged(true);
      }

      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));

      setLastMousePos({ x: event.clientX, y: event.clientY });
    } else {
      // Handle hover detection when not dragging
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const mouseX = (event.clientX - rect.left) * scaleX;
      const mouseY = (event.clientY - rect.top) * scaleY;

      // Filter points based on active layer
      const filteredPoints = mapPoints.filter(point => {
        if (activeLayer === 'all') return true;
        if (activeLayer === 'disasters') return point.type === 'disaster';
        if (activeLayer === 'food') return point.type === 'food';
        if (activeLayer === 'vulnerable') return point.type === 'vulnerable';
        return false;
      });

      // Find hovered point
      let newHoveredPoint: MapPoint | null = null;
      let minDistance = Infinity;

      filteredPoints.forEach(point => {
        const { x, y } = latLngToCanvas(point.lat, point.lng, canvas.width, canvas.height);
        const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
        
        if (distance < 30 && distance < minDistance) {
          minDistance = distance;
          newHoveredPoint = point;
        }
      });

      setHoveredPoint(newHoveredPoint);
      
      // Change cursor based on hover state
      canvas.style.cursor = newHoveredPoint ? 'pointer' : isDragging ? 'grabbing' : 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset hasDragged after a short delay to allow click detection
    setTimeout(() => {
      setHasDragged(false);
    }, 100);
  };

  // Zoom functions
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Load South Africa map image
  useEffect(() => {
    const img = new Image();
    // Using local South Africa map SVG
    img.src = '/south-africa-map.svg';
    
    img.onload = () => {
      setMapImage(img);
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      console.log('Failed to load map image, using fallback drawing');
      setImageLoaded(true); // Still proceed with fallback drawing
    };
  }, []);

  // Draw map when component mounts or data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 800;
      canvas.height = 600;
      drawMap();
    }
  }, [activeLayer, zoom, offset, selectedPoint, hoveredPoint, imageLoaded]);

  // Get statistics for active layer
  const getStats = () => {
    const disasters = mapPoints.filter(p => p.type === 'disaster').length;
    const food = mapPoints.filter(p => p.type === 'food').length;
    const vulnerable = mapPoints.filter(p => p.type === 'vulnerable').length;
    
    return { disasters, food, vulnerable };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white">Interactive Maps</h1>
          <p className="text-blue-100">Geographic visualization of disasters, resources, and vulnerable areas</p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  South Africa Overview
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto border rounded-lg cursor-grab select-none"
                  style={{ maxHeight: '600px', touchAction: 'none' }}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
                
                {/* Layer Controls */}
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Map Layers
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant={activeLayer === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveLayer('all')}
                      className="w-full text-xs"
                    >
                      All Locations
                    </Button>
                    <Button
                      variant={activeLayer === 'disasters' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveLayer('disasters')}
                      className="w-full text-xs"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Disasters ({stats.disasters})
                    </Button>
                    <Button
                      variant={activeLayer === 'food' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveLayer('food')}
                      className="w-full text-xs"
                    >
                      <Package className="h-3 w-3 mr-1" />
                      Food Points ({stats.food})
                    </Button>
                    <Button
                      variant={activeLayer === 'vulnerable' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveLayer('vulnerable')}
                      className="w-full text-xs"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Vulnerable Areas ({stats.vulnerable})
                    </Button>
                  </div>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
                  <h3 className="font-semibold text-sm mb-2">Legend</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <span>Critical Disasters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span>Food Distribution</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>Vulnerable Areas</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Location Details */}
          {selectedPoint && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Location Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">{selectedPoint.name}</h4>
                    <p className="text-sm text-gray-600 capitalize">{selectedPoint.type}</p>
                  </div>
                  
                  {selectedPoint.severity && (
                    <div>
                      <Badge 
                        className={
                          selectedPoint.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          selectedPoint.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          selectedPoint.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }
                      >
                        {selectedPoint.severity.toUpperCase()}
                      </Badge>
                    </div>
                  )}

                  {selectedPoint.data && (
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedPoint.data).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600 capitalize">{key}:</span>
                          <span className="font-medium">
                            {Array.isArray(value) ? value.join(', ') : String(value || '')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    <p>Lat: {selectedPoint.lat.toFixed(4)}</p>
                    <p>Lng: {selectedPoint.lng.toFixed(4)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Disasters</span>
                  <span className="font-bold text-red-600">{stats.disasters}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Distribution Points</span>
                  <span className="font-bold text-green-600">{stats.food}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vulnerable Areas</span>
                  <span className="font-bold text-orange-600">{stats.vulnerable}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Locations</span>
                  <span className="font-bold">{mapPoints.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Map Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-2 text-gray-600">
                <p>• Click points for details</p>
                <p>• Drag to pan the map</p>
                <p>• Use zoom buttons to zoom in/out</p>
                <p>• Select layers to filter data</p>
                <p>• Reset button returns to default view</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;