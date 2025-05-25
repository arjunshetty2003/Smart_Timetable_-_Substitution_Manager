const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const seedUsers = async () => {
  try {
    console.log('🌱 Seeding demo users...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📍 Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Demo users
    const demoUsers = [
      {
        name: 'System Administrator',
        email: 'admin@university.edu',
        passwordHash: 'admin123',
        role: 'admin',
        department: 'Computer Science',
        availability: [
          {
            day: 'Monday',
            slots: ['09:00', '10:00', '11:00']
          }
        ]
      },
      {
        name: 'Dr. Jane Smith',
        email: 'faculty@university.edu',
        passwordHash: 'faculty123',
        role: 'faculty',
        department: 'Computer Science',
        availability: [
          {
            day: 'Monday',
            slots: ['09:00', '10:00', '14:00']
          },
          {
            day: 'Tuesday',
            slots: ['09:00', '11:00']
          }
        ]
      },
      {
        name: 'John Doe',
        email: 'student@university.edu',
        passwordHash: 'student123',
        role: 'student',
        department: 'Computer Science',
        availability: [] // Students typically don't have availability constraints
      },
      {
        name: 'Alice Johnson',
        email: 'alice@university.edu',
        passwordHash: 'password123',
        role: 'student',
        department: 'Mathematics',
        availability: []
      },
      {
        name: 'Prof. Robert Wilson',
        email: 'robert@university.edu',
        passwordHash: 'password123',
        role: 'faculty',
        department: 'Physics',
        availability: [
          {
            day: 'Wednesday',
            slots: ['10:00', '15:00']
          }
        ]
      }
    ];

    // Create users one by one to trigger pre-save middleware
    const createdUsers = [];
    for (const userData of demoUsers) {
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
    }
    
    console.log('✅ Demo users created successfully:');
    createdUsers.forEach(user => {
      console.log(`   📧 ${user.email} (${user.role}) - Password: ${demoUsers.find(u => u.email === user.email).passwordHash}`);
    });

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📝 You can now login with any of these accounts:');
    console.log('   👨‍💼 Admin: admin@university.edu / admin123');
    console.log('   👩‍🏫 Faculty: faculty@university.edu / faculty123');
    console.log('   👨‍🎓 Student: student@university.edu / student123');

  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

seedUsers(); 