import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { habitsAPI } from '../services/habitsAPI.js'
import { formatLocalDate } from '../utils/date'

export const useHabitStore = defineStore('habits', () => {
  const habits = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalHabits = computed(() => habits.value.length)

  const completedTodayCount = computed(() => {
    const today = formatLocalDate()
    return habits.value.filter((habit) => habit.history.includes(today)).length
  })

  const activeStreakCount = computed(() => {
    if (habits.value.length === 0) return 0
    return Math.max(...habits.value.map(h => h.streak), 0)
  })

  const completionRate = computed(() => {
    if (habits.value.length === 0) return 0
    const completedHabits = habits.value.filter((habit) => habit.history.length > 0).length
    return Math.round((completedHabits / habits.value.length) * 100)
  })

  // Actions
  const loadHabits = async () => {
    try {
      loading.value = true
      error.value = null
      const data = await habitsAPI.getHabits()
      habits.value = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } catch (err) {
      error.value = err.message
      console.error('Failed to load habits:', err)
    } finally {
      loading.value = false
    }
  }

  const addHabit = async (payload) => {
    try {
      loading.value = true
      error.value = null
      const newHabit = await habitsAPI.createHabit(
        payload.name.trim(),
        payload.description?.trim() || ''
      )
      habits.value.unshift(newHabit)
      return newHabit
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateHabit = async (habitId, payload) => {
    try {
      loading.value = true
      error.value = null
      const updatedHabit = await habitsAPI.updateHabit(
        habitId,
        payload.name.trim(),
        payload.description?.trim() || ''
      )
      habits.value = habits.value.map((h) =>
        h._id === habitId ? updatedHabit : h
      )
      return updatedHabit
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteHabit = async (habitId) => {
    try {
      loading.value = true
      error.value = null
      await habitsAPI.deleteHabit(habitId)
      habits.value = habits.value.filter((h) => h._id !== habitId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const markHabitAsDone = async (habitId) => {
    try {
      loading.value = true
      error.value = null
      const updatedHabit = await habitsAPI.markHabitDone(habitId)
      habits.value = habits.value.map((h) =>
        h._id === habitId ? updatedHabit : h
      )
      return updatedHabit
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const unmarkHabitDone = async (habitId, date) => {
    try {
      loading.value = true
      error.value = null
      const updatedHabit = await habitsAPI.unmarkHabitDone(habitId, date)
      habits.value = habits.value.map((h) =>
        h._id === habitId ? updatedHabit : h
      )
      return updatedHabit
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const seedDemoHabits = async () => {
    try {
      loading.value = true
      error.value = null

      const demoHabits = [
        {
          name: 'Morning Jog',
          description: 'Run 5km every morning before breakfast'
        },
        {
          name: 'Read Book',
          description: 'Read at least 30 pages of a book'
        },
        {
          name: 'Meditation',
          description: 'Meditate for 15 minutes in the evening'
        }
      ]

      for (const habit of demoHabits) {
        await addHabit(habit)
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    habits,
    loading,
    error,

    // Getters
    totalHabits,
    completedTodayCount,
    activeStreakCount,
    completionRate,

    // Actions
    loadHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    markHabitAsDone,
    unmarkHabitDone,
    seedDemoHabits
  }
})
