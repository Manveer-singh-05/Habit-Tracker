<template>
  <main class="details-page" :aria-busy="loading">
    <section v-if="error" class="sync-banner danger">
      {{ error }}
    </section>

    <section v-else-if="habit" class="details-shell">
      <div class="details-hero">
        <button class="ghost-button" type="button" @click="goBack">Back</button>
        <div class="details-hero-copy">
          <span class="eyebrow">{{ habit.category }}</span>
          <h1>{{ habit.name }}</h1>
          <p>{{ habit.description || 'No description added yet.' }}</p>
        </div>
        <div class="status-chip">{{ statusLabel }}</div>
      </div>

      <section class="details-grid">
        <article class="summary-card">
          <p class="summary-label">Current streak</p>
          <p class="summary-value">{{ habit.streak || 0 }}</p>
        </article>
        <article class="summary-card">
          <p class="summary-label">Best streak</p>
          <p class="summary-value">{{ habit.bestStreak || habit.streak || 0 }}</p>
        </article>
        <article class="summary-card">
          <p class="summary-label">Completion</p>
          <p class="summary-value">{{ completionPercentage }}%</p>
        </article>
        <article class="summary-card">
          <p class="summary-label">Last completed</p>
          <p class="summary-value">{{ lastCompletedLabel }}</p>
        </article>
      </section>

      <section class="details-panel">
        <div class="panel-head">
          <div>
            <h2 class="section-title">Smart insights</h2>
            <p class="section-copy">Lightweight insights based on the habit history.</p>
          </div>
        </div>

        <div class="insight-grid">
          <article class="insight-card">
            <p class="summary-label">Best day</p>
            <h3>{{ bestDayInsight }}</h3>
          </article>
          <article class="insight-card">
            <p class="summary-label">Consistency trend</p>
            <h3>{{ trendInsight }}</h3>
          </article>
          <article class="insight-card">
            <p class="summary-label">Reminder</p>
            <h3>{{ reminderInsight }}</h3>
          </article>
          <article class="insight-card">
            <p class="summary-label">Frequency</p>
            <h3>{{ habit.frequency || 'daily' }}</h3>
          </article>
        </div>
      </section>

      <section class="details-panel">
        <div class="panel-head">
          <div>
            <h2 class="section-title">Completion graph</h2>
            <p class="section-copy">A quick view of the last 30 days for this habit.</p>
          </div>
        </div>

        <div class="chart-wrap details-chart">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </section>

      <section class="details-panel">
        <div class="panel-head">
          <div>
            <h2 class="section-title">History</h2>
            <p class="section-copy">Full tracked dates for this habit.</p>
          </div>
        </div>

        <div v-if="historyEntries.length" class="history-list">
          <div v-for="entry in historyEntries" :key="entry.key" class="history-row">
            <div>
              <p class="history-date">{{ entry.label }}</p>
              <p class="history-subtext">{{ entry.type }}</p>
            </div>
            <span class="history-pill" :class="entry.typeClass">{{ entry.type }}</span>
          </div>
        </div>

        <p v-else class="section-copy">No history yet. Mark this habit as done to start building it.</p>
      </section>

      <section class="details-panel">
        <div class="panel-head">
          <div>
            <h2 class="section-title">Edit details</h2>
            <p class="section-copy">Update frequency, category, reminder, or notes.</p>
          </div>
        </div>

        <form class="details-form" @submit.prevent="saveDetails">
          <label class="field">
            <span>Name</span>
            <input v-model.trim="draft.name" type="text" maxlength="100" />
          </label>

          <label class="field">
            <span>Description</span>
            <textarea v-model.trim="draft.description" maxlength="500"></textarea>
          </label>

          <div class="field-grid">
            <label class="field">
              <span>Category</span>
              <select v-model="draft.category">
                <option v-for="category in categoryOptions" :key="category" :value="category">{{ category }}</option>
              </select>
            </label>

            <label class="field">
              <span>Frequency</span>
              <select v-model="draft.frequency">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
          </div>

          <div class="field-grid">
            <label class="field">
              <span>Reminder time</span>
              <input v-model="draft.reminderTime" type="time" />
            </label>

            <label class="field">
              <span>Notes</span>
              <input v-model.trim="draft.notes" type="text" maxlength="200" />
            </label>
          </div>

          <div class="form-actions">
            <button class="primary-button" type="submit" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save changes' }}
            </button>
            <button class="ghost-button" type="button" @click="markDone" :disabled="saving">
              Done for today
            </button>
            <button class="ghost-button" type="button" @click="skipDay" :disabled="saving">
              Skip day
            </button>
            <button class="danger-button" type="button" @click="deleteHabit" :disabled="saving">
              Delete
            </button>
          </div>
        </form>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import { habitsAPI } from '../services/habitsAPI'
