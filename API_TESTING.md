# API Testing Examples

You can use these examples to test the authentication API with curl or Postman.

## Base URL

- Development: `http://localhost:5000`
- Production: Update to your deployed backend URL

---

## 1. Sign Up

**Endpoint:** `POST /api/auth/signup`

### cURL

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Response (201 Created)

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "newuser@example.com"
  }
}
```

---

## 2. Login

**Endpoint:** `POST /api/auth/login`

### cURL

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123"
  }'
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "newuser@example.com"
  }
}
```

---

## 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Authentication:** Requires JWT token in Authorization header

### cURL

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Response (200 OK)

```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "newuser@example.com",
    "createdAt": "2026-04-29T11:30:00.000Z"
  }
}
```

---

## 4. Logout

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Requires JWT token

### cURL

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "message": "Email and password are required"
}
```

### 401 Unauthorized

```json
{
  "message": "Invalid credentials"
}
```

### 401 Unauthorized (Invalid Token)

```json
{
  "message": "Invalid token"
}
```

---

## Postman Collection

You can import this into Postman:

```json
{
  "info": {
    "name": "Habit Tracker API",
    "description": "Authentication API endpoints"
  },
  "item": [
    {
      "name": "Sign Up",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"test@example.com\", \"password\": \"password123\", \"confirmPassword\": \"password123\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/signup",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "signup"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"email\": \"test@example.com\", \"password\": \"password123\"}"
        },
        "url": {
          "raw": "http://localhost:5000/api/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "login"]
        }
      }
    },
    {
      "name": "Get Current User",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer YOUR_TOKEN_HERE"
          }
        ],
        "url": {
          "raw": "http://localhost:5000/api/auth/me",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "me"]
        }
      }
    },
    {
      "name": "Logout",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer YOUR_TOKEN_HERE"
          }
        ],
        "url": {
          "raw": "http://localhost:5000/api/auth/logout",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "auth", "logout"]
        }
      }
    }
  ]
}
```

---

## Testing Workflow

1. **Sign Up** → Get token from response
2. **Copy token** into Authorization header for other requests
3. **Get Current User** → Verify token works
4. **Logout** → Token should still work but user session ends
5. **Try Get User again** → Token still valid but consider it as expired in frontend

---

## Tips

- Replace `YOUR_JWT_TOKEN_HERE` with actual token from signup/login response
- Tokens expire after 30 days
- Test with invalid credentials to verify error handling
- Use `-v` flag with curl to see all headers: `curl -v ...`
