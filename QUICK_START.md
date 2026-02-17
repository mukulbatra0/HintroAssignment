# ⚡ Quick Start Guide

Get the Task Collaboration Platform running in 5 minutes!

---

## Prerequisites

Make sure you have these installed:
- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **MongoDB** (v6+) - [Download](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud option)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Installation (5 Steps)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd task-collaboration-platform
```

### Step 2: Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-collaboration
JWT_SECRET=your_super_secret_jwt_key_change_this_min_32_chars
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CLIENT_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Setup Frontend

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=TaskCollab
```

### Step 4: Start MongoDB

**Option A - Local MongoDB:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Option B - MongoDB Atlas:**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`

### Step 5: Run Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🎉 Access Application

Open your browser and go to:
```
http://localhost:5173
```

---

## 📝 First Steps

### 1. Register Account
- Click "Sign Up"
- Enter name, email, password
- Click "Create Account"

### 2. Create Board
- Click "Create New Board"
- Enter board title
- Click "Create Board"

### 3. Create List
- Click "Add List"
- Enter list title (e.g., "To Do")
- Press Enter

### 4. Create Task
- Click "Add Task" in a list
- Enter task title
- Press Enter

### 5. Drag & Drop
- Drag tasks between lists
- Drag lists to reorder

### 6. Test Real-Time
- Open same board in another browser/tab
- Make changes in one
- See updates in the other instantly!

---

## 🔧 Common Issues

### Port Already in Use

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5173 | xargs kill -9
```

### MongoDB Connection Failed

**Check if MongoDB is running:**
```bash
# Windows
sc query MongoDB

# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod
```

**Start MongoDB:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Module Not Found

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Make sure `CLIENT_URL` in `backend/.env` matches your frontend URL:
```env
CLIENT_URL=http://localhost:5173
```

---

## 📚 Next Steps

- Read [README.md](./README.md) for full documentation
- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API details
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for testing
- Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) to deploy

---

## 🎯 Quick Commands

### Development

```bash
# Backend
cd backend
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start without auto-reload
npm test             # Run tests

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
```

### Database

```bash
# Connect to MongoDB
mongosh

# Show databases
show dbs

# Use database
use task-collaboration

# Show collections
show collections

# View users
db.users.find()

# View boards
db.boards.find()

# Clear database
db.dropDatabase()
```

---

## 🐛 Debug Mode

Enable detailed logging:

**Backend:**
```env
# Add to backend/.env
NODE_ENV=development
```

**Frontend:**
```env
# Add to frontend/.env
VITE_DEBUG=true
```

---

## 🔑 Demo Credentials

Create these accounts for testing:

**User 1:**
```
Email: demo@example.com
Password: demo123
```

**User 2:**
```
Email: demo2@example.com
Password: demo123
```

---

## 📱 Test Features

### Basic Features
- ✅ User registration/login
- ✅ Create/edit/delete boards
- ✅ Create/edit/delete lists
- ✅ Create/edit/delete tasks
- ✅ Drag and drop tasks
- ✅ Assign users to tasks
- ✅ Mark tasks complete
- ✅ Search tasks

### Real-Time Features
- ✅ Live board updates
- ✅ Live task updates
- ✅ Live drag and drop
- ✅ Multi-user collaboration

---

## 🎨 UI Features

- Modern glassmorphism design
- Smooth animations
- Responsive layout
- Toast notifications
- Loading states
- Error handling

---

## 📊 Project Structure

```
task-collaboration-platform/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── socket/       # Socket.io handlers
│   │   └── middleware/   # Express middleware
│   └── server.js         # Entry point
│
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store
│   │   ├── services/     # API services
│   │   └── hooks/        # Custom hooks
│   └── index.html        # Entry HTML
│
└── docs/                 # Documentation
```

---

## 🛠 Tech Stack

**Frontend:**
- React 18.2
- Redux Toolkit
- Tailwind CSS
- Socket.io Client
- @dnd-kit (Drag & Drop)

**Backend:**
- Node.js
- Express.js
- MongoDB + Mongoose
- Socket.io
- JWT Authentication

---

## 💡 Tips

1. **Use two browsers** to test real-time features
2. **Check browser console** for errors
3. **Check terminal logs** for backend errors
4. **Use MongoDB Compass** to view database
5. **Use Postman** to test API endpoints

---

## 🆘 Need Help?

- Check [README.md](./README.md) for detailed docs
- Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Check browser console for errors
- Check terminal for backend errors
- Verify environment variables
- Ensure MongoDB is running

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Socket.io Documentation](https://socket.io/docs/)

---

**Happy Coding! 🚀**
