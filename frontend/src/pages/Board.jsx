import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoard } from '../store/boardSlice';
import { fetchLists, createList, updateList, deleteList, updateListPosition, reorderListsOptimistically } from '../store/listSlice';
import { createTask, updateTask, deleteTask, moveTask, setTasksForList } from '../store/taskSlice';
import { useSocketListeners } from '../hooks/useSocket';
import socketClient from '../services/socket';
import Header from '../components/Header';
import BoardMembers from '../components/BoardMembers';
import TaskCard from '../components/TaskCard';
import { Plus, X, MoreVertical, Trash2 } from 'lucide-react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  horizontalListSortingStrategy,
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  const [activeList, setActiveList] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [isDraggingList, setIsDraggingList] = useState(false);

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
    const id = active.id;
    setActiveId(id);
    
    // Check if dragging a list (list IDs start with 'list-')
    if (id.toString().startsWith('list-')) {
      setIsDraggingList(true);
      const listId = id.replace('list-', '');
      const list = lists.find(l => l._id === listId);
      if (list) {
        setActiveList(list);
      }
    } else {
      // Dragging a task
      setIsDraggingList(false);
      for (const listId in tasks) {
        const task = tasks[listId]?.find(t => t._id === id);
        if (task) {
          setActiveTask(task);
          break;
        }
      }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveList(null);
    setActiveId(null);
    setIsDraggingList(false);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Handle list reordering
    if (activeId.toString().startsWith('list-') && overId.toString().startsWith('list-')) {
      const activeListId = activeId.replace('list-', '');
      const overListId = overId.replace('list-', '');
      
      if (activeListId !== overListId) {
        const oldIndex = lists.findIndex(l => l._id === activeListId);
        const newIndex = lists.findIndex(l => l._id === overListId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          // Optimistically update the UI immediately
          dispatch(reorderListsOptimistically({ activeListId, overListId }));
          
          // Update backend position
          const result = await dispatch(updateListPosition({ 
            listId: activeListId, 
            position: newIndex 
          }));
          
          if (!result.error) {
            socketClient.emitListReordered(activeListId, newIndex, boardId);
          }
        }
      }
      return;
    }

    // Handle task dragging (existing logic)
    const taskId = activeId;

    // Determine source list
    let sourceListId = null;
    for (const listId in tasks) {
      if (tasks[listId]?.some(t => t._id === taskId)) {
        sourceListId = listId;
        break;
      }
    }

    if (!sourceListId) return;

    // Check if dropped on a list container
    if (overId.toString().startsWith('list-')) {
      const targetListId = overId.replace('list-', '');
      
      if (sourceListId !== targetListId) {
        const task = tasks[sourceListId]?.find(t => t._id === taskId);
        if (task) {
          await dispatch(moveTask({
            taskId,
            sourceListId,
            targetListId,
            position: (tasks[targetListId]?.length || 0),
          }));
          
          socketClient.emitTaskMoved(
            { ...task, list: targetListId },
            sourceListId,
            targetListId,
            boardId
          );
        }
      }
    } else {
      // Dropped on another task
      let targetListId = null;
      let targetPosition = 0;

      for (const listId in tasks) {
        const taskList = tasks[listId] || [];
        const index = taskList.findIndex(t => t._id === overId);
        if (index !== -1) {
          targetListId = listId;
          targetPosition = index;
          break;
        }
      }

      if (targetListId) {
        const task = tasks[sourceListId]?.find(t => t._id === taskId);
        if (task) {
          await dispatch(moveTask({
            taskId,
            sourceListId,
            targetListId,
            position: targetPosition,
          }));
          
          socketClient.emitTaskMoved(
            { ...task, list: targetListId },
            sourceListId,
            targetListId,
            boardId
          );
        }
      }
    }
  };

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-teal-50 to-cyan-100">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-teal-50 to-cyan-100 animate-fade-in">
      <Header showSearch={true} boardId={boardId} />

      <div className="p-6">
        {/* Board Header - Glassmorphism */}
        <div className="mb-6 bg-white/40 backdrop-blur-lg rounded-3xl shadow-xl border border-white/50 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                {currentBoard.title}
              </h1>
              {currentBoard.description && (
                <p className="text-gray-600 mt-2 text-lg">{currentBoard.description}</p>
              )}
            </div>
            <BoardMembers board={currentBoard} />
          </div>
        </div>

        {/* Lists Container */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex space-x-5 overflow-x-auto pb-6 px-1">
            <SortableContext 
              items={lists.map(list => `list-${list._id}`)} 
              strategy={horizontalListSortingStrategy}
            >
              {lists.map((list) => {
                // Get tasks for this list - use tasks from Redux state
                const listTasks = tasks[list._id] || [];
                console.log(`Rendering list ${list.title} (${list._id}) with ${listTasks.length} tasks:`, 
                  listTasks.map(t => ({ id: t._id, title: t.title, completed: t.isCompleted })));
                
                return (
                  <SortableList
                    key={list._id}
                    list={list}
                    listTasks={listTasks}
                    editingListId={editingListId}
                    editListTitle={editListTitle}
                    setEditingListId={setEditingListId}
                    setEditListTitle={setEditListTitle}
                    handleUpdateList={handleUpdateList}
                    handleDeleteList={handleDeleteList}
                    boardId={boardId}
                  />
                );
              })}
            </SortableContext>

            {/* Add New List Card */}
            {showAddList ? (
              <div className="flex-shrink-0 w-80">
                <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-lg border border-white/70 p-4">
                  <form onSubmit={handleAddList}>
                    <input
                      type="text"
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      placeholder="Enter list title..."
                      className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-blue-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 font-semibold"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-teal-700 transition-all shadow-md"
                      >
                        Add List
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddList(false);
                          setNewListTitle('');
                        }}
                        className="px-4 py-2.5 bg-white/80 hover:bg-white text-gray-700 font-semibold rounded-full transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex-shrink-0 w-80">
                <button
                  onClick={() => setShowAddList(true)}
                  className="w-full bg-white/40 backdrop-blur-md hover:bg-white/60 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-3xl p-4 flex items-center justify-center gap-2 text-blue-700 font-semibold transition-all hover:shadow-lg group"
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Add List</span>
                </button>
              </div>
            )}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <div className="opacity-80">
                <TaskCard task={activeTask} listId="" boardId={boardId} />
              </div>
            ) : activeList ? (
              <div className="opacity-80 flex-shrink-0 w-80">
                <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-lg border border-white/70 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-teal-500/10 border-b border-white/50">
                    <h2 className="font-bold text-gray-800 text-lg">
                      {activeList.title}
                    </h2>
                  </div>
                  <div className="p-3 min-h-[100px]">
                    {/* Empty placeholder for drag preview */}
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

// Add Task Button Component
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
    }

    setTaskTitle('');
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full mt-3 p-3 bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-dashed border-gray-300 hover:border-blue-400 rounded-2xl flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition-all group"
      >
        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
        <span>Add Task</span>
      </button>
    );
  }

  return (
    <div className="mt-3 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-md">
      <form onSubmit={handleAddTask}>
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Enter task title..."
          className="w-full px-3 py-2 bg-white border-2 border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-medium rounded-full hover:from-blue-700 hover:to-teal-700 transition-all text-sm"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setTaskTitle('');
            }}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-all text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Sortable List Component
