import api from './api';

export const uploadService = {
  async uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/upload', formData);
    return response.data;
  },
};
