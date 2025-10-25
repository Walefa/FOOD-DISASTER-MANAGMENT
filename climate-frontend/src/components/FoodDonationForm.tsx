import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Package,
  Phone,
  Truck,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface FoodDonationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const FoodDonationForm: React.FC<FoodDonationFormProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    produce_type: 'vegetables',
    variety: '',
    quantity: '',
    unit: 'kg',
    quality_grade: 'A',
    harvest_date: '',
    expiry_date: '',
    available_until: '',
    urgency: 'medium',
    farm_location: '',
    latitude: '',
    longitude: '',
    pickup_instructions: '',
    transportation_available: false,
    contact_phone: '',
    contact_email: '',
    preferred_contact_method: 'phone',
    storage_requirements: '',
    packaging_type: '',
    handling_notes: '',
    intended_beneficiaries: '',
    estimated_people_fed: '',
    certification: '',
    is_urgent: false
  });

  const produceTypes = [
    { value: 'grains', label: '🌾 Grains (Wheat, Rice, Corn)' },
    { value: 'vegetables', label: '🥬 Vegetables' },
    { value: 'fruits', label: '🍎 Fruits' },
    { value: 'legumes', label: '🌰 Legumes (Beans, Lentils)' },
    { value: 'tubers', label: '🥔 Tubers (Potatoes, Sweet Potatoes)' },
    { value: 'herbs', label: '🌿 Herbs & Spices' },
    { value: 'dairy', label: '🥛 Dairy Products' },
    { value: 'meat', label: '🥩 Meat Products' },
    { value: 'other', label: '📦 Other' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  const qualityGrades = [
    { value: 'A', label: 'Grade A (Premium)' },
    { value: 'B', label: 'Grade B (Good)' },
    { value: 'C', label: 'Grade C (Fair)' },
    { value: 'Fresh', label: 'Fresh' },
    { value: 'Good', label: 'Good' },
    { value: 'Fair', label: 'Fair' }
  ];

  const units = [
    'kg', 'tons', 'bags', 'crates', 'boxes', 'pieces', 'liters', 'bunches'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          alert('✅ Current location coordinates added!');
        },
        () => {
          alert('❌ Could not get your location. Please enter coordinates manually.');
        }
      );
    } else {
      alert('❌ Geolocation not supported by this browser.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        estimated_people_fed: formData.estimated_people_fed ? parseInt(formData.estimated_people_fed) : null,
        harvest_date: formData.harvest_date ? new Date(formData.harvest_date).toISOString() : null,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
        available_until: formData.available_until ? new Date(formData.available_until).toISOString() : null
      };

      const response = await fetch('http://localhost:8000/api/v1/food-donations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create food donation');
      }

      const result = await response.json();
      console.log('Food donation created:', result);
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        produce_type: 'vegetables',
        variety: '',
        quantity: '',
        unit: 'kg',
        quality_grade: 'A',
        harvest_date: '',
        expiry_date: '',
        available_until: '',
        urgency: 'medium',
        farm_location: '',
        latitude: '',
        longitude: '',
        pickup_instructions: '',
        transportation_available: false,
        contact_phone: '',
        contact_email: '',
        preferred_contact_method: 'phone',
        storage_requirements: '',
        packaging_type: '',
        handling_notes: '',
        intended_beneficiaries: '',
        estimated_people_fed: '',
        certification: '',
        is_urgent: false
      });

      if (onSuccess) {
        onSuccess();
      }

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error('Error creating food donation:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-green-700">
            <CheckCircle className="h-8 w-8" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Food Donation Created Successfully!</h3>
              <p className="text-sm">Your surplus produce is now available for NGOs and emergency responders to claim.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Donate Surplus Produce
        </CardTitle>
        <p className="text-sm text-gray-600">
          Help communities by donating your surplus farm produce. All fields marked with * are required.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Donation Title *
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Fresh Tomatoes - 50kg Available"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Give your donation a clear, descriptive title</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional details about the produce, growing conditions, etc."
              />
            </div>
          </div>

          {/* Produce Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Produce Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Produce Type *
                </label>
                <select
                  name="produce_type"
                  value={formData.produce_type}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {produceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Variety/Specific Type
                </label>
                <Input
                  name="variety"
                  value={formData.variety}
                  onChange={handleChange}
                  placeholder="e.g., Roma Tomatoes, Sweet Corn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity *
                </label>
                <Input
                  name="quantity"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Quality Grade
                </label>
                <select
                  name="quality_grade"
                  value={formData.quality_grade}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {qualityGrades.map(grade => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Urgency Level
                </label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {urgencyLevels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Timing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Timing & Availability
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Harvest Date
                </label>
                <Input
                  name="harvest_date"
                  type="date"
                  value={formData.harvest_date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Expiry Date
                </label>
                <Input
                  name="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Available Until
                </label>
                <Input
                  name="available_until"
                  type="date"
                  value={formData.available_until}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Location & Pickup
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Farm Location *
              </label>
              <Input
                name="farm_location"
                value={formData.farm_location}
                onChange={handleChange}
                placeholder="e.g., Johannesburg, Gauteng or specific farm address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Latitude *
                </label>
                <Input
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="-26.2041"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Longitude *
                </label>
                <Input
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="28.0473"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  💡 Need coordinates? Use your current location or Google Maps
                </span>
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1"
                >
                  📍 Use My Location
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Pickup Instructions
              </label>
              <textarea
                name="pickup_instructions"
                value={formData.pickup_instructions}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Specific directions, gate access codes, best times for pickup, etc."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="transportation_available"
                checked={formData.transportation_available}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium flex items-center">
                <Truck className="h-4 w-4 mr-1" />
                I can provide transportation/delivery
              </label>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Phone
                </label>
                <Input
                  name="contact_phone"
                  type="tel"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="+27 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Email
                </label>
                <Input
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="farmer@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Preferred Contact Method
              </label>
              <select
                name="preferred_contact_method"
                value={formData.preferred_contact_method}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="phone">Phone Call</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Additional Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Storage Requirements
                </label>
                <Input
                  name="storage_requirements"
                  value={formData.storage_requirements}
                  onChange={handleChange}
                  placeholder="e.g., Keep refrigerated, Store in cool dry place"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Packaging Type
                </label>
                <Input
                  name="packaging_type"
                  value={formData.packaging_type}
                  onChange={handleChange}
                  placeholder="e.g., Wooden crates, Plastic bags, Loose"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Intended Beneficiaries
                </label>
                <Input
                  name="intended_beneficiaries"
                  value={formData.intended_beneficiaries}
                  onChange={handleChange}
                  placeholder="e.g., Local communities, Disaster areas, Food banks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Estimated People Fed
                </label>
                <Input
                  name="estimated_people_fed"
                  type="number"
                  min="1"
                  value={formData.estimated_people_fed}
                  onChange={handleChange}
                  placeholder="50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Certification
                </label>
                <Input
                  name="certification"
                  value={formData.certification}
                  onChange={handleChange}
                  placeholder="e.g., Organic, Pesticide-free, Fair Trade"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Handling Notes
              </label>
              <textarea
                name="handling_notes"
                value={formData.handling_notes}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Special handling requirements, fragility notes, etc."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_urgent"
                checked={formData.is_urgent}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="text-sm font-medium flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Mark as urgent (will expire soon or needed immediately)
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Donation...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Food Donation
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FoodDonationForm;