import { useHabitStore } from '../store/habitStore'
import { formatLocalDate, parseLocalDate } from '../utils/date'
import { formatDisplayDate, normalizeHabit, resolveHabitCategory } from '../utils/habitMeta'

const route = useRoute()
const router = useRouter()
const habitStore = useHabitStore()

const habit = ref(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const chartCanvas = ref(null)
const chartInstance = ref(null)

const draft = reactive({
  name: '',
  description: '',
  category: 'Health',
  frequency: 'daily',
  reminderTime: '',
  notes: '',
})

const categoryOptions = ['Health', 'Study', 'Fitness']

async function loadHabit() {
  try {
    loading.value = true
    error.value = ''
    const data = await habitsAPI.getHabit(route.params.id)
    habit.value = normalizeHabit(data)
    syncDraft()
    renderChart()
  } catch (err) {
    error.value = err.message || 'Failed to load habit.'
  } finally {
    loading.value = false
  }
}

function syncDraft() {
  if (!habit.value) return

  draft.name = habit.value.name || ''
  draft.description = habit.value.description || ''
  draft.category = resolveHabitCategory(habit.value)
  draft.frequency = habit.value.frequency || 'daily'
  draft.reminderTime = habit.value.reminderTime || ''
  draft.notes = habit.value.notes || ''
}

const statusLabel = computed(() => {
  if (!habit.value) return 'Pending'
  return habit.value.history?.includes(formatLocalDate()) ? 'Done today' : 'Pending'
})

const completionPercentage = computed(() => {
  if (!habit.value) return 0
  const created = habit.value.createdAt ? formatLocalDate(new Date(habit.value.createdAt)) : formatLocalDate()
  const diff = parseLocalDate(formatLocalDate()) - parseLocalDate(created)
  const daysActive = Math.max(1, Math.round(diff / (24 * 60 * 60 * 1000)) + 1)
  return Math.min(100, Math.round(((habit.value.history?.length || 0) / daysActive) * 100))
})

const lastCompletedLabel = computed(() => {
  if (!habit.value?.history?.length) {
    return 'Never'
  }

  return formatDisplayDate(parseLocalDate(habit.value.history[habit.value.history.length - 1]))
})

const bestDayInsight = computed(() => {
  if (!habit.value?.history?.length) return 'Build a few check-ins first.'

  const counts = new Map()
  for (const dateString of habit.value.history) {
    const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(parseLocalDate(dateString))
    counts.set(weekday, (counts.get(weekday) || 0) + 1)
  }

  const [bestDay] = [...counts.entries()].sort((left, right) => right[1] - left[1])[0]
  return `You are most consistent on ${bestDay}s.`
})

const trendInsight = computed(() => {
  if (!habit.value?.history?.length) return 'Trend needs more history.'

  const today = parseLocalDate(formatLocalDate())
  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const twoWeeksAgo = new Date(today)
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const recentCount = habit.value.history.filter((dateString) => parseLocalDate(dateString) > oneWeekAgo).length
  const previousCount = habit.value.history.filter((dateString) => {
    const parsed = parseLocalDate(dateString)
    return parsed > twoWeeksAgo && parsed <= oneWeekAgo
  }).length

  if (recentCount > previousCount) return 'Your consistency is improving this week.'
  if (recentCount === previousCount) return 'Your rhythm is steady.'
  return 'Your streak has slowed recently. Try a quick reset.'
})

const reminderInsight = computed(() => habit.value?.reminderTime ? `Reminder set for ${habit.value.reminderTime}.` : 'No reminder set yet.')

const historyEntries = computed(() => {
  if (!habit.value) return []

  const history = [...(habit.value.history || [])].sort((left, right) => right.localeCompare(left))
  const skippedDates = new Set(habit.value.skippedDates || [])

  const completed = history.map((dateString) => ({
    key: dateString,
    label: formatDisplayDate(parseLocalDate(dateString)),
    type: 'Completed',
    typeClass: 'done',
  }))

  const skipped = [...skippedDates]
    .sort((left, right) => right.localeCompare(left))
    .map((dateString) => ({
      key: `skip-${dateString}`,
      label: formatDisplayDate(parseLocalDate(dateString)),
      type: 'Skipped',
      typeClass: 'skipped',
    }))

  return [...completed, ...skipped]
})

function renderChart() {
  if (!chartCanvas.value || !habit.value) return

  chartInstance.value?.destroy()

  const labels = Array.from({ length: 30 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - index))
    return formatLocalDate(date)
  })

  const history = new Set(habit.value.history || [])
  const skipped = new Set(habit.value.skippedDates || [])

  chartInstance.value = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Done',
          data: labels.map((date) => (history.has(date) ? 1 : 0)),
          backgroundColor: 'rgba(37, 99, 235, 0.75)',
          borderRadius: 10,
        },
        {
          label: 'Skipped',
          data: labels.map((date) => (skipped.has(date) ? 1 : 0)),
          backgroundColor: 'rgba(245, 158, 11, 0.65)',
          borderRadius: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            display: false,
          },
          grid: {
            display: false,
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  })
}

