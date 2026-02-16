import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoard } from '../store/boardSlice';
import { fetchLists, createList, updateList, deleteList } from '../store/listSlice';
import { createTask, updateTask, deleteTask, moveTask, setTasksForList } from '../store/taskSlice';
import { useSocketListeners } from '../hooks/useSocket';
import socketClient from '../services/socket';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import { Plus, X, MoreVertical } from 'lucide-react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

const Board = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const { currentBoard } = useSelector((state) => state.boards);
  const { lists } = useSelector((state) => state.lists);
  const { tasks } = useSelector((state) => state.tasks);

  const [showAddList, setShowAddList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [editListTitle, setEditListTitle] = useState('');
  const [activeTask, setActiveTask] = useState(null);

  // Set up socket listeners for real-time updates
  useSocketListeners(boardId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoard(boardId));
      dispatch(fetchLists(boardId));
    }
  }, [boardId, dispatch]);

  // Load tasks for each list when lists are fetched
  useEffect(() => {
    lists.forEach((list) => {
      if (list.tasks && list.tasks.length > 0) {
        dispatch(setTasksForList({ listId: list._id, tasks: list.tasks }));
      }
    });
  }, [lists, dispatch]);

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    const result = await dispatch(createList({ boardId, data: { title: newListTitle } }));
    
    if (!result.error) {
      socketClient.emitListCreated(result.payload, boardId);
    }
    
    setNewListTitle('');
    setShowAddList(false);
  };

  const handleUpdateList = async (listId) => {
    if (!editListTitle.trim()) return;
    
    const result = await dispatch(updateList({ listId, data: { title: editListTitle } }));
    
    if (!result.error) {
      socketClient.emitListUpdated(result.payload, boardId);
    }
    
    setEditingListId(null);
    setEditListTitle('');
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list and all its tasks?')) {
      const result = await dispatch(deleteList(listId));
      
      if (!result.error) {
        socketClient.emitListDeleted(listId, boardId);
      }
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    for (const listId in tasks) {
      const task = tasks[listId]?.find((t) => t._id === active.id);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeTaskId = active.id;
    let oldListId = null;
    let activeTaskObj = null;

    for (const listId in tasks) {
      const task = tasks[listId]?.find((t) => t._id === activeTaskId);
      if (task) {
        oldListId = listId;
        activeTaskObj = task;
        break;
      }
    }

    if (!oldListId || !activeTaskObj) {
      setActiveTask(null);
      return;
    }

    let newListId = oldListId;
    
    for (const listId in tasks) {
      const task = tasks[listId]?.find((t) => t._id === over.id);
      if (task) {
        newListId = listId;
        break;
      }
    }

    const droppedList = lists.find((l) => over.id.includes(l._id));
    if (droppedList) {
      newListId = droppedList._id;
    }

    const oldTasks = tasks[oldListId] || [];
    const newTasks = tasks[newListId] || [];
    
    const oldIndex = oldTasks.findIndex((t) => t._id === activeTaskId);
    let newIndex = 0;

    if (newListId === oldListId) {
      const overIndex = oldTasks.findIndex((t) => t._id === over.id);
      newIndex = overIndex !== -1 ? overIndex : oldTasks.length - 1;
    } else {
      const overIndex = newTasks.findIndex((t) => t._id === over.id);
      newIndex = overIndex !== -1 ? overIndex : newTasks.length;
    }

    const result = await dispatch(moveTask({
      taskId: activeTaskId,
      newListId,
      newPosition: newIndex,
    }));

    if (!result.error) {
      socketClient.emitTaskMoved(result.payload, oldListId, newListId, boardId);
    }

    setActiveTask(null);
  };

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header showSearch={true} boardId={boardId} />

      <div className="p-4">
        <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-4">
          <h1 className="text-2xl font-bold text-gray-900">{currentBoard.title}</h1>
          {currentBoard.description && (
            <p className="text-gray-600 mt-1">{currentBoard.description}</p>
          )}
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {lists.map((list) => (
              <div
                key={list._id}
                id={`list-${list._id}`}
                className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md"
              >
                <div className="p-3 border-b border-gray-200">
                  {editingListId === list._id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateList(list._id);
                      }}
                      className="flex items-center"
                    >
                      <input
                        type="text"
                        value={editListTitle}
                        onChange={(e) => setEditListTitle(e.target.value)}
                        className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none"
                        autoFocus
                        onBlur={() => {
                          if (editListTitle.trim()) {
                            handleUpdateList(list._id);
                          } else {
                            setEditingListId(null);
                          }
                        }}
                      />
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h2
                        className="font-semibold text-gray-900 flex-1 cursor-pointer"
                        onClick={() => {
                          setEditingListId(list._id);
                          setEditListTitle(list.title);
                        }}
                      >
                        {list.title} ({tasks[list._id]?.length || 0})
                      </h2>
                      <div className="relative group">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block z-10">
                          <button
                            onClick={() => handleDeleteList(list._id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete List
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <SortableContext
                  items={tasks[list._id]?.map((t) => t._id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="p-3 space-y-2 min-h-[100px] max-h-[calc(100vh-300px)] overflow-y-auto">
                    {tasks[list._id]?.map((task) => (
                      <TaskCard key={task._id} task={task} listId={list._id} boardId={boardId} />
                    ))}
                  </div>
                </SortableContext>

                <AddTaskButton listId={list._id} boardId={boardId} />
              </div>
            ))}

            {showAddList ? (
              <div className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md p-3">
                <form onSubmit={handleAddList}>
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Enter list title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    autoFocus
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Add List
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddList(false);
                        setNewListTitle('');
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <button
                onClick={() => setShowAddList(true)}
                className="flex-shrink-0 w-80 bg-white/60 hover:bg-white/80 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add List
              </button>
            )}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-3 w-80 opacity-90">
                <h3 className="text-sm font-medium text-gray-900">{activeTask.title}</h3>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

const AddTaskButton = ({ listId, boardId }) => {
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const result = await dispatch(createTask({ listId, data: { title: taskTitle } }));
    
    if (!result.error) {
      socketClient.emitTaskCreated(result.payload, boardId);
      setTaskTitle('');
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <div className="p-3">
        <button
          onClick={() => setShowForm(true)}
          className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-md flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </button>
      </div>
    );
  }

  return (
    <div className="p-3">
      <form onSubmit={handleAddTask}>
        <textarea
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Enter task title..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
          rows="2"
          autoFocus
        />
        <div className="flex items-center space-x-2">
          <button
            type="submit"
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setTaskTitle('');
            }}
            className="p-1.5 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Board;
