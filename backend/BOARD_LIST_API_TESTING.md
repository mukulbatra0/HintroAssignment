# Board & List API Testing Guide - Postman

Complete guide for testing all Board and List endpoints with Postman.

---

## Prerequisites

1. ✅ User must be logged in (have a valid JWT token)
2. ✅ Add token to Authorization header: `Bearer YOUR_TOKEN`

---

## Base URL
```
http://localhost:5000/api
```

---

# 📋 BOARD ENDPOINTS

## 1️⃣ Get All Boards

**Endpoint:** `GET /api/boards`  
**Authentication:** Required

### Request Body:
None (GET request)

### Headers Required:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Expected Response (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Boards retrieved successfully",
  "data": [
    {
      "_id": "65abc123...",
      "title": "Project Alpha",
      "description": "Main project board",
      "backgroundColor": "#0284c7",
      "owner": {
        "_id": "65xyz...",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://..."
      },
      "members": [
        {
          "_id": "65xyz...",
          "name": "John Doe",
          "email": "john@example.com"
        }
      ],
      "isArchived": false,
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  ]
}
```

### Postman Setup:
1. Method: `GET`
2. URL: `http://localhost:5000/api/boards`
3. Authorization: `Bearer Token` → Paste your token
4. Body: None

---

## 2️⃣ Create New Board

**Endpoint:** `POST /api/boards`  
**Authentication:** Required

### Request Body (JSON):
```json
{
  "title": "My Project Board",
  "description": "This is my new project board",
  "backgroundColor": "#0284c7"
}
```

### Input Fields:
- `title` (required) - 1-100 characters
- `description` (optional) - Max 500 characters
- `backgroundColor` (optional) - Hex color (default: #0284c7)

### Headers Required:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

### Expected Response (201 Created):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Board created successfully",
  "data": {
    "_id": "65abc123...",
    "title": "My Project Board",
    "description": "This is my new project board",
    "backgroundColor": "#0284c7",
    "owner": {
      "_id": "65xyz...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "members": [
      {
        "_id": "65xyz...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "isArchived": false,
    "createdAt": "2024-01-20T10:30:00.000Z",
    "updatedAt": "2024-01-20T10:30:00.000Z"
  }
}
```

### Postman Setup:
1. Method: `POST`
2. URL: `http://localhost:5000/api/boards`
3. Authorization: `Bearer Token` → Paste your token
4. Headers: `Content-Type: application/json`
5. Body: Select `raw` → `JSON` → Paste the JSON above

**💡 Tip:** Save the board `_id` for next requests!

---

## 3️⃣ Get Single Board with Lists & Tasks

**Endpoint:** `GET /api/boards/:id`  
**Authentication:** Required

### URL Parameters:
- `id` - Board ID (MongoDB ObjectId)

### Request Body:
None (GET request)

### Expected Response (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Board retrieved successfully",
  "data": {
    "board": {
      "_id": "65abc123...",
      "title": "My Project Board",
      "description": "This is my new project board",
      "backgroundColor": "#0284c7",
      "owner": { ... },
      "members": [ ... ]
    },
    "lists": [
      {
        "_id": "65list1...",
        "title": "To Do",
        "position": 0,
        "board": "65abc123...",
        "tasks": [
          {
            "_id": "65task1...",
            "title": "Task 1",
            "description": "",
            "position": 0,
            "assignedTo": [ ... ],
            "labels": [],
            "dueDate": null
          }
        ]
      }
    ]
  }
}
```

### Postman Setup:
1. Method: `GET`
2. URL: `http://localhost:5000/api/boards/65abc123...` (replace with actual board ID)
3. Authorization: `Bearer Token`
4. Body: None

---

## 4️⃣ Update Board

**Endpoint:** `PUT /api/boards/:id`  
**Authentication:** Required (Owner only)

### URL Parameters:
- `id` - Board ID

### Request Body (JSON):
```json
{
  "title": "Updated Board Title",
  "description": "Updated description",
  "backgroundColor": "#16a34a"
}
```

### Input Fields (all optional):
- `title` - New title (1-100 chars)
- `description` - New description (max 500 chars)
- `backgroundColor` - New hex color

### Expected Response (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Board updated successfully",
  "data": {
    "_id": "65abc123...",
    "title": "Updated Board Title",
    "description": "Updated description",
    "backgroundColor": "#16a34a",
    ...
  }
}
```

### Postman Setup:
1. Method: `PUT`
2. URL: `http://localhost:5000/api/boards/65abc123...`
3. Authorization: `Bearer Token`
4. Headers: `Content-Type: application/json`
5. Body: `raw` → `JSON` → Paste fields to update

---

## 5️⃣ Delete Board (Archive)

**Endpoint:** `DELETE /api/boards/:id`  
**Authentication:** Required (Owner only)

### URL Parameters:
- `id` - Board ID

### Request Body:
None

