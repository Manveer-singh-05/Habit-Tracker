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
      </div>
    </div>
  </header>
</template>

<script setup>
defineEmits(["create", "seed-demo"]);
</script>
