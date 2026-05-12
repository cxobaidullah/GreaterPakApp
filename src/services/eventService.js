import apiClient from './api';

export const fetchEventsList = async ({ page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get('/events', { params: { page, limit } });
  return response.data.data;
};

export const fetchEventItem = async (id) => {
  const response = await apiClient.get(`/events/${id}`);
  return response.data.data.event;
};

export const reserveEvent = async (id) => {
  const response = await apiClient.post(`/events/${id}/rsvp`);
  return response.data.data;
};

export const toggleEventLike = async (id) => {
  const response = await apiClient.post(`/events/${id}/like`);
  return response.data.data;
};

export const fetchEventComments = async (id) => {
  const response = await apiClient.get(`/events/${id}/comments`);
  return response.data.data.comments || [];
};

export const addEventComment = async (id, text) => {
  const response = await apiClient.post(`/events/${id}/comments`, { text });
  return response.data.data;
};

export const recordEventShare = async (id) => {
  const response = await apiClient.post(`/events/${id}/share`);
  return response.data.data;
};
