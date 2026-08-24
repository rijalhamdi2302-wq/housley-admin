/**
 * Housley Admin HQ — API client
 */
const BASE = import.meta.env.VITE_API_URL || '';

function getHeaders() {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, opts = {}) {
  const resp = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { ...getHeaders(), ...opts.headers },
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request('/api/admin/me'),

  // Dashboard
  dashboard: () => request('/api/admin/dashboard'),

  // Users
  users: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/admin/users?${q}`);
  },
  user: (id) => request(`/api/admin/users/${id}`),
  updateUser: (id, data) => request(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/api/admin/users/${id}`, { method: 'DELETE' }),

  // Families
  families: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/admin/families?${q}`);
  },
  family: (id) => request(`/api/admin/families/${id}`),
  updateFamily: (id, data) => request(`/api/admin/families/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFamily: (id) => request(`/api/admin/families/${id}`, { method: 'DELETE' }),
  factoryReset: (id) => request(`/api/admin/factory-reset/${id}`, { method: 'POST' }),

  // Orders
  orders: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/admin/orders?${q}`);
  },
  order: (id) => request(`/api/admin/orders/${id}`),

  // Activity
  activity: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/admin/activity?${q}`);
  },

  // Promos (dynamic promo code management)
  promos: () => request('/api/admin/promos'),
  promoUsage: () => request('/api/admin/promos/usage'),
  createPromo: (data) => request('/api/admin/promos', { method: 'POST', body: JSON.stringify(data) }),
  updatePromo: (id, data) => request(`/api/admin/promos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePromo: (id) => request(`/api/admin/promos/${id}`, { method: 'DELETE' }),

  // User password reset (admin)
  resetUserPassword: (userId, password) => request(`/api/admin/users/${userId}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }),

  // Announcements
  announcements: () => request('/api/admin/announcements'),
  createAnnouncement: (data) => request('/api/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
  deleteAnnouncement: (id) => request(`/api/admin/announcements/${id}`, { method: 'DELETE' }),

  // App Releases
  releases: () => request('/api/admin/releases'),
  publishRelease: async (formData) => {
    const token = localStorage.getItem('admin_token');
    const resp = await fetch(`${BASE}/api/admin/releases`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData, // multipart form data with APK file
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
    return data;
  },
  deleteRelease: (id) => request(`/api/admin/releases/${id}`, { method: 'DELETE' }),

  // System
  system: () => request('/api/admin/system'),
  createAdmin: (data) => request('/api/admin/create-admin', { method: 'POST', body: JSON.stringify(data) }),
};
