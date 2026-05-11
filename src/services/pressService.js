import apiClient from './api';

export const fetchPressList = async ({ page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get('/press', { params: { page, limit } });
  return response.data.data;
};

export const fetchPressItem = async (id) => {
  const response = await apiClient.get(`/press/${id}`);
  return response.data.data.press;
};
