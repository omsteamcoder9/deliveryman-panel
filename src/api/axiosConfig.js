import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log(API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // ✅ FIXED: Use 'deliveryToken' instead of 'token'
    const token = localStorage.getItem('deliveryToken');
    console.log('Token found:', token ? 'Yes' : 'No');  // Optional: for debugging
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: clear token and redirect on 401
      localStorage.removeItem('deliveryToken');
      localStorage.removeItem('deliveryBoy');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;