import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${API_BASE}/api` });

// Attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fort_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fort_admin_token');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// ─── PUBLIC API ───
export const publicAPI = {
  getServices: () => api.get('/public/services'),
  getService: (slug: string) => api.get(`/public/services/${slug}`),
  getProjects: (params?: Record<string, string>) => api.get('/public/projects', { params }),
  getProject: (slug: string) => api.get(`/public/projects/${slug}`),
  getHomeVideo: () => api.get('/public/home-video'),
  getQuickShoots: () => api.get('/public/quick-shoots'),
  getQuickShootVideos: (qsId: string) => api.get(`/public/quick-shoots/${qsId}/videos`),
  getPartners: () => api.get('/public/partners'),
  getClients: () => api.get('/public/clients'),
  getTestimonials: () => api.get('/public/testimonials'),
  getContent: () => api.get('/public/content'),
  getContentSection: (section: string) => api.get(`/public/content/${section}`),
  getBrand: () => api.get('/public/brand'),
  getStats: () => api.get('/public/stats'),
  submitEnquiry: (data: Record<string, string>) => api.post('/public/enquiry', data),
};

// ─── AUTH API ───
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post(`/auth/reset-password/${token}`, { password }),
};

// ─── ADMIN API ───
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),

  // Home Videos
  getHomeVideos: () => api.get('/admin/home-videos'),
  uploadHomeVideo: (data: FormData) => api.post('/admin/home-videos', data),
  updateHomeVideo: (id: string, data: FormData | Record<string, unknown>) => api.put(`/admin/home-videos/${id}`, data),
  deleteHomeVideo: (id: string) => api.delete(`/admin/home-videos/${id}`),

  // Services
  getServices: () => api.get('/admin/services'),
  getService: (id: string) => api.get(`/admin/services/${id}`),
  createService: (data: FormData) => api.post('/admin/services', data),
  updateService: (id: string, data: FormData) => api.put(`/admin/services/${id}`, data),
  deleteService: (id: string) => api.delete(`/admin/services/${id}`),

  // Service Videos
  getServiceVideos: (serviceId: string) => api.get(`/admin/services/${serviceId}/videos`),
  addServiceVideo: (serviceId: string, data: FormData) => api.post(`/admin/services/${serviceId}/videos`, data),
  updateServiceVideo: (videoId: string, data: FormData) => api.put(`/admin/services/videos/${videoId}`, data),
  deleteServiceVideo: (videoId: string) => api.delete(`/admin/services/videos/${videoId}`),

  // Projects
  getProjects: () => api.get('/admin/projects'),
  getProject: (id: string) => api.get(`/admin/projects/${id}`),
  createProject: (data: FormData) => api.post('/admin/projects', data),
  updateProject: (id: string, data: FormData) => api.put(`/admin/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/admin/projects/${id}`),

  // Quick Shoots
  getQuickShoots: () => api.get('/admin/quick-shoots'),
  createQuickShoot: (data: FormData) => api.post('/admin/quick-shoots', data),
  updateQuickShoot: (id: string, data: FormData) => api.put(`/admin/quick-shoots/${id}`, data),
  deleteQuickShoot: (id: string) => api.delete(`/admin/quick-shoots/${id}`),

  // Quick Shoot Videos
  getQuickShootVideos: (qsId: string) => api.get(`/admin/quick-shoots/${qsId}/videos`),
  addQuickShootVideo: (qsId: string, data: FormData) => api.post(`/admin/quick-shoots/${qsId}/videos`, data),
  updateQuickShootVideo: (videoId: string, data: FormData) => api.put(`/admin/quick-shoots/videos/${videoId}`, data),
  deleteQuickShootVideo: (videoId: string) => api.delete(`/admin/quick-shoots/videos/${videoId}`),

  // Partners
  getPartners: () => api.get('/admin/partners'),
  createPartner: (data: FormData) => api.post('/admin/partners', data),
  updatePartner: (id: string, data: FormData) => api.put(`/admin/partners/${id}`, data),
  deletePartner: (id: string) => api.delete(`/admin/partners/${id}`),

  // Enquiries
  getEnquiries: (params?: Record<string, string>) => api.get('/admin/enquiries', { params }),
  getEnquiry: (id: string) => api.get(`/admin/enquiries/${id}`),
  updateEnquiry: (id: string, data: Record<string, unknown>) => api.put(`/admin/enquiries/${id}`, data),
  deleteEnquiry: (id: string) => api.delete(`/admin/enquiries/${id}`),

  // Clients
  getClients: () => api.get('/admin/clients'),
  createClient: (data: FormData) => api.post('/admin/clients', data),
  updateClient: (id: string, data: FormData) => api.put(`/admin/clients/${id}`, data),
  deleteClient: (id: string) => api.delete(`/admin/clients/${id}`),

  // Testimonials
  getTestimonials: () => api.get('/admin/testimonials'),
  createTestimonial: (data: FormData) => api.post('/admin/testimonials', data),
  updateTestimonial: (id: string, data: FormData) => api.put(`/admin/testimonials/${id}`, data),
  deleteTestimonial: (id: string) => api.delete(`/admin/testimonials/${id}`),

  // Content
  getContent: () => api.get('/admin/content'),
  updateContent: (section: string, data: Record<string, unknown>) => api.put(`/admin/content/${section}`, data),

  // Stats
  updateStats: (data: Record<string, unknown>) => api.put('/admin/stats', data),

  // Brand
  getBrand: () => api.get('/admin/brand'),
  updateBrand: (data: FormData) => api.put('/admin/brand', data),

  // Partner Accounts
  getPartnerAccounts: () => api.get('/admin/partner-accounts'),
  createPartnerAccount: (data: Record<string, string>) => api.post('/admin/partner-accounts', data),
  updatePartnerAccount: (id: string, data: Record<string, unknown>) => api.put(`/admin/partner-accounts/${id}`, data),
  deletePartnerAccount: (id: string) => api.delete(`/admin/partner-accounts/${id}`),
};

export default api;
