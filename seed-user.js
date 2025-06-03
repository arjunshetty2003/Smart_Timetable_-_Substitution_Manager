const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Define User Schema (simplified version)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],
    default: 'student'
  },
  department: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create User model
const User = mongoose.model('User', UserSchema);

// Seed user function
const seedUser = async () => {
  try {
    // Check if user already exists
    const userExists = await User.findOne({ email: 'admin@college.edu' });
    
    if (userExists) {
      console.log('User already exists. Updating password...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      
      // Update user
      await User.findByIdAndUpdate(userExists._id, { 
        passwordHash: hashedPassword,
        isActive: true
      });
      
      console.log('User updated successfully');
    } else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      
      // Create new user
      await User.create({
        name: 'Admin User',
        email: 'admin@college.edu',
        passwordHash: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      console.log('User created successfully');
    }
    
    // Create faculty user
    const facultyExists = await User.findOne({ email: 'faculty@college.edu' });
    
    if (!facultyExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      
      await User.create({
        name: 'Faculty User',
        email: 'faculty@college.edu',
        passwordHash: hashedPassword,
        role: 'faculty',
        department: 'Computer Science',
        isActive: true
      });
      
      console.log('Faculty user created successfully');
    }
    
    // Create student user
    const studentExists = await User.findOne({ email: 'student@college.edu' });
    
    if (!studentExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password', salt);
      
      await User.create({
        name: 'Student User',
        email: 'student@college.edu',
        passwordHash: hashedPassword,
        role: 'student',
        department: 'Computer Science',
        isActive: true
      });
      
      console.log('Student user created successfully');
    }
    
    console.log('All users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
  }
};

// Run seed
seedUser(); 