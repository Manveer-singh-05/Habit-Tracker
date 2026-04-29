<template>
  <div class="signup-container">
    <!-- Background image -->
    <div class="background-image"></div>
    
    <!-- Content -->
    <div class="content">
      <div class="signup-card">
        <!-- Logo & Title -->
        <div class="header">
          <div class="logo">🎯</div>
          <h1>Join Us</h1>
          <p>Start building better habits today</p>
        </div>

        <!-- Error Message -->
        <Transition name="fade">
          <div v-if="authStore.error || error" class="error-box">
            <p>{{ authStore.error || error }}</p>
            <button @click="clearError" class="close-btn">✕</button>
          </div>
        </Transition>

        <!-- Signup Form -->
        <form @submit.prevent="handleSignup" class="form">
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
              type="password"
              placeholder="Password (6+ characters)"
              required
              :disabled="authStore.loading"
              class="input"
            />
          </div>

          <div class="form-group">
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              :disabled="authStore.loading"
              class="input"
            />
          </div>

          <button 
            type="submit" 
            class="btn-signup"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Creating account...' : 'Sign Up' }}
          </button>
        </form>

        <!-- Login Link -->
        <div class="footer">
          <p>Already have an account? 
            <router-link to="/login" class="link">Login</router-link>
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
const confirmPassword = ref('')
const error = ref('')
const router = useRouter()
const authStore = useAuthStore()

const handleSignup = async () => {
  error.value = ''
  try {
    await authStore.signup(email.value, password.value, confirmPassword.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || 'Signup failed'
  }
}

const clearError = () => {
  error.value = ''
  authStore.error = ''
}
</script>

<style scoped>
.signup-container {
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
  background-image:
    linear-gradient(rgba(6, 12, 24, 0.56), rgba(6, 12, 24, 0.56)),
    url('/auth-background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
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
.signup-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
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
  color: #ffffff;
  font-weight: 700;
}

.header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.84);
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
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 8px;
  font-size: 1rem;
  color: #ffffff;
  transition: all 0.3s ease;
}

.input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.24);
  border-color: rgba(255, 255, 255, 0.78);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.18);
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.78);
}

.input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Signup Button */
.btn-signup {
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

.btn-signup:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-signup:active:not(:disabled) {
  transform: translateY(0);
}

.btn-signup:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Footer */
.footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.footer p {
  margin: 0;
  color: rgba(255, 255, 255, 0.86);
  font-size: 0.9rem;
}

.link {
  color: #dbeafe;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.link:hover {
  color: #ffffff;
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
  .signup-card {
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
