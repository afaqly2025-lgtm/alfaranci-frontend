import api from './http.js';

export const dashboardApi = {
  get: async (params) => (await api.get('/dashboard', { params })).data.data
};

export const usersApi = {
  list: async (params) => (await api.get('/users', { params })).data,
  get: async (id) => (await api.get(`/users/${id}`)).data.data,
  create: async (payload) => (await api.post('/users', payload)).data.data,
  update: async (id, payload) => (await api.put(`/users/${id}`, payload)).data.data,
  remove: async (id) => (await api.delete(`/users/${id}`)).data
};

export const storesApi = {
  list: async (params) => (await api.get('/stores', { params })).data,
  get: async (id) => (await api.get(`/stores/${id}`)).data.data,
  profile: async (id) => (await api.get(`/stores/${id}/profile`)).data.data,
  create: async (payload) => (await api.post('/stores', payload)).data.data,
  update: async (id, payload) => (await api.put(`/stores/${id}`, payload)).data.data,
  remove: async (id) => (await api.delete(`/stores/${id}`)).data
};

export const invoicesApi = {
  list: async (params) => (await api.get('/invoices', { params })).data,
  get: async (id) => (await api.get(`/invoices/${id}`)).data.data,
  summary: async (id) => (await api.get(`/invoices/${id}/summary`)).data.data,
  create: async (payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') form.append(key, value);
    });
    return (await api.post('/invoices', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data;
  },
  update: async (id, payload) => {
    const form = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') form.append(key, value);
    });
    return (await api.put(`/invoices/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data;
  },
  remove: async (id) => (await api.delete(`/invoices/${id}`)).data,
  recordCollection: async (payload) => (await api.post('/invoices/collections', payload)).data.data,
  collections: async (params) => (await api.get('/invoices/collections', { params })).data
};

export const settingsApi = {
  get: async () => (await api.get('/settings')).data.data,
  update: async (payload) => (await api.put('/settings', payload)).data.data,
  uploadLogo: async (file) => {
    const form = new FormData();
    form.append('companyLogo', file);
    return (await api.put('/settings/logo', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data.data;
  }
};

export const auditLogsApi = {
  list: async (params) => (await api.get('/audit-logs', { params })).data
};

export const notificationsApi = {
  list: async (params) => (await api.get('/notifications', { params })).data.data,
  markRead: async (id) => (await api.patch(`/notifications/${id}/read`)).data.data,
  markAllRead: async () => (await api.patch('/notifications/read-all')).data
};

export const reportsApi = {
  list: async (params) => (await api.get('/reports', { params })).data.data,
  overdue: async () => (await api.get('/reports/overdue')).data.data,
  salesRepProfilesSummary: async () => (await api.get('/reports/sales-reps/profiles-summary')).data.data,
  salesRepProfile: async (id, params) => (await api.get(`/reports/sales-reps/${id}/profile`, { params })).data.data,
  exportExcel: (params) => api.get('/reports/export/excel', { params, responseType: 'blob' }),
  exportPdf: (params) => api.get('/reports/export/pdf', { params, responseType: 'blob' })
};
