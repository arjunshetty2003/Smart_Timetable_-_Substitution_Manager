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

const checkSchedules = async () => {
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
    
    // Get schedule entries with populated subjects and classes
    console.log('\n=== SCHEDULE ENTRIES ===');
    const schedules = await Schedule.find().populate('subject').populate('class');
    
    schedules.forEach(schedule => {
      console.log(`
Day: ${schedule.day}
Time: ${schedule.startTime} - ${schedule.endTime}
Room: ${schedule.room}
Subject ID: ${schedule.subject?._id}
Subject Name: ${schedule.subject?.subjectName}
Subject Code: ${schedule.subject?.subjectCode}
Class ID: ${schedule.class?._id}
Class Name: ${schedule.class?.name}
Status: ${schedule.status}
-----------------------------`);
    });

    // Get the field names in Schedule documents
    if (schedules.length > 0) {
      console.log('\n=== SCHEDULE DOCUMENT FIELDS ===');
      const firstSchedule = schedules[0].toObject();
      console.log('Field names:', Object.keys(firstSchedule));
      console.log('Raw data of first schedule:', JSON.stringify(firstSchedule, null, 2));
    }
  } catch (error) {
    console.error('Database check error:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the check function
checkSchedules(); 