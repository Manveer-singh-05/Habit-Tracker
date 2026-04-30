<template>
  <div v-if="isOpen" class="modal-backdrop" @click.self="close">
    <div class="modal-card reminder-modal">
      <div class="modal-head">
        <h2>{{ habitName }} - Set Reminder</h2>
        <button type="button" class="icon-button" @click="close" aria-label="Close modal">
          ✕
        </button>
      </div>

      <div class="modal-content">
        <!-- Enable/Disable Toggle -->
        <div class="form-group">
          <label class="toggle-label">
            <input
              v-model="localReminder.enabled"
              type="checkbox"
              class="toggle-input"
            />
            <span class="toggle-text">
              {{ localReminder.enabled ? 'Reminders enabled' : 'Reminders disabled' }}
            </span>
          </label>
        </div>

        <!-- Reminder Settings (shown only when enabled) -->
        <div v-if="localReminder.enabled" class="reminder-settings">
          <!-- Time Picker -->
          <div class="form-group">
            <label for="reminder-time" class="form-label">
              <span>Reminder time</span>
              <span class="label-hint">What time should we remind you?</span>
            </label>

            <div class="time-picker">
              <input
                id="reminder-time"
                v-model="localReminder.time"
                type="time"
                class="time-input"
              />

              <div class="quick-times">
                <button
                  v-for="time in commonTimes"
                  :key="time"
                  type="button"
                  class="quick-time-btn"
                  :class="{ active: localReminder.time === time }"
                  @click="localReminder.time = time"
                >
                  {{ formatQuickTime(time) }}
                </button>
              </div>
            </div>
          </div>

          <!-- Days Selector -->
          <div class="form-group">
            <label class="form-label">
              <span>Reminder days</span>
              <span class="label-hint">Which days should you be reminded?</span>
            </label>

            <div class="days-grid">
              <label v-for="day in daysOfWeek" :key="day" class="day-checkbox">
                <input
                  v-model="localReminder.days"
                  type="checkbox"
                  :value="day"
                  class="day-input"
                />
                <span class="day-label">{{ day.substring(0, 3) }}</span>
              </label>
            </div>

            <div class="quick-day-buttons">
              <button
                type="button"
                class="quick-day-btn"
                :class="{ active: isDailySelected }"
                @click="selectDaily"
              >
                Every day
              </button>
              <button
                type="button"
                class="quick-day-btn"
                :class="{ active: isWeekdaysSelected }"
                @click="selectWeekdays"
              >
                Weekdays
              </button>
              <button
                type="button"
                class="quick-day-btn"
                :class="{ active: isWeekendsSelected }"
                @click="selectWeekends"
              >
                Weekends
              </button>
            </div>
          </div>

          <!-- Notification Type -->
          <div class="form-group">
            <label for="notification-type" class="form-label">
              <span>Notification type</span>
              <span class="label-hint">How should we notify you?</span>
            </label>

            <select
              id="notification-type"
              v-model="localReminder.notificationType"
              class="form-select"
            >
              <option value="browser">Browser notification</option>
              <option value="both">Browser & visual indicator</option>
              <option value="none">Visual indicator only</option>
            </select>
          </div>

          <!-- Preview -->
          <div class="reminder-preview">
            <strong>Your reminder:</strong>
            <p>
              You'll be reminded
              <strong>{{ formatTime(localReminder.time) }}</strong>
              on
              <strong>{{ formatDays(localReminder.days) }}</strong>
            </p>
          </div>
        </div>

        <!-- No reminders message -->
        <div v-else class="reminder-disabled">
          <p>Enable reminders to stay consistent with this habit.</p>
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="modal-actions">
        <button type="button" class="ghost-button" @click="close">Cancel</button>
        <button type="button" class="primary-button" @click="save">
          {{ localReminder.enabled ? 'Save reminder' : 'Disable reminder' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { COMMON_REMINDER_TIMES, formatTime, formatDays } from '../utils/reminders'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  habitName: {
    type: String,
    default: 'Habit',
  },
  reminder: {
    type: Object,
    default: () => ({
      enabled: false,
      time: '09:00',
      days: [],
      notificationType: 'browser',
    }),
  },
})

const emit = defineEmits(['save', 'close'])

const localReminder = ref({ ...props.reminder })
const commonTimes = COMMON_REMINDER_TIMES

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const isDailySelected = computed(
  () => localReminder.value.days.length === 7 || localReminder.value.days.includes('daily')
)

const isWeekdaysSelected = computed(() => {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  return weekdays.every(day => localReminder.value.days.includes(day)) &&
         !localReminder.value.days.includes('Saturday') &&
         !localReminder.value.days.includes('Sunday')
})

