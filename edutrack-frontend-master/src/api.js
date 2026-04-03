const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// AUTH FUNCTIONS
export const signup = async (name, email, password, role) => {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  return response.json();
};

export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

export const getProfile = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// STUDENT FUNCTIONS
export const getStudentDashboard = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/student/all`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// TEACHER FUNCTIONS
export const getTeacherClasses = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/teacher/classes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// ADMIN FUNCTIONS
export const getAdminUsers = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const getAdminStats = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/admin/stats`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};