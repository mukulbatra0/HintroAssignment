// API URLs
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Socket Events
export const SOCKET_EVENTS = {
  // Client to Server
  JOIN_BOARD: 'join:board',
  LEAVE_BOARD: 'leave:board',
  
  // Server to Client
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_MOVED: 'task:moved',
  
  LIST_CREATED: 'list:created',
  LIST_UPDATED: 'list:updated',
  LIST_DELETED: 'list:deleted',
  
  ACTIVITY_NEW: 'activity:new',
  
  ERROR: 'error',
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  BOARD: '/board/:id',
  PROFILE: '/profile',
};
