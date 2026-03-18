import api from './api';

export const authService = {
  async login(email, password, inviteToken) {
    const response = await api.post('/auth/login', { email, password, inviteToken });
    return response.data;
  },

  async register(email, password, name, role, inviteToken) {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
      role,
      inviteToken,
    });
    return response.data;
  },

  async googleLogin(idToken, role, inviteToken) {
    const response = await api.post('/auth/google', { idToken, role, inviteToken });
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
