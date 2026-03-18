import api from './api';

export const traineeService = {
  async listTrainees() {
    const response = await api.get('/api/coaches/trainees');
    return response.data.trainees;
  },

  async addTrainee(email, domain) {
    const response = await api.post('/api/coaches/trainees', { email, domain });
    return response.data;
  },

  async getMyCoach() {
    const response = await api.get('/api/trainees/coach');
    return response.data.coach;
  },

  async getMyCoaches() {
    const response = await api.get('/api/trainees/coaches');
    return response.data.coaches;
  },

  async getTraineeOverview(traineeId) {
    const response = await api.get(`/api/coaches/trainees/${traineeId}`);
    return response.data;
  },

  async getTraineeTasks(traineeId, params = {}) {
    const response = await api.get(`/api/coaches/trainees/${traineeId}/tasks`, {
      params,
    });
    return response.data;
  },
};
