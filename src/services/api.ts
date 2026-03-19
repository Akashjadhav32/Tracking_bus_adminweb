import axios from 'axios';

const API_BASE_URL = 'https://akash123-071-tracking-backend.hf.space/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  },
};

// Routes API
export const routesAPI = {
  createRoute: async (routeData: {
    routeName: string;
    stops: Array<{
      stopId: string;
      name: string;
      latitude: number;
      longitude: number;
    }>;
  }) => {
    const response = await api.post('/admin/routes', routeData);
    return response.data;
  },

  getAllRoutes: async () => {
    const response = await api.get('/admin/routes');
    return response.data;
  },

  getRouteWithPolyline: async (routeName: string) => {
    const response = await api.get(`/admin/routes-with-polyline?routeName=${routeName}`);
    return response.data;
  },
};

// Buses API
export const busesAPI = {
  createBus: async (busData: {
    busNumber: string;
    driverUsername: string;
    routeName: string;
    status: string;
  }) => {
    const response = await api.post('/admin/buses', busData);
    return response.data;
  },

  getAllBuses: async () => {
    const response = await api.get('/buses');
    return response.data;
  },

  updateBusStatus: async (busId: string, status: string) => {
    const response = await api.put(`/admin/buses/${busId}`, { status });
    return response.data;
  },

  deleteBus: async (busId: string) => {
    const response = await api.delete(`/admin/buses/${busId}`);
    return response.data;
  },
};

// Drivers API
export const driversAPI = {
  // Accept FormData so the admin can include an optional face photo
  createDriver: async (formData: FormData) => {
    const response = await api.post('/admin/drivers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAllDrivers: async () => {
    const response = await api.get('/admin/drivers');
    return response.data;
  },

  deleteDriver: async (driverId: string) => {
    const response = await api.delete(`/admin/drivers/${driverId}`);
    return response.data;
  },
};

export default api;