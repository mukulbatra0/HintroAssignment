import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { searchTasks } from '../store/taskSlice';
import { Search, X } from 'lucide-react';

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
        const result = await dispatch(searchTasks({ 
          boardId, 
          params: { q: searchQuery } 
        }));
        
        if (!result.error) {
          // API returns { data: [...tasks], pagination: {...} }
          const tasks = result.payload?.data || [];
          setSearchResults(tasks);
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
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <Search className="w-5 h-5 purple-600" strokeWidth={2} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-12 pr-12 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-sm placeholder:text-gray-400"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute z-[200] mt-3 w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/70 max-h-96 overflow-y-auto">
          {searching ? (
            <div className="p-6 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 mt-3">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-600 px-3 py-2 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl mb-2">
                Found {searchResults.length} task{searchResults.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2 mt-2">
                {searchResults.map((task) => (
                  <div 
                    key={task._id} 
                    className="p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-blue-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900">{task.title}</h4>
                        {task.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            List: {task.list?.title || 'Unknown'}
                          </span>
                          {task.isCompleted && (
                            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 font-medium">No tasks found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
