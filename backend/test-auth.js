const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testAuth = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const user = await User.findOne({ email: 'admin@university.edu' }).select('+passwordHash');
    console.log('User found:', !!user);
    
    if (user) {
      console.log('Password hash exists:', !!user.passwordHash);
      console.log('Password hash length:', user.passwordHash?.length);
      
      const isMatch = await user.matchPassword('admin123');
      console.log('Password matches using user method:', isMatch);
      
      const directMatch = await bcrypt.compare('admin123', user.passwordHash);
      console.log('Password matches using direct bcrypt:', directMatch);
    }
    
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
};

testAuth(); 