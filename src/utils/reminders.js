/**
 * Check if browser supports notifications
 */
export function isNotificationSupported() {
  return 'Notification' in window
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return 'denied'
}

/**
 * Send a browser notification
 */
export function sendNotification(title, options = {}) {
  if (!isNotificationSupported()) return

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    })
  }
}

/**
 * Check if a reminder should trigger now
 * @param {Object} reminder - Reminder config {enabled, time, days}
 * @returns {boolean} True if reminder should trigger
 */
export function shouldTriggerReminder(reminder) {
  if (!reminder || !reminder.enabled) return false

  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now)

  // Check time matches (within 1-minute window to account for polling)
  const timeMatches = currentTime === reminder.time

  // Check day matches
  const dayMatches =
    reminder.days.length === 0 ||
    reminder.days.includes('daily') ||
    reminder.days.includes(currentDay)

  return timeMatches && dayMatches
}

/**
 * Parse time string to Date object for today
 * @param {string} timeStr - Time in HH:mm format
 * @returns {Date} Date object with time set
 */
export function parseTimeToday(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

/**
 * Get time until next reminder
 * @param {Object} reminder - Reminder config
 * @returns {number} Milliseconds until next reminder, or -1 if not scheduled
 */
export function getTimeUntilNextReminder(reminder) {
  if (!reminder || !reminder.enabled || !reminder.time) return -1

  const now = new Date()
  const reminderTime = parseTimeToday(reminder.time)
  const currentDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(now)

  // Check if reminder is for today
  const isDayMatch =
    reminder.days.length === 0 ||
    reminder.days.includes('daily') ||
    reminder.days.includes(currentDay)

  if (!isDayMatch) return -1

  let timeUntil = reminderTime.getTime() - now.getTime()

  // If time has passed today, calculate for next occurrence
  if (timeUntil <= 0) {
    timeUntil += 24 * 60 * 60 * 1000
  }

  return timeUntil
}

/**
 * Format time until next reminder for display
 * @param {number} ms - Milliseconds
 * @returns {string} Human-readable time
 */
export function formatTimeUntil(ms) {
  if (ms < 0) return 'Not scheduled'

  const hours = Math.floor(ms / (60 * 60 * 1000))
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))

  if (hours > 0) {
    return `in ${hours}h ${minutes}m`
  }

  return `in ${minutes}m`
}

/**
 * Default reminder days for daily habits
 */
export const DEFAULT_REMINDER_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

/**
 * Common reminder times
 */
export const COMMON_REMINDER_TIMES = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '12:00',
  '13:00',
  '14:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
]

/**
 * Format time for display
 * @param {string} timeStr - Time in HH:mm format
 * @returns {string} Formatted time
 */
export function formatTime(timeStr) {
  if (!timeStr) return 'Not set'

  const [hours, minutes] = timeStr.split(':')
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(2000, 0, 1, hours, minutes))
}

/**
 * Format days array for display
 * @param {Array} days - Array of day names
 * @returns {string} Formatted string
 */
export function formatDays(days) {
  if (!days || days.length === 0) return 'Not set'

  if (days.includes('daily') || days.length === 7) {
    return 'Every day'
  }

  if (days.length <= 2) {
    return days.join(', ')
  }

  return `${days.length} days per week`
}

/**
 * Create a mock reminder schedule for testing
 * @param {Object} habit - Habit object
 * @returns {Object} Reminder info
 */
export function getReminderInfo(habit) {
  if (!habit.reminder || !habit.reminder.enabled) {
    return {
      enabled: false,
      status: '⏰ Reminders disabled',
    }
  }

  const timeUntil = getTimeUntilNextReminder(habit.reminder)
  const formattedTime = formatTime(habit.reminder.time)
  const formattedDays = formatDays(habit.reminder.days)

  return {
    enabled: true,
    time: formattedTime,
    days: formattedDays,
    timeUntil: timeUntil > 0 ? formatTimeUntil(timeUntil) : 'overdue',
    status: `⏰ ${formattedTime} on ${formattedDays}`,
    nextTrigger: timeUntil,
  }
}

/**
 * Schedule a reminder check interval
 * @param {Function} callback - Function to call on reminder check
 * @param {number} interval - Check interval in ms (default 60000 = 1 minute)
 * @returns {number} Interval ID for cleanup
 */
export function scheduleReminderCheck(callback, interval = 60000) {
  // Check immediately on setup
  callback()

  // Then check at regular intervals
  return setInterval(callback, interval)
}
