const mongoose = require('mongoose');

const specialClassSchema = new mongoose.Schema({
  classCode: {
    type: String,
    required: [true, 'Please add a class code'],
    trim: true,
    uppercase: true
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please assign a faculty']
  },
  date: {
    type: String,
    required: [true, 'Please add a date'],
    match: /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD format
  },
  startTime: {
    type: String,
    required: [true, 'Please add start time'],
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  endTime: {
    type: String,
    required: [true, 'Please add end time'],
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  room: {
    type: String,
    required: [true, 'Please add a room'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['extra_class', 'makeup_class', 'workshop', 'seminar', 'exam', 'project_presentation'],
    default: 'extra_class'
  },
  maxStudents: {
    type: Number,
    min: [1, 'Maximum students must be at least 1'],
    max: [200, 'Maximum students cannot exceed 200']
  },
  registeredStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  materials: {
    type: String,
    trim: true,
    maxlength: [1000, 'Materials description cannot exceed 1000 characters']
  },
  prerequisites: {
    type: String,
    trim: true,
    maxlength: [500, 'Prerequisites cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide the creator ID']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
specialClassSchema.index({ date: 1, startTime: 1 });
specialClassSchema.index({ facultyId: 1, date: 1 });
specialClassSchema.index({ classCode: 1, date: 1 });
specialClassSchema.index({ room: 1, date: 1, startTime: 1 });
specialClassSchema.index({ status: 1 });

// Validate that end time is after start time
specialClassSchema.pre('save', function(next) {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    next(new Error('End time must be after start time'));
  }
  
  next();
});

// Virtual for duration in minutes
specialClassSchema.virtual('durationMinutes').get(function() {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  return endMinutes - startMinutes;
});

// Virtual to check if registration is full
specialClassSchema.virtual('isFull').get(function() {
  return this.maxStudents && this.registeredStudents.length >= this.maxStudents;
});

// Virtual for available spots
specialClassSchema.virtual('availableSpots').get(function() {
  if (!this.maxStudents) return null;
  return Math.max(0, this.maxStudents - this.registeredStudents.length);
});

// Method to register a student
specialClassSchema.methods.registerStudent = function(studentId) {
  if (this.isFull) {
    throw new Error('Class is full');
  }
  
  if (this.registeredStudents.includes(studentId)) {
    throw new Error('Student already registered');
  }
  
  this.registeredStudents.push(studentId);
  return this.save();
};

// Method to unregister a student
specialClassSchema.methods.unregisterStudent = function(studentId) {
  this.registeredStudents = this.registeredStudents.filter(
    id => !id.equals(studentId)
  );
  return this.save();
};

// Method to get formatted time range
specialClassSchema.methods.getTimeRange = function() {
  return `${this.startTime} - ${this.endTime}`;
};

// Static method to find upcoming classes
specialClassSchema.statics.findUpcoming = function(limit = 10) {
  const today = new Date().toISOString().split('T')[0];
  return this.find({
    date: { $gte: today },
    status: { $in: ['scheduled', 'ongoing'] }
  })
  .populate('facultyId', 'name email')
  .populate('createdBy', 'name email')
  .sort({ date: 1, startTime: 1 })
  .limit(limit);
};

module.exports = mongoose.model('SpecialClass', specialClassSchema); 