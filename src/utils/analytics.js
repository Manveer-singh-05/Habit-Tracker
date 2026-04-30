import { formatLocalDate, parseLocalDate, sortDatesAscending } from './date'

/**
 * Calculate completion percentage over a time period
 * @param {Object} habit - Habit object with history array
 * @param {number} days - Number of days to look back
 * @returns {number} Percentage (0-100)
 */
export function calculateCompletionRate(habit, days = 30) {
  if (!habit.history || habit.history.length === 0) return 0

  const today = parseLocalDate(formatLocalDate())
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - days)

  const validDates = habit.history.filter(dateStr => {
    const date = parseLocalDate(dateStr)
    return date >= startDate && date <= today
  })

  return Math.round((validDates.length / days) * 100)
}

/**
 * Analyze completion patterns by day of week
 * @param {Object} habit - Habit object
 * @returns {Object} Pattern with day names as keys and counts as values
 */
export function analyzeCompletionByDayOfWeek(habit) {
  const patterns = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  }

  if (!habit.history || habit.history.length === 0) return patterns

  for (const dateStr of habit.history) {
    const date = parseLocalDate(dateStr)
    const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date)
    patterns[dayName] += 1
  }

  return patterns
}

/**
 * Find the most productive day (highest completions)
 * @param {Object} habit - Habit object
 * @returns {Object} {day: string, count: number}
 */
export function getMostProductiveDay(habit) {
  const patterns = analyzeCompletionByDayOfWeek(habit)
  const entries = Object.entries(patterns)

  if (entries.length === 0) return { day: 'N/A', count: 0 }

  const [day, count] = entries.reduce((best, current) => (current[1] > best[1] ? current : best), entries[0])

  return { day, count }
}

/**
 * Calculate trend for a habit (comparing recent period to earlier period)
 * @param {Object} habit - Habit object
 * @returns {Object} {trend: 'up'|'down'|'stable', percentChange: number, status: string}
 */
export function calculateTrend(habit) {
  if (!habit.history || habit.history.length === 0) {
    return { trend: 'stable', percentChange: 0, status: 'No data yet' }
  }

  const recentRate = calculateCompletionRate(habit, 7)
  const priorRate = calculateCompletionRate(habit, 30)

  const percentChange = ((recentRate - priorRate) / (priorRate || 1)) * 100

  let trend = 'stable'
  if (percentChange > 10) trend = 'up'
  else if (percentChange < -10) trend = 'down'

  return {
    trend,
    percentChange: Math.round(percentChange),
    status: getTrendMessage(trend, percentChange),
  }
}

/**
 * Generate trend message
 * @param {string} trend - 'up', 'down', or 'stable'
 * @param {number} percentChange - Percentage change
 * @returns {string} Human-readable trend message
 */
function getTrendMessage(trend, percentChange) {
  if (trend === 'up') {
    return `📈 Great momentum! Up ${Math.abs(percentChange)}% this week`
  }
  if (trend === 'down') {
    return `📉 Slight dip. Down ${Math.abs(percentChange)}% - keep pushing!`
  }
  return '➡️ Steady consistency'
}

/**
 * Predict future completion probability based on historical data
 * @param {Object} habit - Habit object
 * @returns {Object} {probability: number, confidence: string, prediction: string}
 */
export function predictFutureCompletion(habit) {
  if (!habit.history || habit.history.length < 7) {
    return {
      probability: 0,
      confidence: 'low',
      prediction: 'Need more data to make predictions',
    }
  }

  const recentRate = calculateCompletionRate(habit, 7)
  const overallRate = calculateCompletionRate(habit, 30)
  const averageRate = (recentRate + overallRate) / 2

  let confidence = 'low'
  if (habit.history.length > 30) confidence = 'medium'
  if (habit.history.length > 60) confidence = 'high'

  let prediction
  if (averageRate >= 80) {
    prediction = 'Very likely to complete tomorrow'
  } else if (averageRate >= 60) {
    prediction = 'Likely to complete tomorrow'
  } else if (averageRate >= 40) {
    prediction = 'Likely but not guaranteed'
  } else {
    prediction = 'May need a push to complete'
  }

  return {
    probability: Math.round(averageRate),
    confidence,
    prediction,
  }
}

/**
 * Calculate all habits' completion rates and return top performers
 * @param {Array} habits - Array of habit objects
 * @param {number} limit - How many top habits to return
 * @returns {Array} Top performing habits with their rates
 */
export function getTopPerformingHabits(habits, limit = 3) {
  return habits
    .map(habit => ({
      ...habit,
      completionRate: calculateCompletionRate(habit, 30),
    }))
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, limit)
}

/**
 * Calculate habits that need attention (low completion)
 * @param {Array} habits - Array of habit objects
 * @param {number} threshold - Completion rate threshold (0-100)
 * @returns {Array} Habits below threshold
 */
export function getHabitsThatNeedAttention(habits, threshold = 30) {
  return habits
    .map(habit => ({
      ...habit,
      completionRate: calculateCompletionRate(habit, 30),
    }))
    .filter(habit => habit.completionRate < threshold)
    .sort((a, b) => a.completionRate - b.completionRate)
}

