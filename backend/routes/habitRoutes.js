import express from 'express'
import {
  createHabit,
  getHabits,
  getHabit,
  updateHabit,
  deleteHabit,
  markHabitDone,
  unmarkHabitDone,
  skipHabitDay,
  getHabitStats
} from '../controllers/habitController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// All habit routes require authentication
router.use(authMiddleware)

// Habit CRUD operations
router.post('/', createHabit)
router.get('/', getHabits)
router.get('/stats/summary', getHabitStats)
router.get('/:id', getHabit)
router.put('/:id', updateHabit)
router.delete('/:id', deleteHabit)

// Habit marking operations
router.post('/:id/mark-done', markHabitDone)
router.post('/:id/unmark-done', unmarkHabitDone)
router.post('/:id/skip-day', skipHabitDay)

export default router
