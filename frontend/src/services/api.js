import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

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

export const addEquipment = (equipment) => api.post('/equipment', equipment);
export const getAllEquipment = () => api.get('/equipment');
export const getEquipmentById = (id) => api.get(`/equipment/${id}`);
export const updateEquipment = (id, equipment) => api.put(`/equipment/${id}`, equipment);
export const deleteEquipment = (id) => api.delete(`/equipment/${id}`);
export const searchEquipment = (type, location, availability) =>
  api.get('/equipment/search', { params: { type, location, availability } });

export const createBooking = (booking) => api.post('/bookings', booking);
export const getAllBookings = () => api.get('/bookings');
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const updateBooking = (id, booking) => api.put(`/bookings/${id}`, booking);
export const deleteBooking = (id) => api.delete(`/bookings/${id}`);
export const confirmBooking = (id) => api.post(`/bookings/${id}/confirm`);
export const completeBooking = (id) => api.post(`/bookings/${id}/complete`);

export default api;