/**
 * Calculate average completion time consistency
 * @param {Object} habit - Habit object
 * @returns {Object} {consistency: number, pattern: string}
 */
export function analyzeCompletionConsistency(habit) {
  if (!habit.history || habit.history.length < 7) {
    return { consistency: 0, pattern: 'Insufficient data' }
  }

  const sorted = sortDatesAscending(habit.history)
  const gaps = []

  for (let i = 1; i < sorted.length; i++) {
    const curr = parseLocalDate(sorted[i])
    const prev = parseLocalDate(sorted[i - 1])
    const dayDiff = Math.floor((curr - prev) / (1000 * 60 * 60 * 24))
    gaps.push(dayDiff)
  }

  if (gaps.length === 0) return { consistency: 100, pattern: 'Perfect streak' }

  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
  const consistency = Math.max(0, Math.min(100, 100 - avgGap * 10))

  let pattern
  if (consistency > 80) pattern = 'Very consistent daily'
  else if (consistency > 60) pattern = 'Mostly consistent'
  else if (consistency > 40) pattern = 'Irregular but persistent'
  else pattern = 'Sporadic completions'

  return { consistency: Math.round(consistency), pattern }
}

/**
 * Get actionable recommendations for a habit
 * @param {Object} habit - Habit object
 * @returns {Array} Array of recommendation strings
 */
export function getRecommendations(habit) {
  const recommendations = []
  const trend = calculateTrend(habit)
  const prediction = predictFutureCompletion(habit)
  const productive = getMostProductiveDay(habit)
  const consistency = analyzeCompletionConsistency(habit)

  // Trend-based recommendations
  if (trend.trend === 'down') {
    recommendations.push(`You're losing momentum. Try to complete ${habit.name} at a consistent time daily.`)
  }

  // Productivity day-based recommendations
  if (productive.count > 0) {
    recommendations.push(`You\'re most consistent on ${productive.day}s. Leverage this for streaks!`)
  }

  // Prediction-based recommendations
  if (prediction.probability < 50) {
    recommendations.push(`Only ${prediction.probability}% completion rate. Set a reminder to build this habit.`)
  }

  // Consistency-based recommendations
  if (consistency.consistency < 50) {
    recommendations.push('Try spacing completions evenly throughout the week for better consistency.')
  }

  return recommendations.length > 0
    ? recommendations
    : ['Keep up the great work! You\'re on a roll with ' + habit.name + '.']
}

/**
 * Generate an AI-style insight summary for a single habit
 * @param {Object} habit - Habit object
 * @returns {Object} Complete insight object
 */
export function generateHabitInsight(habit) {
  return {
    habitName: habit.name,
    completionRate: calculateCompletionRate(habit, 30),
    trend: calculateTrend(habit),
    prediction: predictFutureCompletion(habit),
    productiveDay: getMostProductiveDay(habit),
    consistency: analyzeCompletionConsistency(habit),
    recommendations: getRecommendations(habit),
  }
}

/**
 * Generate overall dashboard insights from all habits
 * @param {Array} habits - Array of habit objects
 * @returns {Object} Dashboard-wide insights
 */
export function generateDashboardInsights(habits) {
  if (habits.length === 0) {
    return {
      topPerformers: [],
      needAttention: [],
      overallTrend: 'Start tracking habits to see insights',
      bestDay: 'No pattern yet',
      avgCompletionRate: 0,
      summary: 'Add your first habit to start building insights!',
    }
  }

  const topPerformers = getTopPerformingHabits(habits, 3)
  const needAttention = getHabitsThatNeedAttention(habits, 40)
  const allRates = habits.map(h => calculateCompletionRate(h, 30))
  const avgRate = Math.round(allRates.reduce((a, b) => a + b, 0) / allRates.length)

  // Calculate best day across all habits
  const dayPatterns = {}
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  daysOfWeek.forEach(day => {
    dayPatterns[day] = 0
  })

  for (const habit of habits) {
    const patterns = analyzeCompletionByDayOfWeek(habit)
    for (const day of daysOfWeek) {
      dayPatterns[day] += patterns[day]
    }
  }

  const bestDay = Object.entries(dayPatterns).sort(([, a], [, b]) => b - a)[0][0]

  let overallTrend = 'Stable'
  const recentRates = habits.map(h => calculateCompletionRate(h, 7))
  const priorRates = habits.map(h => calculateCompletionRate(h, 30))
  const recentAvg = recentRates.reduce((a, b) => a + b, 0) / recentRates.length
  const priorAvg = priorRates.reduce((a, b) => a + b, 0) / priorRates.length

  if (recentAvg > priorAvg + 10) overallTrend = 'Improving'
  else if (recentAvg < priorAvg - 10) overallTrend = 'Declining'

  return {
    topPerformers,
    needAttention,
    overallTrend,
    bestDay,
    avgCompletionRate: avgRate,
    summary:
      topPerformers.length > 0
        ? `${topPerformers[0].name} is your best habit at ${topPerformers[0].completionRate}% completion!`
        : 'Keep tracking to unlock insights!',
  }
}
