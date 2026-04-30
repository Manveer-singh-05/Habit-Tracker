<template>
  <div class="app-shell" :aria-busy="habitStore.loading">
    <Navbar @create="openCreateForm" @profile="openProfileModal" />

    <main class="page">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Personal habit dashboard</span>
          <h1>Track habits with a clean local-first dashboard.</h1>
          <p>
            Create habits, check them off once a day, and let streaks plus
            charts show where consistency is building.
          </p>
          <p class="hero-status" :class="dashboardState.tone">
            {{ dashboardState.label }}
          </p>
        </div>

        <div class="action-row">
          <button class="primary-button" type="button" @click="openCreateForm">
            Add a habit
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

        <article class="summary-card">
          <p class="summary-label">Completion rate</p>
          <p class="summary-value">{{ habitStore.completionRate }}%</p>
          <p class="summary-help">How many tracked habits have at least one check-in.</p>
        </article>
      </section>

      <Transition name="fade">
        <p v-if="habitStore.error" class="sync-banner danger">
          {{ habitStore.error }}
        </p>
      </Transition>

      <section class="layout-grid">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">Habits</h2>
              <p class="section-copy">
                Update one habit at a time and keep the list focused.
              </p>
              <p class="section-copy subtle">
                Showing {{ filteredHabits.length }} habit
                {{ filteredHabits.length === 1 ? 'item' : 'items' }} in this view.
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
      :saving="isSubmitting"
      @close="closeForm"
      @save="saveHabit"
    />

    <ProfileModal :isOpen="isProfileOpen" @close="isProfileOpen = false" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import AddHabitForm from "../components/AddHabitForm.vue";
import HabitList from "../components/HabitList.vue";
import Navbar from "../components/Navbar.vue";
import ProgressChart from "../components/ProgressChart.vue";
import ProfileModal from "../components/ProfileModal.vue";
import { useHabitStore } from "../store/habitStore";
import { formatLocalDate } from "../utils/date";

const habitStore = useHabitStore();
const filter = ref("all");
const isFormVisible = ref(false);
const isProfileOpen = ref(false);
const editingHabit = ref(null);
const isSubmitting = ref(false);

// Load habits on component mount
onMounted(() => {
  habitStore.loadHabits()
})

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

const dashboardState = computed(() => {
  if (habitStore.error) {
    return {
      label: habitStore.error,
      tone: "danger",
    };
  }

  if (habitStore.loading || isSubmitting.value) {
    return {
      label: "Saving your latest changes...",
      tone: "loading",
    };
  }

  return {
    label: `${habitStore.completedTodayCount} habits completed today · ${habitStore.completionRate}% completion rate`,
    tone: "ready",
  };
});

function openCreateForm() {
  editingHabit.value = null;
  isFormVisible.value = true;
}

function openProfileModal() {
  isProfileOpen.value = true;
}

function openEditForm(habit) {
  editingHabit.value = habit;
  isFormVisible.value = true;
}

function closeForm() {
  isFormVisible.value = false;
  editingHabit.value = null;
}

async function saveHabit(payload) {
  isSubmitting.value = true;

  try {
    if (editingHabit.value) {
      await habitStore.updateHabit(editingHabit.value._id, payload);
    } else {
      await habitStore.addHabit(payload);
    }

    closeForm();
  } finally {
    isSubmitting.value = false;
  }
}

async function markHabitAsDone(habitId) {
  await habitStore.markHabitAsDone(habitId);
}

async function deleteHabit(habitId) {
  if (window.confirm("Delete this habit? This cannot be undone.")) {
    await habitStore.deleteHabit(habitId);
  }
}

</script>
