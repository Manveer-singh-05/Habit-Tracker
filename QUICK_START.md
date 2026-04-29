# 🚀 Quick Start - MongoDB Authentication Setup

## 1️⃣ MongoDB Atlas Setup (5 minutes)

```
1. Go to mongodb.com/cloud/atlas
2. Create account → Create cluster (free tier)
3. Create database user with password
4. Add your IP to Network Access (0.0.0.0/0 for dev)
5. Copy connection string
```

## 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/habit_tracker...
# JWT_SECRET=your_secret_key
npm run dev
# → Server running on port 5000 ✓
```

## 3️⃣ Frontend Setup (New Terminal)

```bash
# From Habit-Tracker directory
npm run dev
# → Frontend running on http://localhost:5174 ✓
```

## 4️⃣ Test It

- Open http://localhost:5174
- Sign up with test email
- Should redirect to dashboard
- Try logging out and back in
- Refresh page - should stay logged in

---

## 📊 Architecture

```
Frontend (Vue 3)           Backend (Express)        Database (MongoDB)
    ↓                           ↓                          ↓
[Login/Signup] → REST API → [Auth Routes] → bcrypt → [User Collection]
[Dashboard] ← JWT Token ← [JWT Verify]  ← Store ← [Persistent Data]
```

## 🔑 Key Files

**Backend:**

- `server.js` - Main server
- `models/User.js` - MongoDB schema
- `controllers/authController.js` - Auth logic
- `middleware/auth.js` - JWT verification
- `.env` - Configuration (git ignored)

**Frontend:**

- `src/services/authAPI.js` - API client
- `src/store/authStore.js` - Auth state
- `src/views/Login.vue` & `Signup.vue` - Auth pages
- `vite.config.js` - API proxy config

## 🐛 Troubleshooting

| Problem                     | Solution                                             |
| --------------------------- | ---------------------------------------------------- |
| "Cannot connect to MongoDB" | Check .env MONGODB_URI, verify IP whitelist in Atlas |
| "CORS error"                | Check backend is running on port 5000                |
| "Login fails"               | Verify user exists in MongoDB, check password        |
| "Token expired"             | Normal after 30 days, user must login again          |

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to random string
- [ ] Add IP whitelist in MongoDB (not 0.0.0.0/0 for production)
- [ ] Use HTTPS in production
- [ ] Add rate limiting (production)
- [ ] Validate all inputs (production)
- [ ] Use environment-specific configs

## 📞 Support

- Backend errors: Check `npm run dev` console
- Frontend errors: Check browser DevTools → Console
- API issues: Test with curl/Postman
- DB issues: Check MongoDB Atlas dashboard

---

**Total Setup Time: ~15 minutes**
