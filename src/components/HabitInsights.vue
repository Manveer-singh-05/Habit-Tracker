<template>
  <section v-if="habits.length > 0" class="insights-panel">
    <div class="panel-header">
      <h3 class="section-title">✨ AI Insights & Predictions</h3>
      <p class="section-copy subtle">Trends, patterns, and personalized recommendations</p>
    </div>

    <!-- Overall Summary Strip -->
    <div class="insights-summary">
      <div class="insight-metric">
        <span class="metric-label">Overall Trend</span>
        <strong class="metric-value" :class="trendClass">{{ dashboardInsights.overallTrend }}</strong>
      </div>
      <div class="insight-metric">
        <span class="metric-label">Best Day</span>
        <strong class="metric-value">{{ dashboardInsights.bestDay }}</strong>
      </div>
      <div class="insight-metric">
        <span class="metric-label">Avg Completion</span>
        <strong class="metric-value">{{ dashboardInsights.avgCompletionRate }}%</strong>
      </div>
      <div class="insight-metric">
        <span class="metric-label">Summary</span>
        <strong class="metric-value">{{ dashboardInsights.summary }}</strong>
      </div>
    </div>

    <!-- Top Performers -->
    <div v-if="dashboardInsights.topPerformers.length > 0" class="insights-section">
      <h4 class="section-subtitle">🏆 Top Performers</h4>
      <div class="performer-grid">
        <div v-for="habit in dashboardInsights.topPerformers" :key="habit._id" class="performer-card">
          <div class="performer-name">{{ habit.name }}</div>
          <div class="performer-rate">
            <span class="rate-number">{{ habit.completionRate }}%</span>
            <span class="rate-label">completion</span>
          </div>
          <div class="performer-bar">
            <div class="performer-fill" :style="{ width: habit.completionRate + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Habits Needing Attention -->
    <div v-if="dashboardInsights.needAttention.length > 0" class="insights-section">
      <h4 class="section-subtitle">⚠️ Needs Attention</h4>
      <div class="attention-list">
        <div v-for="habit in dashboardInsights.needAttention" :key="habit._id" class="attention-card">
          <div class="attention-name">{{ habit.name }}</div>
          <div class="attention-rate">{{ habit.completionRate }}% done</div>
          <div class="attention-bar">
            <div class="attention-fill" :style="{ width: habit.completionRate + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Individual Habit Insights -->
    <div v-if="filteredHabits.length > 0" class="insights-section">
      <h4 class="section-subtitle">🔍 Habit Breakdown</h4>
      <div class="habits-insights">
        <details
          v-for="habit in filteredHabits"
          :key="habit._id"
          :open="expandedHabitId === habit._id"
          class="habit-insight-card"
          @toggle="expandedHabitId = expandedHabitId === habit._id ? null : habit._id"
        >
          <summary class="habit-insight-header">
            <div class="habit-insight-name">{{ habit.name }}</div>
            <div class="habit-insight-trend" :class="habitInsights[habit._id].trend.trend">
              {{ habitInsights[habit._id].trend.status }}
            </div>
          </summary>

          <div class="habit-insight-content">
            <!-- Metrics Grid -->
            <div class="insight-metrics-grid">
              <div class="metric-box">
                <span class="metric-label">Rate (30d)</span>
                <span class="metric-value">{{ habitInsights[habit._id].completionRate }}%</span>
              </div>
              <div class="metric-box">
                <span class="metric-label">Prediction</span>
                <span class="metric-value">{{ habitInsights[habit._id].prediction.probability }}%</span>
              </div>
              <div class="metric-box">
                <span class="metric-label">Best Day</span>
                <span class="metric-value">{{ habitInsights[habit._id].productiveDay.day }}</span>
              </div>
              <div class="metric-box">
                <span class="metric-label">Consistency</span>
                <span class="metric-value">{{ habitInsights[habit._id].consistency.consistency }}%</span>
              </div>
            </div>

            <!-- Prediction -->
            <div class="insight-box prediction-box">
              <strong>Tomorrow's Prediction</strong>
              <p>{{ habitInsights[habit._id].prediction.prediction }}</p>
              <small>Confidence: {{ habitInsights[habit._id].prediction.confidence }}</small>
            </div>

            <!-- Pattern -->
            <div class="insight-box pattern-box">
              <strong>Completion Pattern</strong>
              <p>{{ habitInsights[habit._id].consistency.pattern }}</p>
              <p class="pattern-note">Most consistent on {{ habitInsights[habit._id].productiveDay.day }}s</p>
            </div>

            <!-- Recommendations -->
            <div class="recommendations">
              <strong>💡 Recommendations</strong>
              <ul>
                <li v-for="(rec, idx) in habitInsights[habit._id].recommendations" :key="idx">
                  {{ rec }}
                </li>
              </ul>
            </div>
          </div>
        </details>
      </div>
    </div>
  </section>

  <div v-else class="empty-insights">
    <p>📊 Start tracking habits to unlock AI insights and predictions!</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { generateDashboardInsights, generateHabitInsight } from '../utils/analytics'

const props = defineProps({
  habits: {
    type: Array,
    required: true,
  },
})

const expandedHabitId = ref(null)

const dashboardInsights = computed(() => generateDashboardInsights(props.habits))

const habitInsights = computed(() => {
  const insights = {}
  for (const habit of props.habits) {
    insights[habit._id] = generateHabitInsight(habit)
  }
  return insights
})

