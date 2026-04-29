<template>
  <div class="profile-page">
    <main class="profile-wrap">
      <section class="profile-card">
        <div class="profile-header">
          <h1>Welcome, {{ displayName }} <span aria-hidden="true">👋</span></h1>
          <p>
            Manage your personal details, update profile information, and keep
            your account up to date all in one place.
          </p>
        </div>

        <hr class="divider" />

        <div class="profile-body">
          <div class="avatar-column">
            <div class="avatar-circle" aria-hidden="true">👤</div>
          </div>

          <div class="details-column">
            <p>
              <strong>Name:</strong>
              <span v-if="!isEditing">{{ authStore.profile.name || displayName }}</span>
              <input
                v-else
                v-model.trim="draft.name"
                class="profile-input"
                type="text"
                maxlength="40"
                placeholder="Enter your name"
              />
            </p>
            <p><strong>Email:</strong> {{ authStore.user?.email || 'Not available' }}</p>
            <p>
              <strong>Phone:</strong>
              <span v-if="!isEditing">{{ authStore.profile.phone || 'Not added' }}</span>
              <input
                v-else
                v-model.trim="draft.phone"
                class="profile-input"
                type="text"
                maxlength="20"
                placeholder="Enter phone number"
              />
            </p>
            <p>
              <strong>Bio:</strong>
              <span v-if="!isEditing">{{ authStore.profile.bio || 'No bio yet' }}</span>
              <textarea
                v-else
                v-model.trim="draft.bio"
                class="profile-input profile-textarea"
                maxlength="160"
                placeholder="Write a short bio"
              />
            </p>
            <p><strong>Last Login:</strong> {{ formattedLastLogin }}</p>
          </div>
        </div>

        <div class="action-row">
          <button class="action-button primary" type="button" @click="toggleEdit">
            {{ isEditing ? 'Save Profile' : 'Edit Profile' }}
          </button>
          <button class="action-button accent" type="button" @click="showPasswordHint = !showPasswordHint">
            Change Password
          </button>
          <button class="action-button ghost" type="button" @click="goToDashboard">
            Back to Dashboard
          </button>
        </div>

        <p v-if="showPasswordHint" class="helper-note">
          Password change API is not connected yet. Use the same account email for now.
        </p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const router = useRouter()
const authStore = useAuthStore()

const isEditing = ref(false)
const showPasswordHint = ref(false)
const draft = reactive({
  name: '',
  phone: '',
  bio: '',
})

watch(
  () => authStore.profile,
  (nextProfile) => {
    draft.name = nextProfile.name || ''
    draft.phone = nextProfile.phone || ''
    draft.bio = nextProfile.bio || ''
  },
  { immediate: true, deep: true },
)

const displayName = computed(() => {
  if (authStore.profile.name) {
    return authStore.profile.name
  }

  const email = authStore.user?.email || ''
  if (!email.includes('@')) {
    return 'User'
  }

  return email.split('@')[0]
})

const formattedLastLogin = computed(() => {
  if (!authStore.lastLoginAt) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(authStore.lastLoginAt))
})

const toggleEdit = () => {
  if (!isEditing.value) {
    isEditing.value = true
    return
  }

  authStore.updateProfile({
    name: draft.name,
    phone: draft.phone,
    bio: draft.bio,
  })
  isEditing.value = false
}

const goToDashboard = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 22px;
  background-image:
    linear-gradient(rgba(5, 12, 23, 0.58), rgba(5, 12, 23, 0.58)),
    url('/auth-background.jpg');
  background-size: cover;
  background-position: center;
}

.profile-wrap {
  width: min(980px, 100%);
}

.profile-card {
  background: rgba(110, 154, 205, 0.33);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 26px;
  padding: clamp(1.25rem, 2vw, 2rem);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.25);
}

.profile-header h1 {
  margin: 0;
  color: #0b162d;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
}

.profile-header p {
  margin: 0.9rem 0 0;
  color: rgba(11, 22, 45, 0.76);
  max-width: 62ch;
  line-height: 1.5;
  font-size: 1.22rem;
}

.divider {
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.24);
  margin: 1.65rem 0;
}

.profile-body {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 22px;
  align-items: start;
}

.avatar-column {
  display: flex;
  justify-content: center;
}

.avatar-circle {
  width: 152px;
  height: 152px;
  border-radius: 999px;
  border: 5px solid rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.26);
  display: grid;
  place-items: center;
  font-size: 4rem;
}

.details-column p {
  margin: 0 0 1rem;
  color: #0f1d37;
  font-size: 1.55rem;
  line-height: 1.4;
}

.details-column strong {
  color: #0a1428;
}

.profile-input {
  width: min(460px, 100%);
  margin-top: 0.45rem;
  display: block;
  border-radius: 12px;
  border: 1px solid rgba(15, 29, 55, 0.24);
  background: rgba(255, 255, 255, 0.64);
  padding: 0.75rem 0.9rem;
  font-size: 1rem;
  color: #0f1d37;
}

.profile-textarea {
  min-height: 96px;
  resize: vertical;
}

.action-row {
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.action-button {
  border: 0;
  border-radius: 14px;
  padding: 0.82rem 1.4rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
}

.action-button.primary {
  background: linear-gradient(135deg, #2563eb, #426dff);
  color: white;
}

.action-button.accent {
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  color: white;
}

.action-button.ghost {
  background: rgba(255, 255, 255, 0.66);
  color: #0f1d37;
}

.helper-note {
  margin-top: 0.85rem;
  color: #0f1d37;
  font-weight: 600;
}

@media (max-width: 768px) {
  .profile-body {
    grid-template-columns: 1fr;
  }

  .avatar-column {
    justify-content: flex-start;
  }
}
</style>
