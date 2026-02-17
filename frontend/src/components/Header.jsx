import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { LogOut, Plus, User, Home, Layout } from 'lucide-react';
import SearchBar from './SearchBar';

const Header = ({ onCreateBoard, showSearch, boardId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  
  const isOnDashboard = location.pathname === '/dashboard';
  const isOnBoard = location.pathname.includes('/boards/');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleHome = () => {
    navigate('/dashboard');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b-2 border-purple-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={handleHome}>
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                <Layout className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </div>

            {/* Breadcrumb Navigation */}
            {isOnBoard && (
              <div className="hidden md:flex items-center space-x-2 ml-4">
                <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                <button
                  onClick={handleHome}
                  className="text-sm text-gray-500 hover:text-purple-600 transition-colors flex items-center space-x-1"
                >
                  <Home className="w-4 h-4" />
                  <span>Boards</span>
                </button>
              </div>
            )}
          </div>

          {/* Center - Search (if on board) */}
          {showSearch && boardId && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBar boardId={boardId} />
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Create Board Button (only on dashboard) */}
            {isOnDashboard && onCreateBoard && (
              <button
                onClick={onCreateBoard}
                className="hidden sm:flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>New Board</span>
              </button>
            )}

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all border-2 border-transparent hover:border-purple-200">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border-2 border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleHome}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors"
                  >
                    <Home className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
