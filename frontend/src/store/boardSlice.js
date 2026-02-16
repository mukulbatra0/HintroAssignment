import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { boardAPI } from '../services/apiService';

// Async thunks
export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await boardAPI.getBoards();
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchBoard = createAsyncThunk(
  'boards/fetchBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await boardAPI.getBoard(boardId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (boardData, { rejectWithValue }) => {
    try {
      const response = await boardAPI.createBoard(boardData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ boardId, data }, { rejectWithValue }) => {
    try {
      const response = await boardAPI.updateBoard(boardId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      await boardAPI.deleteBoard(boardId);
      return boardId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addBoardMember = createAsyncThunk(
  'boards/addMember',
  async ({ boardId, email }, { rejectWithValue }) => {
    try {
      const response = await boardAPI.addMember(boardId, email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const removeBoardMember = createAsyncThunk(
  'boards/removeMember',
  async ({ boardId, userId }, { rejectWithValue }) => {
    try {
      const response = await boardAPI.removeMember(boardId, userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Initial state
const initialState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

// Slice
const boardSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
    // Real-time updates
    boardCreatedRealtime: (state, action) => {
      state.boards.push(action.payload);
    },
    boardUpdatedRealtime: (state, action) => {
      const index = state.boards.findIndex((b) => b._id === action.payload._id);
      if (index !== -1) {
        state.boards[index] = action.payload;
      }
      if (state.currentBoard?._id === action.payload._id) {
        state.currentBoard = { ...state.currentBoard, ...action.payload };
      }
    },
    boardDeletedRealtime: (state, action) => {
      state.boards = state.boards.filter((b) => b._id !== action.payload);
      if (state.currentBoard?._id === action.payload) {
        state.currentBoard = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Boards
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Board
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload.board;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Board
    builder
      .addCase(createBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards.push(action.payload);
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Board
    builder
      .addCase(updateBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.boards.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard?._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Board
    builder
      .addCase(deleteBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = state.boards.filter((b) => b._id !== action.payload);
        if (state.currentBoard?._id === action.payload) {
          state.currentBoard = null;
        }
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Member
    builder
      .addCase(addBoardMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBoardMember.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.boards.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard?._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
      })
      .addCase(addBoardMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Remove Member
    builder
      .addCase(removeBoardMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeBoardMember.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.boards.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard?._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
      })
      .addCase(removeBoardMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentBoard,
  boardCreatedRealtime,
  boardUpdatedRealtime,
  boardDeletedRealtime,
} = boardSlice.actions;

export default boardSlice.reducer;
