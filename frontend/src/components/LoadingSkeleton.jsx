const BoardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="flex items-center space-x-2">
      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

const TaskSkeleton = () => (
  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const ListSkeleton = () => (
  <div className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md animate-pulse">
    <div className="p-3 border-b border-gray-200">
      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
    </div>
    <div className="p-3 space-y-2">
      <TaskSkeleton />
      <TaskSkeleton />
      <TaskSkeleton />
    </div>
  </div>
);

const Spinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
  );
};

export { BoardSkeleton, TaskSkeleton, ListSkeleton, Spinner };
