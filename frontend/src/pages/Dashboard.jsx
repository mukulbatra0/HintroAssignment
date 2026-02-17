import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchBoards, createBoard, deleteBoard } from '../store/boardSlice';
import { addToast } from '../store/toastSlice';
import Header from '../components/Header';
import { BoardSkeleton } from '../components/LoadingSkeleton';
import { Trash2, Users, Calendar, Plus, Sparkles, Layout } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boards, loading } = useSelector((state) => state.boards);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardData, setNewBoardData] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardData.title.trim()) return;

    setCreating(true);
    const result = await dispatch(createBoard(newBoardData));
    setCreating(false);

    if (!result.error) {
      setShowCreateModal(false);
      setNewBoardData({ title: '', description: '' });
      dispatch(addToast({ message: 'Board created successfully!', type: 'success' }));
      navigate(`/boards/${result.payload._id}`);
    } else {
      dispatch(addToast({ message: 'Failed to create board', type: 'error' }));
    }
  };

  const handleDeleteBoard = async (boardId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this board?')) {
      const result = await dispatch(deleteBoard(boardId));
      if (!result.error) {
        dispatch(addToast({ message: 'Board deleted successfully!', type: 'success' }));
      }
    }
  };

  if (loading && boards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded-3xl w-48 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-3xl w-72 mt-3 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BoardSkeleton />
            <BoardSkeleton />
            <BoardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Header onCreateBoard={() => setShowCreateModal(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Header Section with Gradient */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <Layout className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              My Boards
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-16">Select a board to start collaborating with your team</p>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl mb-6 shadow-lg">
              <Sparkles className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No boards yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first board to organize your tasks and start collaborating with your team
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board._id}
                onClick={() => navigate(`/boards/${board._id}`)}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border-2 border-transparent hover:border-purple-200 transform hover:-translate-y-1"
              >
                {/* Gradient Top Border */}
                <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1 pr-2">
                      {board.title}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteBoard(board._id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-all text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full"
                      title="Delete board"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {board.description ? (
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[40px]">
                      {board.description}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm italic mb-6 min-h-[40px]">
                      No description
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1 bg-purple-50 px-3 py-1.5 rounded-full">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-purple-700">{board.members?.length || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{format(new Date(board.createdAt), 'MMM d')}</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-pink-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-blue-500/5 transition-all duration-300 rounded-3xl pointer-events-none"></div>
              </div>
            ))}

            {/* Create New Board Card */}
            <div
              onClick={() => setShowCreateModal(true)}
              className="group bg-gradient-to-br from-purple-100/50 to-pink-100/50 rounded-3xl border-2 border-dashed border-purple-300 hover:border-purple-500 transition-all cursor-pointer flex items-center justify-center min-h-[240px] hover:shadow-xl transform hover:scale-105"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-md group-hover:shadow-lg transition-shadow">
                  <Plus className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-purple-700 font-semibold text-lg">Create New Board</p>
                <p className="text-purple-500 text-sm mt-1">Start a new project</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Board</h2>
            </div>

            <form onSubmit={handleCreateBoard}>
              <div className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Board Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newBoardData.title}
                    onChange={(e) => setNewBoardData({ ...newBoardData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="My Awesome Project"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newBoardData.description}
                    onChange={(e) => setNewBoardData({ ...newBoardData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    rows="3"
                    placeholder="What's this board about?"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewBoardData({ title: '', description: '' });
                  }}
                  className="px-6 py-3 border-2 border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-all"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={creating || !newBoardData.title.trim()}
                >
                  {creating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Board'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
