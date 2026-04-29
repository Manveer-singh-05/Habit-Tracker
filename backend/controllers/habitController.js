import Habit from '../models/Habit.js'

// Calculate streak from history
const calculateStreak = (history) => {
  if (!history || history.length === 0) return 0

  const today = new Date()
  const sortedDates = history.sort()
  let streak = 0
  let currentDate = new Date(today)

  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const habitDate = new Date(sortedDates[i])
    const expectedDate = new Date(currentDate)

    // Check if dates match (ignoring time)
    if (
      habitDate.getFullYear() === expectedDate.getFullYear() &&
      habitDate.getMonth() === expectedDate.getMonth() &&
      habitDate.getDate() === expectedDate.getDate()
    ) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// @route   POST /api/habits
// @desc    Create a new habit
// @access  Private
export const createHabit = async (req, res) => {
  try {
    const { name, description } = req.body
    const userId = req.user.id

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Habit name is required' })
    }

    const habit = new Habit({
      userId,
      name,
      description: description || '',
      streak: 0,
      history: []
    })

    await habit.save()

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      habit
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route   GET /api/habits
// @desc    Get all habits for current user
// @access  Private
export const getHabits = async (req, res) => {
  try {
    const userId = req.user.id

    const habits = await Habit.find({ userId }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      habits
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route   GET /api/habits/:id
// @desc    Get a specific habit
// @access  Private
export const getHabit = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const habit = await Habit.findOne({ _id: id, userId })

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' })
    }

    res.status(200).json({
      success: true,
      habit
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route   PUT /api/habits/:id
// @desc    Update a habit
// @access  Private
export const updateHabit = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body
    const userId = req.user.id

    if (!name) {
      return res.status(400).json({ message: 'Habit name is required' })
    }

    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId },
      { name, description: description || '' },
      { new: true, runValidators: true }
    )

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Habit updated successfully',
      habit
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route   DELETE /api/habits/:id
// @desc    Delete a habit
// @access  Private
export const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const habit = await Habit.findOneAndDelete({ _id: id, userId })

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' })
    }

    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route   POST /api/habits/:id/mark-done
// @desc    Mark habit as done for today
// @access  Private
export const markHabitDone = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    const habit = await Habit.findOne({ _id: id, userId })

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' })
    }

    // Check if already marked today
    if (habit.history.includes(today)) {
      return res.status(400).json({ message: 'Habit already marked for today' })
    }

    // Add today to history
    habit.history.push(today)

    // Recalculate streak
    habit.streak = calculateStreak(habit.history)

    await habit.save()

    res.status(200).json({
      success: true,
      message: 'Habit marked as done',
      habit
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route   POST /api/habits/:id/unmark-done
// @desc    Unmark habit for a specific date
// @access  Private
export const unmarkHabitDone = async (req, res) => {
  try {
    const { id } = req.params
    const { date } = req.body
    const userId = req.user.id

    if (!date) {
      return res.status(400).json({ message: 'Date is required' })
    }

    const habit = await Habit.findOne({ _id: id, userId })

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' })
    }

    // Remove date from history
    habit.history = habit.history.filter(d => d !== date)

    // Recalculate streak
    habit.streak = calculateStreak(habit.history)

    await habit.save()

    res.status(200).json({
      success: true,
      message: 'Habit unmarked',
      habit
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @route   GET /api/habits/stats/summary
// @desc    Get habits statistics for current user
// @access  Private
export const getHabitStats = async (req, res) => {
  try {
    const userId = req.user.id

    const habits = await Habit.find({ userId })

    const today = new Date().toISOString().split('T')[0]
    const completedToday = habits.filter(h => h.history.includes(today)).length
    const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0

    const stats = {
      totalHabits: habits.length,
      completedToday,
      bestStreak,
      completionRate: habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0
    }

    res.status(200).json({
      success: true,
      stats
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