### Expected Response (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Board deleted successfully",
  "data": null
}
```

### Postman Setup:
1. Method: `DELETE`
2. URL: `http://localhost:5000/api/boards/65abc123...`
3. Authorization: `Bearer Token`
4. Body: None

---

## 6️⃣ Add Member to Board

**Endpoint:** `POST /api/boards/:id/members`  
**Authentication:** Required (Owner or existing members)

### URL Parameters:
- `id` - Board ID

### Request Body (JSON):
```json
{
  "email": "teammate@example.com"
}
```

### Input Fields:
- `email` (required) - Email of user to add (must be registered)

### Expected Response (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member added successfully",
  "data": {
    "_id": "65abc123...",
    "title": "My Project Board",
    "members": [
      {
        "_id": "65xyz1...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      {
        "_id": "65xyz2...",
        "name": "Jane Smith",
        "email": "teammate@example.com"
      }
    ],
    ...
  }
}
```

### Postman Setup:
1. Method: `POST`
2. URL: `http://localhost:5000/api/boards/65abc123.../members`
3. Authorization: `Bearer Token`
4. Headers: `Content-Type: application/json`
5. Body: `raw` → `JSON` → `{ "email": "teammate@example.com" }`

---

## 7️⃣ Remove Member from Board

**Endpoint:** `DELETE /api/boards/:id/members/:userId`  
**Authentication:** Required (Owner only)

### URL Parameters:
- `id` - Board ID
- `userId` - User ID to remove

### Request Body:
None

### Expected Response (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Member removed successfully",
  "data": {
    "_id": "65abc123...",
    "members": [
      {
        "_id": "65xyz1...",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    ...
  }
}
```

### Postman Setup:
1. Method: `DELETE`
2. URL: `http://localhost:5000/api/boards/65abc123.../members/65xyz2...`
3. Authorization: `Bearer Token`
4. Body: None

---

# 📝 LIST ENDPOINTS

## 8️⃣ Create List in Board

**Endpoint:** `POST /api/boards/:boardId/lists`  
**Authentication:** Required

### URL Parameters:
- `boardId` - Board ID where list will be created

### Request Body (JSON):
```json
{
  "title": "To Do"
}
```

### Input Fields:
- `title` (required) - 1-100 characters

### Expected Response (201 Created):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "List created successfully",
  "data": {
    "_id": "65list123...",
    "title": "To Do",
    "board": "65abc123...",
    "position": 0,
    "createdAt": "2024-01-20T11:00:00.000Z",
    "updatedAt": "2024-01-20T11:00:00.000Z"
  }
}
```

### Postman Setup:
1. Method: `POST`
2. URL: `http://localhost:5000/api/boards/65abc123.../lists`
3. Authorization: `Bearer Token`
4. Headers: `Content-Type: application/json`
5. Body: `raw` → `JSON` → `{ "title": "To Do" }`

---

## 9️⃣ Get All Lists in Board

**Endpoint:** `GET /api/boards/:boardId/lists`  
**Authentication:** Required

### URL Parameters:
- `boardId` - Board ID

### Request Body:
None (GET request)

### Expected Response (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Lists retrieved successfully",
  "data": [
    {
      "_id": "65list1...",
      "title": "To Do",
      "board": "65abc123...",
      "position": 0
    },
    {
      "_id": "65list2...",
      "title": "In Progress",
      "board": "65abc123...",
      "position": 1
    },
    {
      "_id": "65list3...",
      "title": "Done",
      "board": "65abc123...",
      "position": 2
    }
  ]
}
```

### Postman Setup:
1. Method: `GET`
2. URL: `http://localhost:5000/api/boards/65abc123.../lists`
3. Authorization: `Bearer Token`
4. Body: None

---

## 🔟 Update List Title

**Endpoint:** `PUT /api/lists/:id`  
**Authentication:** Required

### URL Parameters:
- `id` - List ID

### Request Body (JSON):
```json
{
  "title": "Completed Tasks"
}
```

### Input Fields:
- `title` (required) - New title (1-100 chars)

### Expected Response (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "List updated successfully",
  "data": {
    "_id": "65list3...",
    "title": "Completed Tasks",
    "board": "65abc123...",
    "position": 2,
    "updatedAt": "2024-01-20T11:15:00.000Z"
  }
}
```

### Postman Setup:
1. Method: `PUT`
2. URL: `http://localhost:5000/api/lists/65list3...`
3. Authorization: `Bearer Token`
4. Headers: `Content-Type: application/json`
5. Body: `raw` → `JSON` → `{ "title": "Completed Tasks" }`

---

## 1️⃣1️⃣ Delete List

**Endpoint:** `DELETE /api/lists/:id`  
**Authentication:** Required

### URL Parameters:
- `id` - List ID

### Request Body:
None

### Expected Response (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "List deleted successfully",
  "data": null
}
```

**⚠️ Note:** Deleting a list also deletes all tasks in that list!

### Postman Setup:
1. Method: `DELETE`
2. URL: `http://localhost:5000/api/lists/65list3...`
3. Authorization: `Bearer Token`
4. Body: None

