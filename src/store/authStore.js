import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../services/authAPI.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const isReady = ref(false)
  const profile = ref({
    name: '',
    phone: '',
    bio: '',
  })
  const lastLoginAt = ref('')
  let initPromise = null

  const isAuthenticated = computed(() => user.value !== null && token.value !== null)

  const getUserIdentifier = () => {
    return user.value?.id || user.value?._id || user.value?.email || 'guest'
  }

  const getProfileStorageKey = () => `habit-profile-${getUserIdentifier()}`
  const getLastLoginStorageKey = () => `habit-last-login-${getUserIdentifier()}`

  const loadProfile = () => {
    const defaultProfile = {
      name: user.value?.email?.split('@')[0] || '',
      phone: '',
      bio: '',
    }

    try {
      const rawProfile = localStorage.getItem(getProfileStorageKey())
      const parsedProfile = rawProfile ? JSON.parse(rawProfile) : {}
      profile.value = {
        ...defaultProfile,
        ...parsedProfile,
      }
    } catch (storageError) {
      profile.value = defaultProfile
      console.error('Failed to read profile from storage:', storageError)
    }
  }

  const loadLastLogin = () => {
    const storedTimestamp = localStorage.getItem(getLastLoginStorageKey())
    lastLoginAt.value = storedTimestamp || user.value?.createdAt || ''
  }

  const recordLastLogin = () => {
    const timestamp = new Date().toISOString()
    localStorage.setItem(getLastLoginStorageKey(), timestamp)
    lastLoginAt.value = timestamp
  }

  const updateProfile = (payload) => {
    profile.value = {
      ...profile.value,
      ...payload,
    }

    localStorage.setItem(getProfileStorageKey(), JSON.stringify(profile.value))
  }

  // Initialize from localStorage
  const initAuth = async () => {
    if (initPromise) {
      return initPromise
    }

    initPromise = (async () => {
      try {
        loading.value = true
        isReady.value = false
        const savedToken = localStorage.getItem('token')

        if (savedToken) {
          token.value = savedToken
          // Verify token by fetching current user
          try {
            const userData = await authAPI.getCurrentUser()
            user.value = userData
            loadProfile()
            loadLastLogin()
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
        isReady.value = true
      }
    })()

    return initPromise
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
      recordLastLogin()
      loadProfile()

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
      recordLastLogin()
      loadProfile()

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
      profile.value = {
        name: '',
        phone: '',
        bio: '',
      }
      lastLoginAt.value = ''
      localStorage.removeItem('token')
      loading.value = false
    }
  }

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      loading.value = true
      error.value = null

      return await authAPI.changePassword(currentPassword, newPassword, confirmPassword)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isReady,
    profile,
    lastLoginAt,
    isAuthenticated,
    initAuth,
    login,
    signup,
    logout,
    changePassword,
    updateProfile,
  }
})
