const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const checkUsers = async () => {
  try {
    console.log('🔍 Checking users in database...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📍 Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('+passwordHash');
    console.log(`\n👥 Found ${users.length} users:`);
    
    for (const user of users) {
      console.log(`\n📧 Email: ${user.email}`);
      console.log(`👤 Name: ${user.name}`);
      console.log(`🎭 Role: ${user.role}`);
      console.log(`🔑 Password Hash: ${user.passwordHash.substring(0, 20)}...`);
      
      // Test password comparison
      try {
        const testPassword = user.email === 'student@university.edu' ? 'student123' : 
                            user.email === 'faculty@university.edu' ? 'faculty123' :
                            user.email === 'admin@university.edu' ? 'admin123' : 'password123';
        
        const isMatch = await user.matchPassword(testPassword);
        console.log(`✅ Password test for "${testPassword}": ${isMatch ? 'PASS' : 'FAIL'}`);
        
        // Also test bcrypt directly
        const directMatch = await bcrypt.compare(testPassword, user.passwordHash);
        console.log(`🔧 Direct bcrypt test: ${directMatch ? 'PASS' : 'FAIL'}`);
        
      } catch (error) {
        console.log(`❌ Password test error: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
    process.exit(0);
  }
};

checkUsers(); 