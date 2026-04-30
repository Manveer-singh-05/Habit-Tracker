<template>
  <header class="nav-bar">
    <div class="nav-inner">
      <div class="brand">
        <div class="brand-mark">H</div>
        <div class="brand-copy">
          <h2>Habit Tracker</h2>
          <p>Build streaks, visualize progress, stay consistent.</p>
        </div>
      </div>

      <div class="nav-actions">
        <div v-if="userEmail" class="session-chip">
          <span class="status-indicator" aria-hidden="true"></span>
          <span class="email-text">{{ userEmail }}</span>
        </div>

        <button class="nav-button theme-button" type="button" @click="$emit('toggle-theme')" :title="darkMode ? 'Switch to light mode' : 'Switch to dark mode'">
          <span class="button-icon" aria-hidden="true">{{ darkMode ? '☀️' : '🌙' }}</span>
          <span class="button-label">{{ darkMode ? 'Light' : 'Dark' }}</span>
        </button>

        <button class="nav-button profile-button" type="button" @click="$emit('profile')" title="View profile">
          <span class="button-icon" aria-hidden="true">👤</span>
          <span class="button-label">Profile</span>
        </button>

        <button class="nav-button primary-button" type="button" @click="$emit('create')" title="Add a new habit">
          <span class="button-icon" aria-hidden="true">➕</span>
          <span class="button-label">Add habit</span>
        </button>

        <button class="nav-button logout-button" type="button" @click="handleLogout" title="Sign out">
          <span class="button-icon" aria-hidden="true">🚪</span>
          <span class="button-label">Logout</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

defineProps({
  darkMode: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['create', 'profile', 'toggle-theme'])

const router = useRouter()
const authStore = useAuthStore()

const userEmail = computed(() => authStore.user?.email ?? '')

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-bar {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.brand-mark {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #2563eb, #426dff);
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.brand-mark:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.brand-copy h2 {
  margin: 0;
  color: #111827;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.brand-copy p {
  margin: 0.25rem 0 0 0;
  color: #6b7280;
  font-size: 0.85rem;
  line-height: 1.3;
}

.nav-actions {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.session-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  background: #f3f4f6;
  color: #374151;
  padding: 0.6rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.session-chip:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  display: inline-block;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
  }
  50% {
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
  }
}

.email-text {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  padding: 0.65rem 1.1rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.button-icon {
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
}

.button-label {
  white-space: nowrap;
}

.profile-button {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.theme-button {
  background: #0f172a;
  color: white;
  border: 1px solid #0f172a;
}

.theme-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.22);
}

.profile-button:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
  transition: transform 0.2s ease, background-color 0.2s ease;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.profile-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.primary-button {
  background: linear-gradient(135deg, #2563eb, #426dff);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
}

.primary-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.logout-button {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.logout-button:hover {
  background: #fecaca;
  border-color: #f87171;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
}

.logout-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
}

@media (max-width: 768px) {
  .nav-inner {
    flex-direction: column;
    gap: 1rem;
  }

  .brand {
    width: 100%;
  }

  .nav-actions {
    width: 100%;
    justify-content: center;
  }

  .nav-button {
    flex: 1;
    min-width: 100px;
  }

  .theme-button {
    order: -1;
  }

  .email-text {
    max-width: none;
  }
}
</style>
