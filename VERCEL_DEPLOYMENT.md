# Vercel Deployment Guide

Your project is now configured to deploy on **Vercel with both frontend and backend**.

## 📋 Pre-Deployment Checklist

### Backend Environment Variables
Set these in Vercel Dashboard → Project Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://manveersingh:100121@proappoint.m2kipdf.mongodb.net/habit_tracker
JWT_SECRET=dfa894b58d0fed24e6432940a16f03440676d52f52c98baa0d6d4733f6410935
NODE_ENV=production
PORT=3001
CLIENT_URL=https://your-project-name.vercel.app
```

Replace `your-project-name` with your actual Vercel project name.

## 🚀 Deployment Steps

1. **Commit & Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure Vercel deployment"
   git push
   ```

2. **In Vercel Dashboard:**
   - Go to **Settings → Environment Variables**
   - Add the backend environment variables above
   - Redeploy the project

## ✅ What's Configured

- **Frontend:** Deployed at `/` (root)
- **Backend:** Deployed at `/_/backend`
- **CORS:** Configured to allow frontend to communicate with backend
- **API Routes:** Frontend automatically uses `/_/backend/api` in production

## 📝 Project Structure

```
frontend/          → Runs at / on Vercel
backend/           → Runs at /_/backend on Vercel
vercel.json        → Multi-service configuration
```

## 🔗 After Deployment

- **Frontend URL:** `https://your-project-name.vercel.app`
- **Backend URL:** `https://your-project-name.vercel.app/_/backend`
- **API Calls:** `//_/backend/api` (relative path, handled automatically)

## ⚠️ Important Notes

- MongoDB is only accessible from your IP, ensure Vercel's IP is added to MongoDB Atlas Network Access
- Keep `JWT_SECRET` secure and unique for production
- Don't commit `.env` files with sensitive data to GitHub
