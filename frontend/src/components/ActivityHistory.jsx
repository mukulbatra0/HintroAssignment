import { useState, useEffect } from 'react';
import { Clock, User as UserIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { apiClient } from '../services/api';

const ActivityHistory = ({ boardId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [boardId, page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/activities/board/${boardId}?page=${page}&limit=20`);
      
      if (page === 1) {
        setActivities(response.data.data.activities);
      } else {
        setActivities((prev) => [...prev, ...response.data.data.activities]);
      }
      
      setHasMore(response.data.data.hasMore);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'TASK_CREATED':
      case 'TASK_UPDATED':
      case 'TASK_DELETED':
      case 'TASK_MOVED':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'USER_JOINED':
      case 'USER_LEFT':
        return <UserIcon className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity History</h2>

      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
        {activities.length === 0 && !loading ? (
          <p className="text-center text-gray-500 text-sm py-8">No activities yet</p>
        ) : (
          <>
            {activities.map((activity) => (
              <div key={activity._id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>{activity.user?.name || 'Unknown'}</span>
                    <span className="mx-2">•</span>
                    <span>{format(new Date(activity.createdAt), 'MMM d, h:mm a')}</span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}

            {hasMore && !loading && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2"
              >
                Load more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityHistory;
