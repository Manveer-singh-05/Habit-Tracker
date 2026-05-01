// API base URL - On Vercel, backend is at /_/backend/api
const API_BASE_URL = import.meta.env.PROD ? '/_/backend/api' : '/api'

export const habitsAPI = {
  // Create a new habit
  async createHabit(payload) {
    const response = await fetch(`${API_BASE_URL}/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create habit')
    }

    return data.habit
  },

  // Get all habits
  async getHabits() {
    const response = await fetch(`${API_BASE_URL}/habits`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch habits')
    }

    return data.habits
  },

  // Get a specific habit
  async getHabit(habitId) {
    const response = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch habit')
    }

    return data.habit
  },

  // Update a habit
  async updateHabit(habitId, payload) {
    const response = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update habit')
    }

    return data.habit
  },

  // Delete a habit
  async deleteHabit(habitId) {
    const response = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete habit')
    }

    return data
  },

  // Mark habit as done for today
  async markHabitDone(habitId) {
    const response = await fetch(`${API_BASE_URL}/habits/${habitId}/mark-done`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark habit as done')
    }

    return data.habit
  },

  // Skip habit for today
  async skipHabitDay(habitId) {
    const response = await fetch(`${API_BASE_URL}/habits/${habitId}/skip-day`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to skip habit day')
    }

    return data.habit
  },

  // Unmark habit for a specific date
  async unmarkHabitDone(habitId, date) {
    const response = await fetch(`${API_BASE_URL}/habits/${habitId}/unmark-done`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include',
      body: JSON.stringify({ date })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to unmark habit')
    }

    return data.habit
  },

  // Get habit statistics
  async getHabitStats() {
    const response = await fetch(`${API_BASE_URL}/habits/stats/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      credentials: 'include'
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch statistics')
    }

    return data.stats
  }
}
