import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { formatDate, getFoodCategoryIcon, isExpiringSoon } from '../lib/utils';
import { 
  Package, 
  Plus, 
  Search, 
  AlertCircle,
  Edit,
  Trash2,
  Download,
  TrendingDown,
  BarChart3,
  MessageCircle,
  Send,
  X
} from 'lucide-react';

interface FoodItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiry_date: string | null;
  storage_location: string;
  supplier: string;
  cost_per_unit: number;
  nutritional_info?: string;
  created_at: string;
  last_updated: string;
}

const FoodSecurity: React.FC = () => {
  const [foodItems, setFoodItems] = React.useState<FoodItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<FoodItem | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('all');
  const [filterStatus, setFilterStatus] = React.useState('all');
  
  // Messaging state
  const [showMessageModal, setShowMessageModal] = React.useState(false);
  const [selectedSupplier, setSelectedSupplier] = React.useState<{ name: string; item: string } | null>(null);
  const [messageText, setMessageText] = React.useState('');
  const [messageSending, setMessageSending] = React.useState(false);
  
  // Check if current user is NGO (also show for admin users to demo the feature)
  const userRole = localStorage.getItem('user_role') || 'ngo'; // Default to ngo for demo
  const isNGO = userRole === 'ngo' || userRole === 'admin';

  const [formData, setFormData] = React.useState({
    name: '',
    category: 'grains',
    quantity: '',
    unit: 'kg',
    expiry_date: '',
    storage_location: '',
    supplier: '',
    cost_per_unit: '',
    nutritional_info: ''
  });

  React.useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      // Mock data for comprehensive food inventory
      const mockFoodItems: FoodItem[] = [
        {
          id: 1,
          name: 'White Rice',
          category: 'grains',
          quantity: 150,
          unit: 'kg',
          expiry_date: '2024-06-15',
          storage_location: 'Warehouse A, Section 1',
          supplier: 'Golden Harvest Co.',
          cost_per_unit: 12.50,
          nutritional_info: 'Carbohydrates: 80g/100g, Protein: 7g/100g',
          created_at: '2024-01-10T09:00:00Z',
          last_updated: '2024-01-15T14:30:00Z'
        },
        {
          id: 2,
          name: 'Canned Beans',
          category: 'proteins',
          quantity: 200,
          unit: 'cans',
          expiry_date: '2024-12-31',
          storage_location: 'Warehouse B, Section 3',
          supplier: 'Nutritious Foods Ltd',
          cost_per_unit: 8.75,
          nutritional_info: 'Protein: 15g/100g, Fiber: 12g/100g',
          created_at: '2024-01-08T11:15:00Z',
          last_updated: '2024-01-14T16:45:00Z'
        },
        {
          id: 3,
          name: 'Powdered Milk',
          category: 'dairy',
          quantity: 50,
          unit: 'packages',
          expiry_date: '2024-03-20',
          storage_location: 'Cold Storage Unit 1',
          supplier: 'Dairy Fresh Suppliers',
          cost_per_unit: 45.00,
          nutritional_info: 'Protein: 26g/100g, Calcium: 1200mg/100g',
          created_at: '2024-01-05T08:30:00Z',
          last_updated: '2024-01-12T10:20:00Z'
        },
        {
          id: 4,
          name: 'Fresh Vegetables Mix',
          category: 'vegetables',
          quantity: 80,
          unit: 'kg',
          expiry_date: '2024-01-25',
          storage_location: 'Refrigerated Section A',
          supplier: 'Local Farm Cooperative',
          cost_per_unit: 18.30,
          nutritional_info: 'Vitamins A, C, K, Folate, various minerals',
          created_at: '2024-01-18T07:00:00Z',
          last_updated: '2024-01-18T07:00:00Z'
        },
        {
          id: 5,
          name: 'Cooking Oil',
          category: 'fats',
          quantity: 120,
          unit: 'liters',
          expiry_date: '2024-08-30',
          storage_location: 'Warehouse A, Section 2',
          supplier: 'Healthy Oils Inc',
          cost_per_unit: 35.50,
          nutritional_info: 'Fat: 100g/100ml, Vitamin E',
          created_at: '2024-01-12T13:45:00Z',
          last_updated: '2024-01-16T09:15:00Z'
        },
        {
          id: 6,
          name: 'Baby Formula',
          category: 'nutrition',
          quantity: 25,
          unit: 'containers',
          expiry_date: '2024-04-10',
          storage_location: 'Secure Storage Room',
          supplier: 'NutriCare Supplies',
          cost_per_unit: 89.99,
          nutritional_info: 'Complete infant nutrition, 0-12 months',
          created_at: '2024-01-14T15:20:00Z',
          last_updated: '2024-01-17T11:30:00Z'
        }
      ];
      
      setFoodItems(mockFoodItems);
    } catch (error) {
      console.error('Failed to fetch food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newItem = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        cost_per_unit: parseFloat(formData.cost_per_unit) || 0,
      };

      if (editingItem) {
        // Update existing item
        const updatedItem = { 
          ...editingItem, 
          ...newItem,
          last_updated: new Date().toISOString()
        };
        setFoodItems(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
        setEditingItem(null);
      } else {
        // Add new item
        const item: FoodItem = {
          id: Date.now(),
          ...newItem,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        } as FoodItem;
        
        setFoodItems(prev => [item, ...prev]);
      }

      // Reset form
      setFormData({
        name: '',
        category: 'grains',
        quantity: '',
        unit: 'kg',
        expiry_date: '',
        storage_location: '',
        supplier: '',
        cost_per_unit: '',
        nutritional_info: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to save food item:', error);
    }
  };

  const handleEdit = (item: FoodItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || '',
      quantity: (item.quantity || 0).toString(),
      unit: item.unit || '',
      expiry_date: item.expiry_date || '',
      storage_location: item.storage_location || '',
      supplier: item.supplier || '',
      cost_per_unit: (item.cost_per_unit || 0).toString(),
      nutritional_info: item.nutritional_info || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this food item?')) {
      setFoodItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Messaging functions
  const handleMessageSupplier = (item: FoodItem) => {
    setSelectedSupplier({ name: item.supplier, item: item.name });
    setMessageText(`Hello ${item.supplier},

I hope this message finds you well. I am reaching out from our NGO regarding the ${item.name} you have listed in our food security system.

We are currently working to address food insecurity in our communities and would appreciate the opportunity to discuss potential partnerships or procurement options.

Could we please arrange a time to discuss:
- Availability and pricing for larger quantities
- Delivery schedules and logistics
- Quality assurance and certifications
- Long-term supply agreements

Thank you for your time and contribution to food security efforts.

Best regards,
NGO Food Security Team`);
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!selectedSupplier || !messageText.trim()) return;
    
    setMessageSending(true);
    try {
      // Simulate API call to send message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`✅ Message sent successfully to ${selectedSupplier.name}!\n\nYour message about ${selectedSupplier.item} has been delivered. The supplier will receive your contact information and can respond directly.`);
      
      // Reset message modal
      setShowMessageModal(false);
      setSelectedSupplier(null);
      setMessageText('');
    } catch (error) {
      alert('❌ Failed to send message. Please try again later.');
    } finally {
      setMessageSending(false);
    }
  };

  const handleCloseMessage = () => {
    setShowMessageModal(false);
    setSelectedSupplier(null);
    setMessageText('');
  };

  // Filter food items
  const filteredItems = foodItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    let matchesStatus = true;
    if (filterStatus === 'expiring') {
      matchesStatus = item.expiry_date ? isExpiringSoon(item.expiry_date) : false;
    } else if (filterStatus === 'low_stock') {
      matchesStatus = item.quantity < 50; // Assuming 50 is low stock threshold
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate statistics
  const totalItems = foodItems.length;
  const totalValue = foodItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.cost_per_unit || 0)), 0);
  const expiringItems = foodItems.filter(item => item.expiry_date ? isExpiringSoon(item.expiry_date) : false).length;
  const lowStockItems = foodItems.filter(item => item.quantity < 50).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Food Security Management</h1>
          <p className="mt-2 text-gray-600">Monitor inventory, track expiry dates, and manage food distribution</p>
          {isNGO && (
            <div className="mt-3 flex items-center text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
              <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>As an NGO user, you can message suppliers directly using the message button (💬) on each food item card.</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Food Item
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">R{totalValue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">{expiringItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search food items or suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="all">All Categories</option>
              <option value="grains">Grains</option>
              <option value="proteins">Proteins</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="dairy">Dairy</option>
              <option value="fats">Fats & Oils</option>
              <option value="nutrition">Nutrition</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="all">All Items</option>
              <option value="expiring">Expiring Soon</option>
              <option value="low_stock">Low Stock</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Item Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., White Rice"
                    required
                  />
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      required
                    >
                      <option value="grains">Grains</option>
                      <option value="proteins">Proteins</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="dairy">Dairy</option>
                      <option value="fats">Fats & Oils</option>
                      <option value="nutrition">Nutrition</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="150"
                    required
                  />
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Unit
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      required
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="liters">Liters (L)</option>
                      <option value="cans">Cans</option>
                      <option value="packages">Packages</option>
                      <option value="containers">Containers</option>
                      <option value="boxes">Boxes</option>
                    </select>
                  </div>

                  <Input
                    label="Cost per Unit (R)"
                    name="cost_per_unit"
                    type="number"
                    step="0.01"
                    value={formData.cost_per_unit}
                    onChange={handleChange}
                    placeholder="12.50"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Expiry Date"
                    name="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={handleChange}
                  />
                  
                  <Input
                    label="Supplier"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    placeholder="Golden Harvest Co."
                    required
                  />
                </div>

                <Input
                  label="Storage Location"
                  name="storage_location"
                  value={formData.storage_location}
                  onChange={handleChange}
                  placeholder="Warehouse A, Section 1"
                  required
                />

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Nutritional Information
                  </label>
                  <textarea
                    name="nutritional_info"
                    value={formData.nutritional_info}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                    placeholder="Carbohydrates: 80g/100g, Protein: 7g/100g..."
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingItem(null);
                      setFormData({
                        name: '',
                        category: 'grains',
                        quantity: '',
                        unit: 'kg',
                        expiry_date: '',
                        storage_location: '',
                        supplier: '',
                        cost_per_unit: '',
                        nutritional_info: ''
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Food Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isExpiring = item.expiry_date ? isExpiringSoon(item.expiry_date) : false;
          const isLowStock = item.quantity < 50;
          
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getFoodCategoryIcon(item.category)}</span>
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <p className="text-sm text-gray-500 capitalize">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    {isExpiring && (
                      <Badge variant="warning" className="text-xs">
                        Expiring Soon
                      </Badge>
                    )}
                    {isLowStock && (
                      <Badge variant="destructive" className="text-xs">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="font-medium">{item.quantity} {item.unit}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Value:</span>
                    <span className="font-medium text-green-600">
                      R{((item.quantity || 0) * (item.cost_per_unit || 0)).toLocaleString()}
                    </span>
                  </div>
                  
                  {item.expiry_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Expires:</span>
                      <span className={`text-sm ${isExpiring ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                        {formatDate(item.expiry_date)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm text-gray-900 text-right">{item.storage_location}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Supplier:</span>
                    <span className="text-sm text-gray-900 text-right">{item.supplier}</span>
                  </div>

                  {item.nutritional_info && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-600">{item.nutritional_info}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <span className="text-xs text-gray-500">
                    Updated {formatDate(item.last_updated)}
                  </span>
                  
                  <div className="flex space-x-2">
                    {isNGO && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMessageSupplier(item)}
                        title={`Send message to ${item.supplier}`}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No food items found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'No food items match your current filters.'
                : 'No food items have been added to inventory yet.'}
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Message Supplier Modal */}
      {showMessageModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Message Supplier
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Send a message to <strong>{selectedSupplier.name}</strong> about <strong>{selectedSupplier.item}</strong>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseMessage}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your message to the supplier..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tip: Be specific about quantities, delivery dates, and contact preferences
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-900">Message Features:</h4>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        <li>• Your NGO contact information will be automatically included</li>
                        <li>• Suppliers can respond directly via email or phone</li>
                        <li>• Messages are logged for partnership tracking</li>
                        <li>• Priority delivery for verified NGO organizations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCloseMessage}
                  disabled={messageSending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={messageSending || !messageText.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {messageSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodSecurity;