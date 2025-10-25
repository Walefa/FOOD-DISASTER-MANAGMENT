import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (userData: {
    email: string;
    username: string;
    full_name: string;
    password: string;
    role: string;
    phone?: string;
    organization?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Disaster Alerts API
export const disasterAPI = {
  getAlerts: async (params?: {
    skip?: number;
    limit?: number;
    disaster_type?: string;
    severity?: string;
    active_only?: boolean;
    lat?: number;
    lng?: number;
    radius_km?: number;
  }) => {
    const response = await api.get('/disasters/alerts', { params });
    return response.data;
  },

  createAlert: async (alertData: {
    title: string;
    description?: string;
    disaster_type: string;
    severity: string;
    location: string;
    latitude: number;
    longitude: number;
    radius_km?: number;
    start_time?: string;
    end_time?: string;
    source?: string;
    confidence_score?: number;
  }) => {
    const response = await api.post('/disasters/alerts', alertData);
    return response.data;
  },

  getAlert: async (alertId: number) => {
    const response = await api.get(`/disasters/alerts/${alertId}`);
    return response.data;
  },

  updateAlert: async (alertId: number, updates: any) => {
    const response = await api.put(`/disasters/alerts/${alertId}`, updates);
    return response.data;
  },

  deleteAlert: async (alertId: number) => {
    const response = await api.delete(`/disasters/alerts/${alertId}`);
    return response.data;
  },

  getNearbyAlerts: async (lat: number, lng: number, radius_km: number = 50) => {
    const response = await api.get(`/disasters/alerts/nearby/${lat}/${lng}?radius_km=${radius_km}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/disasters/stats/overview');
    return response.data;
  },
};

// Food Security API
export const foodAPI = {
  getInventory: async (params?: {
    skip?: number;
    limit?: number;
    category?: string;
    location?: string;
    available_only?: boolean;
    emergency_only?: boolean;
    expiring_soon_days?: number;
    lat?: number;
    lng?: number;
    radius_km?: number;
  }) => {
    const response = await api.get('/food/inventory', { params });
    return response.data;
  },

  createInventoryItem: async (itemData: {
    item_name: string;
    category?: string;
    quantity: number;
    unit: string;
    expiry_date?: string;
    location: string;
    latitude?: number;
    longitude?: number;
    owner_organization?: string;
    contact_person?: string;
    contact_phone?: string;
    contact_email?: string;
    is_emergency_reserve?: boolean;
    nutritional_value?: string;
    storage_requirements?: string;
  }) => {
    const response = await api.post('/food/inventory', itemData);
    return response.data;
  },

  getInventoryItem: async (itemId: number) => {
    const response = await api.get(`/food/inventory/${itemId}`);
    return response.data;
  },

  updateInventoryItem: async (itemId: number, updates: any) => {
    const response = await api.put(`/food/inventory/${itemId}`, updates);
    return response.data;
  },

  deleteInventoryItem: async (itemId: number) => {
    const response = await api.delete(`/food/inventory/${itemId}`);
    return response.data;
  },

  getDistributions: async (params?: {
    skip?: number;
    limit?: number;
    status_filter?: string;
    upcoming_only?: boolean;
    organization?: string;
  }) => {
    const response = await api.get('/food/distributions', { params });
    return response.data;
  },

  createDistribution: async (distributionData: {
    event_name: string;
    location: string;
    latitude: number;
    longitude: number;
    scheduled_date: string;
    duration_hours?: number;
    target_beneficiaries?: number;
    organizing_ngo?: string;
    partner_organizations?: string;
    volunteers_count?: number;
  }) => {
    const response = await api.post('/food/distributions', distributionData);
    return response.data;
  },

  getInventorySummary: async () => {
    const response = await api.get('/food/stats/inventory-summary');
    return response.data;
  },

  getDistributionSummary: async () => {
    const response = await api.get('/food/stats/distribution-summary');
    return response.data;
  },

  searchNearbyResources: async (lat: number, lng: number, radius_km: number = 25, emergency_only: boolean = false) => {
    const response = await api.get('/food/search/nearby-resources', {
      params: { lat, lng, radius_km, emergency_only }
    });
    return response.data;
  },
};

// Vulnerability Assessment API
export const vulnerabilityAPI = {
  getAssessments: async (params?: {
    skip?: number;
    limit?: number;
    vulnerability_level?: string;
    location?: string;
    lat?: number;
    lng?: number;
    radius_km?: number;
  }) => {
    const response = await api.get('/vulnerability/assessments', { params });
    return response.data;
  },

  createAssessment: async (assessmentData: any) => {
    const response = await api.post('/vulnerability/assessments', assessmentData);
    return response.data;
  },

  getAssessment: async (assessmentId: number) => {
    const response = await api.get(`/vulnerability/assessments/${assessmentId}`);
    return response.data;
  },

  updateAssessment: async (assessmentId: number, updates: any) => {
    const response = await api.put(`/vulnerability/assessments/${assessmentId}`, updates);
    return response.data;
  },

  getVulnerabilityOverview: async () => {
    const response = await api.get('/vulnerability/stats/vulnerability-overview');
    return response.data;
  },

  getHighRiskHotspots: async (lat?: number, lng?: number, radius_km: number = 100) => {
    const response = await api.get('/vulnerability/hotspots/high-risk', {
      params: { lat, lng, radius_km }
    });
    return response.data;
  },

  getRecommendations: async (assessmentId: number) => {
    const response = await api.get(`/vulnerability/recommendations/${assessmentId}`);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboardMetrics: async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  getClimateRiskForecast: async (lat?: number, lng?: number, days_ahead: number = 7) => {
    const response = await api.get('/analytics/climate-risk-forecast', {
      params: { lat, lng, days_ahead }
    });
    return response.data;
  },

  getFoodShortageRisk: async (location?: string, radius_km: number = 50) => {
    const response = await api.get('/analytics/food-shortage-risk', {
      params: { location, radius_km }
    });
    return response.data;
  },

  getResourceAllocation: async (disaster_alert_id?: number, lat?: number, lng?: number, radius_km: number = 25) => {
    const response = await api.get('/analytics/resource-allocation', {
      params: { disaster_alert_id, lat, lng, radius_km }
    });
    return response.data;
  },

  getClimateImpactTrends: async (months_back: number = 12) => {
    const response = await api.get('/analytics/trends/climate-impact', {
      params: { months_back }
    });
    return response.data;
  },
};

// Coordination API
export const coordinationAPI = {
  getEmergencyResponses: async (params?: {
    skip?: number;
    limit?: number;
    status_filter?: string;
    response_type?: string;
    priority?: string;
    active_only?: boolean;
  }) => {
    const response = await api.get('/coordination/emergency-responses', { params });
    return response.data;
  },

  createEmergencyResponse: async (responseData: any) => {
    const response = await api.post('/coordination/emergency-responses', responseData);
    return response.data;
  },

  updateEmergencyResponse: async (responseId: number, updates: any) => {
    const response = await api.put(`/coordination/emergency-responses/${responseId}`, updates);
    return response.data;
  },

  getOrganizations: async (response_type?: string) => {
    const response = await api.get('/coordination/organizations', {
      params: { response_type }
    });
    return response.data;
  },

  getCoordinationMatrix: async (disaster_alert_id?: number, lat?: number, lng?: number, radius_km: number = 50) => {
    const response = await api.get('/coordination/coordination-matrix', {
      params: { disaster_alert_id, lat, lng, radius_km }
    });
    return response.data;
  },

  coordinateResponse: async (coordinationRequest: any) => {
    const response = await api.post('/coordination/coordinate-response', coordinationRequest);
    return response.data;
  },

  getCommunicationTree: async (emergency_response_id?: number, disaster_alert_id?: number) => {
    const response = await api.get('/coordination/communication-tree', {
      params: { emergency_response_id, disaster_alert_id }
    });
    return response.data;
  },
};