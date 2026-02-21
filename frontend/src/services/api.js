// services/api.js
// Centralized Axios instance for calling the backend API.
// Automatically attaches backend JWT from localStorage.

import axios from 'axios';
import { getToken } from '../utils/auth.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginWithFirebaseIdToken(idToken) {
  const { data } = await api.post('/api/login', { idToken });
  return data;
}

export async function createProfile(payload) {
  const { data } = await api.post('/api/users', payload);
  return data;
}

export async function listProfiles(params = {}) {
  const { data } = await api.get('/api/users', { params });
  return data.profiles || [];
}

export async function getMatches(elderId, orphanIds) {
  const { data } = await api.post('/api/matches', {
    elder_id: elderId,
    orphan_ids: orphanIds,
  });
  return data.matches || [];
}

export async function scheduleSession(payload) {
  const { data } = await api.post('/api/sessions', payload);
  return data;
}

export async function listSessions(params = {}) {
  const { data } = await api.get('/api/sessions', { params });
  return data.sessions || [];
}

export async function submitFeedback(payload) {
  const { data } = await api.post('/api/feedback', payload);
  return data;
}

export default api;

