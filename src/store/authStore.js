import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/authAPI.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => user.value !== null && token.value !== null)

  // Initialize from localStorage
  const initAuth = async () => {
    try {
      loading.value = true
      const savedToken = localStorage.getItem('token')
      
      if (savedToken) {
        token.value = savedToken
        // Verify token by fetching current user
        try {
          const userData = await authAPI.getCurrentUser()
          user.value = userData
        } catch (err) {
          // Token is invalid, clear it
          localStorage.removeItem('token')
          token.value = null
          error.value = 'Session expired. Please login again.'
        }
      }
    } catch (err) {
      console.error('Auth initialization failed:', err)
    } finally {
      loading.value = false
    }
  }

  const login = async (email, password) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authAPI.login(email, password)
      
      token.value = response.token
      user.value = response.user
      
      // Save token to localStorage
      localStorage.setItem('token', response.token)
      
      return response.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const signup = async (email, password, confirmPassword) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await authAPI.signup(email, password, confirmPassword)
      
      token.value = response.token
      user.value = response.user
      
      // Save token to localStorage
      localStorage.setItem('token', response.token)
      
      return response.user
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      await authAPI.logout()
    } catch (err) {
      console.error('Logout error:', err)
      // Continue with logout even if API call fails
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    initAuth,
    login,
    signup,
    logout
  }
})
