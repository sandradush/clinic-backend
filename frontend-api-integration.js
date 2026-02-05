// Frontend API Service - api.js
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(),
    ...options
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API call failed');
  }
  
  return response.json();
};

// Authentication APIs
export const authAPI = {
  // Patient self-registration
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  // Login (Patient/Doctor/Admin)
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  // Refresh token
  refreshToken: (refreshToken) => apiCall('/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  }),

  // Logout
  logout: () => apiCall('/auth/logout', { method: 'POST' }),

  // Forgot password
  forgotPassword: (email) => apiCall('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),

  // Reset password
  resetPassword: (token, password) => apiCall('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password })
  }),

  // Get all users (Admin only)
  getAllUsers: () => apiCall('/auth/users'),

  // Get users by role (Admin only)
  getUsersByRole: (role) => apiCall(`/auth/users/role/${role}`),

  // Delete user (Admin only)
  deleteUser: (id) => apiCall(`/auth/users/${id}`, { method: 'DELETE' })
};

// User Management APIs (Admin only)
export const userAPI = {
  // Get all users
  getAll: () => apiCall('/users'),

  // Get user by ID
  getById: (id) => apiCall(`/users/${id}`),

  // Create user
  create: (userData) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),

  // Update user
  update: (id, userData) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),

  // Delete user
  delete: (id) => apiCall(`/users/${id}`, { method: 'DELETE' })
};

// Patient Management APIs
export const patientAPI = {
  // Patient: Get own profile
  getMyProfile: () => apiCall('/patients/me'),

  // Patient: Update own profile
  updateMyProfile: (profileData) => apiCall('/patients/me', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),

  // Admin/Doctor: Get all patients
  getAll: () => apiCall('/patients'),

  // Admin: Create patient manually
  create: (patientData) => apiCall('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData)
  }),

  // Admin/Doctor: Get specific patient
  getById: (id) => apiCall(`/patients/${id}`),

  // Admin: Update patient
  update: (id, patientData) => apiCall(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patientData)
  }),

  // Admin: Archive patient
  delete: (id) => apiCall(`/patients/${id}`, { method: 'DELETE' }),

  // Get patient's prescriptions
  getPrescriptions: (id) => apiCall(`/patients/${id}/prescriptions`)
};

// Doctor Management APIs (Admin only)
export const doctorAPI = {
  // Get all doctors
  getAll: () => apiCall('/doctors'),

  // Create doctor
  create: (doctorData) => apiCall('/doctors', {
    method: 'POST',
    body: JSON.stringify(doctorData)
  }),

  // Get doctor by ID
  getById: (id) => apiCall(`/doctors/${id}`),

  // Update doctor
  update: (id, doctorData) => apiCall(`/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(doctorData)
  }),

  // Archive doctor
  delete: (id) => apiCall(`/doctors/${id}`, { method: 'DELETE' }),

  // Get doctor's patients
  getPatients: (id) => apiCall(`/doctors/${id}/patients`)
};

// Doctor Request APIs
export const doctorRequestAPI = {
  // Create doctor request (Public)
  create: (requestData) => apiCall('/doctor-requests', {
    method: 'POST',
    body: JSON.stringify(requestData),
    headers: { 'Content-Type': 'application/json' } // No auth needed
  }),

  // Get all requests (Admin only)
  getAll: () => apiCall('/doctor-requests'),

  // Approve request (Admin only)
  approve: (id) => apiCall(`/doctor-requests/${id}/approve`, {
    method: 'PUT'
  }),

  // Reject request (Admin only)
  reject: (id, reason) => apiCall(`/doctor-requests/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason })
  })
};

// Prescription Management APIs
export const prescriptionAPI = {
  // Doctor: Create prescription
  create: (prescriptionData) => apiCall('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(prescriptionData)
  }),

  // Doctor: Get own prescriptions
  getAll: () => apiCall('/prescriptions'),

  // Patient: Get own prescriptions
  getMy: () => apiCall('/prescriptions/me'),

  // Admin: Get all prescriptions
  getAllAdmin: () => apiCall('/prescriptions/all'),

  // Get specific prescription
  getById: (id) => apiCall(`/prescriptions/${id}`),

  // Doctor: Update prescription
  update: (id, prescriptionData) => apiCall(`/prescriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(prescriptionData)
  }),

  // Doctor: Delete prescription
  delete: (id) => apiCall(`/prescriptions/${id}`, { method: 'DELETE' }),

  // Update prescription status
  updateStatus: (id, status) => apiCall(`/prescriptions/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),

  // Get prescriptions by patient
  getByPatient: (patientId) => apiCall(`/prescriptions/patient/${patientId}`),

  // Get prescriptions by doctor
  getByDoctor: (doctorId) => apiCall(`/prescriptions/doctor/${doctorId}`)
};

// Appointment Management APIs
export const appointmentAPI = {
  // Patient: Book appointment
  create: (appointmentData) => apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify(appointmentData)
  }),

  // Patient: Get own appointments
  getMy: () => apiCall('/appointments/me'),

  // Doctor: Get doctor's appointments
  getAll: () => apiCall('/appointments'),

  // Get specific appointment
  getById: (id) => apiCall(`/appointments/${id}`),

  // Update appointment
  update: (id, appointmentData) => apiCall(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(appointmentData)
  }),

  // Cancel appointment
  delete: (id) => apiCall(`/appointments/${id}`, { method: 'DELETE' })
};

// Health Check API
export const healthAPI = {
  check: () => apiCall('/health')
};

// Token management utilities
export const tokenUtils = {
  setToken: (token) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),
  setRefreshToken: (token) => localStorage.setItem('refreshToken', token),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  removeRefreshToken: () => localStorage.removeItem('refreshToken')
};

// Usage Examples:
/*
// Login
const loginUser = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    tokenUtils.setToken(response.accessToken);
    tokenUtils.setRefreshToken(response.refreshToken);
    return response.user;
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};

// Register patient
const registerPatient = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    return response;
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};

// Create doctor request
const submitDoctorRequest = async (requestData) => {
  try {
    const response = await doctorRequestAPI.create(requestData);
    return response;
  } catch (error) {
    console.error('Doctor request failed:', error.message);
  }
};

// Get patient profile
const getMyProfile = async () => {
  try {
    const profile = await patientAPI.getMyProfile();
    return profile;
  } catch (error) {
    console.error('Failed to get profile:', error.message);
  }
};
*/