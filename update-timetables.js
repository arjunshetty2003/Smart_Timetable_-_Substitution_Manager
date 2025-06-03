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

const updateTimetables = async () => {
  try {
    // Get all subjects
    const subjects = await Subject.find();
    console.log(`Found ${subjects.length} subjects`);

    // Get all classes
    const classes = await Class.find();
    console.log(`Found ${classes.length} classes`);

    // Get all timetable entries
    const timetables = await Timetable.find();
    console.log(`Found ${timetables.length} timetable entries`);

    if (subjects.length === 0) {
      console.log('No subjects found. Cannot update timetables.');
      return;
    }

    // Update all timetable entries with a random subject, regardless of whether they already have one
    let updatedCount = 0;
    for (const timetable of timetables) {
      // Assign a random subject
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      timetable.subject = randomSubject._id;
      
      // Assign a random class if not already assigned
      if (!timetable.class && classes.length > 0) {
        const randomClass = classes[Math.floor(Math.random() * classes.length)];
        timetable.class = randomClass._id;
      }
      
      // Save the updated timetable
      await timetable.save();
      updatedCount++;
    }

    console.log(`Updated ${updatedCount} timetable entries with subject references`);
  } catch (error) {
    console.error('Error updating timetables:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the update function
updateTimetables(); 