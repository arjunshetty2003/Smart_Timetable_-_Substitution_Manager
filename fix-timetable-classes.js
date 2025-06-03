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

const fixTimetableClasses = async () => {
  try {
    // Get all classes
    const classes = await Class.find();
    console.log(`Found ${classes.length} classes`);
    
    if (classes.length === 0) {
      // Create some sample classes if none exist
      const sampleClasses = [
        { name: 'CSE-A', department: 'Computer Science', semester: 3 },
        { name: 'CSE-B', department: 'Computer Science', semester: 3 },
        { name: 'ECE-A', department: 'Electronics', semester: 3 },
        { name: 'MECH-A', department: 'Mechanical', semester: 3 }
      ];
      
      await Class.insertMany(sampleClasses);
      console.log('Created sample classes');
      classes.push(...await Class.find());
    }

    // Get all timetable entries
    const timetables = await Timetable.find();
    console.log(`Found ${timetables.length} timetable entries to update`);

    let updatedCount = 0;
    for (const timetable of timetables) {
      // Assign a random class
      const randomClass = classes[Math.floor(Math.random() * classes.length)];
      timetable.class = randomClass._id;
      
      // Save the updated timetable
      await timetable.save();
      updatedCount++;
    }

    console.log(`Updated ${updatedCount} timetable entries with class references`);
  } catch (error) {
    console.error('Error fixing timetable classes:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the fix function
fixTimetableClasses(); 