import axios from 'axios';

const API_BASE_URL = 'http://localhost:4004/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const registerUser = (user) => api.post('/auth/register', user);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const logoutUser = () => {
  localStorage.removeItem('token');
  return api.post('/auth/logout');
};

export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUser = (id, user) => api.put(`/users/${id}`, user);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export const addEquipment = (equipment) => api.post('/api/equipments/add', equipment);
export const getAllEquipment = () => api.get('/api/equipments');
export const getEquipmentById = (id) => api.get(`/api/equipments/${id}`);
export const updateEquipment = (id, equipment) => api.put(`/api/equipments/${id}`, equipment);
export const deleteEquipment = (id) => api.delete(`/api/equipments/${id}`);
export const searchEquipment = (type, location, availability) =>
  api.get('/api/equipments/search', { params: { type, location, availability } });

export const createBooking = (booking) => api.post('/api/bookings', booking);
// export const getAllBookings = () => api.get('/bookings');
export const getBookingById = (id) => api.get(`/api/bookings/${id}`);
export const updateBooking = (id, booking) => api.put(`/api/bookings/${id}`, booking);
export const deleteBooking = (id) => api.delete(`/api/bookings/${id}`);
export const confirmBooking = (id) => api.post(`/api/bookings/${id}/confirm`);
// export const completeBooking = (id) => api.post(`/bookings/${id}/complete`);

// Payment related constants
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
};

export const PAYMENT_ENDPOINTS = {
  VERIFY: '/api/payments/verify-payment',
  STATUS: '/api/payments',
  WEBHOOK: '/api/payments/webhook'
};

// Payment related API calls
export const verifyPayment = (paymentData) => api.post(PAYMENT_ENDPOINTS.VERIFY, paymentData);

export const getPaymentStatus = (orderId) => api.get(`${PAYMENT_ENDPOINTS.STATUS}/${orderId}`);

export const getPaymentByOrderId = (orderId) => api.get(`${PAYMENT_ENDPOINTS.STATUS}/${orderId}`);

export default api;
