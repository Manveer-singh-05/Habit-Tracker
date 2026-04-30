<template>
  <Transition name="fade-scale">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="floating-profile" @click.stop>
        <button class="close-button" type="button" @click="closeModal" aria-label="Close profile">
          ✕
        </button>

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
            <button class="action-button accent" type="button" @click="togglePasswordForm">
              {{ showPasswordForm ? 'Cancel Password Change' : 'Change Password' }}
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

            <button class="action-button primary" type="submit" :disabled="isSubmittingPassword">
              {{ isSubmittingPassword ? 'Updating...' : 'Update Password' }}
            </button>

            <p v-if="passwordMessage" :class="['password-message', passwordMessageType]">
              {{ passwordMessage }}
            </p>
          </form>
        </section>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '../store/authStore'

const authStore = useAuthStore()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const isEditing = ref(false)
const showPasswordForm = ref(false)
const isSubmittingPassword = ref(false)
const passwordMessage = ref('')
const passwordMessageType = ref('')

const draft = ref({
  name: '',
  phone: '',
  bio: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const displayName = computed(() => {
  return authStore.profile?.name || authStore.user?.email?.split('@')[0] || 'User'
})

const formattedLastLogin = computed(() => {
  if (!authStore.profile?.lastLogin) return 'Never'
  const date = new Date(authStore.profile.lastLogin)
  return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const closeModal = () => {
  isEditing.value = false
  showPasswordForm.value = false
  passwordMessage.value = ''
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  emit('close')
}

const toggleEdit = async () => {
  if (!isEditing.value) {
    draft.value = {
      name: authStore.profile?.name || '',
      phone: authStore.profile?.phone || '',
      bio: authStore.profile?.bio || ''
    }
    isEditing.value = true
  } else {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft.value),
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to update profile')

      const updatedProfile = await response.json()
      authStore.profile = updatedProfile
      isEditing.value = false
    } catch (error) {
      alert('Error updating profile: ' + error.message)
    }
  }
}

const togglePasswordForm = () => {
  showPasswordForm.value = !showPasswordForm.value
  if (!showPasswordForm.value) {
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  }
}

const submitPasswordChange = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = 'Passwords do not match'
    passwordMessageType.value = 'error'
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    passwordMessage.value = 'Password must be at least 6 characters'
    passwordMessageType.value = 'error'
    return
  }

  isSubmittingPassword.value = true
  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      }),
      credentials: 'include'
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to change password')
    }

    passwordMessage.value = 'Password updated successfully!'
    passwordMessageType.value = 'success'
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    setTimeout(() => {
      showPasswordForm.value = false
      passwordMessage.value = ''
    }, 2000)
  } catch (error) {
    passwordMessage.value = error.message
    passwordMessageType.value = 'error'
  } finally {
    isSubmittingPassword.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.floating-profile {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 550px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
  transition: all 0.3s ease;
}

.floating-profile:hover {
  box-shadow: 0 25px 80px rgba(37, 99, 235, 0.15), 
              0 0 30px rgba(124, 58, 237, 0.1);
}

.close-button {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  transition: transform 0.2s ease, color 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  hover: rgba(0, 0, 0, 0.05);
}

.close-button:hover {
  transform: rotate(90deg) scale(1.1);
  color: #000;
  background: rgba(0, 0, 0, 0.05);
}

.profile-card {
  padding-top: 1rem;
}

.profile-header {
  margin-bottom: 1.5rem;
}

.profile-header h1 {
  font-size: 1.75rem;
  margin: 0 0 0.5rem 0;
  color: #0f1d37;
}

.profile-header p {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.divider {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin: 1.5rem 0;
}

.profile-body {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.avatar-column {
  display: flex;
  justify-content: center;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  flex-shrink: 0;
}

.details-column p {
  margin: 0.75rem 0;
  color: #0f1d37;
  line-height: 1.6;
}

.details-column strong {
  color: #000;
  font-weight: 600;
}

.profile-input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  margin-top: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.profile-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.profile-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.action-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.action-button.primary {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
}

.action-button.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
}

.action-button.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-button.accent {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.action-button.accent:hover {
  background: rgba(37, 99, 235, 0.2);
  transform: translateY(-1px);
}

.password-form {
  background: rgba(37, 99, 235, 0.05);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  border-left: 4px solid #2563eb;
}

.password-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
}

.password-form label {
  display: block;
  color: #0f1d37;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.password-message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
}

.password-message.success {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.password-message.error {
  background: rgba(244, 63, 94, 0.1);
  color: #dc2626;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

/* Transitions */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 640px) {
  .floating-profile {
    width: 95%;
    max-height: 90vh;
    padding: 1.5rem;
  }

  .profile-header h1 {
    font-size: 1.5rem;
  }

  .profile-body {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .avatar-column {
    justify-content: flex-start;
  }

  .action-row {
    grid-template-columns: 1fr;
  }
}
</style>
