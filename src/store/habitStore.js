import { defineStore } from 'pinia'
import {
  formatLocalDate,
  recalculateStreak,
  sortDatesAscending,
} from '../utils/date'

const STORAGE_KEY = 'habit-tracker-v1'

function createHabitId(habits) {
  return habits.length === 0 ? 1 : Math.max(...habits.map((habit) => habit.id)) + 1
}

function loadHabits() {
  if (typeof window === 'undefined') {
    return []
  }

  const rawHabits = window.localStorage.getItem(STORAGE_KEY)

  if (!rawHabits) {
    return []
  }

  try {
    const parsedHabits = JSON.parse(rawHabits)

    return parsedHabits.map((habit) => ({
      ...habit,
      history: sortDatesAscending(habit.history ?? []),
      streak: recalculateStreak(habit.history ?? []),
    }))
  } catch {
    return []
  }
}

function persistHabits(habits) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
}

export const useHabitStore = defineStore('habits', {
  state: () => ({
    habits: loadHabits(),
  }),
  getters: {
    totalHabits: (state) => state.habits.length,
    completedTodayCount: (state) => {
      const today = formatLocalDate()

      return state.habits.filter((habit) => habit.history.includes(today)).length
    },
    activeStreakCount: (state) => {
      if (state.habits.length === 0) {
        return 0
      }

      return state.habits.reduce((highestStreak, habit) => {
        return Math.max(highestStreak, habit.streak)
      }, 0)
    },
    completionRate: (state) => {
      if (state.habits.length === 0) {
        return 0
      }

      const completedHabits = state.habits.filter((habit) => habit.history.length > 0).length

      return Math.round((completedHabits / state.habits.length) * 100)
    },
  },
  actions: {
    syncStorage() {
      persistHabits(this.habits)
    },
    addHabit(payload) {
      const nextHabit = {
        id: createHabitId(this.habits),
        name: payload.name.trim(),
        description: payload.description.trim(),
        streak: 0,
        history: [],
      }

      this.habits.unshift(nextHabit)
      this.syncStorage()
    },
    updateHabit(habitId, payload) {
      this.habits = this.habits.map((habit) => {
        if (habit.id !== habitId) {
          return habit
        }

        return {
          ...habit,
          name: payload.name.trim(),
          description: payload.description.trim(),
        }
      })

      this.syncStorage()
    },
    deleteHabit(habitId) {
      this.habits = this.habits.filter((habit) => habit.id !== habitId)
      this.syncStorage()
    },
    markHabitAsDone(habitId) {
      const today = formatLocalDate()

      this.habits = this.habits.map((habit) => {
        if (habit.id !== habitId || habit.history.includes(today)) {
          return habit
        }

        const history = sortDatesAscending([...habit.history, today])

        return {
          ...habit,
          history,
          streak: recalculateStreak(history),
        }
      })

      this.syncStorage()
    },
    seedDemoHabits() {
      if (this.habits.length > 0) {
        return
      }

      const today = formatLocalDate()
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

      const habitHistory = [formatLocalDate(twoDaysAgo), formatLocalDate(yesterday), today]

      this.habits = [
        {
          id: 1,
          name: 'Exercise',
          description: 'Workout daily for at least 20 minutes.',
          streak: recalculateStreak(habitHistory),
          history: habitHistory,
        },
        {
          id: 2,
          name: 'Read',
          description: 'Read one chapter before bed.',
          streak: 0,
          history: [],
        },
      ]

      this.syncStorage()
    },
  },
})
