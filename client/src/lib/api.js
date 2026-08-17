import { getToken, clearSession } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  // Attach auth token if present
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isFormData = options.body instanceof FormData;
  if (isFormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    // Auth failed - clear the session. clearSession() dispatches auth:changed,
    // which makes App reload the session (now null) and the route guards
    // redirect. No hard page reload here.
    console.warn('Authentication failed, signing out...');
    clearSession();
    throw new Error('Authentication failed');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

const api = {
  products: {
    getAll: () => request('/products'),
    getById: (id) => request(`/products/${id}`),
    create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },

  categories: {
    getAll: () => request('/categories'),
    getById: (id) => request(`/categories/${id}`),
    create: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  },

  orders: {
    getAll: () => request('/orders'),
    getById: (id) => request(`/orders/${id}`),
    create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  },

  reviews: {
    getByProduct: (productId) => request(`/reviews/${productId}`),
    submit: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
  },

  banners: {
    getAll: () => request('/banners'),
    create: (data) => request('/banners', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/banners/${id}`, { method: 'DELETE' }),
  },

  analytics: {
    get: () => request('/analytics'),
  },

  upload: {
    file: (file, bucket = 'products', folder = '') => {
      const formData = new FormData();
      formData.append('bucket', bucket);
      formData.append('folder', folder);
      formData.append('file', file);
      return request('/upload', { method: 'POST', body: formData });
    },
    profile: (file) => {
      const formData = new FormData();
      formData.append('file', file);
      return request('/upload/profile', { method: 'POST', body: formData });
    },
  },

  auth: {
    updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },
};

export default api;
