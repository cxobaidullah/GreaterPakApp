import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@greaterpak_token';
const MODE_KEY = '@greaterpak_mode';
const USER_KEY = '@greaterpak_user';

export const saveAuthToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = async () => AsyncStorage.getItem(TOKEN_KEY);

export const removeAuthToken = async () => AsyncStorage.removeItem(TOKEN_KEY);

export const saveAuthMode = async (mode) => {
  await AsyncStorage.setItem(MODE_KEY, mode);
};

export const getAuthMode = async () => AsyncStorage.getItem(MODE_KEY);

export const removeAuthMode = async () => AsyncStorage.removeItem(MODE_KEY);

export const saveUser = async (user) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const removeUser = async () => AsyncStorage.removeItem(USER_KEY);
