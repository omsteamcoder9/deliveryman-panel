// deliveryBoy.js - CORRECTED (no /api prefix since baseURL already has it)
import api from './axiosConfig';

export const deliveryBoyAPI = {
  // Delivery boy login
  login: (credentials) => api.post('/delivery/login', credentials),  // ✅ Changed from /api/delivery/login
  
  getProfile: () => api.get('/delivery/profile'),  // ✅ Changed
  
  updateProfile: (profileData) => api.put('/delivery/profile', profileData),  // ✅ Changed
  
  getStats: () => api.get('/delivery/stats'),  // ✅ Changed
  
  getMyOrders: () => api.get('/delivery/orders'),  // ✅ Changed
  
  getOrderHistory: () => api.get('/delivery/orders/history'),  // ✅ Changed
  
  getOrderDetails: (orderId) => api.get(`/delivery/orders/${orderId}`),  // ✅ Changed
  
  markPickedUp: (orderId) => api.put(`/delivery/orders/${orderId}/pickup`),  // ✅ Changed
  
  markDelivered: (orderId) => api.put(`/delivery/orders/${orderId}/deliver`),  // ✅ Changed,
    markCodPaid: (orderId) => api.put(`/delivery/orders/${orderId}/mark-paid`),

  
  // Admin endpoints
  getAllDeliveryBoys: (params = {}) => {
    const { search, status, page = 1, limit = 20 } = params;
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (status && status !== 'all') queryParams.append('status', status);
    
    return api.get(`/admin/delivery-boys?${queryParams.toString()}`);  // ✅ Changed (removed /api)
  },
  
  getDeliveryBoyById: (id) => api.get(`/admin/delivery-boys/${id}`),  // ✅ Changed
  
  addDeliveryBoy: (data) => api.post('/admin/delivery-boys', data),  // ✅ Changed
  
  updateDeliveryBoy: (id, data) => api.put(`/admin/delivery-boys/${id}`, data),  // ✅ Changed
  
  deleteDeliveryBoy: (id) => api.delete(`/admin/delivery-boys/${id}`),  // ✅ Changed
  
  getWardsList: () => api.get('/admin/wards'),  // ✅ Changed
  
  getUnassignedOrders: () => api.get('/admin/orders/unassigned'),  // ✅ Changed
  
  assignOrderToDeliveryBoy: (orderId, deliveryBoyId) => 
    api.post('/admin/orders/assign', { orderId, deliveryBoyId }),  // ✅ Changed
  
  getDeliveryBoyStats: () => api.get('/admin/delivery/stats'),  // ✅ Changed
};