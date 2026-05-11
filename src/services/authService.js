import apiClient from './api';
import {
  saveAuthToken,
  saveAuthMode,
  saveUser,
  getAuthToken,
  getAuthMode,
  getUser,
  removeAuthToken,
  removeAuthMode,
  removeUser,
} from './storage';

export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  const { token, user } = response.data.data;
  await saveAuthToken(token);
  await saveAuthMode('authenticated');
  await saveUser(user);
  return { token, user };
};

export const register = async (payload) => {
  const response = await apiClient.post('/auth/register', payload);
  const { token, user } = response.data.data;
  await saveAuthToken(token);
  await saveAuthMode('authenticated');
  await saveUser(user);
  return { token, user };
};

export const logout = async () => {
  await removeAuthToken();
  await removeUser();
  await saveAuthMode('signedOut');
};

export const continueAsGuest = async () => {
  await removeAuthToken();
  await removeUser();
  await saveAuthMode('guest');
  return { mode: 'guest' };
};

export const restoreSession = async () => {
  const token = await getAuthToken();
  const mode = await getAuthMode();
  const user = await getUser();
  return { token, mode, user };
};

export const fetchProfile = async () => {
  const response = await apiClient.get('/auth/profile');
  const user = response.data.data.user;
  await saveUser(user);
  return user;
};

export const updateProfile = async (updates) => {
  const response = await apiClient.patch('/auth/profile', updates);
  const user = response.data.data.user;
  await saveUser(user);
  return user;
};

export const applyForMembership = async (payload) => {
  const response = await apiClient.post('/auth/apply-member', payload);
  const { user, application } = response.data.data;
  await saveUser(user);
  return { user, application };
};
