import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sams_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Unauthorized / Token Expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and broadcast logout if unauthorized
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('sams_token');
        localStorage.removeItem('sams_user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// SAMS Modular Services (Structured for future offline sync)
// -------------------------------------------------------------

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me/');
    return response.data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats/');
    return response.data;
  },
  getCharts: async () => {
    const response = await api.get('/dashboard/charts/');
    return response.data;
  },
  getAlerts: async () => {
    const response = await api.get('/alerts/');
    return response.data;
  },
};

export const childService = {
  list: async (params = {}) => {
    const response = await api.get('/children/', { params });
    return response.data.results || response.data;
  },
  get: async (id) => {
    const response = await api.get(`/children/${id}/`);
    return response.data;
  },
  getFullProfile: async (id) => {
    const response = await api.get(`/children/${id}/full_profile/`);
    return response.data;
  },
  getGrowthHistory: async (id) => {
    const response = await api.get(`/children/${id}/growth_history/`);
    return response.data;
  },
  create: async (childData) => {
    const response = await api.post('/children/', childData);
    return response.data;
  },
  update: async (id, childData) => {
    const response = await api.patch(`/children/${id}/`, childData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/children/${id}/`);
    return response.data;
  },
};

export const attendanceService = {
  list: async (params = {}) => {
    const response = await api.get('/attendance/', { params });
    return response.data.results || response.data;
  },
  bulkRecord: async (date, records) => {
    const response = await api.post('/attendance/bulk_record/', { date, records });
    return response.data;
  },
  recordSingle: async (data) => {
    const response = await api.post('/attendance/', data);
    return response.data;
  },
};

export const growthService = {
  list: async (params = {}) => {
    const response = await api.get('/growth/', { params });
    return response.data.results || response.data;
  },
  create: async (data) => {
    const response = await api.post('/growth/', data);
    return response.data;
  },
};

export const immunizationService = {
  list: async (params = {}) => {
    const response = await api.get('/immunizations/', { params });
    return response.data.results || response.data;
  },
  create: async (data) => {
    const response = await api.post('/immunizations/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`/immunizations/${id}/`, data);
    return response.data;
  },
};

export const healthService = {
  list: async (params = {}) => {
    const response = await api.get('/health-records/', { params });
    return response.data.results || response.data;
  },
  create: async (data) => {
    const response = await api.post('/health-records/', data);
    return response.data;
  },
};

export const pregnantService = {
  list: async (params = {}) => {
    const response = await api.get('/pregnant-women/', { params });
    return response.data.results || response.data;
  },
  getFullDetails: async (id) => {
    const response = await api.get(`/pregnant-women/${id}/full_details/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/pregnant-women/', data);
    return response.data;
  },
  addCheckup: async (data) => {
    const response = await api.post('/pregnancy-health/', data);
    return response.data;
  },
  addVaccination: async (data) => {
    const response = await api.post('/maternal-vaccinations/', data);
    return response.data;
  },
};

export const foodService = {
  getMenu: async (params = {}) => {
    const response = await api.get('/food-menu/', { params });
    return response.data.results || response.data;
  },
  createMenu: async (data) => {
    const response = await api.post('/food-menu/', data);
    return response.data;
  },
  getStock: async (params = {}) => {
    const response = await api.get('/food-stock/', { params });
    return response.data.results || response.data;
  },
  updateStock: async (id, data) => {
    const response = await api.patch(`/food-stock/${id}/`, data);
    return response.data;
  },
  createStockItem: async (data) => {
    const response = await api.post('/food-stock/', data);
    return response.data;
  },
};

export const activityService = {
  listActivities: async (params = {}) => {
    const response = await api.get('/learning-activities/', { params });
    return response.data.results || response.data;
  },
  createActivity: async (data) => {
    const response = await api.post('/learning-activities/', data);
    return response.data;
  },
  listParticipations: async (params = {}) => {
    const response = await api.get('/child-activities/', { params });
    return response.data.results || response.data;
  },
  recordParticipation: async (data) => {
    const response = await api.post('/child-activities/', data);
    return response.data;
  },
};

export const centerService = {
  list: async () => {
    const response = await api.get('/anganwadi-centers/');
    return response.data.results || response.data;
  },
  create: async (data) => {
    const response = await api.post('/anganwadi-centers/', data);
    return response.data;
  },
};

export const userService = {
  list: async (params = {}) => {
    const response = await api.get('/users/', { params });
    return response.data.results || response.data;
  },
  create: async (data) => {
    const response = await api.post('/users/', data);
    return response.data;
  },
};

export const notificationService = {
  list: async () => {
    const response = await api.get('/notifications/');
    return response.data.results || response.data;
  },
  markRead: async (id) => {
    const response = await api.post(`/notifications/${id}/mark_read/`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await api.post('/notifications/mark_all_read/');
    return response.data;
  },
};

export const reportService = {
  getExportUrl: (type = 'children') => {
    return `${API_BASE_URL}/reports/export-csv/?type=${type}`;
  },
};

export default api;
