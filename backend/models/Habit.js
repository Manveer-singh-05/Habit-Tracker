import mongoose from 'mongoose'

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    default: 'Health',
    trim: true
  },
  frequency: {
    type: String,
    default: 'daily',
    trim: true
  },
  reminderTime: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: '',
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  bestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  history: {
    type: [String],  // Array of dates in YYYY-MM-DD format
    default: []
  },
  skippedDates: {
    type: [String],
    default: []
  },
  lastCompletedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt field before saving
habitSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.model('Habit', habitSchema)
