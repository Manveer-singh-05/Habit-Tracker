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
