import api from './api';

export const traineeService = {
  async getMyCoach() {
    const response = await api.get('/api/trainees/coach');
    return response.data.coach;
  },
};
