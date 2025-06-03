const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Define Schemas
const SubjectSchema = new mongoose.Schema({
  subjectName: String,
  subjectCode: String,
  credits: Number,
  department: String,
  semester: Number
});

const ClassSchema = new mongoose.Schema({
  name: String,
  department: String,
  semester: Number
});

// Define Timetable Schema
const TimetableSchema = new mongoose.Schema({
  day: String,
  startTime: String,
  endTime: String,
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  room: String,
  status: {
    type: String,
    enum: ['active', 'cancelled', 'substituted'],
    default: 'active'
  }
});

// Create models
const Subject = mongoose.model('Subject', SubjectSchema);
const Class = mongoose.model('Class', ClassSchema);
const Timetable = mongoose.model('Timetable', TimetableSchema);

// Define time slots and room options
const timeSlots = [
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '12:00', end: '13:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' }
];

const rooms = ['Lab-01', 'Room 101', 'Room 103', 'A102', 'Lab 1'];

const fixTimetables = async () => {
  try {
    // Get all timetable entries
    const timetables = await Timetable.find();
    console.log(`Found ${timetables.length} timetable entries to update`);

    let updatedCount = 0;
    for (const timetable of timetables) {
      // Assign random time slot if missing
      if (!timetable.startTime || !timetable.endTime) {
        const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        timetable.startTime = timeSlot.start;
        timetable.endTime = timeSlot.end;
      }
      
      // Assign random room if missing
      if (!timetable.room) {
        timetable.room = rooms[Math.floor(Math.random() * rooms.length)];
      }
      
      // Ensure status is set
      if (!timetable.status) {
        timetable.status = 'active';
      }
      
      // Save the updated timetable
      await timetable.save();
      updatedCount++;
    }

    console.log(`Updated ${updatedCount} timetable entries with missing information`);
  } catch (error) {
    console.error('Error fixing timetables:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the fix function
fixTimetables(); 