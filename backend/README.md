# Habit Tracker Backend

Node.js + Express + MongoDB authentication backend for the Habit Tracker application.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection details:

```
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/habit_tracker?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5174
```

### 3. Get Your MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign in to your account
3. Click on "Clusters" in the left sidebar
4. Click "Connect" on your cluster
5. Select "Drivers" → "Node.js"
6. Copy the connection string
7. Replace `<password>` and `<username>` with your actual credentials
8. Replace `dbname` with `habit_tracker`

### 4. Start the Server

**Development mode (with auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication Endpoints

#### Sign Up

```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  }
}
```

#### Logout

```
POST /api/auth/logout
Authorization: Bearer jwt_token_here
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get Current User

```
GET /api/auth/me
Authorization: Bearer jwt_token_here
```

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "createdAt": "2026-04-29T11:00:00.000Z"
  }
}
```

## File Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   └── User.js              # User schema
├── routes/
│   └── authRoutes.js        # Auth API routes
├── server.js                # Main server file
├── package.json
├── .env.example
└── .env                     # Your actual configuration (git ignored)
```

## Troubleshooting

### MongoDB Connection Failed

- Check your connection string in `.env`
- Verify your MongoDB user credentials
- Ensure your IP is whitelisted in MongoDB Atlas (0.0.0.0/0 for development)

### CORS Errors

- Check `CLIENT_URL` in `.env` matches your frontend URL
- Ensure `credentials: 'include'` in frontend API calls

### JWT Token Errors

- Generate a strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Token expires after 30 days

## Security Notes

⚠️ **Before deploying to production:**

1. Never commit `.env` file
2. Use a strong JWT_SECRET
3. Enable HTTPS
4. Set secure CORS origin
5. Use environment-specific configurations
6. Add rate limiting
7. Add input validation
8. Add logging and monitoring

---

For more information, see the [Frontend README](../README.md)
