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
        <button class="ghost-button" type="button" @click="$emit('seed-demo')">
          Load demo habits
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
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

defineEmits(["create", "seed-demo"]);

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
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
