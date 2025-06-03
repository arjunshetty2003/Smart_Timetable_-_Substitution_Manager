const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const seedAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@university.edu' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@university.edu',
      passwordHash: 'admin123',
      role: 'admin',
      department: 'Administration',
      isActive: true
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@university.edu');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedAdminUser(); 