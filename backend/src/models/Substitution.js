const mongoose = require('mongoose');

const substitutionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  originalFacultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Original faculty ID is required']
  },
  substituteFacultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject ID is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true
  },
  classroom: {
    type: String,
    required: [true, 'Classroom is required'],
    trim: true
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for performance
substitutionSchema.index({ date: 1, originalFacultyId: 1 });
substitutionSchema.index({ substituteFacultyId: 1, date: 1 });
substitutionSchema.index({ status: 1 });

module.exports = mongoose.model('Substitution', substitutionSchema); 