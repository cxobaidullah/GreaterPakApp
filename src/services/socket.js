import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/apiConfig';
import { getAuthToken } from './storage';

const SOCKET_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

let socket = null;

export const connectSocket = async () => {
  if (socket && socket.connected) return socket;
  const token = await getAuthToken();
  if (!token) return null;

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    path: '/socket.io',
    transports: ['websocket'],
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
