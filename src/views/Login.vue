<template>
  <div class="login-container">
    <!-- Background image -->
    <div class="background-image"></div>
    
    <!-- Content -->
    <div class="content">
      <div class="login-card">
        <!-- Logo & Title -->
        <div class="header">
          <div class="logo">🎯</div>
          <h1>Habit Tracker</h1>
          <p>Build better habits, one day at a time</p>
        </div>

        <!-- Error Message -->
        <Transition name="fade">
          <div v-if="authStore.error || error" class="error-box">
            <p>{{ authStore.error || error }}</p>
            <button @click="clearError" class="close-btn">✕</button>
          </div>
        </Transition>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="form">
          <div class="form-group">
            <input
              v-model="email"
              type="email"
              placeholder="Email"
              required
              :disabled="authStore.loading"
              class="input"
            />
          </div>

          <div class="form-group">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              required
              :disabled="authStore.loading"
              class="input"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="toggle-btn"
              :disabled="authStore.loading"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>

          <button 
            type="submit" 
            class="btn-login"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <!-- Signup Link -->
        <div class="footer">
          <p>Don't have an account? 
            <router-link to="/signup" class="link">Sign Up</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const email = ref('')
const password = ref('')
const error = ref('')
const showPassword = ref(false)
const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  error.value = ''
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || 'Login failed'
  }
}

const clearError = () => {
  error.value = ''
  authStore.error = ''
}
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Background Image */
.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  z-index: 0;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Content */
.content {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Card */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  padding: 2.5rem 2rem;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.header h1 {
  margin: 0.5rem 0;
  font-size: 1.8rem;
  color: #667eea;
  font-weight: 700;
}

.header p {
  margin: 0;
  color: #999;
  font-size: 0.9rem;
}

/* Error Box */
.error-box {
  background: #fee;
  border-left: 4px solid #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-box p {
  margin: 0;
  color: #dc2626;
  font-size: 0.9rem;
  flex: 1;
}

.close-btn {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0 0 1rem;
}

.close-btn:hover {
  color: #b91c1c;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  position: relative;
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  color: #333;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  background: #fff;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input::placeholder {
  color: #999;
}

.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Password toggle button */
.toggle-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.toggle-btn:hover:not(:disabled) {
  transform: translateY(-50%) scale(1.2);
}

.toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Login Button */
.btn-login {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Footer */
.footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.footer p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    max-width: 100%;
    padding: 2rem 1.5rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .logo {
    font-size: 2.5rem;
  }
}
</style>
