const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Schedule = require('../models/Schedule');
const Substitution = require('../models/Substitution');
const Timetable = require('../models/Timetable');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Subject.deleteMany({}),
      Class.deleteMany({}),
      Schedule.deleteMany({}),
      Substitution.deleteMany({}),
      Timetable.deleteMany({})
    ]);

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@university.edu',
      passwordHash: 'admin123', // Will be hashed by the pre-save middleware
      role: 'admin',
      department: 'Administration',
      isActive: true
    });

    // Create faculty users
    const faculty1 = await User.create({
      name: 'Dr. Jane Smith',
      email: 'jane.smith@university.edu',
      passwordHash: 'password123',
      role: 'faculty',
      department: 'Computer Science',
      isActive: true
    });

    const faculty2 = await User.create({
      name: 'Prof. John Doe',
      email: 'john.doe@university.edu',
      passwordHash: 'password123',
      role: 'faculty',
      department: 'Computer Science',
      isActive: true
    });

    const faculty3 = await User.create({
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@university.edu',
      passwordHash: 'password123',
      role: 'faculty',
      department: 'Mathematics',
      isActive: true
    });

    const faculty4 = await User.create({
      name: 'Prof. Michael Brown',
      email: 'michael.brown@university.edu',
      passwordHash: 'password123',
      role: 'faculty',
      department: 'Physics',
      isActive: true
    });

    const faculties = [faculty1, faculty2, faculty3, faculty4];

    // Create student users
    const student1 = await User.create({
      name: 'Alice Johnson',
      email: 'alice.johnson@student.edu',
      passwordHash: 'student123',
      role: 'student',
      department: 'Computer Science',
      isActive: true
    });

    const student2 = await User.create({
      name: 'Bob Williams',
      email: 'bob.williams@student.edu',
      passwordHash: 'student123',
      role: 'student',
      department: 'Computer Science',
      isActive: true
    });

    const students = [student1, student2];

    console.log('👥 Created users');

    // Create subjects
    const subjects = await Subject.insertMany([
      {
        subjectName: 'Data Structures and Algorithms',
        subjectCode: 'CS301',
        credits: 4,
        department: 'Computer Science',
        semester: 3
      },
      {
        subjectName: 'Database Management Systems',
        subjectCode: 'CS401',
        credits: 4,
        department: 'Computer Science',
        semester: 4
      },
      {
        subjectName: 'Web Development',
        subjectCode: 'CS302',
        credits: 3,
        department: 'Computer Science',
        semester: 3
      },
      {
        subjectName: 'Machine Learning',
        subjectCode: 'CS501',
        credits: 4,
        department: 'Computer Science',
        semester: 5
      },
      {
        subjectName: 'Calculus I',
        subjectCode: 'MATH101',
        credits: 4,
        department: 'Mathematics',
        semester: 1
      },
      {
        subjectName: 'Linear Algebra',
        subjectCode: 'MATH201',
        credits: 3,
        department: 'Mathematics',
        semester: 2
      },
      {
        subjectName: 'Physics I',
        subjectCode: 'PHY101',
        credits: 4,
        department: 'Physics',
        semester: 1
      }
    ]);

    console.log('📚 Created subjects');

    // Create classes
    const classes = await Class.insertMany([
      {
        className: 'CS Third Year Section A',
        courseCode: 'CS-3A',
        facultyId: faculties[0]._id,
        department: 'Computer Science',
        semester: 3
      },
      {
        className: 'CS Fourth Year Section B',
        courseCode: 'CS-4B',
        facultyId: faculties[1]._id,
        department: 'Computer Science',
        semester: 4
      },
      {
        className: 'Math First Year Section A',
        courseCode: 'MATH-1A',
        facultyId: faculties[2]._id,
        department: 'Mathematics',
        semester: 1
      },
      {
        className: 'Physics First Year Section A',
        courseCode: 'PHY-1A',
        facultyId: faculties[3]._id,
        department: 'Physics',
        semester: 1
      }
    ]);

    console.log('🏫 Created classes');

    // Create schedules
    const schedules = await Schedule.insertMany([
      // Monday schedules
      {
        day: 'Monday',
        startTime: '09:00',
        endTime: '10:00',
        classroom: 'Room 101',
        classId: classes[0]._id,
        facultyId: faculties[0]._id,
        subjectId: subjects[0]._id
      },
      {
        day: 'Monday',
        startTime: '10:00',
        endTime: '11:00',
        classroom: 'Room 102',
        classId: classes[1]._id,
        facultyId: faculties[1]._id,
        subjectId: subjects[1]._id
      },
      {
        day: 'Monday',
        startTime: '11:00',
        endTime: '12:00',
        classroom: 'Room 103',
        classId: classes[0]._id,
        facultyId: faculties[0]._id,
        subjectId: subjects[2]._id
      },
      // Tuesday schedules
      {
        day: 'Tuesday',
        startTime: '09:00',
        endTime: '10:00',
        classroom: 'Room 201',
        classId: classes[2]._id,
        facultyId: faculties[2]._id,
        subjectId: subjects[4]._id
      },
      {
        day: 'Tuesday',
        startTime: '10:00',
        endTime: '11:00',
        classroom: 'Room 202',
        classId: classes[3]._id,
        facultyId: faculties[3]._id,
        subjectId: subjects[6]._id
      },
      // Wednesday schedules
      {
        day: 'Wednesday',
        startTime: '14:00',
        endTime: '15:00',
        classroom: 'Lab 1',
        classId: classes[0]._id,
        facultyId: faculties[0]._id,
        subjectId: subjects[2]._id
      },
      {
        day: 'Wednesday',
        startTime: '15:00',
        endTime: '16:00',
        classroom: 'Room 105',
        classId: classes[1]._id,
        facultyId: faculties[1]._id,
        subjectId: subjects[3]._id
      },
      // Today's schedules (assuming today is dynamic)
      {
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        startTime: '10:00',
        endTime: '11:00',
        classroom: 'Room 201',
        classId: classes[0]._id,
        facultyId: faculties[0]._id,
        subjectId: subjects[0]._id
      },
      {
        day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        startTime: '14:00',
        endTime: '15:00',
        classroom: 'Lab 2',
        classId: classes[0]._id,
        facultyId: faculties[0]._id,
        subjectId: subjects[2]._id
      }
    ]);

    console.log('📅 Created schedules');

    // Create substitutions
    const substitutions = await Substitution.insertMany([
      {
        date: new Date(),
        originalFacultyId: faculties[0]._id,
        substituteFacultyId: faculties[1]._id,
        subjectId: subjects[2]._id,
        reason: 'Medical appointment',
        classroom: 'Lab 1',
        timeSlot: '15:00-16:00',
        status: 'pending'
      },
      {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        originalFacultyId: faculties[1]._id,
        substituteFacultyId: faculties[0]._id,
        subjectId: subjects[1]._id,
        reason: 'Conference attendance',
        classroom: 'Room 102',
        timeSlot: '10:00-11:00',
        status: 'approved'
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        originalFacultyId: faculties[2]._id,
        substituteFacultyId: faculties[3]._id,
        subjectId: subjects[4]._id,
        reason: 'Personal emergency',
        classroom: 'Room 201',
        timeSlot: '09:00-10:00',
        status: 'completed'
      }
    ]);

    console.log('🔄 Created substitutions');

    // Create timetables
    const timetables = await Timetable.insertMany([
      {
        classId: classes[0]._id,
        day: 'Monday',
        timeSlots: [
          {
            startTime: '09:00',
            endTime: '10:00',
            subjectId: subjects[0]._id,
            facultyId: faculties[0]._id,
            classroom: 'Room 101'
          },
          {
            startTime: '11:00',
            endTime: '12:00',
            subjectId: subjects[2]._id,
            facultyId: faculties[0]._id,
            classroom: 'Room 103'
          }
        ]
      },
      {
        classId: classes[1]._id,
        day: 'Monday',
        timeSlots: [
          {
            startTime: '10:00',
            endTime: '11:00',
            subjectId: subjects[1]._id,
            facultyId: faculties[1]._id,
            classroom: 'Room 102'
          }
        ]
      },
      {
        classId: classes[0]._id,
        day: 'Wednesday',
        timeSlots: [
          {
            startTime: '14:00',
            endTime: '15:00',
            subjectId: subjects[2]._id,
            facultyId: faculties[0]._id,
            classroom: 'Lab 1'
          }
        ]
      }
    ]);

    console.log('📋 Created timetables');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   👤 Users: ${await User.countDocuments()}`);
    console.log(`   📚 Subjects: ${await Subject.countDocuments()}`);
    console.log(`   🏫 Classes: ${await Class.countDocuments()}`);
    console.log(`   📅 Schedules: ${await Schedule.countDocuments()}`);
    console.log(`   🔄 Substitutions: ${await Substitution.countDocuments()}`);
    console.log(`   📋 Timetables: ${await Timetable.countDocuments()}`);

    console.log('\n🔑 Login Credentials:');
    console.log('   Admin: admin@university.edu / admin123');
    console.log('   Faculty: jane.smith@university.edu / password123');
    console.log('   Student: alice.johnson@student.edu / student123');

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the seeder
const runSeeder = async () => {
  await connectDB();
  await seedDatabase();
};

runSeeder(); 