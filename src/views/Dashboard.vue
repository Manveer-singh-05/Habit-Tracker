<template>
  <div class="app-shell">
    <Navbar @create="openCreateForm" @seed-demo="seedDemoHabits" />

    <main class="page">
      <section class="hero">
        <div class="hero-copy">
          <h1>Track habits with a clean local-first dashboard.</h1>
          <p>
            Create habits, check them off once a day, and let streaks plus
            charts show where consistency is building.
          </p>
        </div>

        <div class="action-row">
          <button class="primary-button" type="button" @click="openCreateForm">
            Add a habit
          </button>
          <button class="ghost-button" type="button" @click="seedDemoHabits">
            Use demo data
          </button>
        </div>
      </section>

      <section class="summary-grid" aria-label="Habit overview">
        <article class="summary-card">
          <p class="summary-label">Total habits</p>
          <p class="summary-value">{{ habitStore.totalHabits }}</p>
          <p class="summary-help">Everything you are currently tracking.</p>
        </article>

        <article class="summary-card">
          <p class="summary-label">Done today</p>
          <p class="summary-value">{{ habitStore.completedTodayCount }}</p>
          <p class="summary-help">Checked in before the day ends.</p>
        </article>

        <article class="summary-card">
          <p class="summary-label">Best streak</p>
          <p class="summary-value">{{ habitStore.activeStreakCount }}</p>
          <p class="summary-help">Your strongest consecutive run so far.</p>
        </article>
      </section>

      <section class="layout-grid">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">Habits</h2>
              <p class="section-copy">
                Update one habit at a time and keep the list focused.
              </p>
            </div>

            <div class="filters" role="tablist" aria-label="Habit filters">
              <button
                v-for="option in filterOptions"
                :key="option.value"
                class="filter-button"
                :class="{ active: filter === option.value }"
                type="button"
                @click="filter = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <HabitList
            :habits="filteredHabits"
            @mark-done="markHabitAsDone"
            @edit="openEditForm"
            @delete="deleteHabit"
          />
        </div>

        <aside class="panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">Progress</h2>
              <p class="section-copy">
                Daily completions update as soon as you check a habit in.
              </p>
            </div>
          </div>

          <ProgressChart :habits="habitStore.habits" />
          <p class="chart-note">
            Charts summarize all tracked habits, not just the filtered list.
          </p>
        </aside>
      </section>
    </main>

    <AddHabitForm
      v-if="isFormVisible"
      :habit="editingHabit"
      @close="closeForm"
      @save="saveHabit"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import AddHabitForm from "../components/AddHabitForm.vue";
import HabitList from "../components/HabitList.vue";
import Navbar from "../components/Navbar.vue";
import ProgressChart from "../components/ProgressChart.vue";
import { useHabitStore } from "../store/habitStore";
import { formatLocalDate } from "../utils/date";

const habitStore = useHabitStore();
const filter = ref("all");
const isFormVisible = ref(false);
const editingHabit = ref(null);

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Done today", value: "done" },
  { label: "Pending", value: "pending" },
];

const filteredHabits = computed(() => {
  const today = formatLocalDate();

  if (filter.value === "done") {
    return habitStore.habits.filter((habit) => habit.history.includes(today));
  }

  if (filter.value === "pending") {
    return habitStore.habits.filter((habit) => !habit.history.includes(today));
  }

  return habitStore.habits;
});

function openCreateForm() {
  editingHabit.value = null;
  isFormVisible.value = true;
}

function openEditForm(habit) {
  editingHabit.value = habit;
  isFormVisible.value = true;
}

function closeForm() {
  isFormVisible.value = false;
  editingHabit.value = null;
}

function saveHabit(payload) {
  if (editingHabit.value) {
    habitStore.updateHabit(editingHabit.value.id, payload);
  } else {
    habitStore.addHabit(payload);
  }

  closeForm();
}

function markHabitAsDone(habitId) {
  habitStore.markHabitAsDone(habitId);
}

function deleteHabit(habitId) {
  if (window.confirm("Delete this habit? This cannot be undone.")) {
    habitStore.deleteHabit(habitId);
  }
}

function seedDemoHabits() {
  habitStore.seedDemoHabits();
}
</script>
