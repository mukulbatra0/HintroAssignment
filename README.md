# 🚀 Real-Time Task Collaboration Platform

A modern, real-time task management application similar to Trello/Notion, built with React, Node.js, Express, MongoDB, and Socket.io. Features drag-and-drop functionality, real-time collaboration, and a beautiful glassmorphism UI.

![Tech Stack](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-8.0-brightgreen)
![Socket.io](https://img.shields.io/badge/Socket.io-4.6-black)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Real-Time Features](#-real-time-features)
- [Testing](#-testing)
- [Demo Credentials](#-demo-credentials)
- [Project Structure](#-project-structure)
- [Assumptions & Trade-offs](#-assumptions--trade-offs)
- [Future Enhancements](#-future-enhancements)

---

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - Secure signup/login with JWT tokens
- ✅ **Board Management** - Create, update, delete boards with descriptions
- ✅ **List Management** - Create multiple lists (columns) within boards
- ✅ **Task Management** - Create, update, delete tasks with rich metadata
- ✅ **Drag & Drop** - Intuitive drag-and-drop for tasks and lists
- ✅ **User Assignment** - Assign multiple users to tasks
- ✅ **Real-Time Sync** - Live updates across all connected users
- ✅ **Activity History** - Track all board activities
- ✅ **Search & Filter** - Full-text search on tasks
- ✅ **Pagination** - Efficient data loading

### UI/UX Features
- 🎨 Modern glassmorphism design
- 📱 Fully responsive layout
- 🌈 Gradient accents and smooth animations
- 🔔 Toast notifications
- ⚡ Optimistic UI updates
- 🎯 Loading skeletons

---

## 🛠 Tech Stack

### Frontend
- **React 18.2** - UI library
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **@dnd-kit** - Drag and drop functionality
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Utility-first styling
- **Vite** - Build tool and dev server
- **Lucide React** - Icon library
- **date-fns** - Date formatting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Winston** - Logging
- **Helmet** - Security headers
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting

---

## 🏗 Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────────────┐
│                   React App                      │
├─────────────────────────────────────────────────┤
│  Components Layer                                │
│  ├─ Pages (Dashboard, Board, Auth)              │
│  ├─ Components (TaskCard, Header, etc.)         │
│  └─ Hooks (useSocket, custom hooks)             │
├─────────────────────────────────────────────────┤
│  State Management (Redux Toolkit)               │
│  ├─ authSlice                                    │
│  ├─ boardSlice                                   │
│  ├─ listSlice                                    │
│  ├─ taskSlice                                    │
│  └─ toastSlice                                   │
├─────────────────────────────────────────────────┤
│  Services Layer                                  │
│  ├─ API Service (Axios)                         │
│  └─ Socket Service (Socket.io Client)           │
└─────────────────────────────────────────────────┘
```

**Key Design Patterns:**
- **Redux Toolkit** for centralized state management
- **Async Thunks** for API calls with loading states
- **Optimistic Updates** for better UX
- **Custom Hooks** for reusable logic
- **Component Composition** for maintainability

### Backend Architecture

```
┌─────────────────────────────────────────────────┐
│              Express.js Server                   │
├─────────────────────────────────────────────────┤
│  Middleware Layer                                │
│  ├─ Authentication (JWT)                         │
│  ├─ Validation (express-validator)              │
│  ├─ Error Handling                               │
│  ├─ Rate Limiting                                │
│  └─ CORS & Security (Helmet)                    │
├─────────────────────────────────────────────────┤
│  Routes Layer                                    │
│  ├─ /api/auth                                    │
│  ├─ /api/boards                                  │
│  ├─ /api/lists                                   │
│  └─ /api/tasks                                   │
├─────────────────────────────────────────────────┤
│  Controllers Layer                               │
│  └─ Business logic handlers                     │
├─────────────────────────────────────────────────┤
│  Services Layer                                  │
│  └─ Database operations                         │
├─────────────────────────────────────────────────┤
│  Models Layer (Mongoose)                        │
│  ├─ User                                         │
│  ├─ Board                                        │
│  ├─ List                                         │
│  ├─ Task                                         │
│  └─ Activity                                     │
├─────────────────────────────────────────────────┤
│  Socket.io Server                                │
│  └─ Real-time event handlers                    │
└─────────────────────────────────────────────────┘
```

**Key Design Patterns:**
- **MVC Architecture** - Separation of concerns
- **Service Layer Pattern** - Business logic isolation
- **Repository Pattern** - Data access abstraction
- **Middleware Chain** - Request processing pipeline
- **Event-Driven** - Socket.io for real-time updates

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - OR use MongoDB Atlas (cloud) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd task-collaboration-platform
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
# Windows
net start MongoDB

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string
4. Whitelist your IP address

### 4. Configure Environment Variables

#### Backend Environment Variables

Create `backend/.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/task-collaboration
# For MongoDB Atlas: mongodb+srv://<username>:<password>@cluster.mongodb.net/task-collaboration

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# CORS
CLIENT_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment Variables

Create `frontend/.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=TaskCollab
```

---

## 🔧 Environment Variables

### Backend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Server port | `5000` | Yes |
| `MONGODB_URI` | MongoDB connection string | - | Yes |
| `JWT_SECRET` | Secret key for JWT (min 32 chars) | - | Yes |
| `JWT_EXPIRE` | JWT expiration time | `7d` | Yes |
| `JWT_COOKIE_EXPIRE` | Cookie expiration (days) | `7` | Yes |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |

### Frontend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` | Yes |
| `VITE_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` | Yes |
| `VITE_APP_NAME` | Application name | `TaskCollab` | No |

---

## ▶️ Running the Application

### Development Mode

#### 1. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

#### 2. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

#### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

### Production Mode

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## 📚 API Documentation

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Board Endpoints

#### Get All Boards
```http
GET /api/boards
Authorization: Bearer <token>
```

#### Get Single Board
```http
GET /api/boards/:id
Authorization: Bearer <token>
```

#### Create Board
```http
POST /api/boards
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Project",
  "description": "Project description"
}
```

#### Update Board
```http
PUT /api/boards/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Board
```http
DELETE /api/boards/:id
Authorization: Bearer <token>
```

#### Add Member to Board
```http
POST /api/boards/:id/members
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "member@example.com"
}
```

#### Remove Member from Board
```http
DELETE /api/boards/:id/members/:userId
Authorization: Bearer <token>
```

### List Endpoints

#### Get Board Lists
```http
GET /api/boards/:boardId/lists
Authorization: Bearer <token>
```

#### Create List
```http
POST /api/boards/:boardId/lists
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "To Do"
}
```

#### Update List
```http
PUT /api/lists/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title"
}
```

#### Delete List
```http
DELETE /api/lists/:id
Authorization: Bearer <token>
```

#### Update List Position
```http
PUT /api/lists/:id/position
Authorization: Bearer <token>
Content-Type: application/json

{
  "position": 2
}
```

### Task Endpoints

#### Create Task
```http
POST /api/lists/:listId/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Task title",
  "description": "Task description",
  "dueDate": "2024-12-31"
}
```

#### Get Task
```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "isCompleted": true
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

#### Move Task (Drag & Drop)
```http
PUT /api/tasks/:id/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "listId": "target_list_id",
  "position": 0
}
```

#### Assign User to Task
```http
POST /api/tasks/:id/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id_to_assign"
}
```

#### Unassign User from Task
```http
DELETE /api/tasks/:id/assign/:userId
Authorization: Bearer <token>
```

#### Search Tasks
```http
GET /api/boards/:boardId/tasks/search?q=search_term&page=1&limit=10
Authorization: Bearer <token>
```

### Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## 🗄 Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for detailed schema documentation.

### Collections Overview

1. **users** - User accounts and authentication
2. **boards** - Project boards
3. **lists** - Columns within boards
4. **tasks** - Individual task cards
5. **activities** - Activity history logs

### Key Relationships

```
User ──┬─> owns ──> Board
       │
       └─> member of ──> Board

Board ──> contains ──> List ──> contains ──> Task
                                             │
User ─────────────> assigned to ─────────────┘
```

---

## ⚡ Real-Time Features

The application uses **Socket.io** for real-time collaboration.

### Socket Events

#### Client → Server Events
- `join:board` - Join a board room
- `leave:board` - Leave a board room

#### Server → Client Events
- `board:updated` - Board was updated
- `list:created` - New list created
- `list:updated` - List updated
- `list:deleted` - List deleted
- `list:reordered` - List position changed
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `task:moved` - Task moved to different list

### Real-Time Flow

```
User A makes change → API call → Database update → 
Socket.io broadcast → All connected users receive update → 
UI updates automatically
```

---

## � Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage

The application includes:
- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for React components

**Note:** Test implementation is in progress. Current test script is a placeholder.

---

## 🔐 Demo Credentials

For testing purposes, you can use these demo accounts:

### Demo User 1
```
Email: demo@example.com
Password: demo123
```

### Demo User 2
```
Email: demo2@example.com
Password: demo123
```

**Note:** Create these accounts by registering through the application, or seed them using a database script.

---

## 📁 Project Structure

```
task-collaboration-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── socket/          # Socket.io handlers
│   │   ├── utils/           # Utility functions
│   │   ├── validators/      # Input validation
│   │   └── app.js           # Express app setup
│   ├── logs/                # Application logs
│   ├── .env                 # Environment variables
│   ├── .env.example         # Environment template
│   ├── package.json
│   └── server.js            # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API & Socket services
│   │   ├── store/           # Redux store & slices
│   │   ├── styles/          # CSS files
│   │   ├── utils/           # Utility functions
│   │   ├── App.jsx          # Root component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── .env                 # Environment variables
│   ├── .env.example         # Environment template
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js   # Tailwind configuration
│   └── vite.config.js       # Vite configuration
│
├── DATABASE_SCHEMA.md       # Database documentation
├── API_DOCUMENTATION.md     # Detailed API docs
├── ARCHITECTURE.md          # Architecture details
└── README.md                # This file
```

---

## 🤔 Assumptions & Trade-offs

### Assumptions

1. **Single Workspace**: Users can access all boards they're members of without workspace separation
2. **Public Board Discovery**: No board discovery feature; users must be added by board owners
3. **Simple Permissions**: Only owner can delete boards; all members have equal edit rights
4. **No File Attachments**: Tasks don't support file uploads (can be added later)
5. **No Comments**: Task comments not implemented (can be added later)
6. **Activity Retention**: Activities are stored indefinitely (can add TTL later)
7. **Local Time**: All dates displayed in user's local timezone
8. **Modern Browsers**: Optimized for Chrome, Firefox, Safari, Edge (latest versions)

### Trade-offs

#### 1. Position-Based Ordering vs Fractional Indexing
**Chosen**: Position-based ordering (0, 1, 2, ...)
- **Pros**: Simple to implement and understand
- **Cons**: Requires reordering on every move
- **Alternative**: Fractional indexing would avoid reordering but adds complexity

#### 2. Optimistic Updates vs Server Confirmation
**Chosen**: Optimistic updates with rollback on error
- **Pros**: Instant UI feedback, better UX
- **Cons**: Potential inconsistency if server fails
- **Mitigation**: Rollback on error, socket sync

#### 3. REST API vs GraphQL
**Chosen**: REST API
- **Pros**: Simpler, well-understood, easier to cache
- **Cons**: Over-fetching, multiple requests
- **Rationale**: Sufficient for current scale

#### 4. MongoDB vs PostgreSQL
**Chosen**: MongoDB
- **Pros**: Flexible schema, easy to scale horizontally
- **Cons**: No ACID transactions across collections
- **Rationale**: Document model fits board/list/task hierarchy

#### 5. Socket.io vs WebRTC
**Chosen**: Socket.io
- **Pros**: Easier to implement, handles reconnection
- **Cons**: Server-mediated (not peer-to-peer)
- **Rationale**: Sufficient for current real-time needs

#### 6. Client-Side vs Server-Side Rendering
**Chosen**: Client-side (SPA)
- **Pros**: Better interactivity, easier state management
- **Cons**: Slower initial load, SEO challenges
- **Rationale**: App is behind authentication, SEO not critical

---

## 🚀 Future Enhancements

### High Priority
- [ ] Task comments and discussions
- [ ] File attachments for tasks
- [ ] Task checklists/subtasks
- [ ] Email notifications
- [ ] Board templates
- [ ] Dark mode
- [ ] Mobile app (React Native)

### Medium Priority
- [ ] Task labels/tags with colors
- [ ] Advanced search and filters
- [ ] Board archiving
- [ ] Export board data (JSON, CSV)
- [ ] Keyboard shortcuts
- [ ] Undo/redo functionality
- [ ] Task dependencies

### Low Priority
- [ ] Time tracking
- [ ] Calendar view
- [ ] Gantt chart view
- [ ] Board analytics
- [ ] Custom fields
- [ ] Automation rules
- [ ] Third-party integrations (Slack, GitHub)

---

## 📄 License

This project is created for educational/interview purposes.

---

## 👥 Contributors

- Your Name - Full Stack Developer

---

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact: your.email@example.com

---

## 🙏 Acknowledgments

- Inspired by Trello and Notion
- UI design inspired by modern glassmorphism trends
- Icons by Lucide React
- Built with love and coffee ☕

---

**Made with ❤️ for the Full Stack Engineer Interview Assignment**