const filteredHabits = computed(() => {
  return props.habits.slice(0, 5)
})

const trendClass = computed(() => {
  const trend = dashboardInsights.value.overallTrend
  if (trend === 'Improving') return 'trend-up'
  if (trend === 'Declining') return 'trend-down'
  return 'trend-stable'
})
</script>

<style scoped>
.insights-panel {
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 18px;
  margin: 0 0 20px;
}

.panel-header {
  margin-bottom: 16px;
}

.section-title {
  margin: 0;
  font-size: 1.35rem;
  color: var(--text);
}

.section-copy {
  margin: 6px 0 0;
  color: var(--muted);
}

.section-copy.subtle {
  font-size: 0.88rem;
}

.section-subtitle {
  margin: 16px 0 10px;
  font-size: 1.05rem;
  color: var(--text);
  font-weight: 700;
}

.insights-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(29, 78, 216, 0.04);
  border-radius: 14px;
}

.insight-metric {
  display: grid;
  gap: 4px;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.metric-value {
  display: block;
  font-size: 1.1rem;
  line-height: 1.2;
}

.metric-value.trend-up {
  color: var(--success);
}

.metric-value.trend-down {
  color: var(--danger);
}

.metric-value.trend-stable {
  color: var(--primary);
}

.insights-section {
  margin: 14px 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
}

.performer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.performer-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 8px;
}

.performer-name {
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.3;
}

.performer-rate {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.rate-number {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--primary);
}

.rate-label {
  font-size: 0.75rem;
  color: var(--muted);
}

.performer-bar {
  width: 100%;
  height: 6px;
  background: rgba(29, 78, 216, 0.12);
  border-radius: 999px;
  overflow: hidden;
}

.performer-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), #7c3aed);
  border-radius: inherit;
}

.attention-list {
  display: grid;
  gap: 10px;
}

.attention-card {
  background: var(--surface);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 12px;
  padding: 12px;
  display: grid;
  gap: 6px;
}

.attention-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.attention-rate {
  font-size: 0.88rem;
  color: var(--muted);
}

.attention-bar {
  width: 100%;
  height: 6px;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.attention-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--danger), #f97316);
  border-radius: inherit;
}

.habits-insights {
  display: grid;
  gap: 10px;
}

.habit-insight-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.habit-insight-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}

.habit-insight-header:hover {
  background: rgba(29, 78, 216, 0.04);
}

.habit-insight-name {
  font-weight: 600;
  font-size: 0.95rem;
  flex: 1;
}

.habit-insight-trend {
  font-size: 0.82rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 999px;
  white-space: nowrap;
}

.habit-insight-trend.up {
  background: rgba(15, 157, 88, 0.12);
  color: var(--success);
}

.habit-insight-trend.down {
  background: rgba(220, 38, 38, 0.12);
  color: var(--danger);
}

.habit-insight-trend.stable {
  background: rgba(29, 78, 216, 0.12);
  color: var(--primary);
}

.habit-insight-content {
  padding: 12px;
  display: grid;
  gap: 12px;
  border-top: 1px solid var(--border);
}

.insight-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
}

.metric-box {
  background: rgba(29, 78, 216, 0.04);
  border-radius: 10px;
  padding: 8px;
  text-align: center;
  display: grid;
  gap: 2px;
}

.metric-box .metric-label {
  font-size: 0.7rem;
}

.metric-box .metric-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary);
}

.insight-box {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  padding: 10px;
  font-size: 0.88rem;
  line-height: 1.5;
}

.insight-box strong {
  display: block;
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.insight-box p {
  margin: 0;
  color: var(--text);
}

.insight-box small {
  color: var(--muted);
}

.pattern-note {
  font-size: 0.82rem;
  color: var(--muted);
  margin-top: 4px;
}

.prediction-box {
  border-left: 3px solid var(--primary);
}

.pattern-box {
  border-left: 3px solid var(--success);
}

.recommendations {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  padding: 10px;
}

.recommendations strong {
  display: block;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.recommendations ul {
  margin: 0;
  padding-left: 18px;
  list-style-type: none;
}

.recommendations li {
  margin: 4px 0;
  padding-left: 16px;
  position: relative;
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--text);
}

.recommendations li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: 700;
}

.empty-insights {
  text-align: center;
  padding: 24px;
  background: var(--surface-strong);
  border: 1px dashed var(--border);
  border-radius: 22px;
  color: var(--muted);
  font-size: 0.95rem;
}

details[open] > .habit-insight-header {
  background: rgba(29, 78, 216, 0.08);
}

details summary {
  list-style: none;
}

details summary::marker,
details summary::-webkit-details-marker {
  display: none;
}

@media (max-width: 768px) {
  .insights-summary {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 10px;
  }

  .metric-label {
    font-size: 0.7rem;
  }

  .metric-value {
    font-size: 1rem;
  }

  .performer-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }

  .insight-metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .insights-panel {
    padding: 14px;
  }

  .section-title {
    font-size: 1.15rem;
  }

  .section-subtitle {
    font-size: 0.95rem;
  }

  .insights-summary {
    grid-template-columns: 1fr;
  }

  .performer-grid {
    grid-template-columns: 1fr;
  }

  .insight-metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .habit-insight-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .habit-insight-trend {
    width: 100%;
    text-align: center;
  }
}
</style>
