# 📡 API Documentation

Complete API reference for the Task Collaboration Platform.

**Base URL:** `http://localhost:5000/api`

**Authentication:** Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [Boards](#boards)
3. [Lists](#lists)
4. [Tasks](#tasks)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Authentication

### Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `name`: 2-50 characters, required
- `email`: Valid email format, unique, required
- `password`: Minimum 6 characters, required

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

### Login

Authenticate user and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://ui-avatars.com/api/?name=John+Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://ui-avatars.com/api/?name=John+Doe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Logout

Logout user (clears cookie if used).

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Update Profile

Update user profile information.

**Endpoint:** `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "avatar": "https://ui-avatars.com/api/?name=John+Updated"
  }
}
```

---

### Change Password

Change user password.

**Endpoint:** `PUT /api/auth/password`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Boards

### Get All Boards

Get all boards where user is owner or member.

**Endpoint:** `GET /api/boards`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Project Alpha",
      "description": "Main project board",
      "owner": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "members": [
        {
          "_id": "507f1f77bcf86cd799439012",
          "name": "John Doe",
          "email": "john@example.com"
        }
      ],
      "backgroundColor": "#0284c7",
      "isArchived": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

### Get Single Board

Get board details with lists and tasks.

**Endpoint:** `GET /api/boards/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Board ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Project Alpha",
    "description": "Main project board",
    "owner": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "members": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://ui-avatars.com/api/?name=John+Doe"
      }
    ],
    "lists": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "title": "To Do",
        "position": 0,
        "tasks": [
          {
            "_id": "507f1f77bcf86cd799439014",
            "title": "Task 1",
            "description": "Task description",
            "position": 0,
            "assignedTo": [],
            "labels": [],
            "dueDate": null,
            "isCompleted": false,
            "createdAt": "2024-01-15T10:30:00.000Z"
          }
        ]
      }
    ],
    "backgroundColor": "#0284c7",
    "isArchived": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Board not found"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "error": "Not authorized to access this board"
}
```

---

### Create Board

Create a new board.

**Endpoint:** `POST /api/boards`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Project",
  "description": "Project description",
  "backgroundColor": "#0284c7"
}
```

**Validation Rules:**
- `title`: 1-100 characters, required
- `description`: Max 500 characters, optional
- `backgroundColor`: Valid hex color, optional

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "New Project",
    "description": "Project description",
    "owner": "507f1f77bcf86cd799439012",
    "members": ["507f1f77bcf86cd799439012"],
    "backgroundColor": "#0284c7",
    "isArchived": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Update Board

Update board details.

**Endpoint:** `PUT /api/boards/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "backgroundColor": "#ef4444"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Title",
    "description": "Updated description",
    "backgroundColor": "#ef4444",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### Delete Board

Delete a board (owner only).

**Endpoint:** `DELETE /api/boards/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Board deleted successfully"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "error": "Only board owner can delete the board"
}
```

---

### Add Member to Board

Add a user to board by email.

**Endpoint:** `POST /api/boards/:id/members`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "newmember@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "members": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com"
      },
      {
        "_id": "507f1f77bcf86cd799439015",
        "name": "New Member",
        "email": "newmember@example.com"
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "User not found with that email"
}
```

---

### Remove Member from Board

Remove a member from board.

**Endpoint:** `DELETE /api/boards/:id/members/:userId`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id`: Board ID
- `userId`: User ID to remove

**Success Response (200):**
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

---

## Lists

### Get Board Lists

Get all lists for a board.

**Endpoint:** `GET /api/boards/:boardId/lists`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "To Do",
      "board": "507f1f77bcf86cd799439011",
      "position": 0,
      "tasks": [],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### Create List

Create a new list in a board.

**Endpoint:** `POST /api/boards/:boardId/lists`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "In Progress"
}
```

**Validation Rules:**
- `title`: 1-100 characters, required

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "In Progress",
    "board": "507f1f77bcf86cd799439011",
    "position": 1,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Update List

Update list title.

**Endpoint:** `PUT /api/lists/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Updated Title",
    "position": 1,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### Delete List

Delete a list and all its tasks.