const isWeekendsSelected = computed(() => {
  const weekends = ['Saturday', 'Sunday']
  return weekends.every(day => localReminder.value.days.includes(day)) &&
         !localReminder.value.days.includes('Monday') &&
         !localReminder.value.days.includes('Tuesday') &&
         !localReminder.value.days.includes('Wednesday') &&
         !localReminder.value.days.includes('Thursday') &&
         !localReminder.value.days.includes('Friday')
})

watch(() => props.reminder, (newReminder) => {
  localReminder.value = { ...newReminder }
}, { deep: true })

function selectDaily() {
  localReminder.value.days = daysOfWeek
}

function selectWeekdays() {
  localReminder.value.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
}

function selectWeekends() {
  localReminder.value.days = ['Saturday', 'Sunday']
}

function formatQuickTime(time) {
  const [hours, minutes] = time.split(':')
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(2000, 0, 1, hours, minutes))
}

function close() {
  emit('close')
}

function save() {
  emit('save', localReminder.value)
  close()
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  background: rgba(20, 33, 61, 0.42);
  padding: 16px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-card {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 28px;
  box-shadow: 0 40px 100px rgba(15, 23, 42, 0.16);
  max-width: 560px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border);
}

.modal-head h2 {
  margin: 0;
  font-size: 1.35rem;
  color: var(--text);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: grid;
  gap: 20px;
}

.form-group {
  display: grid;
  gap: 10px;
}

.form-label {
  display: grid;
  gap: 4px;
}

.form-label span:first-child {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text);
}

.label-hint {
  font-size: 0.82rem;
  color: var(--muted);
  font-weight: 400;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 12px;
  background: rgba(29, 78, 216, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(29, 78, 216, 0.08);
  transition: all 0.2s ease;
}

.toggle-label:hover {
  background: rgba(29, 78, 216, 0.08);
}

.toggle-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary);
}

.toggle-text {
  font-weight: 600;
  color: var(--text);
}

.reminder-settings {
  display: grid;
  gap: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 14px;
}

.time-picker {
  display: grid;
  gap: 12px;
}

.time-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
  cursor: pointer;
}

.time-input:focus {
  outline: 2px solid rgba(29, 78, 216, 0.45);
  outline-offset: 2px;
}

.quick-times {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 8px;
}

.quick-time-btn {
  padding: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 8px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text);
}

.quick-time-btn:hover {
  border-color: var(--primary);
  background: rgba(29, 78, 216, 0.08);
}

.quick-time-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  font-weight: 700;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.day-checkbox {
  position: relative;
  display: grid;
  place-items: center;
  gap: 4px;
  cursor: pointer;
}

.day-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.day-label {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 2px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  font-weight: 600;
  font-size: 0.82rem;
  transition: all 0.2s ease;
}

.day-checkbox .day-input:checked ~ .day-label {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.quick-day-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.quick-day-btn {
  padding: 8px 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text);
}

.quick-day-btn:hover {
  border-color: var(--primary);
  background: rgba(29, 78, 216, 0.08);
}

.quick-day-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  color: var(--text);
  font-size: 0.95rem;
  cursor: pointer;
}

.form-select:focus {
  outline: 2px solid rgba(29, 78, 216, 0.45);
  outline-offset: 2px;
}

.reminder-preview {
  padding: 12px;
  background: rgba(15, 157, 88, 0.08);
  border-radius: 10px;
  border-left: 3px solid var(--success);
  font-size: 0.88rem;
  line-height: 1.5;
}

.reminder-preview strong {
  color: var(--success);
  font-weight: 700;
}

.reminder-preview p {
  margin: 6px 0 0;
  color: var(--text);
}

.reminder-disabled {
  padding: 20px;
  text-align: center;
  color: var(--muted);
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid var(--border);
  justify-content: flex-end;
}

.primary-button,
.ghost-button {
  padding: 0.8rem 1.2rem;
  border-radius: 999px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-button {
  background: linear-gradient(135deg, var(--primary), #4f77ff);
  color: white;
  box-shadow: 0 12px 24px rgba(29, 78, 216, 0.24);
}

.primary-button:hover {
  transform: translateY(-1px);
}

.ghost-button {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

.ghost-button:hover {
  background: rgba(29, 78, 216, 0.08);
}

@media (max-width: 640px) {
  .modal-card {
    max-height: 90vh;
    border-radius: 20px;
  }

  .modal-head {
    padding: 18px;
  }

  .modal-head h2 {
    font-size: 1.15rem;
  }

  .modal-content {
    padding: 18px;
  }

  .days-grid {
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
  }

  .day-label {
    width: 35px;
    height: 35px;
    font-size: 0.75rem;
  }

  .quick-day-buttons {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .primary-button,
  .ghost-button {
    width: 100%;
  }
}
</style>
