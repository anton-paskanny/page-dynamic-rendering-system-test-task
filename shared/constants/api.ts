// Shared API constants for both frontend and backend
export const API_CONFIG = {
  PORT: 3001,
  BASE_URL: 'http://localhost:3001',
  API_PREFIX: '/api',
} as const;

export const API_ROUTES = {
  LAYOUTS: {
    ACCOUNT: '/layouts/account',
  },
  ACCOUNTS: {
    BY_ID: (id: string) => `/accounts/${id}`,
  },
  HEALTH: '/health',
} as const;

// Backend route paths (without /api prefix)
export const BACKEND_ROUTES = {
  LAYOUTS: '/layouts',
  ACCOUNTS: '/accounts',
  HEALTH: '/health',
} as const;
