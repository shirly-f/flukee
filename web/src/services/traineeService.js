import api from './api';

export const traineeService = {
  async listTrainees() {
    const response = await api.get('/api/coaches/trainees');
    return response.data.trainees;
  },

  async getMyCoach() {
    const response = await api.get('/api/trainees/coach');
    return response.data.coach;
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
