# Habit Tracker - Complete Setup Guide

This guide will help you set up the Habit Tracker application with MongoDB authentication.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (free tier available)
- Git (optional)

## 🚀 Quick Start

### Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or log in
3. Create a new project or use existing one
4. Click "Build a Cluster" and select the free tier
5. Wait for cluster to be deployed
6. Click "Connect" on your cluster
7. Select "Drivers" → "Node.js"
8. Copy the connection string
   - It will look like: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority`
9. Replace:
   - `<username>` with your database username
   - `<password>` with your database password
   - `<dbname>` with `habit_tracker`

### Step 2: Set Up Backend

```bash
# Navigate to backend directory
cd Habit-Tracker/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI
# Windows: Open with Notepad or VS Code
# Linux/Mac: nano .env or vim .env
```

Update `.env` with:

```
MONGODB_URI=mongodb+srv://your_username:your_password@your-cluster.mongodb.net/habit_tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here_make_it_long_and_random
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5174
```

**Generate a strong JWT_SECRET:**

```bash
# On Windows PowerShell:
node -e "[console.log(require('crypto').randomBytes(32).toString('hex'))]"

# On Linux/Mac:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Start Backend Server

```bash
# From Habit-Tracker/backend directory
npm run dev
```

You should see:

```
MongoDB Connected: your-cluster.mongodb.net
Server running on port 5000
```

### Step 4: Start Frontend (New Terminal)

```bash
# From Habit-Tracker directory
npm run dev
```

The frontend will be available at: `http://localhost:5174`

## 📁 Project Structure

```
Habit-Tracker/
├── backend/                    # Node.js + Express API
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── controllers/
│   │   └── authController.js  # Authentication logic
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── models/
│   │   └── User.js            # User schema
│   ├── routes/
│   │   └── authRoutes.js      # API routes
│   ├── server.js              # Main server file
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── src/                        # Vue.js Frontend
│   ├── components/
│   ├── views/
│   │   ├── Login.vue          # Login page
│   │   ├── Signup.vue         # Signup page
│   │   └── Dashboard.vue      # Main app
│   ├── services/
│   │   └── authAPI.js         # API client
│   ├── store/
│   │   ├── authStore.js       # Authentication state
│   │   └── habitStore.js      # Habits state
│   ├── router/
│   │   └── index.js           # Route configuration
│   ├── App.vue
│   └── main.js
│
├── package.json
├── vite.config.js
└── README.md
```

## 🔑 How Authentication Works

1. **Sign Up**
   - User provides email and password
   - Password is hashed with bcryptjs
   - User is stored in MongoDB
   - JWT token is generated and returned
   - Token is saved in localStorage

2. **Login**
   - User provides email and password
   - Password is compared with stored hash
   - JWT token is generated and returned
   - Token is saved in localStorage

3. **Protected Routes**
   - Token is sent with each request in `Authorization` header
   - Backend verifies token with JWT secret
   - If valid, user can access dashboard
   - If invalid/expired, user is redirected to login

4. **Logout**
   - Token is removed from localStorage
   - User is redirected to login page

## 🧪 Testing the Application

### Create a Test Account

1. Open `http://localhost:5174`
2. Click "Sign Up"
3. Enter test email and password
4. Click "Sign Up"
5. You should be redirected to Dashboard

### Test Login/Logout

1. Click "Logout" button in navbar
2. You should see the Login page
3. Enter your test email and password
4. Click "Login"
5. You should be back at Dashboard

### Test Session Persistence

1. Refresh the page (F5)
2. You should stay logged in
3. Check browser DevTools → Application → LocalStorage to see your token

## 🛠️ Troubleshooting

### "Cannot connect to MongoDB"

- ✅ Check MongoDB URI in .env file
- ✅ Verify username and password are correct
- ✅ In MongoDB Atlas, go to Security → Network Access → Add IP Address
  - For development: Add `0.0.0.0/0` (allows all IPs)
  - For production: Add your specific server IP

### "CORS error" or "API not found"

- ✅ Make sure backend is running (`npm run dev` in backend folder)
- ✅ Check PORT is 5000 in .env
- ✅ Check vite.config.js has proxy setup for `/api`

### "Login fails with 401 error"

- ✅ Check credentials are correct
- ✅ Ensure JWT_SECRET in .env matches what's in backend
- ✅ Check user exists in MongoDB Atlas

### "Token expired"

- Tokens expire after 30 days
- User needs to login again
- This is normal security behavior

## 📦 Dependencies

**Backend (Node.js):**

- express: Web framework
- mongoose: MongoDB ODM
- bcryptjs: Password hashing
- jsonwebtoken: JWT tokens
- cors: Cross-origin requests
- dotenv: Environment variables

**Frontend (Vue.js):**

- vue: UI framework
- vue-router: Navigation
- pinia: State management
- chart.js: Charts and graphs

## 🔒 Security Notes

⚠️ **Before deploying to production:**

1. **Environment Variables**
   - Never commit `.env` file
   - Use different secrets for production
   - Use environment variables from your hosting provider

2. **HTTPS**
   - All production requests must be HTTPS
   - Update `CLIENT_URL` in backend .env

3. **CORS**
   - Set specific origin instead of `*`
   - Only allow your frontend domain

4. **JWT**
   - Use a long, random JWT_SECRET
   - Consider shorter expiration times (1 day)
   - Implement refresh tokens for longer sessions

5. **Rate Limiting**
   - Add rate limiting to prevent brute force attacks
   - Package: `express-rate-limit`

6. **Input Validation**
   - Validate all user inputs
   - Sanitize data before storing
   - Use `express-validator` for validation

## 📚 API Documentation

See [backend/README.md](backend/README.md) for detailed API endpoints documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## ❓ FAQ

**Q: Can I use this on my phone?**
A: Yes! The app is responsive. Access via your computer's IP address: `http://YOUR_IP:5174`

**Q: Where is my data stored?**
A: All habit data and user info is stored in MongoDB Atlas (free tier: 512MB storage)

**Q: Can I self-host MongoDB?**
A: Yes, but MongoDB Atlas is easier. You can also use a local MongoDB instance.

**Q: How do I deploy this?**
A: See deployment guides for Vercel (frontend) and Railway/Heroku (backend)

---

**Need help?** Check the individual README files:

- [Backend Setup](backend/README.md)
- [Frontend Setup](src/README.md)
