import api from './api';

export const messageService = {
  async getMessages(otherUserId) {
    const response = await api.get('/api/messages', {
      params: { with: otherUserId },
    });
    return response.data.messages;
  },

  async sendMessage(receiverId, content) {
    const response = await api.post('/api/messages', {
      receiverId,
      content,
    });
    return response.data;
  },

  async markAsRead(messageId) {
    const response = await api.put(`/api/messages/${messageId}/read`);
    return response.data;
  },
};
