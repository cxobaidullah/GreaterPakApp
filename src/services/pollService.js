import apiClient from './api';

// Votes & Surveys.
export const fetchPolls = async () => {
  const response = await apiClient.get('/polls');
  return response.data.data.items || [];
};

export const fetchPoll = async (id) => {
  const response = await apiClient.get(`/polls/${id}`);
  return response.data.data; // { poll, myVote }
};

export const votePoll = async (id, optionId) => {
  const response = await apiClient.post(`/polls/${id}/vote`, { optionId });
  return response.data.data; // { poll }
};
