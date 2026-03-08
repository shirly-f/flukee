import api from './api';

export const taskService = {
  async listTasks(params = {}) {
    const response = await api.get('/api/trainees/tasks', { params });
    return response.data.tasks;
  },

  async getTaskDetails(taskId) {
    const response = await api.get(`/api/trainees/tasks/${taskId}`);
    return response.data;
  },

  async submitTaskResponse(taskId, responseData, status = 'submitted') {
    const response = await api.post(`/api/trainees/tasks/${taskId}/response`, {
      responseData,
      status,
    });
    return response.data;
  },

  async updateTaskStatus(taskId, status) {
    const response = await api.put(`/api/trainees/tasks/${taskId}/status`, {
      status,
    });
    return response.data;
  },
};
