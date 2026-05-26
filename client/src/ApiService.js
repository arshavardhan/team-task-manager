import axios from 'axios';

// Automatically shifts backend targets depending on your running environment
const API_URL = import.meta.env.DEV 
  ? 'http://127.0.0.1:8000/api' 
  : 'https://YOUR-BACKEND-RAILWAY-URL.up.railway.app/api'; 

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Explicitly export ApiService as a named export
export const ApiService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { name: "", email, password, role: "" });
    return response.data;
  },
  signup: async (name, email, password, role) => {
    const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password, role });
    return response.data;
  },
  getMetrics: async () => {
    const response = await axios.get(`${API_URL}/dashboard/metrics`, { headers: getAuthHeaders() });
    return response.data;
  },
  getProjects: async () => {
    const response = await axios.get(`${API_URL}/projects`, { headers: getAuthHeaders() });
    return response.data;
  },
  createProject: async (name, description, memberIds) => {
    const response = await axios.post(`${API_URL}/projects`, { name, description, member_ids: memberIds }, { headers: getAuthHeaders() });
    return response.data;
  },
  getTasks: async () => {
    const response = await axios.get(`${API_URL}/tasks`, { headers: getAuthHeaders() });
    return response.data;
  },
  createTask: async (taskData) => {
    const response = await axios.post(`${API_URL}/tasks`, taskData, { headers: getAuthHeaders() });
    return response.data;
  },
  updateTaskStatus: async (taskId, status) => {
    const response = await axios.patch(`${API_URL}/tasks/${taskId}/status`, { status }, { headers: getAuthHeaders() });
    return response.data;
  },
  getUsers: async () => {
    const response = await axios.get(`${API_URL}/users`, { headers: getAuthHeaders() });
    return response.data;
  }
};