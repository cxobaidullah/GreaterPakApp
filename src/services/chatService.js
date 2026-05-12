import apiClient from './api';

export const fetchMyConversation = async () => {
  const response = await apiClient.get('/chat/conversation');
  return response.data.data.conversation;
};

export const fetchMyMessages = async ({ limit = 30, before } = {}) => {
  const params = { limit };
  if (before) params.before = before;
  const response = await apiClient.get('/chat/conversation/messages', { params });
  return response.data.data;
};

export const sendMyMessage = async (text) => {
  const response = await apiClient.post('/chat/conversation/messages', { text });
  return response.data.data;
};

export const markMyConversationRead = async () => {
  const response = await apiClient.post('/chat/conversation/read');
  return response.data.data.conversation;
};

export const fetchAdminConversations = async ({ page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get('/chat/conversations', { params: { page, limit } });
  return response.data.data;
};

export const fetchConversationMessages = async (conversationId, { limit = 30, before } = {}) => {
  const params = { limit };
  if (before) params.before = before;
  const response = await apiClient.get(`/chat/conversations/${conversationId}/messages`, { params });
  return response.data.data;
};

export const sendAdminMessage = async (conversationId, text) => {
  const response = await apiClient.post(`/chat/conversations/${conversationId}/messages`, { text });
  return response.data.data;
};

export const markAdminConversationRead = async (conversationId) => {
  const response = await apiClient.post(`/chat/conversations/${conversationId}/read`);
  return response.data.data.conversation;
};
