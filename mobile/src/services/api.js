import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Extract host from URLs like "exp://192.168.1.5:8081" or "192.168.1.5:8081"
const extractHost = (uri) => {
  if (!uri || typeof uri !== 'string') return null;
  const withoutProtocol = uri.replace(/^[^:]+:\/\//, '');
  return withoutProtocol.split(':')[0] || null;
};

// Backend URL: simulator/emulator uses localhost; physical device needs computer's IP or deployed URL
const getApiBaseUrl = () => {
  // Production: full URL (e.g. https://flukee-backend.onrender.com)
  const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (apiBaseUrl) return apiBaseUrl;

  // Physical device on same network: computer's IP
  const customHost = Constants.expoConfig?.extra?.apiHost;
  if (customHost) return `http://${customHost}:3001`;

  // Auto-detect: Expo bundler host (your computer) when on physical device
  const bundlerHost = extractHost(Constants.expoConfig?.hostUri)
    || extractHost(Constants.manifest?.debuggerHost);
  if (bundlerHost && !['localhost', '127.0.0.1', 'exp'].includes(bundlerHost)) {
    return `http://${bundlerHost}:3001`;
  }

  if (Platform.OS === 'android') return 'http://10.0.2.2:3001';
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();
if (__DEV__) console.log('[Flukee API] Backend URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Callback when 401 occurs - AuthContext registers logout so user is redirected to login
let onUnauthorized = null;
export function setOnUnauthorized(cb) {
  onUnauthorized = cb;
}

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default api;
