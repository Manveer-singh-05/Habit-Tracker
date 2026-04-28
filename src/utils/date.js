export function formatLocalDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function parseLocalDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)

  return new Date(year, month - 1, day)
}

export function sortDatesAscending(dateList) {
  return [...new Set(dateList)].sort((left, right) => left.localeCompare(right))
}

export function daysBetween(leftDateString, rightDateString) {
  const leftDate = parseLocalDate(leftDateString)
  const rightDate = parseLocalDate(rightDateString)
  const millisecondsPerDay = 24 * 60 * 60 * 1000

  return Math.round((leftDate - rightDate) / millisecondsPerDay)
}

export function recalculateStreak(history) {
  const sortedHistory = sortDatesAscending(history)

  if (sortedHistory.length === 0) {
    return 0
  }

  let streak = 1

  for (let index = sortedHistory.length - 1; index > 0; index -= 1) {
    if (daysBetween(sortedHistory[index], sortedHistory[index - 1]) !== 1) {
      break
    }

    streak += 1
  }

  return streak
}

export function formatChartLabel(dateString) {
  const date = parseLocalDate(dateString)

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
