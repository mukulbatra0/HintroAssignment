import apiClient from './api';

/**
 * Auth API Service
 */
export const authAPI = {
  // Register new user
  register: async (data) => {
    return await apiClient.post('/auth/register', data);
  },

  // Login user
  login: async (credentials) => {
    return await apiClient.post('/auth/login', credentials);
  },

  // Get current user profile
  getMe: async () => {
    return await apiClient.get('/auth/me');
  },

  // Logout
  logout: async () => {
    return await apiClient.post('/auth/logout');
  },

  // Update profile
  updateProfile: async (data) => {
    return await apiClient.put('/auth/profile', data);
  },

  // Change password
  changePassword: async (data) => {
    return await apiClient.put('/auth/password', data);
  },
};

/**
 * Board API Service
 */
export const boardAPI = {
  // Get all boards
  getBoards: async () => {
    return await apiClient.get('/boards');
  },

  // Get single board
  getBoard: async (boardId) => {
    return await apiClient.get(`/boards/${boardId}`);
  },

  // Create board
  createBoard: async (data) => {
    return await apiClient.post('/boards', data);
  },

  // Update board
  updateBoard: async (boardId, data) => {
    return await apiClient.put(`/boards/${boardId}`, data);
  },

  // Delete board
  deleteBoard: async (boardId) => {
    return await apiClient.delete(`/boards/${boardId}`);
  },

  // Add member
  addMember: async (boardId, email) => {
    return await apiClient.post(`/boards/${boardId}/members`, { email });
  },

  // Remove member
  removeMember: async (boardId, userId) => {
    return await apiClient.delete(`/boards/${boardId}/members/${userId}`);
  },
};

/**
 * List API Service
 */
export const listAPI = {
  // Get lists for a board
  getBoardLists: async (boardId) => {
    return await apiClient.get(`/boards/${boardId}/lists`);
  },

  // Create list
  createList: async (boardId, data) => {
    return await apiClient.post(`/boards/${boardId}/lists`, data);
  },

  // Update list
  updateList: async (listId, data) => {
    return await apiClient.put(`/lists/${listId}`, data);
  },

  // Delete list
  deleteList: async (listId) => {
    return await apiClient.delete(`/lists/${listId}`);
  },

  // Update list position
  updateListPosition: async (listId, position) => {
    return await apiClient.put(`/lists/${listId}/position`, { position });
  },
};

/**
 * Task API Service
 */
export const taskAPI = {
  // Create task
  createTask: async (listId, data) => {
    return await apiClient.post(`/lists/${listId}/tasks`, data);
  },

  // Get task
  getTask: async (taskId) => {
    return await apiClient.get(`/tasks/${taskId}`);
  },

  // Update task
  updateTask: async (taskId, data) => {
    return await apiClient.put(`/tasks/${taskId}`, data);
  },

  // Delete task
  deleteTask: async (taskId) => {
    return await apiClient.delete(`/tasks/${taskId}`);
  },

  // Move task
  moveTask: async (taskId, newListId, newPosition) => {
    return await apiClient.put(`/tasks/${taskId}/move`, {
      newListId,
      newPosition,
    });
  },

  // Assign user
  assignUser: async (taskId, userId) => {
    return await apiClient.post(`/tasks/${taskId}/assign`, { userId });
  },

  // Unassign user
  unassignUser: async (taskId, userId) => {
    return await apiClient.delete(`/tasks/${taskId}/assign/${userId}`);
  },

  // Search tasks
  searchTasks: async (boardId, params) => {
    return await apiClient.get(`/boards/${boardId}/tasks/search`, { params });
  },
};
