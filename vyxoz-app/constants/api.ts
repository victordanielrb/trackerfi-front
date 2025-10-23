export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.79:3000',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      VERIFY: '/auth/verify',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh-token'
    },
    WALLETS: {
      BASE: '/api/wallets',
      USER: (userId: string) => `/api/wallets/user/${userId}`
    },
    TRACKING: {
      WALLETS: '/api/tracking/wallets',
      TOKENS: '/api/tracking/tokens'
    },
    USERS: {
      BASE: '/api/users',
      BY_ID: (userId: string) => `/api/users/${userId}`
    }
  }
};

export const getApiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`;

// Legacy exports for backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;