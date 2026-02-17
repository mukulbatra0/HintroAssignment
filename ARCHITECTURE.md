# 🏗 Architecture Documentation

Comprehensive architecture overview of the Task Collaboration Platform.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Design](#database-design)
5. [Real-Time Communication](#real-time-communication)
6. [Security Architecture](#security-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Performance Considerations](#performance-considerations)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React SPA (Vite)                                      │ │
│  │  - Redux Toolkit (State Management)                   │ │
│  │  - React Router (Navigation)                          │ │
│  │  - Tailwind CSS (Styling)                             │ │
│  │  - @dnd-kit (Drag & Drop)                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS (REST API)
                            │ WebSocket (Socket.io)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Node.js + Express.js Server                          │ │
│  │  - REST API Endpoints                                 │ │
│  │  - JWT Authentication                                 │ │
│  │  - Input Validation                                   │ │
│  │  - Error Handling                                     │ │
│  │  - Rate Limiting                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Socket.io Server                                     │ │
│  │  - Real-time Event Broadcasting                       │ │
│  │  - Room Management                                    │ │
│  │  - Connection Handling                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MongoDB Driver (Mongoose)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  MongoDB Database                                      │ │
│  │  - Users Collection                                    │ │
│  │  - Boards Collection                                   │ │
│  │  - Lists Collection                                    │ │
│  │  - Tasks Collection                                    │ │
│  │  - Activities Collection                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18.2 | UI library |
| | Redux Toolkit | State management |
| | React Router v6 | Client-side routing |
| | Tailwind CSS | Styling framework |
| | @dnd-kit | Drag and drop |
| | Axios | HTTP client |
| | Socket.io Client | WebSocket client |
| | Vite | Build tool |
| **Backend** | Node.js 18+ | Runtime |
| | Express.js 4.18 | Web framework |
| | Socket.io 4.6 | WebSocket server |
| | Mongoose 8.0 | MongoDB ODM |
| | JWT | Authentication |
| | bcryptjs | Password hashing |
| | Winston | Logging |
| **Database** | MongoDB 6+ | NoSQL database |
| **DevOps** | Git | Version control |
| | npm | Package management |

---

## Frontend Architecture

### Component Hierarchy

```
App
├── Router
│   ├── Public Routes
│   │   ├── Login
│   │   └── Register
│   └── Protected Routes
│       ├── Dashboard
│       │   ├── Header
│       │   ├── BoardCard (multiple)
│       │   └── CreateBoardModal
│       └── Board
│           ├── Header
│           │   ├── SearchBar
│           │   └── BoardMembers
│           ├── List (multiple)
│           │   ├── TaskCard (multiple)
│           │   │   ├── UserAssignmentDropdown
│           │   │   └── TaskDetailsModal
│           │   └── AddTaskButton
│           └── AddListButton
└── Toast (global)
```

### State Management (Redux)

```javascript
// Store Structure
{
  auth: {
    user: User | null,
    token: string | null,
    loading: boolean,
    error: string | null
  },
  boards: {
    boards: Board[],
    currentBoard: Board | null,
    loading: boolean,
    error: string | null
  },
  lists: {
    lists: List[],
    loading: boolean,
    error: string | null
  },
  tasks: {
    tasks: { [listId: string]: Task[] },
    loading: boolean,
    error: string | null
  },
  toast: {
    messages: ToastMessage[]
  }
}
```

### Data Flow

```
User Action
    │
    ▼
Component Event Handler
    │
    ▼
Dispatch Redux Action (Thunk)
    │
    ├─────────────────────┐
    │                     │
    ▼                     ▼
API Call            Optimistic Update
    │                     │
    ▼                     │
Backend Response          │
    │                     │
    ▼                     │
Update Redux State ◄──────┘
    │
    ▼
Component Re-render
    │
    ▼
Socket Emit (if needed)
    │
    ▼
Other Clients Receive Update
```

### Routing Strategy

**Public Routes:**
- `/login` - Login page
- `/register` - Registration page

**Protected Routes (require authentication):**
- `/` - Dashboard (board list)
- `/boards/:boardId` - Board detail view

**Route Protection:**
```javascript
// ProtectedRoute component checks authentication
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Dashboard />} />
  <Route path="/boards/:boardId" element={<Board />} />
</Route>
```

### Drag and Drop Architecture

Using **@dnd-kit** library:

```
DndContext (Board level)
    │
    ├── SortableContext (Lists - horizontal)
    │   └── SortableList (multiple)
    │       └── SortableContext (Tasks - vertical)
    │           └── SortableTask (multiple)
    │
    └── DragOverlay (visual feedback)
```

**Drag Flow:**
1. `onDragStart` - Capture dragged item
2. `onDragOver` - Update visual feedback
3. `onDragEnd` - Update positions, API call, socket emit

---

## Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Routes (Express Router)                          │  │
│  │  - Define endpoints                               │  │
│  │  - Apply middleware                               │  │
│  │  - Route to controllers                           │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Middleware Layer                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  - Authentication (JWT verification)              │  │
│  │  - Validation (express-validator)                 │  │
│  │  - Error handling                                 │  │
│  │  - Rate limiting                                  │  │
│  │  - CORS                                           │  │
│  │  - Security headers (Helmet)                      │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Controller Layer                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  - Request handling                               │  │
│  │  - Response formatting                            │  │
│  │  - Call service layer                             │  │
│  │  - Error handling                                 │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  - Business logic                                 │  │
│  │  - Data validation                                │  │
│  │  - Transaction management                         │  │
│  │  - Call model layer                               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     Model Layer                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  - Mongoose schemas                               │  │
│  │  - Database queries                               │  │
│  │  - Data validation                                │  │
│  │  - Relationships                                  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                    MongoDB Database
```

### Request Flow

```
HTTP Request
    │
    ▼
Express Middleware Chain
    ├─ CORS
    ├─ Body Parser
    ├─ Rate Limiter
    ├─ Authentication (if protected)
    └─ Validation
    │
    ▼
Route Handler
    │
    ▼
Controller
    │
    ▼
Service Layer
    │
    ▼
Model/Database
    │
    ▼
Response
    │
    ▼
Client
```

### Middleware Pipeline

```javascript
// Middleware execution order
app.use(helmet());              // 1. Security headers
app.use(corsMiddleware);        // 2. CORS
app.use(express.json());        // 3. Body parsing
app.use(cookieParser());        // 4. Cookie parsing
app.use(compression());         // 5. Response compression
app.use('/api/', generalLimiter); // 6. Rate limiting
app.use('/api', routes);        // 7. API routes
app.use(notFoundHandler);       // 8. 404 handler
app.use(errorHandler);          // 9. Error handler
```

### Authentication Flow

```
1. User Login
    │
    ▼
2. Validate Credentials
    │
    ▼
3. Generate JWT Token
    │
    ▼
4. Send Token to Client
    │
    ▼
5. Client Stores Token (localStorage)
    │
    ▼
6. Client Sends Token in Headers
    │
    ▼
7. Server Verifies Token (protect middleware)
    │
    ▼
8. Attach User to Request
    │
    ▼
9. Process Request
```

**JWT Token Structure:**
```javascript
{
  payload: {
    id: "user_id",
    email: "user@example.com"
  },
  secret: process.env.JWT_SECRET,
  expiresIn: "7d"
}
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│─────────────│
│ _id         │◄────┐
│ name        │     │
│ email       │     │ owner
│ password    │     │
│ avatar      │     │
└─────────────┘     │
       │            │
       │ members    │
       │            │
       ▼            │
┌─────────────┐     │
│    Board    │─────┘
│─────────────│
│ _id         │◄────┐
│ title       │     │
│ description │     │
│ owner       │     │ board
│ members[]   │     │
│ isArchived  │     │
└─────────────┘     │
       │            │
       │ board      │
       │            │
       ▼            │
┌─────────────┐     │
│    List     │─────┤
│─────────────│     │
│ _id         │◄──┐ │
│ title       │   │ │
│ board       │   │ │
│ position    │   │ │
└─────────────┘   │ │
       │          │ │
       │ list     │ │
       │          │ │
       ▼          │ │
┌─────────────┐   │ │
│    Task     │───┘ │
│─────────────│     │
│ _id         │     │
│ title       │     │
│ description │     │
│ list        │     │
│ board       │─────┘
│ assignedTo[]│
│ position    │
│ labels[]    │
│ dueDate     │
│ isCompleted │
└─────────────┘
       │
       │ assignedTo
       │
       ▼
┌─────────────┐
│    User     │
└─────────────┘

┌─────────────┐
│  Activity   │
│─────────────│
│ _id         │
│ board       │───► Board
│ user        │───► User
│ action      │
│ targetType  │
│ targetId    │
│ details     │
└─────────────┘
```

### Indexing Strategy

**Users Collection:**
```javascript
{ email: 1 }  // Unique index for login
```

**Boards Collection:**
```javascript
{ owner: 1, createdAt: -1 }  // Compound index for user's boards
{ members: 1 }                // Index for member queries
{ isArchived: 1 }             // Index for filtering
```

**Lists Collection:**
```javascript
{ board: 1, position: 1 }  // Compound index for ordering
```

**Tasks Collection:**
```javascript
{ list: 1, position: 1 }   // Compound index for ordering
{ board: 1 }                // Index for board-wide queries
{ assignedTo: 1 }           // Index for user's tasks
{ dueDate: 1 }              // Index for date filtering
{ isCompleted: 1 }          // Index for status filtering
{ title: 'text', description: 'text' }  // Text index for search
```

**Activities Collection:**
```javascript
{ board: 1, createdAt: -1 }  // Compound index for activity feed
```

### Data Consistency

**Position Management:**
- Lists and tasks use integer positions (0, 1, 2, ...)
- On delete, remaining items are reordered
- On move, positions are updated atomically

**Cascade Deletes:**
- Deleting a board → deletes all lists, tasks, and activities
- Deleting a list → deletes all tasks in that list
- Implemented in service layer, not database triggers

---

## Real-Time Communication

### Socket.io Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Socket.io Server                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Connection Manager                               │  │
│  │  - Handle connections/disconnections              │  │
│  │  - Authenticate connections                       │  │
│  │  - Manage rooms                                   │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Event Handlers                                   │  │
│  │  - Board events                                   │  │
│  │  - List events                                    │  │
│  │  - Task events                                    │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Broadcasting                                     │  │
│  │  - Emit to specific rooms                         │  │
│  │  - Emit to specific users                         │  │
│  │  - Broadcast to all except sender                 │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Room Management

**Room Structure:**
```
board:<boardId>  - All users viewing a specific board
user:<userId>    - Specific user for direct messages
```

**Join/Leave Flow:**
```
User Opens Board
    │
    ▼
Socket Connects
    │
    ▼
Authenticate Socket
    │
    ▼
Join Board Room (board:<boardId>)
    │
    ▼
Join User Room (user:<userId>)
    │
    ▼
Listen for Events
    │
    ▼
User Leaves Board
    │
    ▼
Leave Board Room
```

### Event Flow

```
User A: Create Task
    │
    ▼
Frontend: API Call
    │
    ▼
Backend: Save to DB
    │
    ▼
Backend: Emit Socket Event
    │
    ├─────────────────┬─────────────────┐
    │                 │                 │
    ▼                 ▼                 ▼
User A          User B          User C
(Optimistic)    (Real-time)     (Real-time)
```

### Socket Events

**Client → Server:**
- `join:board` - Join board room
- `leave:board` - Leave board room

**Server → Client:**
- `board:updated` - Board details changed
- `list:created` - New list added
- `list:updated` - List title changed
- `list:deleted` - List removed
- `list:reordered` - List position changed
- `task:created` - New task added
- `task:updated` - Task details changed
- `task:deleted` - Task removed
- `task:moved` - Task moved to different list

---

## Security Architecture

### Authentication & Authorization

**JWT-Based Authentication:**
```
1. User logs in with credentials
2. Server validates and generates JWT
3. JWT contains user ID and email
4. JWT signed with secret key
5. Client stores JWT in localStorage
6. Client sends JWT in Authorization header
7. Server verifies JWT on protected routes
```

**Authorization Levels:**
- **Public**: Anyone (login, register)
- **Authenticated**: Logged-in users (create board)
- **Board Member**: Users in board.members (view, edit)
- **Board Owner**: User who created board (delete, manage members)

### Security Measures

**1. Password Security:**
- Passwords hashed with bcryptjs (10 salt rounds)
- Never stored or transmitted in plain text
- Minimum 6 characters required

**2. JWT Security:**
- Signed with strong secret (min 32 characters)
- 7-day expiration
- Verified on every protected request
- No sensitive data in payload

**3. Input Validation:**
- express-validator for all inputs
- Sanitization of user inputs
- Type checking
- Length limits

**4. Rate Limiting:**
- General API: 100 requests/15 min
- Auth endpoints: 5 requests/15 min
- Per IP address

**5. HTTP Security Headers (Helmet):**
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

**6. CORS Configuration:**
- Whitelist specific origins
- Credentials allowed
- Specific methods allowed

**7. Error Handling:**
- No sensitive data in error messages
- Stack traces only in development
- Consistent error format

**8. Database Security:**
- Mongoose schema validation
- No direct query injection
- Parameterized queries

---

## Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────┐
│  Developer Machine                                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Frontend (Vite Dev Server)                       │  │
│  │  http://localhost:5173                            │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Backend (Node.js + Nodemon)                      │  │
│  │  http://localhost:5000                            │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  MongoDB (Local or Atlas)                         │  │
│  │  mongodb://localhost:27017                        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Production Environment (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│  CDN (Cloudflare/CloudFront)                            │
│  - Static assets                                         │
│  - Caching                                               │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Frontend (Vercel/Netlify)                              │
│  - React build                                           │
│  - HTTPS                                                 │
│  - Auto-scaling                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Load Balancer (Optional)                               │
│  - Distribute traffic                                    │
│  - SSL termination                                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Backend (Heroku/Railway/DigitalOcean)                  │
│  - Node.js server                                        │
│  - Socket.io server                                      │
│  - HTTPS                                                 │
│  - Auto-scaling                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  MongoDB Atlas                                           │
│  - Managed database                                      │
│  - Automatic backups                                     │
│  - Replication                                           │
└─────────────────────────────────────────────────────────┘
```

### Environment Variables

**Development:**
- Stored in `.env` files
- Not committed to Git
- Local MongoDB connection

**Production:**
- Stored in hosting platform
- MongoDB Atlas connection
- Strong JWT secret
- Production URLs

---

## Performance Considerations

### Frontend Optimizations

**1. Code Splitting:**
```javascript
// Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Board = lazy(() => import('./pages/Board'));
```

**2. Memoization:**
```javascript
// Prevent unnecessary re-renders
const MemoizedTaskCard = memo(TaskCard);
```

**3. Optimistic Updates:**
- Update UI immediately
- Rollback on error
- Better perceived performance

**4. Debouncing:**
```javascript
// Debounce search input
const debouncedSearch = debounce(searchTasks, 300);
```

**5. Virtual Scrolling:**
- For large lists of tasks
- Render only visible items

### Backend Optimizations

**1. Database Indexing:**
- Compound indexes for common queries
- Text indexes for search
- Covered queries when possible

**2. Query Optimization:**
```javascript
// Populate only needed fields
.populate('members', 'name email avatar')
// Limit results
.limit(10)
// Select specific fields
.select('title description createdAt')
```

**3. Caching Strategy:**
- Redis for frequently accessed data
- Cache board details
- Cache user sessions
- TTL-based invalidation

**4. Connection Pooling:**
- MongoDB connection pool
- Reuse connections
- Configurable pool size

**5. Compression:**
- Gzip compression for responses
- Reduces bandwidth usage

**6. Rate Limiting:**
- Prevent abuse
- Protect against DDoS
- Per-endpoint limits

### Socket.io Optimizations

**1. Room-Based Broadcasting:**
- Only send to relevant users
- Reduce unnecessary traffic

**2. Event Batching:**
- Batch multiple updates
- Reduce event frequency

**3. Connection Management:**
- Graceful reconnection
- Heartbeat mechanism
- Timeout handling

---

## Scalability Considerations

### Current Limitations

**Single Server:**
- All requests to one backend instance
- Socket.io sticky sessions required for scaling

**Position-Based Ordering:**
- Requires reordering on every move
- Can be slow with many items

### Scaling Strategies

**Horizontal Scaling:**
```
┌─────────────┐
│Load Balancer│
└──────┬──────┘
       │
   ┌───┴───┬───────┬───────┐
   │       │       │       │
   ▼       ▼       ▼       ▼
┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│App 1│ │App 2│ │App 3│ │App 4│
└──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
   │       │       │       │
   └───────┴───┬───┴───────┘
               │
         ┌─────▼─────┐
         │   Redis   │ (Socket.io adapter)
         └─────┬─────┘
               │
         ┌─────▼─────┐
         │  MongoDB  │
         └───────────┘
```

**Database Sharding:**
- Shard by board ID
- Distribute data across servers
- Horizontal scaling

**Fractional Indexing:**
- Replace integer positions
- No reordering needed
- Better performance

**Caching Layer:**
- Redis for hot data
- Reduce database load
- Faster response times

---

## Monitoring & Logging

### Logging Strategy

**Winston Logger:**
```javascript
// Log levels
- error: Critical errors
- warn: Warning messages
- info: General information
- debug: Debug information
```

**Log Files:**
- `combined.log` - All logs
- `error.log` - Error logs only

**Log Format:**
```
[2024-01-15 10:30:00] [INFO] Server started on port 5000
[2024-01-15 10:30:15] [ERROR] Database connection failed
```

### Monitoring Metrics

**Application Metrics:**
- Request rate
- Response time
- Error rate
- Active connections

**Database Metrics:**
- Query performance
- Connection pool usage
- Index usage
- Storage size

**Socket.io Metrics:**
- Active connections
- Event frequency
- Room sizes
- Disconnection rate

---

## Testing Strategy

### Test Pyramid

```
        ┌─────────────┐
        │   E2E Tests │  (Few)
        └─────────────┘
      ┌─────────────────┐
      │Integration Tests│  (Some)
      └─────────────────┘
    ┌─────────────────────┐
    │    Unit Tests       │  (Many)
    └─────────────────────┘
```

**Unit Tests:**
- Utility functions
- Redux reducers
- Service layer functions

**Integration Tests:**
- API endpoints
- Database operations
- Socket.io events

**E2E Tests:**
- User workflows
- Critical paths
- Cross-browser testing

---

## Conclusion

This architecture provides:
- ✅ Scalability through horizontal scaling
- ✅ Maintainability through layered design
- ✅ Security through multiple layers
- ✅ Performance through optimization
- ✅ Real-time collaboration through Socket.io
- ✅ Developer experience through modern tools

---

**Last Updated:** January 2024
