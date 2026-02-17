import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateTask, deleteTask } from '../store/taskSlice';
import socketClient from '../services/socket';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, Trash2, Edit2, Check, X, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import UserAssignmentDropdown from './UserAssignmentDropdown';

const TaskCard = ({ task, listId, boardId, boardMembers = [] }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  // Sync local state when task prop changes
  useEffect(() => {
    console.log('Task prop changed:', task._id, 'title:', task.title, 'isCompleted:', task.isCompleted);
    setEditTitle(task.title);
  }, [task.title, task.isCompleted, task._id]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdate = async () => {
    if (editTitle.trim() && editTitle !== task.title) {
      console.log('Updating task:', task._id, 'from', task.title, 'to', editTitle);
      const result = await dispatch(updateTask({ taskId: task._id, data: { title: editTitle } }));
      console.log('Update result:', result);
      if (!result.error && boardId) {
        socketClient.emitTaskUpdated(result.payload, boardId);
      }
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const result = await dispatch(deleteTask(task._id));
      if (!result.error && boardId) {
        socketClient.emitTaskDeleted(task._id, listId, boardId);
      }
    }
  };

  const toggleComplete = async (e) => {
    e.stopPropagation();
    console.log('Toggling complete for task:', task._id, 'from', task.isCompleted, 'to', !task.isCompleted);
    const result = await dispatch(updateTask({ 
      taskId: task._id, 
      data: { isCompleted: !task.isCompleted } 
    }));
    console.log('Toggle result:', result);
    if (!result.error && boardId) {
      socketClient.emitTaskUpdated(result.payload, boardId);
    }
  };

  const handleAssignUser = async (userId) => {
    console.log('📌 TaskCard handleAssignUser called');
    console.log('Task ID:', task._id);
    console.log('User ID to assign:', userId);
    console.log('Current assignedTo:', task.assignedTo);
    
    const currentAssignedTo = task.assignedTo || [];
    const newAssignedTo = [...currentAssignedTo, userId];
    
    console.log('New assignedTo array:', newAssignedTo);
    
    const result = await dispatch(updateTask({
      taskId: task._id,
      data: { assignedTo: newAssignedTo }
    }));
    
    console.log('Assign result:', result);
    
    if (!result.error && boardId) {
      socketClient.emitTaskUpdated(result.payload, boardId);
    }
  };

  const handleUnassignUser = async (userId) => {
    console.log('📌 TaskCard handleUnassignUser called');
    console.log('Task ID:', task._id);
    console.log('User ID to unassign:', userId);
    
    const currentAssignedTo = task.assignedTo || [];
    const newAssignedTo = currentAssignedTo.filter(id => {
      const assigneeId = typeof id === 'object' ? id._id : id;
      return assigneeId !== userId;
    });
    
    console.log('New assignedTo array:', newAssignedTo);
    
    const result = await dispatch(updateTask({
      taskId: task._id,
      data: { assignedTo: newAssignedTo }
    }));
    
    console.log('Unassign result:', result);
    
    if (!result.error && boardId) {
      socketClient.emitTaskUpdated(result.payload, boardId);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-white/80 hover:shadow-xl transition-all group overflow-hidden"
    >
      {/* Drag Handle - Separate from card content */}
      <div
        {...attributes}
        {...listeners}
        className="bg-gradient-to-r from-blue-500/5 to-teal-500/5 px-3 py-2 border-b border-gray-100 cursor-grab active:cursor-grabbing flex items-center gap-2"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
        <div className="flex-1 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">Task</span>
          <div className="flex items-center gap-1">
            {/* Completion Checkbox - Outside drag area */}
            <button
              onClick={toggleComplete}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                task.isCompleted
                  ? 'bg-gradient-to-r from-blue-600 to-teal-600 border-blue-600'
                  : 'border-gray-300 hover:border-blue-400 bg-white'
              }`}
            >
              {task.isCompleted && <Check className="w-3 h-3 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Card Content - Not draggable */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border-2 border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              rows="2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleUpdate();
                }
                if (e.key === 'Escape') {
                  setEditTitle(task.title);
                  setIsEditing(false);
                }
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-medium rounded-full hover:from-blue-700 hover:to-teal-700 transition-all flex items-center justify-center gap-1"
              >
                <Check className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditTitle(task.title);
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-full transition-all flex items-center justify-center gap-1"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3
                onClick={() => setIsEditing(true)}
                className={`flex-1 text-sm font-semibold cursor-pointer hover:text-blue-600 transition-colors ${
                  task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
                }`}
              >
                {task.title}
              </h3>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit task"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                </button>
              </div>
            </div>

            {task.description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2 bg-gray-50 p-2 rounded-lg">
                {task.description}
              </p>
            )}

            {/* Labels */}
            {task.labels && task.labels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {task.labels.map((label, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 text-xs font-medium rounded-full"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                {task.dueDate && (
                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <Calendar className="w-3 h-3 text-blue-600" />
                    <span className="font-medium">{format(new Date(task.dueDate), 'MMM d')}</span>
                  </div>
                )}
                {task.assignedTo && task.assignedTo.length > 0 && (
                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <User className="w-3 h-3 text-teal-600" />
                    <span className="font-medium">{task.assignedTo.length}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* User Assignment Dropdown */}
                <UserAssignmentDropdown
                  task={task}
                  boardMembers={boardMembers}
                  onAssign={handleAssignUser}
                  onUnassign={handleUnassignUser}
                />

                {task.isCompleted && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  Completed
                </span>
              )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
