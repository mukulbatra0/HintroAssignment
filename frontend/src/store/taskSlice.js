import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskAPI } from '../services/apiService';

// Async thunks
export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await taskAPI.getTask(taskId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ listId, data }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.createTask(listId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, data }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.updateTask(taskId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await taskAPI.deleteTask(taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ taskId, newListId, newPosition }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.moveTask(taskId, newListId, newPosition);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const assignUser = createAsyncThunk(
  'tasks/assignUser',
  async ({ taskId, userId }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.assignUser(taskId, userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const unassignUser = createAsyncThunk(
  'tasks/unassignUser',
  async ({ taskId, userId }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.unassignUser(taskId, userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const searchTasks = createAsyncThunk(
  'tasks/searchTasks',
  async ({ boardId, params }, { rejectWithValue }) => {
    try {
      const response = await taskAPI.searchTasks(boardId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Initial state
const initialState = {
  tasks: {}, // Store tasks by list ID: { listId: [tasks] }
  currentTask: null,
  searchResults: null,
  loading: false,
  error: null,
};

// Slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTasks: (state) => {
      state.tasks = {};
    },
    setTasksForList: (state, action) => {
      const { listId, tasks } = action.payload;
      state.tasks[listId] = tasks.sort((a, b) => a.position - b.position);
    },
    // Real-time updates
    taskCreatedRealtime: (state, action) => {
      const task = action.payload;
      if (!state.tasks[task.list]) {
        state.tasks[task.list] = [];
      }
      state.tasks[task.list].push(task);
      state.tasks[task.list].sort((a, b) => a.position - b.position);
    },
    taskUpdatedRealtime: (state, action) => {
      const task = action.payload;
      const listTasks = state.tasks[task.list];
      if (listTasks) {
        const index = listTasks.findIndex((t) => t._id === task._id);
        if (index !== -1) {
          listTasks[index] = task;
        }
      }
      if (state.currentTask?._id === task._id) {
        state.currentTask = task;
      }
    },
    taskDeletedRealtime: (state, action) => {
      const { taskId, listId } = action.payload;
      if (state.tasks[listId]) {
        state.tasks[listId] = state.tasks[listId].filter((t) => t._id !== taskId);
      }
      if (state.currentTask?._id === taskId) {
        state.currentTask = null;
      }
    },
    taskMovedRealtime: (state, action) => {
      const { task, oldListId, newListId } = action.payload;
      
      // Remove from old list
      if (state.tasks[oldListId]) {
        state.tasks[oldListId] = state.tasks[oldListId].filter((t) => t._id !== task._id);
      }
      
      // Add to new list
      if (!state.tasks[newListId]) {
        state.tasks[newListId] = [];
      }
      state.tasks[newListId].push(task);
      state.tasks[newListId].sort((a, b) => a.position - b.position);
    },
  },
  extraReducers: (builder) => {
    // Fetch Task
    builder
      .addCase(fetchTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        const task = action.payload;
        if (!state.tasks[task.list]) {
          state.tasks[task.list] = [];
        }
        state.tasks[task.list].push(task);
        state.tasks[task.list].sort((a, b) => a.position - b.position);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Task
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const task = action.payload;
        const listTasks = state.tasks[task.list];
        if (listTasks) {
          const index = listTasks.findIndex((t) => t._id === task._id);
          if (index !== -1) {
            listTasks[index] = task;
          }
        }
        if (state.currentTask?._id === task._id) {
          state.currentTask = task;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        const taskId = action.payload;
        // Remove from all lists
        Object.keys(state.tasks).forEach((listId) => {
          state.tasks[listId] = state.tasks[listId].filter((t) => t._id !== taskId);
        });
        if (state.currentTask?._id === taskId) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Move Task
    builder
      .addCase(moveTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        state.loading = false;
        const task = action.payload;
        
        // Remove from all lists first
        Object.keys(state.tasks).forEach((listId) => {
          state.tasks[listId] = state.tasks[listId].filter((t) => t._id !== task._id);
        });
        
        // Add to new list
        if (!state.tasks[task.list]) {
          state.tasks[task.list] = [];
        }
        state.tasks[task.list].push(task);
        state.tasks[task.list].sort((a, b) => a.position - b.position);
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Assign User
    builder
      .addCase(assignUser.fulfilled, (state, action) => {
        const task = action.payload;
        const listTasks = state.tasks[task.list];
        if (listTasks) {
          const index = listTasks.findIndex((t) => t._id === task._id);
          if (index !== -1) {
            listTasks[index] = task;
          }
        }
        if (state.currentTask?._id === task._id) {
          state.currentTask = task;
        }
      });

    // Unassign User
    builder
      .addCase(unassignUser.fulfilled, (state, action) => {
        const task = action.payload;
        const listTasks = state.tasks[task.list];
        if (listTasks) {
          const index = listTasks.findIndex((t) => t._id === task._id);
          if (index !== -1) {
            listTasks[index] = task;
          }
        }
        if (state.currentTask?._id === task._id) {
          state.currentTask = task;
        }
      });

    // Search Tasks
    builder
      .addCase(searchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearTasks,
  setTasksForList,
  taskCreatedRealtime,
  taskUpdatedRealtime,
  taskDeletedRealtime,
  taskMovedRealtime,
} = taskSlice.actions;

export default taskSlice.reducer;
