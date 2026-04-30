<template>
  <div class="chart-grid">
    <section class="chart-card">
      <div class="chart-head">
        <h3>Weekly completion</h3>
        <p>Completion count across the last 7 days.</p>
      </div>
      <div class="chart-wrap">
        <canvas ref="weeklyCanvas" />
      </div>
    </section>

    <section class="chart-card">
      <div class="chart-head">
        <h3>Monthly progress</h3>
        <p>Completion count across the last 30 days.</p>
      </div>
      <div class="chart-wrap">
        <canvas ref="monthlyCanvas" />
      </div>
    </section>

    <section class="chart-card heatmap-card">
      <div class="chart-head">
        <h3>Contribution heatmap</h3>
        <p>GitHub-style view of completions across the last 56 days.</p>
      </div>

      <div class="heatmap-wrap">
        <div class="heatmap-axis">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div class="heatmap-grid" role="img" aria-label="Habit completion heatmap calendar">
          <button
            v-for="cell in heatmapCells"
            :key="cell.date"
            class="heatmap-cell"
            :class="`level-${cell.level}`"
            type="button"
            :title="cell.tooltip"
          ></button>
        </div>

        <div class="heatmap-legend">
          <span>Less</span>
          <span class="legend-swatch level-0"></span>
          <span class="legend-swatch level-1"></span>
          <span class="legend-swatch level-2"></span>
          <span class="legend-swatch level-3"></span>
          <span class="legend-swatch level-4"></span>
          <span>More</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import Chart from "chart.js/auto";
import {
  formatChartLabel,
  formatLocalDate,
  parseLocalDate,
} from "../utils/date";

const props = defineProps({
  habits: {
    type: Array,
    required: true,
  },
});

const weeklyCanvas = ref(null);
const monthlyCanvas = ref(null);
const weeklyChart = ref(null);
const monthlyChart = ref(null);

const today = computed(() => parseLocalDate(formatLocalDate()));

const heatmapCells = computed(() => {
  const days = 56;
  const dateList = Array.from({ length: days }, (_, index) => {
    const date = new Date(today.value);
    date.setDate(date.getDate() - (days - 1 - index));
    return formatLocalDate(date);
  });

  const completionByDate = new Map();

  for (const habit of props.habits) {
    for (const dateString of habit.history || []) {
      completionByDate.set(dateString, (completionByDate.get(dateString) || 0) + 1);
    }
  }

  const totalHabits = Math.max(props.habits.length, 1);

  return dateList.map((dateString) => {
    const count = completionByDate.get(dateString) || 0;
    const intensity = Math.round((count / totalHabits) * 4);

    return {
      date: dateString,
      level: Math.min(4, Math.max(0, intensity)),
      tooltip: `${formatChartLabel(dateString)} · ${count} completion${count === 1 ? '' : 's'}`,
    };
  });
});

function createDateRange(days) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today.value);
    date.setDate(date.getDate() - (days - 1 - index));

    return formatLocalDate(date);
  });
}

function getCompletionCounts(dateRange) {
  return dateRange.map((dateString) => {
    return props.habits.reduce((count, habit) => {
      return count + (habit.history.includes(dateString) ? 1 : 0);
    }, 0);
  });
}

function renderChart(canvasRef, chartRef, labels, data, chartType) {
  if (!canvasRef.value) {
    return;
  }

  if (chartRef.value) {
    chartRef.value.destroy();
  }

  chartRef.value = new Chart(canvasRef.value, {
    type: chartType,
    data: {
      labels,
      datasets: [
        {
          label: "Completions",
          data,
          borderColor: "#1d4ed8",
          backgroundColor: "rgba(29, 78, 216, 0.18)",
          fill: chartType === "line",
          borderRadius: 12,
          tension: 0.36,
          pointRadius: 3,
          pointBackgroundColor: "#1d4ed8",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          intersect: false,
          mode: "index",
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}

function renderCharts() {
  const weeklyRange = createDateRange(7);
  const monthlyRange = createDateRange(30);

  renderChart(
    weeklyCanvas,
    weeklyChart,
    weeklyRange.map((dateString) => formatChartLabel(dateString)),
    getCompletionCounts(weeklyRange),
    "bar",
  );

  renderChart(
    monthlyCanvas,
    monthlyChart,
    monthlyRange.map((dateString) => formatChartLabel(dateString)),
    getCompletionCounts(monthlyRange),
    "line",
  );
}

watch(
  () => props.habits,
  () => {
    renderCharts();
  },
  { deep: true },
);

onMounted(renderCharts);

onBeforeUnmount(() => {
  weeklyChart.value?.destroy();
  monthlyChart.value?.destroy();
});
</script>
