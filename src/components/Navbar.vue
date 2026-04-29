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
        <span v-if="userEmail" class="session-chip">{{ userEmail }}</span>
        <button class="profile-button" type="button" @click="goToProfile">
          <span class="profile-dot" aria-hidden="true"></span>
          Profile
        </button>
        <button class="primary-button" type="button" @click="$emit('create')">
          Add habit
        </button>
        <button class="logout-button" type="button" @click="handleLogout">
          Logout
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

defineEmits(["create"]);

const router = useRouter()
const authStore = useAuthStore()

const userEmail = computed(() => authStore.user?.email ?? '')

const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(20, 33, 61, 0.14);
  background: rgba(255, 255, 255, 0.78);
  color: #0f1d37;
  padding: 0.62rem 0.95rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.profile-button:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.95);
}

.profile-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.logout-button {
  background-color: #f43f5e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: #e11d48;
}
</style>
