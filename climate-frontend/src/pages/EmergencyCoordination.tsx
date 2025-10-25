import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../lib/utils';
import { 
  Users, 
  Plus, 
  Search, 
  MessageSquare,
  Clock,
  UserCheck,
  Truck,
  Phone,
  Mail,
  MapPin,
  Target,
  Send,
  Paperclip
} from 'lucide-react';

interface CoordinationTask {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to: string;
  assigned_by: string;
  organization: string;
  category: 'logistics' | 'medical' | 'communication' | 'evacuation' | 'resources' | 'assessment';
  deadline: string;
  created_at: string;
  location?: string;
  resources_needed: string[];
  progress_notes: string;
  contact_info: {
    phone?: string;
    email?: string;
  };
}

interface Message {
  id: number;
  sender: string;
  organization: string;
  message: string;
  timestamp: string;
  priority: 'normal' | 'urgent' | 'emergency';
  thread_id?: number;
  attachments?: string[];
}

interface ResourceRequest {
  id: number;
  requested_by: string;
  organization: string;
  resource_type: string;
  quantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  status: 'pending' | 'approved' | 'dispatched' | 'delivered' | 'cancelled';
  created_at: string;
  estimated_delivery?: string;
}

const EmergencyCoordination: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'tasks' | 'messages' | 'resources'>('tasks');
  const [tasks, setTasks] = React.useState<CoordinationTask[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [resourceRequests, setResourceRequests] = React.useState<ResourceRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [showResourceForm, setShowResourceForm] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [filterPriority, setFilterPriority] = React.useState('all');
  const [newMessage, setNewMessage] = React.useState('');

  const [taskForm, setTaskForm] = React.useState({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    organization: '',
    category: 'logistics',
    deadline: '',
    location: '',
    resources_needed: [] as string[],
    contact_phone: '',
    contact_email: ''
  });

  const [resourceForm, setResourceForm] = React.useState({
    resource_type: '',
    quantity: '',
    urgency: 'medium',
    location: '',
    description: '',
    requested_by: '',
    organization: ''
  });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock comprehensive coordination data
      const mockTasks: CoordinationTask[] = [
        {
          id: 1,
          title: 'Emergency Food Distribution - Khayelitsha',
          description: 'Coordinate emergency food distribution for 500 families affected by flooding',
          priority: 'critical',
          status: 'in_progress',
          assigned_to: 'Sarah Johnson',
          assigned_by: 'Mike Chen',
          organization: 'Red Cross South Africa',
          category: 'logistics',
          deadline: '2024-01-20T18:00:00Z',
          created_at: '2024-01-18T08:00:00Z',
          location: 'Khayelitsha Community Center',
          resources_needed: ['Food Packages', 'Volunteers', 'Transportation'],
          progress_notes: 'Distribution site setup complete. 60% of packages distributed.',
          contact_info: {
            phone: '+27-11-123-4567',
            email: 'sarah.j@redcross.org.za'
          }
        },
        {
          id: 2,
          title: 'Medical Team Deployment - Limpopo',
          description: 'Deploy mobile medical unit to drought-affected rural areas',
          priority: 'high',
          status: 'assigned',
          assigned_to: 'Dr. Thabo Mthembu',
          assigned_by: 'Emergency Coordinator',
          organization: 'Department of Health',
          category: 'medical',
          deadline: '2024-01-22T12:00:00Z',
          created_at: '2024-01-18T10:30:00Z',
          location: 'Polokwane Rural District',
          resources_needed: ['Mobile Clinic', 'Medical Supplies', 'Fuel'],
          progress_notes: 'Team assembled, awaiting transportation approval.',
          contact_info: {
            phone: '+27-15-987-6543',
            email: 'thabo.m@health.gov.za'
          }
        },
        {
          id: 3,
          title: 'Evacuation Route Assessment',
          description: 'Assess and clear evacuation routes for coastal communities',
          priority: 'high',
          status: 'pending',
          assigned_to: 'Cape Town Emergency Services',
          assigned_by: 'Provincial Coordinator',
          organization: 'City of Cape Town',
          category: 'evacuation',
          deadline: '2024-01-25T16:00:00Z',
          created_at: '2024-01-19T07:00:00Z',
          location: 'Muizenberg to Fish Hoek Route',
          resources_needed: ['Survey Team', 'Heavy Equipment', 'Safety Barriers'],
          progress_notes: 'Initial survey scheduled for tomorrow morning.',
          contact_info: {
            phone: '+27-21-400-4911',
            email: 'emergency@capetown.gov.za'
          }
        },
        {
          id: 4,
          title: 'Communication Tower Repair',
          description: 'Restore communication infrastructure damaged by storm',
          priority: 'medium',
          status: 'completed',
          assigned_to: 'Telkom Technical Team',
          assigned_by: 'Infrastructure Manager',
          organization: 'Telkom SA',
          category: 'communication',
          deadline: '2024-01-19T14:00:00Z',
          created_at: '2024-01-17T16:30:00Z',
          location: 'Durban North Tower Site',
          resources_needed: ['Replacement Parts', 'Technical Crew', 'Generator'],
          progress_notes: 'Tower fully operational as of 13:45 today.',
          contact_info: {
            phone: '+27-31-240-3000',
            email: 'repair.team@telkom.co.za'
          }
        }
      ];

      const mockMessages: Message[] = [
        {
          id: 1,
          sender: 'Emergency Command Center',
          organization: 'NDMC',
          message: 'URGENT: Severe weather warning issued for Western Cape. All teams prepare for response activation.',
          timestamp: '2024-01-18T14:30:00Z',
          priority: 'emergency'
        },
        {
          id: 2,
          sender: 'Sarah Johnson',
          organization: 'Red Cross',
          message: 'Food distribution in Khayelitsha proceeding as planned. We need 3 additional volunteers for evening shift.',
          timestamp: '2024-01-18T12:15:00Z',
          priority: 'normal'
        },
        {
          id: 3,
          sender: 'Dr. Thabo Mthembu',
          organization: 'Department of Health',
          message: 'Mobile clinic team ready for deployment. Requesting clearance for rural access roads.',
          timestamp: '2024-01-18T11:45:00Z',
          priority: 'urgent'
        },
        {
          id: 4,
          sender: 'Cape Town Emergency Services',
          organization: 'City of Cape Town',
          message: 'Evacuation routes A1 and A2 cleared. Route B3 blocked by fallen tree - repair crew dispatched.',
          timestamp: '2024-01-18T10:20:00Z',
          priority: 'urgent'
        }
      ];

      const mockResourceRequests: ResourceRequest[] = [
        {
          id: 1,
          requested_by: 'Field Coordinator',
          organization: 'Gift of the Givers',
          resource_type: 'Emergency Food Supplies',
          quantity: 200,
          urgency: 'critical',
          location: 'Khayelitsha',
          description: '200 family food packages for flood victims',
          status: 'dispatched',
          created_at: '2024-01-18T08:00:00Z',
          estimated_delivery: '2024-01-18T16:00:00Z'
        },
        {
          id: 2,
          requested_by: 'Medical Officer',
          organization: 'Doctors Without Borders',
          resource_type: 'Medical Supplies',
          quantity: 1,
          urgency: 'high',
          location: 'Rural Limpopo',
          description: 'Diabetes and hypertension medication for 50 patients',
          status: 'approved',
          created_at: '2024-01-18T09:30:00Z',
          estimated_delivery: '2024-01-19T10:00:00Z'
        },
        {
          id: 3,
          requested_by: 'Logistics Manager',
          organization: 'SAPS Search and Rescue',
          resource_type: 'Transportation',
          quantity: 3,
          urgency: 'medium',
          location: 'Drakensberg',
          description: '3 helicopter units for mountain rescue operation',
          status: 'pending',
          created_at: '2024-01-18T11:15:00Z'
        }
      ];
      
      setTasks(mockTasks);
      setMessages(mockMessages);
      setResourceRequests(mockResourceRequests);
    } catch (error) {
      console.error('Failed to fetch coordination data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newTask: CoordinationTask = {
        id: Date.now(),
        title: taskForm.title,
        description: taskForm.description,
        priority: taskForm.priority as any,
        status: 'pending',
        assigned_to: taskForm.assigned_to,
        assigned_by: 'Current User', // Would be from auth context
        organization: taskForm.organization,
        category: taskForm.category as any,
        deadline: taskForm.deadline,
        created_at: new Date().toISOString(),
        location: taskForm.location,
        resources_needed: taskForm.resources_needed,
        progress_notes: '',
        contact_info: {
          phone: taskForm.contact_phone,
          email: taskForm.contact_email
        }
      };
      
      setTasks(prev => [newTask, ...prev]);
      setShowTaskForm(false);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        assigned_to: '',
        organization: '',
        category: 'logistics',
        deadline: '',
        location: '',
        resources_needed: [],
        contact_phone: '',
        contact_email: ''
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const message: Message = {
        id: Date.now(),
        sender: 'Current User', // Would be from auth context
        organization: 'Your Organization',
        message: newMessage,
        timestamp: new Date().toISOString(),
        priority: 'normal'
      };
      
      setMessages(prev => [message, ...prev]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleResourceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const request: ResourceRequest = {
        id: Date.now(),
        requested_by: resourceForm.requested_by,
        organization: resourceForm.organization,
        resource_type: resourceForm.resource_type,
        quantity: parseInt(resourceForm.quantity) || 0,
        urgency: resourceForm.urgency as any,
        location: resourceForm.location,
        description: resourceForm.description,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      setResourceRequests(prev => [request, ...prev]);
      setShowResourceForm(false);
      setResourceForm({
        resource_type: '',
        quantity: '',
        urgency: 'medium',
        location: '',
        description: '',
        requested_by: '',
        organization: ''
      });
    } catch (error) {
      console.error('Failed to create resource request:', error);
    }
  };

  const updateTaskStatus = (taskId: number, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus as any } : task
    ));
  };

  // Filter functions
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.organization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">Emergency Coordination</h1>
          <p className="mt-2 text-gray-600">Multi-stakeholder collaboration and response coordination</p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(t => ['pending', 'assigned', 'in_progress'].includes(t.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Messages Today</p>
                <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Resource Requests</p>
                <p className="text-2xl font-bold text-gray-900">{resourceRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Organizations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set([...tasks.map(t => t.organization), ...messages.map(m => m.organization)]).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'tasks', label: 'Tasks & Assignments', icon: Target },
            { key: 'messages', label: 'Communications', icon: MessageSquare },
            { key: 'resources', label: 'Resource Requests', icon: Truck }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`${
                activeTab === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Filters and Add Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks, organizations, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button onClick={() => setShowTaskForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>

          {/* Tasks List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-3">
                        <div className={`w-1 h-16 rounded-full ${getPriorityColor(task.priority)}`}></div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                            <div className="flex items-center">
                              <UserCheck className="h-4 w-4 mr-1" />
                              {task.assigned_to} ({task.organization})
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {task.location || 'No location specified'}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Due: {formatDate(task.deadline)}
                            </div>
                          </div>

                          {task.resources_needed.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-500 mb-1">Resources Needed:</p>
                              <div className="flex flex-wrap gap-1">
                                {task.resources_needed.map((resource, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {task.progress_notes && (
                            <div className="mt-3 p-2 bg-blue-50 rounded">
                              <p className="text-xs font-medium text-blue-700 mb-1">Progress Notes:</p>
                              <p className="text-xs text-blue-600">{task.progress_notes}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(task.status)}>
                                {task.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.category}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {task.contact_info.phone && (
                                <Button size="sm" variant="outline">
                                  <Phone className="h-3 w-3" />
                                </Button>
                              )}
                              {task.contact_info.email && (
                                <Button size="sm" variant="outline">
                                  <Mail className="h-3 w-3" />
                                </Button>
                              )}
                              
                              {task.status !== 'completed' && task.status !== 'cancelled' && (
                                <select
                                  value={task.status}
                                  onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="assigned">Assigned</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-6">
          {/* Send Message Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message to all coordination team members..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                    required
                  />
                </div>
                <div className="flex justify-between items-center">
                  <Button type="button" variant="outline">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
                  <Button type="submit">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Messages List */}
          <div className="space-y-4">
            {messages.map((message) => (
              <Card key={message.id} className={`${
                message.priority === 'emergency' ? 'border-red-500 bg-red-50' :
                message.priority === 'urgent' ? 'border-orange-500 bg-orange-50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">{message.sender}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.organization}
                        </Badge>
                        {message.priority !== 'normal' && (
                          <Badge 
                            variant={message.priority === 'emergency' ? 'destructive' : 'warning'}
                            className="text-xs"
                          >
                            {message.priority.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-700">{message.message}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(message.timestamp)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Add Resource Request Button */}
          <div className="flex justify-end">
            <Button onClick={() => setShowResourceForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Resource Request
            </Button>
          </div>

          {/* Resource Requests List */}
          <div className="grid grid-cols-1 gap-4">
            {resourceRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{request.resource_type}</h3>
                      <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <span className="ml-2 font-medium">{request.quantity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>
                          <span className="ml-2 font-medium">{request.location}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Requested by:</span>
                          <span className="ml-2 font-medium">{request.requested_by}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Organization:</span>
                          <span className="ml-2 font-medium">{request.organization}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge 
                            variant={request.urgency === 'critical' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {request.urgency.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Requested: {formatDate(request.created_at)}
                          {request.estimated_delivery && (
                            <div>ETA: {formatDate(request.estimated_delivery)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTaskSubmit} className="space-y-4">
                <Input
                  label="Task Title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Emergency Food Distribution"
                  required
                />
                
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                    placeholder="Detailed description of the task..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Priority
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Category
                    </label>
                    <select
                      value={taskForm.category}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                      required
                    >
                      <option value="logistics">Logistics</option>
                      <option value="medical">Medical</option>
                      <option value="communication">Communication</option>
                      <option value="evacuation">Evacuation</option>
                      <option value="resources">Resources</option>
                      <option value="assessment">Assessment</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Assigned To"
                  value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                  placeholder="Person or team name"
                  required
                />

                <Input
                  label="Organization"
                  value={taskForm.organization}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Organization name"
                  required
                />

                <Input
                  label="Location"
                  value={taskForm.location}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Task location"
                />

                <Input
                  label="Deadline"
                  type="datetime-local"
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, deadline: e.target.value }))}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Contact Phone"
                    type="tel"
                    value={taskForm.contact_phone}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="+27-11-123-4567"
                  />

                  <Input
                    label="Contact Email"
                    type="email"
                    value={taskForm.contact_email}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="contact@organization.org"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTaskForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Task
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resource Request Form Modal */}
      {showResourceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Request Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResourceRequest} className="space-y-4">
                <Input
                  label="Resource Type"
                  value={resourceForm.resource_type}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, resource_type: e.target.value }))}
                  placeholder="e.g., Food Supplies, Medical Equipment"
                  required
                />
                
                <Input
                  label="Quantity"
                  type="number"
                  value={resourceForm.quantity}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="100"
                  required
                />

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Urgency
                  </label>
                  <select
                    value={resourceForm.urgency}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, urgency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <Input
                  label="Location"
                  value={resourceForm.location}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Delivery location"
                  required
                />

                <Input
                  label="Requested By"
                  value={resourceForm.requested_by}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, requested_by: e.target.value }))}
                  placeholder="Your name"
                  required
                />

                <Input
                  label="Organization"
                  value={resourceForm.organization}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, organization: e.target.value }))}
                  placeholder="Your organization"
                  required
                />

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Description
                  </label>
                  <textarea
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                    placeholder="Additional details about the resource request..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResourceForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmergencyCoordination;