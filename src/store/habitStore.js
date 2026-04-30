import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { habitsAPI } from '../services/habitsAPI.js'
import { formatLocalDate } from '../utils/date'
import { normalizeHabit } from '../utils/habitMeta'

export const useHabitStore = defineStore('habits', () => {
  const habits = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastSyncAt = ref(null)

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
    return Math.round((completedTodayCount.value / habits.value.length) * 100)
  })

  const longestStreakEver = computed(() => {
    if (habits.value.length === 0) return 0

    return Math.max(...habits.value.map((habit) => habit.bestStreak ?? habit.streak ?? 0), 0)
  })

  const totalCheckIns = computed(() =>
    habits.value.reduce((count, habit) => count + (habit.history?.length || 0), 0),
  )

  const xpPoints = computed(() => {
    const checkInXp = totalCheckIns.value * 20
    const streakXp = longestStreakEver.value * 10
    const completionBonus = completedTodayCount.value * 15

    return checkInXp + streakXp + completionBonus
  })

  const level = computed(() => Math.max(1, Math.floor(xpPoints.value / 100) + 1))

  const nextLevelXp = computed(() => level.value * 100)

  const xpProgress = computed(() => xpPoints.value % 100)

  const xpLabel = computed(() => `${xpPoints.value} XP`)

  const bestDayOfWeek = computed(() => {
    const dayCounts = new Map()

    for (const habit of habits.value) {
      for (const dateString of habit.history || []) {
        const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(`${dateString}T00:00:00`))
        dayCounts.set(day, (dayCounts.get(day) || 0) + 1)
      }
    }

    if (dayCounts.size === 0) {
      return 'Start tracking to reveal your best day.'
    }

    const [bestDay] = [...dayCounts.entries()].sort((left, right) => right[1] - left[1])[0]
    return `You are most consistent on ${bestDay}s.`
  })

  const consistencyTrend = computed(() => {
    if (habits.value.length === 0) {
      return 'Add habits to start tracking trends.'
    }

    const lastSevenDays = completedTodayCount.value
    const previousSevenDays = Math.max(totalCheckIns.value - lastSevenDays, 0)

    if (lastSevenDays > previousSevenDays) {
      return 'Your consistency is trending up.'
    }

    if (lastSevenDays === previousSevenDays) {
      return 'Your routine is steady.'
    }

    return 'Your recent activity slowed down a little.'
  })

  const earnedBadges = computed(() => {
    const badges = []

    if (longestStreakEver.value >= 7) {
      badges.push({ label: '7-day streak', tone: 'success' })
    }

    if (longestStreakEver.value >= 30) {
      badges.push({ label: '30-day streak', tone: 'gold' })
    }

    if (completionRate.value === 100 && totalHabits.value > 0) {
      badges.push({ label: 'Perfect day', tone: 'accent' })
    }

    if (totalCheckIns.value >= 25) {
      badges.push({ label: 'Momentum', tone: 'info' })
    }

    return badges
  })

  const dailySummary = computed(() => {
    return `You completed ${completedTodayCount.value} out of ${totalHabits.value} habits today.`
  })

  const motivationalMessage = computed(() => {
    if (totalHabits.value === 0) {
      return 'Add your first habit to start building momentum.'
    }

    if (completedTodayCount.value === 0) {
      return 'One check-in is enough to get the streak moving.'
    }

    if (completionRate.value === 100) {
      return 'Full completion today. That is strong consistency.'
    }

    if (completionRate.value >= 75) {
      return 'You are close to a full win today. Keep going.'
    }

    return 'Small wins still count. Keep the rhythm steady.'
  })

  const syncHabits = (data) => {
    habits.value = data.map((habit) => normalizeHabit(habit)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    lastSyncAt.value = new Date().toISOString()
  }

  // Actions
  const loadHabits = async () => {
    try {
      loading.value = true
      error.value = null
      const data = await habitsAPI.getHabits()
      syncHabits(data)
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
      const newHabit = normalizeHabit({
        ...(await habitsAPI.createHabit(payload)),
        ...payload,
      })
      habits.value.unshift(newHabit)
      lastSyncAt.value = new Date().toISOString()
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
      const updatedHabit = normalizeHabit({
        ...(await habitsAPI.updateHabit(habitId, payload)),
        ...payload,
      })
      habits.value = habits.value.map((h) =>
        h._id === habitId ? updatedHabit : h
      )
      lastSyncAt.value = new Date().toISOString()
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
      lastSyncAt.value = new Date().toISOString()
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
      const updatedHabit = normalizeHabit(await habitsAPI.markHabitDone(habitId))
      habits.value = habits.value.map((h) =>
        h._id === habitId ? updatedHabit : h
      )
      lastSyncAt.value = new Date().toISOString()
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
      const updatedHabit = normalizeHabit(await habitsAPI.unmarkHabitDone(habitId, date))
      habits.value = habits.value.map((h) =>
        h._id === habitId ? updatedHabit : h
      )
      lastSyncAt.value = new Date().toISOString()
      return updatedHabit
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const skipHabitDay = async (habitId) => {
    try {
      loading.value = true
      error.value = null
      const updatedHabit = normalizeHabit(await habitsAPI.skipHabitDay(habitId))
      habits.value = habits.value.map((h) =>
        h._id === habitId ? updatedHabit : h
      )
      lastSyncAt.value = new Date().toISOString()
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
          description: 'Run 5km every morning before breakfast',
          category: 'Fitness'
        },
        {
          name: 'Read Book',
          description: 'Read at least 30 pages of a book',
          category: 'Study'
        },
        {
          name: 'Meditation',
          description: 'Meditate for 15 minutes in the evening',
          category: 'Health'
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
    lastSyncAt,

    // Getters
    totalHabits,
    completedTodayCount,
    activeStreakCount,
    completionRate,
    longestStreakEver,
    totalCheckIns,
    xpPoints,
    xpLabel,
    level,
    nextLevelXp,
    xpProgress,
    bestDayOfWeek,
    consistencyTrend,
    earnedBadges,
    dailySummary,
    motivationalMessage,

    // Actions
    loadHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    markHabitAsDone,
    unmarkHabitDone,
    skipHabitDay,
    seedDemoHabits
  }
})
