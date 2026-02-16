# Database Schema Design

This document describes the MongoDB database schema for the Task Collaboration Platform.

## Collections Overview

The application uses 5 main collections:
1. **users** - User accounts and authentication
2. **boards** - Project boards (like Trello boards)
3. **lists** - Columns within boards
4. **tasks** - Individual task cards
5. **activities** - Activity history logs

---

## 1. Users Collection

Stores user account information and authentication credentials.

**Schema:**
```javascript
{
  _id: ObjectId,
  name: String (2-50 chars, required),
  email: String (unique, lowercase, required),
  password: String (hashed, min 6 chars, required),
  avatar: String (URL, auto-generated),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)

**Methods:**
- `comparePassword(candidatePassword)` - Compare hashed passwords
- `generateAuthToken()` - Generate JWT token
- `toJSON()` - Exclude password from responses

---

## 2. Boards Collection

Stores project boards with ownership and member management.

**Schema:**
```javascript
{
  _id: ObjectId,
  title: String (1-100 chars, required),
  description: String (max 500 chars),
  owner: ObjectId (ref: User, required),
  members: [ObjectId] (ref: User),
  backgroundColor: String (hex color, default: #0284c7),
  isArchived: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `owner, createdAt` (compound)
- `members`
- `isArchived`
- `owner, members` (compound for access queries)

**Virtual Fields:**
- `lists` - Populated from Lists collection

**Methods:**
- `hasAccess(userId)` - Check if user can access board
- `isOwner(userId)` - Check if user is the owner

**Business Logic:**
- Owner is automatically added to members array on creation

---

## 3. Lists Collection

Stores columns/lists within boards with position-based ordering.

**Schema:**
```javascript
{
  _id: ObjectId,
  title: String (1-100 chars, required),
  board: ObjectId (ref: Board, required),
  position: Number (required, auto-incremented),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `board, position` (compound, for ordering)

**Virtual Fields:**
- `tasks` - Populated from Tasks collection

**Static Methods:**
- `reorderAfterDelete(boardId, deletedPosition)` - Reorder remaining lists

**Business Logic:**
- Position auto-increments on creation (0, 1, 2, ...)
- Positions are compact (no gaps)

---

## 4. Tasks Collection

Stores individual task cards with rich metadata and drag-and-drop support.

**Schema:**
```javascript
{
  _id: ObjectId,
  title: String (1-200 chars, required),
  description: String (max 2000 chars),
  list: ObjectId (ref: List, required),
  board: ObjectId (ref: Board, required),
  assignedTo: [ObjectId] (ref: User),
  position: Number (required, auto-incremented),
  labels: [{
    color: String (hex color),
    text: String (max 30 chars)
  }],
  dueDate: Date,
  isCompleted: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `list, position` (compound, for ordering within list)
- `board` (for board-wide queries)
- `assignedTo` (for user's tasks)
- `dueDate` (for filtering)
- `isCompleted` (for filtering)
- `title, description` (text index for search)

**Static Methods:**
- `reorderAfterDelete(listId, deletedPosition)` - Reorder remaining tasks
- `moveTask(taskId, newListId, newPosition)` - Handle drag-and-drop with position updates

**Business Logic:**
- Position auto-increments within each list
- Moving tasks updates positions atomically to prevent conflicts
- Text search enabled on title and description

---

## 5. Activities Collection

Stores activity history for boards (audit log).

**Schema:**
```javascript
{
  _id: ObjectId,
  board: ObjectId (ref: Board, required),
  user: ObjectId (ref: User, required),
  action: String (enum, required),
  targetType: String (enum: task/list/board/member),
  targetId: ObjectId,
  details: Mixed (flexible object for action-specific data),
  createdAt: Date,
  updatedAt: Date
}
```

**Action Types (enum):**
- task_created, task_updated, task_deleted, task_moved
- task_assigned, task_unassigned
- list_created, list_updated, list_deleted
- board_created, board_updated
- member_added, member_removed

**Indexes:**
- `board, createdAt` (compound, for activity feed queries)
- Optional: TTL index on `createdAt` (auto-delete after 90 days)

**Static Methods:**
- `createActivity(boardId, userId, action, targetType, targetId, details)` - Create activity log

**Instance Methods:**
- `formatMessage()` - Generate human-readable activity message

---

## Relationships

```
User ──┬─> owns ──> Board
       │
       └─> member of ──> Board

Board ──> contains ──> List ──> contains ──> Task
                                             │
User ─────────────> assigned to ─────────────┘

Board ──> has ──> Activity
User  ──> creates ──> Activity
```

---

## Performance Considerations

1. **Compound Indexes**: Used for common query patterns (board + position, board + createdAt)
2. **Text Indexes**: Enable full-text search on task titles and descriptions
3. **Sparse Indexes**: Can be added to optional fields like `dueDate` if needed
4. **Virtual Population**: Lists and tasks are populated on-demand to avoid over-fetching
5. **Position Management**: Atomic updates prevent race conditions during drag-and-drop

---

## Pagination Strategy

**Tasks Search/Pagination:**
- Use `skip` and `limit` with cursor-based pagination
- Index on `board, createdAt` for efficient paging
- Default: 10-20 items per page

**Activities Feed:**
- Sorted by `createdAt DESC`
- Use `board, createdAt` index
- Load more with cursor-based pagination

---

## Scalability Considerations

**Current Design (Up to ~10K boards, 100K tasks):**
- Single MongoDB instance
- Indexed queries for fast lookups
- Position-based ordering

**Future Enhancements (for scale):**
- Shard by `board._id` for horizontal scaling
- Implement fractional indexing for positions (avoid costly reordering)
- Add Redis caching for frequently accessed boards
- Separate activity logs to time-series collection
