import { configureStore } from '@reduxjs/toolkit';

// Slices will be imported here as they are created
// import authReducer from './slices/authSlice';
// import boardsReducer from './slices/boardsSlice';
// etc.

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    // boards: boardsReducer,
    // lists: listsReducer,
    // tasks: tasksReducer,
    // activities: activitiesReducer,
    // ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore socket.io instances in actions
        ignoredActions: ['socket/connected'],
        ignoredPaths: ['socket'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});
