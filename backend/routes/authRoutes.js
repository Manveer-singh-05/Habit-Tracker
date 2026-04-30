import express from 'express'
import { signup, login, logout, getCurrentUser, changePassword } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/signup', signup)
router.post('/login', login)

// Protected routes
router.post('/logout', authMiddleware, logout)
router.get('/me', authMiddleware, getCurrentUser)
router.put('/change-password', authMiddleware, changePassword)

export default router