async function saveDetails() {
  if (!habit.value) return

  saving.value = true

  try {
    const updatedHabit = await habitStore.updateHabit(habit.value._id, { ...draft })
    habit.value = normalizeHabit(updatedHabit)
    syncDraft()
    renderChart()
  } finally {
    saving.value = false
  }
}

async function markDone() {
  if (!habit.value) return
  saving.value = true
  try {
    habit.value = normalizeHabit(await habitStore.markHabitAsDone(habit.value._id))
    syncDraft()
    renderChart()
  } finally {
    saving.value = false
  }
}

async function skipDay() {
  if (!habit.value) return
  saving.value = true
  try {
    habit.value = normalizeHabit(await habitStore.skipHabitDay(habit.value._id))
    syncDraft()
    renderChart()
  } finally {
    saving.value = false
  }
}

async function deleteHabit() {
  if (!habit.value) return
  if (!window.confirm('Delete this habit? This cannot be undone.')) return

  await habitStore.deleteHabit(habit.value._id)
  router.push('/dashboard')
}

function goBack() {
  router.back()
}

onMounted(loadHabit)
watch(
  () => route.params.id,
  () => loadHabit(),
)

onBeforeUnmount(() => {
  chartInstance.value?.destroy()
})
</script>

<style scoped>
.details-page {
  width: min(1180px, calc(100% - 32px));
  margin: 0 auto;
  padding: 24px 0 48px;
}

.details-shell {
  display: grid;
  gap: 18px;
}

.details-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(244, 247, 251, 0.92));
  border: 1px solid rgba(20, 33, 61, 0.1);
  box-shadow: var(--shadow);
}

.details-hero-copy {
  flex: 1;
}

.details-hero-copy h1 {
  margin: 6px 0 10px;
  font-size: clamp(2rem, 4vw, 3rem);
  letter-spacing: -0.03em;
}

.details-hero-copy p {
  margin: 0;
  color: var(--muted);
  max-width: 68ch;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.7rem 1rem;
  border-radius: 999px;
  background: rgba(29, 78, 216, 0.12);
  color: var(--primary-strong);
  font-weight: 700;
  white-space: nowrap;
}

.details-grid,
.insight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
}

.details-panel {
  padding: 20px;
  border-radius: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.insight-card {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(20, 33, 61, 0.08);
}

.insight-card h3 {
  margin: 8px 0 0;
  font-size: 1.02rem;
}

.details-chart {
  height: 300px;
}

.history-list {
  display: grid;
  gap: 10px;
}

.history-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(20, 33, 61, 0.08);
}

.history-date {
  margin: 0;
  font-weight: 700;
}

.history-subtext {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 0.92rem;
}

.history-pill {
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-weight: 700;
}

.history-pill.done {
  background: rgba(15, 157, 88, 0.12);
  color: var(--success);
}

.history-pill.skipped {
  background: rgba(245, 158, 11, 0.15);
  color: #b45309;
}

.details-form {
  display: grid;
  gap: 14px;
}

.details-form .field {
  display: grid;
  gap: 8px;
}

.details-form .field span {
  font-weight: 700;
  color: var(--text);
}

.details-form input,
.details-form textarea,
.details-form select {
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(20, 33, 61, 0.12);
  padding: 0.95rem 1rem;
  background: rgba(255, 255, 255, 0.92);
  color: var(--text);
}

.details-form textarea {
  min-height: 120px;
  resize: vertical;
}

.details-form input:focus,
.details-form textarea:focus,
.details-form select:focus {
  outline: 2px solid rgba(29, 78, 216, 0.24);
  border-color: rgba(29, 78, 216, 0.38);
}

@media (max-width: 768px) {
  .details-page {
    width: min(100% - 20px, 1180px);
  }

  .details-hero {
    flex-direction: column;
  }

  .status-chip {
    align-self: flex-start;
  }

  .details-chart {
    height: 240px;
  }
}
</style>