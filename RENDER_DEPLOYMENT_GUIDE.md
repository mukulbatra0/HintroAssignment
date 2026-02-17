# Complete Render Deployment Guide

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- MongoDB Atlas account (free tier at https://www.mongodb.com/cloud/atlas)

---

## Step 1: Prepare MongoDB Atlas

1. Go to https://mongodb.com/cloud/atlas
2. Create a free cluster (M0 Sandbox)
3. Create a database user:
   - Database Access → Add New Database User
   - Username: `your_username`
   - Password: `your_password` (save this!)
4. Whitelist all IPs:
   - Network Access → Add IP Address
   - Enter: `0.0.0.0/0` (allows access from anywhere)
5. Get your connection string:
   - Clusters → Connect → Connect your application
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/taskcollab`

---

## Step 2: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the backend service:

   **Basic Settings:**
   - Name: `taskcollab-backend` (or any name you prefer)
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

   **Environment Variables** (click "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/taskcollab
   JWT_SECRET=your_random_secret_key_here_make_it_long_and_secure
   JWT_EXPIRE=7d
   JWT_COOKIE_EXPIRE=7
   CLIENT_URL=https://your-frontend-name.onrender.com
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

   **Important Notes:**
   - Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
   - Generate a secure `JWT_SECRET` (use a password generator, 32+ characters)
   - `CLIENT_URL` will be your frontend URL (we'll update this after deploying frontend)

5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. Copy your backend URL (e.g., `https://taskcollab-backend.onrender.com`)

---

## Step 4: Deploy Frontend on Render

1. Click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository
3. Configure the frontend service:

   **Basic Settings:**
   - Name: `taskcollab-frontend` (or any name you prefer)
   - Region: Same as backend
   - Branch: `main`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

   **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend-name.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-name.onrender.com
   VITE_APP_NAME=TaskCollab
   ```

   **Important:**
   - Replace `your-backend-name` with your actual backend URL from Step 3

4. Click **"Create Static Site"**
5. Wait for deployment (3-5 minutes)
6. Copy your frontend URL (e.g., `https://taskcollab-frontend.onrender.com`)

---

## Step 5: Update Backend CLIENT_URL

1. Go back to your backend service in Render dashboard
2. Click **"Environment"** in the left sidebar
3. Find `CLIENT_URL` variable
4. Update it with your frontend URL: `https://taskcollab-frontend.onrender.com`
5. Click **"Save Changes"**
6. Backend will automatically redeploy

---

## Step 6: Test Your Application

1. Open your frontend URL: `https://taskcollab-frontend.onrender.com`
2. Try to register a new account
3. Login and create a board
4. Test real-time features (drag & drop, live updates)

---

## Alternative: Deploy Using render.yaml (Blueprint)

If you want to deploy both services at once:

1. The `render.yaml` file is already created in your project root
2. Go to Render Dashboard → **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create both services automatically
5. You'll still need to manually add these environment variables:
   - Backend: `MONGODB_URI`, `CLIENT_URL`
   - Frontend: `VITE_API_URL`, `VITE_SOCKET_URL`

---

## Important Notes

### Free Tier Limitations:
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- 750 hours/month free (enough for one service running 24/7)

### Cold Start Fix:
Use a service like UptimeRobot or Cron-job.org to ping your backend every 10 minutes:
```
https://your-backend-name.onrender.com/api/health
```

### Custom Domain (Optional):
1. Go to your service → Settings → Custom Domain
2. Add your domain and follow DNS instructions

---

## Troubleshooting

### Backend won't start:
- Check logs in Render dashboard
- Verify `MONGODB_URI` is correct
- Ensure MongoDB Atlas allows connections from `0.0.0.0/0`

### Frontend can't connect to backend:
- Check `VITE_API_URL` and `VITE_SOCKET_URL` are correct
- Verify backend `CLIENT_URL` matches frontend URL
- Check browser console for CORS errors

### WebSocket connection fails:
- Render free tier supports WebSockets
- Check `VITE_SOCKET_URL` doesn't have `/api` at the end
- Verify backend is running (check logs)

### Database connection errors:
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check database user has read/write permissions
- Ensure connection string has correct password

---

## Environment Variables Quick Reference

### Backend:
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskcollab
JWT_SECRET=your_long_random_secret_key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
CLIENT_URL=https://your-frontend.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend:
```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
VITE_APP_NAME=TaskCollab
```

---

## Updating Your App

Render automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Both services will rebuild and redeploy automatically.

---

## Cost Estimate

- **Free Tier**: $0/month
  - Backend: Free (with cold starts)
  - Frontend: Free
  - MongoDB Atlas: Free (512MB storage)

- **Paid Tier** (No cold starts): ~$7/month
  - Backend: $7/month (Starter plan)
  - Frontend: Free
  - MongoDB Atlas: Free or $9/month for more storage

---

## Next Steps

1. Set up monitoring with Render's built-in logs
2. Configure custom domain (optional)
3. Set up automated backups for MongoDB
4. Add environment-specific configurations
5. Set up CI/CD for automated testing

---

## Support

- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Your app logs: Render Dashboard → Your Service → Logs

Good luck with your deployment! 🚀
