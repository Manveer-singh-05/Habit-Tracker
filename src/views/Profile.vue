<template>
  <div class="profile-page">
    <main class="profile-wrap">
      <section class="profile-card">
        <div class="profile-header">
          <h1>User Profile</h1>
        </div>

        <div class="profile-body">
          <table class="profile-table">
            <tr>
              <td class="label">Name:</td>
              <td>
                <span v-if="!isEditing">{{ authStore.profile.name || displayName }}</span>
                <input
                  v-else
                  v-model.trim="draft.name"
                  class="profile-input"
                  type="text"
                  maxlength="40"
                  placeholder="Enter your name"
                />
              </td>
            </tr>
            <tr>
              <td class="label">Email:</td>
              <td>{{ authStore.user?.email || 'Not available' }}</td>
            </tr>
            <tr>
              <td class="label">Phone:</td>
              <td>
                <span v-if="!isEditing">{{ authStore.profile.phone || 'Not added' }}</span>
                <input
                  v-else
                  v-model.trim="draft.phone"
                  class="profile-input"
                  type="text"
                  maxlength="20"
                  placeholder="Enter phone number"
                />
              </td>
            </tr>
            <tr>
              <td class="label">Bio:</td>
              <td>
                <span v-if="!isEditing">{{ authStore.profile.bio || 'No bio yet' }}</span>
                <textarea
                  v-else
                  v-model.trim="draft.bio"
                  class="profile-input profile-textarea"
                  maxlength="160"
                  placeholder="Write a short bio"
                />
              </td>
            </tr>
            <tr>
              <td class="label">Last Login:</td>
              <td>{{ formattedLastLogin }}</td>
            </tr>
          </table>
        </div>

        <div class="action-row">
          <button class="action-button primary" type="button" @click="toggleEdit">
            {{ isEditing ? 'Save Profile' : 'Edit Profile' }}
          </button>
          <button class="action-button accent" type="button" @click="togglePasswordForm">
            {{ showPasswordForm ? 'Cancel Password Change' : 'Change Password' }}
          </button>
          <button class="action-button ghost" type="button" @click="goToDashboard">
            Back to Dashboard
          </button>
        </div>

        <form v-if="showPasswordForm" class="password-form" @submit.prevent="submitPasswordChange">
          <div class="password-grid">
            <label>
              Current Password
              <input
                v-model="passwordForm.currentPassword"
                class="profile-input"
                type="password"
                autocomplete="current-password"
                required
              />
            </label>

            <label>
              New Password
              <input
                v-model="passwordForm.newPassword"
                class="profile-input"
                type="password"
                autocomplete="new-password"
                minlength="6"
                required
              />
            </label>

            <label>
              Confirm New Password
              <input
                v-model="passwordForm.confirmPassword"
                class="profile-input"
                type="password"
                autocomplete="new-password"
                minlength="6"
                required
              />
            </label>
          </div>

          <button class="action-button primary" type="submit" :disabled="authStore.loading">
            {{ authStore.loading ? 'Updating...' : 'Update Password' }}
          </button>
        </form>

        <p v-if="passwordMessage" class="helper-note">{{ passwordMessage }}</p>
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
const showPasswordForm = ref(false)
const passwordMessage = ref('')
const draft = reactive({
  name: '',
  phone: '',
  bio: '',
})
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
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

const resetPasswordForm = () => {
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const togglePasswordForm = () => {
  showPasswordForm.value = !showPasswordForm.value
  passwordMessage.value = ''

  if (!showPasswordForm.value) {
    resetPasswordForm()
  }
}

const submitPasswordChange = async () => {
  passwordMessage.value = ''

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordMessage.value = 'New password and confirm password do not match.'
    return
  }

  try {
    const response = await authStore.changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
      passwordForm.confirmPassword,
    )
    passwordMessage.value = response.message || 'Password changed successfully.'
    resetPasswordForm()
    showPasswordForm.value = false
  } catch (error) {
    passwordMessage.value = error.message || 'Failed to change password.'
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.profile-wrap {
  max-width: 800px;
  margin: 0 auto;
}

.profile-card {
  background: #ffffff;
  border: 1px solid #ccc;
  padding: 20px;
  margin-bottom: 20px;
}

.profile-header h1 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 28px;
  font-weight: bold;
  border-bottom: 2px solid #2563eb;
  padding-bottom: 10px;
}

.profile-body {
  width: 100%;
}

.profile-table {
  width: 100%;
  border-collapse: collapse;
}

.profile-table tr {
  border-bottom: 1px solid #ddd;
}

.profile-table td {
  padding: 12px;
  vertical-align: top;
}

.profile-table .label {
  font-weight: bold;
  color: #333;
  width: 120px;
  background-color: #f0f0f0;
}

.profile-table td:not(.label) {
  color: #555;
}

.profile-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #999;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.profile-textarea {
  min-height: 80px;
  resize: vertical;
}

.action-row {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-button {
  border: 1px solid #999;
  padding: 10px 15px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  background-color: #e0e0e0;
  color: #333;
}

.action-button.primary {
  background-color: #2563eb;
  color: white;
  border-color: #1e40af;
}

.action-button.accent {
  background-color: #7c3aed;
  color: white;
  border-color: #6d28d9;
}

.action-button.ghost {
  background-color: #f0f0f0;
  color: #333;
  border-color: #999;
}

.helper-note {
  margin-top: 10px;
  color: #555;
  font-weight: bold;
  padding: 10px;
  background-color: #fffacd;
  border: 1px solid #ddd;
}

.password-form {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
}

.password-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.password-grid label {
  display: block;
  color: #333;
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 3px;
}

@media (max-width: 768px) {
  .profile-table td,
  .profile-table .label {
    display: block;
    width: 100%;
  }

  .profile-table tr {
    display: block;
    margin-bottom: 10px;
  }
}
</style>