const SortableList = ({ 
  list, 
  listTasks, 
  editingListId, 
  editListTitle, 
  setEditingListId, 
  setEditListTitle, 
  handleUpdateList, 
  handleDeleteList,
  boardId 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `list-${list._id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const taskIds = listTasks.map(task => task._id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-80"
    >
      {/* List Card - Glassmorphism */}
      <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-lg border border-white/70 overflow-hidden">
        {/* List Header */}
        <div 
          className="p-4 bg-gradient-to-r from-blue-500/10 to-teal-500/10 border-b border-white/50 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          {editingListId === list._id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateList(list._id);
              }}
              className="flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={editListTitle}
                onChange={(e) => setEditListTitle(e.target.value)}
                className="flex-1 px-3 py-2 bg-white/80 backdrop-blur-sm border-2 border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
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
                className="font-bold text-gray-800 flex-1 cursor-pointer text-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingListId(list._id);
                  setEditListTitle(list.title);
                }}
              >
                {list.title}
              </h2>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteList(list._id);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Delete list"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Tasks Area */}
        <div className="p-3 min-h-[100px] max-h-[calc(100vh-350px)] overflow-y-auto">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {listTasks.map((task) => (
                <TaskCard
                  key={`${task._id}-${task.isCompleted}-${task.title}`}
                  task={task}
                  listId={list._id}
                  boardId={boardId}
                />
              ))}
            </div>
          </SortableContext>

          {/* Add Task Button */}
          <AddTaskButton listId={list._id} boardId={boardId} />
        </div>
      </div>
    </div>
  );
};

export default Board;
