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

const ScheduleSchema = new mongoose.Schema({
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
const Schedule = mongoose.model('Schedule', ScheduleSchema);

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

const fixSchedules = async () => {
  try {
    // Get all subjects
    const subjects = await Subject.find();
    console.log(`Found ${subjects.length} subjects`);
    
    if (subjects.length === 0) {
      console.log('No subjects found. Cannot update schedules.');
      return;
    }

    // Get all classes
    const classes = await Class.find();
    console.log(`Found ${classes.length} classes`);
    
    if (classes.length === 0) {
      console.log('No classes found. Cannot update schedules.');
      return;
    }

    // Get all schedule entries
    const schedules = await Schedule.find();
    console.log(`Found ${schedules.length} schedule entries to update`);

    if (schedules.length === 0) {
      // Create some sample schedules if none exist
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const sampleSchedules = [];
      
      for (const day of days) {
        for (let i = 0; i < 3; i++) {
          const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
          const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
          const randomClass = classes[Math.floor(Math.random() * classes.length)];
          const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
          
          sampleSchedules.push({
            day,
            startTime: timeSlot.start,
            endTime: timeSlot.end,
            subject: randomSubject._id,
            class: randomClass._id,
            room: randomRoom,
            status: 'active'
          });
        }
      }
      
      await Schedule.insertMany(sampleSchedules);
      console.log(`Created ${sampleSchedules.length} sample schedules`);
      
      // Exit since we just created new schedules
      mongoose.connection.close();
      console.log('MongoDB connection closed');
      return;
    }

    // Update existing schedules
    let updatedCount = 0;
    for (const schedule of schedules) {
      // Assign subject if missing
      if (!schedule.subject) {
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        schedule.subject = randomSubject._id;
      }
      
      // Assign class if missing
      if (!schedule.class) {
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        schedule.class = randomClass._id;
      }
      
      // Assign room if missing
      if (!schedule.room) {
        schedule.room = rooms[Math.floor(Math.random() * rooms.length)];
      }
      
      // Assign time slots if missing
      if (!schedule.startTime || !schedule.endTime) {
        const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
        schedule.startTime = timeSlot.start;
        schedule.endTime = timeSlot.end;
      }
      
      // Ensure status is set
      if (!schedule.status) {
        schedule.status = 'active';
      }
      
      // Save the updated schedule
      await schedule.save();
      updatedCount++;
    }

    console.log(`Updated ${updatedCount} schedule entries with subject, class, and time information`);
  } catch (error) {
    console.error('Error fixing schedules:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the fix function
fixSchedules(); 