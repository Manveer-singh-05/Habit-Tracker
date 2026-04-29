<template>
  <article class="habit-card">
    <div class="card-top">
      <div>
        <h3 class="habit-name">{{ habit.name }}</h3>
        <p v-if="habit.description" class="habit-description">
          {{ habit.description }}
        </p>
      </div>

      <span class="chip">🔥 {{ habit.streak }} day streak</span>
    </div>

    <p class="meta">
      <strong>{{
        completedToday ? "Completed today" : "Not completed today"
      }}</strong>
      <span v-if="habit.history.length">
        · Last check-in {{ lastCheckIn }}</span
      >
    </p>

    <div class="card-actions">
      <button
        class="primary-button"
        type="button"
        :disabled="completedToday"
        @click="$emit('mark-done', habit._id)"
      >
        {{ completedToday ? "Done for today" : "Mark as done" }}
      </button>
      <button class="text-button" type="button" @click="$emit('edit', habit)">
        Edit
      </button>
      <button
        class="danger-button"
        type="button"
        @click="$emit('delete', habit._id)"
      >
        Delete
      </button>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";
import { formatLocalDate } from "../utils/date";

const props = defineProps({
  habit: {
    type: Object,
    required: true,
  },
});

defineEmits(["mark-done", "edit", "delete"]);

const completedToday = computed(() =>
  props.habit.history.includes(formatLocalDate()),
);

const lastCheckIn = computed(() => {
  if (props.habit.history.length === 0) {
    return "never";
  }

  return props.habit.history[props.habit.history.length - 1];
});
</script>
