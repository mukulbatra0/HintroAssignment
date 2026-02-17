import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import socketClient from '../services/socket';
import {
  boardCreatedRealtime,
  boardUpdatedRealtime,
  boardDeletedRealtime,
} from '../store/boardSlice';
import {
  listCreatedRealtime,
  listUpdatedRealtime,
  listDeletedRealtime,
  listReorderedRealtime,
} from '../store/listSlice';
import {
  taskCreatedRealtime,
  taskUpdatedRealtime,
  taskDeletedRealtime,
  taskMovedRealtime,
} from '../store/taskSlice';

/**
 * Socket Event Listeners Hook
 * Sets up real-time event listeners for boards, lists, and tasks
 */
export const useSocketListeners = (boardId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!boardId) return;

    // Join board room
    socketClient.joinBoard(boardId);

    // Board events
    socketClient.on('board:updated', ({ board }) => {
      dispatch(boardUpdatedRealtime(board));
    });

    socketClient.on('board:deleted', ({ boardId }) => {
      dispatch(boardDeletedRealtime(boardId));
    });

    // List events
    socketClient.on('list:created', ({ list }) => {
      dispatch(listCreatedRealtime(list));
    });

    socketClient.on('list:updated', ({ list }) => {
      dispatch(listUpdatedRealtime(list));
    });

    socketClient.on('list:deleted', ({ listId }) => {
      dispatch(listDeletedRealtime(listId));
    });

    socketClient.on('list:reordered', ({ listId, newPosition }) => {
      console.log('🔔 Received list:reordered event:', { listId, newPosition });
      dispatch(listReorderedRealtime({ listId, newPosition }));
    });

    // Task events
    socketClient.on('task:created', ({ task }) => {
      dispatch(taskCreatedRealtime(task));
    });

    socketClient.on('task:updated', ({ task }) => {
      dispatch(taskUpdatedRealtime(task));
    });

    socketClient.on('task:deleted', ({ taskId, listId }) => {
      dispatch(taskDeletedRealtime({ taskId, listId }));
    });

    socketClient.on('task:moved', ({ task, oldListId, newListId }) => {
      dispatch(taskMovedRealtime({ task, oldListId, newListId }));
    });

    // Cleanup on unmount or board change
    return () => {
      socketClient.leaveBoard(boardId);
      socketClient.off('board:updated');
      socketClient.off('board:deleted');
      socketClient.off('list:created');
      socketClient.off('list:updated');
      socketClient.off('list:deleted');
      socketClient.off('list:reordered');
      socketClient.off('task:created');
      socketClient.off('task:updated');
      socketClient.off('task:deleted');
      socketClient.off('task:moved');
    };
  }, [boardId, dispatch]);
};

/**
 * Socket Connection Hook
 * Manages socket connection based on authentication status
 */
export const useSocketConnection = (token, isAuthenticated) => {
  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect socket with token
      socketClient.connect(token);
    } else {
      // Disconnect if not authenticated
      socketClient.disconnect();
    }

    return () => {
      // Cleanup on unmount
      if (!isAuthenticated) {
        socketClient.disconnect();
      }
    };
  }, [token, isAuthenticated]);
};
