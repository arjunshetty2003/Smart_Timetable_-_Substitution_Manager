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

const checkDatabase = async () => {
  try {
    // Get all subjects
    const subjects = await Subject.find();
    console.log('=== SUBJECTS ===');
    subjects.forEach(subject => {
      console.log(`ID: ${subject._id}, Name: ${subject.subjectName}, Code: ${subject.subjectCode}`);
    });
    
    // Get all classes
    const classes = await Class.find();
    console.log('\n=== CLASSES ===');
    classes.forEach(cls => {
      console.log(`ID: ${cls._id}, Name: ${cls.name}, Department: ${cls.department}, Semester: ${cls.semester}`);
    });
    
    // Get timetable entries with populated subjects and classes
    console.log('\n=== TIMETABLE ENTRIES ===');
    const timetables = await Timetable.find().populate('subject').populate('class');
    
    timetables.forEach(timetable => {
      console.log(`
Day: ${timetable.day}
Time: ${timetable.startTime} - ${timetable.endTime}
Room: ${timetable.room}
Subject ID: ${timetable.subject?._id}
Subject Name: ${timetable.subject?.subjectName}
Subject Code: ${timetable.subject?.subjectCode}
Class ID: ${timetable.class?._id}
Class Name: ${timetable.class?.name}
Status: ${timetable.status || 'active'}
-----------------------------`);
    });
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the check function
checkDatabase(); 