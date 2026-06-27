import apiClient from './api';

// Generic content (Posts engine): news/article/blog/campaign/program/infobase/...

export const fetchPosts = async ({ type, page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  if (type) params.type = type;
  const response = await apiClient.get('/posts', { params });
  return response.data.data;
};

export const fetchPost = async (idOrSlug) => {
  const response = await apiClient.get(`/posts/${idOrSlug}`);
  return response.data.data.post;
};

export const fetchRelatedPosts = async (idOrSlug) => {
  const response = await apiClient.get(`/posts/${idOrSlug}/related`);
  return response.data.data; // { related, byAuthor, mostViewed }
};

export const likePost = async (id) => {
  const response = await apiClient.post(`/posts/${id}/like`);
  return response.data.data;
};

export const sharePost = async (id) => {
  const response = await apiClient.post(`/posts/${id}/share`);
  return response.data.data;
};

export const fetchPostComments = async (postId) => {
  const response = await apiClient.get(`/posts/${postId}/comments`);
  return response.data.data.items || [];
};

export const addPostComment = async (postId, body) => {
  const response = await apiClient.post(`/posts/${postId}/comments`, { body });
  return response.data.data;
};
