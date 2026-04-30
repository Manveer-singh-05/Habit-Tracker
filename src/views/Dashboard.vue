<template>
  <div class="app-shell" :aria-busy="habitStore.loading">
    <Navbar
      :dark-mode="isDarkMode"
      @create="openCreateForm"
      @profile="openProfileModal"
      @toggle-theme="toggleTheme"
    />

    <main class="page">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Personal habit dashboard</span>
          <h1>Track habits with a clean, interactive dashboard.</h1>
          <p>
            Create habits, check them off once a day, and use smart summaries
            to keep consistency visible.
          </p>
          <p class="hero-status" :class="dashboardState.tone">
            {{ dashboardState.label }}
          </p>
        </div>

        <div class="action-row">
          <button class="primary-button" type="button" @click="openCreateForm">
            Add a habit
          </button>
          <button class="ghost-button" type="button" @click="toggleTheme">
            {{ isDarkMode ? 'Light mode' : 'Dark mode' }}
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
          <p class="summary-help">Today’s completion rate across all habits.</p>
        </article>

        <article class="summary-card">
          <p class="summary-label">Longest streak ever</p>
          <p class="summary-value">{{ habitStore.longestStreakEver }}</p>
          <p class="summary-help">Your highest streak across the full list.</p>
        </article>
      </section>

      <section class="daily-summary">
        <div>
          <p class="summary-label">Daily summary</p>
          <h2>{{ habitStore.dailySummary }}</h2>
          <p>{{ habitStore.motivationalMessage }}</p>
        </div>
        <div class="daily-summary-meta">
          <p><strong>Last sync</strong></p>
          <p>{{ lastSyncLabel }}</p>
        </div>
      </section>

      <section class="gamification-grid">
        <article class="panel gamification-panel">
          <div class="panel-header gamification-head">
            <div>
              <h2 class="section-title">Gamification</h2>
              <p class="section-copy">Points, levels, badges, and progress.</p>
            </div>
            <button class="ghost-button" type="button" @click="exportCsv">
              Export CSV
            </button>
          </div>

          <div class="xp-layout">
            <div class="xp-ring" :style="{ '--progress': `${habitStore.xpProgress}%` }">
              <div>
                <strong>{{ habitStore.level }}</strong>
                <span>Level</span>
              </div>
            </div>

            <div class="xp-copy">
              <p class="xp-value">{{ habitStore.xpLabel }}</p>
              <p class="section-copy">Next level at {{ habitStore.nextLevelXp }} XP.</p>
              <div class="xp-bar" aria-hidden="true">
                <span :style="{ width: `${habitStore.xpProgress}%` }"></span>
              </div>
              <p class="xp-caption">{{ habitStore.xpProgress }} / 100 XP toward the next level.</p>
            </div>
          </div>

          <div class="badge-grid">
            <span
              v-for="badge in earnedBadges"
              :key="badge.label"
              class="badge-chip"
              :class="badge.tone"
            >
              {{ badge.label }}
            </span>
            <span v-if="earnedBadges.length === 0" class="badge-chip muted">
              Keep building to unlock badges.
            </span>
          </div>
        </article>

        <article class="panel insight-panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">Smart insights</h2>
              <p class="section-copy">Quick analytics from your tracked habits.</p>
            </div>
          </div>

          <div class="insight-list">
            <div class="insight-row">
              <span class="summary-label">Best day of week</span>
              <strong>{{ habitStore.bestDayOfWeek }}</strong>
            </div>
            <div class="insight-row">
              <span class="summary-label">Consistency trend</span>
              <strong>{{ habitStore.consistencyTrend }}</strong>
            </div>
            <div class="insight-row">
              <span class="summary-label">Total check-ins</span>
              <strong>{{ habitStore.totalCheckIns }}</strong>
            </div>
          </div>
        </article>
      </section>

      <Transition name="celebration">
        <div v-if="showConfetti" class="confetti-layer" aria-hidden="true">
          <span
            v-for="piece in confettiPieces"
            :key="piece.id"
            class="confetti-piece"
            :style="piece.style"
          ></span>
        </div>
      </Transition>

      <Transition name="fade">
        <p v-if="habitStore.error" class="sync-banner danger">
          {{ habitStore.error }}
        </p>
      </Transition>

      <HabitInsights :habits="habitStore.habits" />

      <section class="layout-grid">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2 class="section-title">Habits</h2>
              <p class="section-copy">
                Search, filter, and keep the list focused.
              </p>
              <p class="section-copy subtle">
                Showing {{ filteredHabits.length }} habit
                {{ filteredHabits.length === 1 ? 'item' : 'items' }} in this view.
              </p>
            </div>

            <div class="controls-stack">
              <label class="search-bar">
                <span>Search habits</span>
                <input
                  v-model.trim="searchQuery"
                  type="search"
                  placeholder="Search by name, note, or category"
                />
              </label>

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

              <div class="category-tabs" role="tablist" aria-label="Habit categories">
                <button
                  v-for="option in categoryOptions"
                  :key="option.value"
                  class="filter-button"
                  :class="{ active: selectedCategory === option.value }"
                  type="button"
                  @click="selectedCategory = option.value"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>

          <HabitList
            :habits="filteredHabits"
            @mark-done="markHabitAsDone"
            @skip-day="skipHabitDay"
            @edit="openEditForm"
            @delete="deleteHabit"
            @open="openHabitDetails"
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

    <button class="floating-add-button" type="button" @click="openCreateForm">
      <span aria-hidden="true">+</span>
      Add Habit
    </button>

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
import { computed, ref, onMounted, watch, onBeforeUnmount } from "vue";
import AddHabitForm from "../components/AddHabitForm.vue";
import HabitList from "../components/HabitList.vue";
import HabitInsights from "../components/HabitInsights.vue";
import Navbar from "../components/Navbar.vue";
import ProgressChart from "../components/ProgressChart.vue";
import ProfileModal from "../components/ProfileModal.vue";
import { useHabitStore } from "../store/habitStore";
import { formatLocalDate } from "../utils/date";
import { HABIT_CATEGORY_OPTIONS, resolveHabitCategory } from "../utils/habitMeta";
import { useRouter } from 'vue-router';

