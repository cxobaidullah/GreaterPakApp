// API base URL.
//
// The new content APIs (posts, polls, quotes, comments, categories) currently
// run on your LOCAL backend, which uses port 5001 (macOS AirPlay holds 5000).
//
//   • iOS simulator:      http://localhost:5001/api/v1
//   • Android emulator:   http://10.0.2.2:5001/api/v1
//   • Physical device:    http://<your-computer-LAN-IP>:5001/api/v1
//   • Production (Railway): https://gp-backend-production-2859e512.up.railway.app/api/v1
//
// Switch this when you deploy the new backend to production.
import { Platform } from 'react-native';

// const LOCAL = Platform.OS === 'android' ? 'http://10.0.2.2:5001/api/v1' : 'http://localhost:5001/api/v1';
const LOCAL =  'https://gp-backend-production-2859e512.up.railway.app/api/v1';
export const API_BASE_URL = LOCAL;
