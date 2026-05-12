import apiClient from './api';

export const fetchContentPage = async (slug) => {
  const response = await apiClient.get(`/content/${slug}`);
  return response.data.data.page;
};
