<template>
  <div class="habit-list">
    <div v-if="habits.length === 0" class="empty-state">
      <h3>No habits yet</h3>
      <p>Create your first habit to start tracking streaks and progress.</p>
    </div>

    <HabitCard
      v-for="habit in habits"
      :key="habit._id"
      :habit="habit"
      @mark-done="$emit('mark-done', $event)"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      @skip-day="$emit('skip-day', $event)"
      @open="$emit('open', $event)"
      @reminder="$emit('reminder', $event)"
    />
  </div>
</template>

<script setup>
import HabitCard from "./HabitCard.vue";

defineProps({
  habits: {
    type: Array,
    required: true,
  },
});

defineEmits(['mark-done', 'edit', 'delete', 'skip-day', 'open', 'reminder'])
</script>
