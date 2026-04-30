const CATEGORY_KEYWORDS = [
  {
    category: 'Fitness',
    keywords: ['run', 'jog', 'workout', 'gym', 'cycle', 'swim', 'train', 'walk'],
  },
  {
    category: 'Study',
    keywords: ['study', 'read', 'learn', 'code', 'book', 'revise', 'research'],
  },
  {
    category: 'Health',
    keywords: ['medit', 'sleep', 'water', 'yoga', 'stretch', 'journal', 'breath'],
  },
]

const CATEGORY_ICONS = {
  Health: '💚',
  Study: '📘',
  Fitness: '💪',
}

export const HABIT_CATEGORY_OPTIONS = ['Health', 'Study', 'Fitness']

export function resolveHabitCategory(habit = {}) {
  const explicitCategory = String(habit.category ?? '').trim()

  if (explicitCategory) {
    return explicitCategory
  }

  const haystack = `${habit.name ?? ''} ${habit.description ?? ''}`.toLowerCase()

  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.keywords.some((keyword) => haystack.includes(keyword))) {
      return entry.category
    }
  }

  return 'Health'
}

export function resolveHabitIcon(habit = {}) {
  const category = resolveHabitCategory(habit)

  if (CATEGORY_ICONS[category]) {
    return CATEGORY_ICONS[category]
  }

  const haystack = `${habit.name ?? ''} ${habit.description ?? ''}`.toLowerCase()

  if (haystack.includes('medit')) return '🧘'
  if (haystack.includes('run') || haystack.includes('walk')) return '🏃'
  if (haystack.includes('read') || haystack.includes('book')) return '📚'

  return '✨'
}

export function formatDisplayDate(value) {
  if (!value) {
    return 'Not available'
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function normalizeHabit(habit = {}) {
  return {
    ...habit,
    category: resolveHabitCategory(habit),
    frequency: habit.frequency || 'daily',
    reminderTime: habit.reminderTime || '',
    notes: habit.notes || '',
    bestStreak: habit.bestStreak ?? habit.streak ?? 0,
    skippedDates: habit.skippedDates || [],
  }
}