**Endpoint:** `DELETE /api/lists/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "List deleted successfully"
}
```

---

### Update List Position

Update list position (for drag & drop).

**Endpoint:** `PUT /api/lists/:id/position`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "position": 2
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "position": 2,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

## Tasks

### Create Task

Create a new task in a list.

**Endpoint:** `POST /api/lists/:listId/tasks`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "labels": [
    {
      "color": "#ef4444",
      "text": "Urgent"
    }
  ]
}
```

**Validation Rules:**
- `title`: 1-200 characters, required
- `description`: Max 2000 characters, optional
- `dueDate`: Valid ISO date, optional
- `labels`: Array of label objects, optional

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "New Task",
    "description": "Task description",
    "list": "507f1f77bcf86cd799439013",
    "board": "507f1f77bcf86cd799439011",
    "position": 0,
    "assignedTo": [],
    "labels": [
      {
        "color": "#ef4444",
        "text": "Urgent"
      }
    ],
    "dueDate": "2024-12-31T23:59:59.000Z",
    "isCompleted": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get Task

Get single task details.

**Endpoint:** `GET /api/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Task Title",
    "description": "Task description",
    "list": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "To Do"
    },
    "board": "507f1f77bcf86cd799439011",
    "assignedTo": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://ui-avatars.com/api/?name=John+Doe"
      }
    ],
    "position": 0,
    "labels": [],
    "dueDate": null,
    "isCompleted": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Update Task

Update task details.

**Endpoint:** `PUT /api/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "isCompleted": true,
  "dueDate": "2024-12-31T23:59:59.000Z",
  "labels": [
    {
      "color": "#10b981",
      "text": "Done"
    }
  ]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Updated Task",
    "description": "Updated description",
    "isCompleted": true,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### Delete Task

Delete a task.

**Endpoint:** `DELETE /api/tasks/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### Move Task

Move task to different list/position (drag & drop).

**Endpoint:** `PUT /api/tasks/:id/move`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "listId": "507f1f77bcf86cd799439015",
  "position": 2
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "list": "507f1f77bcf86cd799439015",
    "position": 2,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

### Assign User to Task

Assign a user to a task.

**Endpoint:** `POST /api/tasks/:id/assign`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "assignedTo": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ]
  }
}
```

---

### Unassign User from Task

Remove user assignment from task.

**Endpoint:** `DELETE /api/tasks/:id/assign/:userId`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User unassigned successfully"
}
```

---

### Search Tasks

Search tasks within a board.

**Endpoint:** `GET /api/boards/:boardId/tasks/search`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `q`: Search query (required)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `completed`: Filter by completion status (true/false)

**Example:**
```
GET /api/boards/507f1f77bcf86cd799439011/tasks/search?q=urgent&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "title": "Urgent Task",
      "description": "This is urgent",
      "list": {
        "_id": "507f1f77bcf86cd799439013",
        "title": "To Do"
      },
      "isCompleted": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

---

## Error Handling

All API errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "stack": "Error stack trace (development only)"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Messages

**Authentication Errors:**
- `"Not authorized, no token"`
- `"Not authorized, token failed"`
- `"Invalid credentials"`

**Validation Errors:**
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

**Resource Errors:**
- `"Board not found"`
- `"List not found"`
- `"Task not found"`
- `"User not found"`

**Permission Errors:**
- `"Not authorized to access this board"`
- `"Only board owner can delete the board"`

---

## Rate Limiting

The API implements rate limiting to prevent abuse.

### Limits

**General API Endpoints:**
- 100 requests per 15 minutes per IP

**Authentication Endpoints:**
- 5 requests per 15 minutes per IP

### Rate Limit Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

### Rate Limit Exceeded Response (429)

```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

---

## WebSocket Events

See [README.md](./README.md#-real-time-features) for Socket.io event documentation.

---

## Postman Collection

Import this collection to test the API:

[Download Postman Collection](./postman_collection.json) *(to be created)*

---

## Additional Resources

- [Database Schema](./DATABASE_SCHEMA.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [Main README](./README.md)

---

**Last Updated:** January 2024