---

## 1️⃣2️⃣ Update List Position (Drag & Drop)

**Endpoint:** `PUT /api/lists/:id/position`  
**Authentication:** Required

### URL Parameters:
- `id` - List ID

### Request Body (JSON):
```json
{
  "position": 1
}
```

### Input Fields:
- `position` (required) - New position (0-indexed integer)

### Expected Response (200 OK):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "List position updated successfully",
  "data": {
    "_id": "65list1...",
    "title": "To Do",
    "board": "65abc123...",
    "position": 1,
    "updatedAt": "2024-01-20T11:20:00.000Z"
  }
}
```

**💡 How it works:**
- Lists at positions 0, 1, 2
- Move list at position 0 to position 2
- Result: Other lists shift to fill the gap

### Postman Setup:
1. Method: `PUT`
2. URL: `http://localhost:5000/api/lists/65list1.../position`
3. Authorization: `Bearer Token`
4. Headers: `Content-Type: application/json`
5. Body: `raw` → `JSON` → `{ "position": 1 }`

---

## 🧪 Complete Testing Flow

### Step 1: Login & Get Token
```
POST /api/auth/login
{
  "email": "your@email.com",
  "password": "yourpassword"
}
```
✅ Copy the token

### Step 2: Create a Board
```
POST /api/boards
Authorization: Bearer [TOKEN]
{
  "title": "Test Board",
  "description": "My test project",
  "backgroundColor": "#0284c7"
}
```
✅ Copy the board `_id`

### Step 3: Create Lists
```
POST /api/boards/[BOARD_ID]/lists
Authorization: Bearer [TOKEN]
{
  "title": "To Do"
}
```
Create 3 lists: "To Do", "In Progress", "Done"

### Step 4: Get Board with Lists
```
GET /api/boards/[BOARD_ID]
Authorization: Bearer [TOKEN]
```
✅ Verify all lists appear in order

### Step 5: Reorder a List
```
PUT /api/lists/[LIST_ID]/position
Authorization: Bearer [TOKEN]
{
  "position": 2
}
```

### Step 6: Add a Member (requires another registered user)
```
POST /api/boards/[BOARD_ID]/members
Authorization: Bearer [TOKEN]
{
  "email": "teammate@example.com"
}
```

### Step 7: Update Board
```
PUT /api/boards/[BOARD_ID]
Authorization: Bearer [TOKEN]
{
  "title": "Updated Test Board"
}
```

---

## 📊 Quick Reference Table

| Endpoint | Method | Auth | Input Fields |
|----------|--------|------|--------------|
| `/api/boards` | GET | ✅ | None |
| `/api/boards` | POST | ✅ | title*, description, backgroundColor |
| `/api/boards/:id` | GET | ✅ | None |
| `/api/boards/:id` | PUT | ✅ Owner | title, description, backgroundColor |
| `/api/boards/:id` | DELETE | ✅ Owner | None |
| `/api/boards/:id/members` | POST | ✅ | email* |
| `/api/boards/:id/members/:userId` | DELETE | ✅ Owner | None |
| `/api/boards/:boardId/lists` | POST | ✅ | title* |
| `/api/boards/:boardId/lists` | GET | ✅ | None |
| `/api/lists/:id` | PUT | ✅ | title* |
| `/api/lists/:id` | DELETE | ✅ | None |
| `/api/lists/:id/position` | PUT | ✅ | position* |

*Required fields

---

## ❌ Common Error Responses

### 400 Bad Request - Invalid Input
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Board title is required"
    }
  ]
}
```

### 403 Forbidden - No Access
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You do not have access to this board"
}
```

### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Board not found"
}
```

### 409 Conflict - Member Already Exists
```json
{
  "success": false,
  "statusCode": 409,
  "message": "User is already a member of this board"
}
```

---

## 💡 Pro Tips

1. **Environment Variables in Postman:**
   - Create variables: `base_url`, `auth_token`, `board_id`, `list_id`
   - Use: `{{base_url}}/boards/{{board_id}}`

2. **Auto-Save IDs:**
   In Postman Tests tab, add:
   ```javascript
   pm.environment.set("board_id", pm.response.json().data._id);
   ```

3. **Test Authorization:**
   - Try accessing boards without token → 401
   - Try updating someone else's board → 403

4. **Test Position Management:**
   - Create 3 lists (positions 0, 1, 2)
   - Move position 0 to position 2
   - Verify other lists shifted correctly

5. **Test Member Management:**
   - Register 2 users
   - User 1 creates board
   - User 1 adds User 2 by email
   - User 2 can now access the board

---

## 🎨 Color Palette Suggestions

Use these hex colors for `backgroundColor`:

- Blue: `#0284c7` (default)
- Green: `#16a34a`
- Purple: `#9333ea`
- Red: `#dc2626`
- Orange: `#ea580c`
- Pink: `#db2777`
- Teal: `#0d9488`
