import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(email, password, name, role) {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
      role: 'trainee', // Mobile app is for trainees only
    });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