const habitStore = useHabitStore();
const router = useRouter();
const filter = ref("all");
const selectedCategory = ref("all");
const searchQuery = ref("");
const isDarkMode = ref(false);
const showConfetti = ref(false);
const confettiPieces = ref([]);
const wasFullyCompleted = ref(false);
const isFormVisible = ref(false);
const isProfileOpen = ref(false);
const editingHabit = ref(null);
const isSubmitting = ref(false);

// Load habits on component mount
onMounted(() => {
  habitStore.loadHabits();

  const savedTheme = localStorage.getItem('habit-theme');
  isDarkMode.value = savedTheme === 'dark';
  document.body.classList.toggle('dark-theme', isDarkMode.value);
});

onBeforeUnmount(() => {
  document.body.classList.remove('dark-theme');
});

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Done today", value: "done" },
  { label: "Pending", value: "pending" },
];

const categoryOptions = [
  { label: 'All categories', value: 'all' },
  ...HABIT_CATEGORY_OPTIONS.map((category) => ({ label: category, value: category })),
];

const earnedBadges = computed(() => habitStore.earnedBadges);

const filteredHabits = computed(() => {
  const today = formatLocalDate();
  const query = searchQuery.value.trim().toLowerCase();

  return habitStore.habits.filter((habit) => {
    const habitCategory = resolveHabitCategory(habit);
    const matchesStatus =
      filter.value === 'all'
        ? true
        : filter.value === 'done'
          ? habit.history.includes(today)
          : !habit.history.includes(today);
    const matchesCategory =
      selectedCategory.value === 'all' || habitCategory === selectedCategory.value;
    const haystack = `${habit.name ?? ''} ${habit.description ?? ''} ${habit.notes ?? ''} ${habitCategory}`.toLowerCase();
    const matchesSearch = !query || haystack.includes(query);

    return matchesStatus && matchesCategory && matchesSearch;
  });
});

const lastSyncLabel = computed(() => {
  if (!habitStore.lastSyncAt) {
    return 'Not synced yet';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(habitStore.lastSyncAt));
});

const dashboardState = computed(() => {
  if (habitStore.error) {
    return {
      label: habitStore.error,
      tone: 'danger',
    };
  }

  if (habitStore.loading || isSubmitting.value) {
    return {
      label: 'Saving your latest changes...',
      tone: 'loading',
    };
  }

  return {
    label: habitStore.dailySummary,
    tone: 'ready',
  };
});

watch(isDarkMode, (enabled) => {
  document.body.classList.toggle('dark-theme', enabled);
  localStorage.setItem('habit-theme', enabled ? 'dark' : 'light');
});

watch(
  () => [habitStore.completedTodayCount, habitStore.totalHabits],
  ([completedTodayCount, totalHabits]) => {
    const isFullyCompleted = totalHabits > 0 && completedTodayCount === totalHabits;

    if (isFullyCompleted && !wasFullyCompleted.value) {
      triggerCelebration();
    }

    wasFullyCompleted.value = isFullyCompleted;
  },
  { immediate: true },
);

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

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
}

function triggerCelebration() {
  confettiPieces.value = Array.from({ length: 28 }, (_, index) => ({
    id: `${Date.now()}-${index}`,
    style: {
      left: `${Math.random() * 100}%`,
      background: ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'][index % 5],
      animationDelay: `${Math.random() * 0.35}s`,
      '--x-drift': `${(Math.random() * 160 - 80).toFixed(0)}px`,
      '--spin': `${(Math.random() * 720 - 360).toFixed(0)}deg`,
    },
  }))

  showConfetti.value = true
  window.setTimeout(() => {
    showConfetti.value = false
  }, 1800)
}

function exportCsv() {
  if (!habitStore.habits.length) {
    return
  }

  const headers = [
    'Name',
    'Category',
    'Description',
    'Frequency',
    'Reminder Time',
    'Current Streak',
    'Best Streak',
    'Status',
    'Completed Dates',
    'Skipped Dates',
  ]

  const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

  const rows = habitStore.habits.map((habit) => [
    habit.name,
    resolveHabitCategory(habit),
    habit.description,
    habit.frequency || 'daily',
    habit.reminderTime || '',
    habit.streak ?? 0,
    habit.bestStreak ?? habit.streak ?? 0,
    habit.history?.includes(formatLocalDate()) ? 'Done today' : 'Pending',
    (habit.history || []).join(' | '),
    (habit.skippedDates || []).join(' | '),
  ])

  const csv = [headers.map(escapeCsv).join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = `habit-tracker-export-${new Date().toISOString().slice(0, 10)}.csv`
  anchor.click()
  URL.revokeObjectURL(url)
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

async function skipHabitDay(habitId) {
  await habitStore.skipHabitDay(habitId);
}

async function deleteHabit(habitId) {
  if (window.confirm("Delete this habit? This cannot be undone.")) {
    await habitStore.deleteHabit(habitId);
  }
}

function openHabitDetails(habitId) {
  router.push(`/habits/${habitId}`);
}

</script>
