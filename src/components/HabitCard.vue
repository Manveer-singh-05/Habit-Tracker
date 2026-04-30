<template>
  <article class="habit-card" role="button" tabindex="0" @click="$emit('open', habit._id)" @keyup.enter="$emit('open', habit._id)">
    <div class="card-top">
      <div class="habit-heading">
        <div class="habit-icon" aria-hidden="true">{{ habitIcon }}</div>
        <div>
          <h3 class="habit-name">{{ habit.name }}</h3>
          <p class="habit-description">
            {{ habit.description || 'No description added yet.' }}
          </p>
        </div>
      </div>

      <span class="chip">{{ habitCategory }} · {{ statusLabel }}</span>
    </div>

    <div class="habit-stats">
      <div class="habit-stat">
        <span class="stat-label">Current streak</span>
        <span class="stat-value">{{ currentStreak }} days</span>
      </div>
      <div class="habit-stat">
        <span class="stat-label">Best streak</span>
        <span class="stat-value">{{ bestStreak }} days</span>
      </div>
      <div class="habit-stat">
        <span class="stat-label">Completion</span>
        <span class="stat-value">{{ completionPercentage }}%</span>
      </div>
      <div class="habit-stat">
        <span class="stat-label">Last completed</span>
        <span class="stat-value">{{ lastCompletedAt }}</span>
      </div>
    </div>

    <p class="meta">
      <strong>{{ statusLabel }}</strong>
      <span> · Frequency {{ habit.frequency || 'daily' }}</span>
      <span v-if="reminderStatus" class="reminder-meta">{{ reminderStatus }}</span>
    </p>

    <p v-if="habit.notes" class="habit-notes">{{ habit.notes }}</p>

    <div class="card-actions">
      <button
        class="primary-button"
        type="button"
        :disabled="completedToday"
        @click.stop="$emit('mark-done', habit._id)"
      >
        {{ completedToday ? "Done for today" : "Mark as done" }}
      </button>
      <button class="text-button" type="button" @click.stop="$emit('skip-day', habit._id)">
        Skip day
      </button>
      <button
        class="text-button"
        type="button"
        :class="{ active: reminderEnabled }"
        @click.stop="$emit('reminder', habit)"
      >
        ⏰ {{ reminderEnabled ? 'Edit reminder' : 'Set reminder' }}
      </button>
      <button class="text-button" type="button" @click.stop="$emit('edit', habit)">
        Edit
      </button>
      <button
        class="danger-button"
        type="button"
        @click.stop="$emit('delete', habit._id)"
      >
        Delete
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { daysBetween, formatLocalDate, parseLocalDate } from "../utils/date";
import { formatDisplayDate, resolveHabitCategory, resolveHabitIcon } from "../utils/habitMeta";
import { getReminderInfo } from "../utils/reminders";

const props = defineProps({
  habit: {
    type: Object,
    required: true,
  },
});

defineEmits(["mark-done", "edit", "delete", "skip-day", "open", "reminder"]);

const habitIcon = computed(() => resolveHabitIcon(props.habit));
const habitCategory = computed(() => resolveHabitCategory(props.habit));

const completedToday = computed(() =>
  props.habit.history.includes(formatLocalDate()),
);

const currentStreak = computed(() => props.habit.streak ?? 0);

const bestStreak = computed(() => props.habit.bestStreak ?? props.habit.streak ?? 0);

const statusLabel = computed(() =>
  completedToday.value ? 'Done today' : 'Pending',
);

const completionPercentage = computed(() => {
  const createdDate = props.habit.createdAt ? formatLocalDate(new Date(props.habit.createdAt)) : formatLocalDate();
  const daysActive = Math.max(daysBetween(formatLocalDate(), createdDate) + 1, 1);

  return Math.min(100, Math.round(((props.habit.history.length || 0) / daysActive) * 100));
});

const lastCompletedAt = computed(() => {
  if (!props.habit.history.length) {
    return 'Never';
  }

  const lastDate = props.habit.history[props.habit.history.length - 1];
  return formatDisplayDate(parseLocalDate(lastDate));
});

const reminderEnabled = computed(() => props.habit.reminder?.enabled ?? false);

const reminderStatus = computed(() => {
  if (!reminderEnabled.value) return null;
  const info = getReminderInfo(props.habit);
  return info.status;
});

function formatReminderTime(reminderTime) {
  if (!reminderTime) {
    return 'None';
  }

  const [hours, minutes] = reminderTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
</script>
