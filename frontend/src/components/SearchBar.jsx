import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchTasks } from '../store/taskSlice';
import { Search, X } from 'lucide-react';
import TaskCard from './TaskCard';

const SearchBar = ({ boardId }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim() && boardId) {
        setSearching(true);
        const result = await dispatch(searchTasks({ boardId, query: searchQuery }));
        
        if (!result.error) {
          setSearchResults(result.payload || []);
          setShowResults(true);
        }
        setSearching(false);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, boardId, dispatch]);

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
          {searching ? (
            <div className="p-4 text-center text-gray-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-2">
              <p className="text-xs text-gray-500 px-2 py-1">
                Found {searchResults.length} task{searchResults.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2 mt-2">
                {searchResults.map((task) => (
                  <div key={task._id} className="p-2 hover:bg-gray-50 rounded">
                    <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      List: {task.list?.title || 'Unknown'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No tasks found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
