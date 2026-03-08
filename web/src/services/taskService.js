import api from './api';

export const taskService = {
  async createTask(taskData) {
    const response = await api.post('/api/coaches/tasks', taskData);
    return response.data;
  },

  async getTaskDetails(taskId) {
    const response = await api.get(`/api/coaches/tasks/${taskId}`);
    return response.data;
  },
};
