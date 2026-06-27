import apiClient from './api';

// Today's Message / Word of the Day.
export const fetchActiveQuotes = async () => {
  const response = await apiClient.get('/quotes/active');
  return response.data.data; // { active: { today_message, word_of_day }, items }
};
