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

  // Trainee endpoints
  async listTasksForTrainee() {
    const response = await api.get('/api/trainees/tasks');
    return response.data.tasks || [];
  },

  async getTaskDetailsForTrainee(taskId) {
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
};
