import api from './client';

const envelope = (promise) => promise.then((response) => response.data);

export const authApi = {
  login: (payload) => envelope(api.post('/auth/login', payload)),
  register: (payload) => envelope(api.post('/auth/register', payload)),
  me: () => envelope(api.get('/auth/me')),
  updateProfile: (payload) => envelope(api.patch('/auth/me', payload)),
  changePassword: (payload) => envelope(api.patch('/auth/password', payload)),
  logout: () => envelope(api.post('/auth/logout')),
};

export const villageApi = {
  list: (params) => envelope(api.get('/villages', { params })),
  get: (id) => envelope(api.get(`/villages/${id}`)),
  update: (id, payload) => envelope(api.patch(`/villages/${id}`, payload)),
};

export const statisticsApi = {
  dashboard: (villageId) => envelope(api.get(`/statistics/dashboard/${villageId}`)),
  reports: (villageId) => envelope(api.get(`/statistics/reports/${villageId}`)),
  get: (villageId) => envelope(api.get(`/statistics/${villageId}`)),
  update: (villageId, payload) => envelope(api.put(`/statistics/${villageId}`, payload)),
};

export const projectApi = {
  list: (params) => envelope(api.get('/projects', { params })),
  get: (id) => envelope(api.get(`/projects/${id}`)),
  create: (payload) => envelope(api.post('/projects', payload)),
  update: (id, payload) => envelope(api.patch(`/projects/${id}`, payload)),
  remove: (id) => envelope(api.delete(`/projects/${id}`)),
};

export const complaintApi = {
  list: (params) => envelope(api.get('/complaints', { params })),
  create: (payload) => envelope(api.post('/complaints', payload)),
  get: (id) => envelope(api.get(`/complaints/${id}`)),
  updateStatus: (id, payload) => envelope(api.patch(`/complaints/${id}`, payload)),
  track: (ticketCode) => envelope(api.get(`/complaints/track/${encodeURIComponent(ticketCode)}`)),
};

export const importApi = {
  upload: (formData, onUploadProgress) =>
    envelope(
      api.post('/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
        timeout: 60000,
      })
    ),
  logs: (params) => envelope(api.get('/import/logs', { params })),
  templateUrl: (type) => `/api/import/template?type=${type}`,
};

export const userApi = {
  list: (params) => envelope(api.get('/users', { params })),
};
