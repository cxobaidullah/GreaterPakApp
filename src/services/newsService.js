import apiClient from './api';

export const fetchNewsList = async ({ page = 1, limit = 20 } = {}) => {
  const response = await apiClient.get('/news', { params: { page, limit } });
  return response.data.data;
};

export const fetchNewsItem = async (id) => {
  const response = await apiClient.get(`/news/${id}`);
  return response.data.data.news;
};
