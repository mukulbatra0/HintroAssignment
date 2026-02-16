import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listAPI } from '../services/apiService';

// Async thunks
export const fetchLists = createAsyncThunk(
  'lists/fetchLists',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await listAPI.getBoardLists(boardId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createList = createAsyncThunk(
  'lists/createList',
  async ({ boardId, data }, { rejectWithValue }) => {
    try {
      const response = await listAPI.createList(boardId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateList = createAsyncThunk(
  'lists/updateList',
  async ({ listId, data }, { rejectWithValue }) => {
    try {
      const response = await listAPI.updateList(listId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteList = createAsyncThunk(
  'lists/deleteList',
  async (listId, { rejectWithValue }) => {
    try {
      await listAPI.deleteList(listId);
      return listId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateListPosition = createAsyncThunk(
  'lists/updatePosition',
  async ({ listId, position }, { rejectWithValue }) => {
    try {
      const response = await listAPI.updateListPosition(listId, position);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Initial state
const initialState = {
  lists: [],
  loading: false,
  error: null,
};

 // Slice
const listSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLists: (state) => {
      state.lists = [];
    },
    // Real-time updates
    listCreatedRealtime: (state, action) => {
      state.lists.push(action.payload);
      // Sort by position
      state.lists.sort((a, b) => a.position - b.position);
    },
    listUpdatedRealtime: (state, action) => {
      const index = state.lists.findIndex((l) => l._id === action.payload._id);
      if (index !== -1) {
        state.lists[index] = action.payload;
      }
    },
    listDeletedRealtime: (state, action) => {
      state.lists = state.lists.filter((l) => l._id !== action.payload);
    },
    listReorderedRealtime: (state, action) => {
      const { listId, newPosition } = action.payload;
      const index = state.lists.findIndex((l) => l._id === listId);
      if (index !== -1) {
        state.lists[index].position = newPosition;
        // Resort
        state.lists.sort((a, b) => a.position - b.position);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Lists
    builder
      .addCase(fetchLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload.sort((a, b) => a.position - b.position);
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create List
    builder
      .addCase(createList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.loading = false;
        state.lists.push(action.payload);
        state.lists.sort((a, b) => a.position - b.position);
      })
      .addCase(createList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update List
    builder
      .addCase(updateList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateList.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.lists.findIndex((l) => l._id === action.payload._id);
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
      })
      .addCase(updateList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete List
    builder
      .addCase(deleteList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = state.lists.filter((l) => l._id !== action.payload);
      })
      .addCase(deleteList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Position
    builder
      .addCase(updateListPosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateListPosition.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.lists.findIndex((l) => l._id === action.payload._id);
        if (index !== -1) {
          state.lists[index] = action.payload;
          state.lists.sort((a, b) => a.position - b.position);
        }
      })
      .addCase(updateListPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearLists,
  listCreatedRealtime,
  listUpdatedRealtime,
  listDeletedRealtime,
  listReorderedRealtime,
} = listSlice.actions;

export default listSlice.reducer;
