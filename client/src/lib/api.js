import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  try {
    // Get session with error handling
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.warn('Session error:', sessionError.message);
      // Clear invalid session and redirect to login
      await supabase.auth.signOut();
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const isFormData = options.body instanceof FormData;
    if (isFormData) {
      delete headers['Content-Type'];
    }

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

    if (res.status === 401 || res.status === 403) {
      // Auth failed - clear session and redirect
      console.warn('Authentication failed, redirecting to login...');
      await supabase.auth.signOut();
      window.location.href = '/login';
      throw new Error('Authentication failed');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    return res.json();
  } catch (error) {
    // Don't redirect if it's a network error or the error happened during fetch
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw error;
    }
    throw error;
  }
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

  admin: {
    getUsers: () => request('/admin/users'),
    getRoles: () => request('/admin/roles'),
    getRole: (email) => request(`/admin/roles/${encodeURIComponent(email)}`),
    assignRole: (data) => request('/admin/roles', { method: 'POST', body: JSON.stringify(data) }),
    removeRole: (email) => request(`/admin/roles/${encodeURIComponent(email)}`, { method: 'DELETE' }),
  },

  upload: {
    file: (file, bucket = 'products', folder = '') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      formData.append('folder', folder);
      return request('/upload', { method: 'POST', body: formData });
    },
  },
};

export default api;
