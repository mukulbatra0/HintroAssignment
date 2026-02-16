// Application-wide constants

export const ACTIVITY_TYPES = {
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated',
  TASK_DELETED: 'task_deleted',
  TASK_MOVED: 'task_moved',
  TASK_ASSIGNED: 'task_assigned',
  TASK_UNASSIGNED: 'task_unassigned',
  LIST_CREATED: 'list_created',
  LIST_UPDATED: 'list_updated',
  LIST_DELETED: 'list_deleted',
  BOARD_CREATED: 'board_created',
  BOARD_UPDATED: 'board_updated',
  MEMBER_ADDED: 'member_added',
  MEMBER_REMOVED: 'member_removed',
};

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Board events
  BOARD_JOIN: 'board:join',
  BOARD_LEAVE: 'board:leave',
  BOARD_CREATED: 'board:created',
  BOARD_UPDATED: 'board:updated',
  BOARD_DELETED: 'board:deleted',
  
  // Member events
  MEMBER_ADDED: 'member:added',
  MEMBER_REMOVED: 'member:removed',
  USER_JOINED: 'user:joined',
  USER_LEFT: 'user:left',
  
  // List events
  LIST_CREATED: 'list:created',
  LIST_UPDATED: 'list:updated',
  LIST_DELETED: 'list:deleted',
  LIST_REORDERED: 'list:reordered',
  
  // Task events
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',
  TASK_MOVED: 'task:moved',
  TASK_ASSIGNED: 'task:assigned',
  TASK_UNASSIGNED: 'task:unassigned',
  
  // Typing indicators (optional)
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',
  
  // Activity
  ACTIVITY_NEW: 'activity:new',
};


export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const USER_ROLES = {
  OWNER: 'owner',
  MEMBER: 'member',
};
