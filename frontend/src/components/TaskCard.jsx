import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateTask, deleteTask } from '../store/taskSlice';
import socketClient from '../services/socket';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, User, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

const TaskCard = ({ task, listId, boardId }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

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
      const result = await dispatch(updateTask({ taskId: task._id, data: { title: editTitle } }));
      if (!result.error && boardId) {
        socketClient.emitTaskUpdated(result.payload, boardId);
      }
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const result = await dispatch(deleteTask(task._id));
      if (!result.error && boardId) {
        socketClient.emitTaskDeleted(task._id, boardId);
      }
    }
  };

  const toggleComplete = async () => {
    const result = await dispatch(updateTask({ 
      taskId: task._id, 
      data: { isCompleted: !task.isCompleted } 
    }));
    if (!result.error && boardId) {
      socketClient.emitTaskUpdated(result.payload, boardId);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow group"
      {...attributes}
      {...listeners}
    >
      {isEditing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
        >
          <textarea
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none resize-none"
            rows="2"
            autoFocus
            onBlur={handleUpdate}
          />
        </form>
      ) : (
        <>
          <div className="flex items-start justify-between mb-2">
            <h3
              className={`flex-1 text-sm font-medium ${
                task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
              }`}
            >
              {task.title}
            </h3>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1 hover:bg-gray-100 rounded"
                title="Edit task"
              >
                <Edit2 className="w-3 h-3 text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="p-1 hover:bg-red-50 rounded"
                title="Delete task"
              >
                <Trash2 className="w-3 h-3 text-red-600" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              {task.dueDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                </div>
              )}
              {task.assignedTo && task.assignedTo.length > 0 && (
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>{task.assignedTo.length}</span>
                </div>
              )}
            </div>

            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={toggleComplete}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.labels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskCard;
