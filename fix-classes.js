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

// Define Class Schema
const ClassSchema = new mongoose.Schema({
  name: String,
  department: String,
  semester: Number
});

// Create model
const Class = mongoose.model('Class', ClassSchema);

const fixClasses = async () => {
  try {
    // Get all classes
    const classes = await Class.find();
    console.log(`Found ${classes.length} classes to update`);

    // Class name mapping
    const classNames = [
      'CSE-A', 'CSE-B', 'ECE-A', 'MECH-A', 
      'IT-A', 'CIVIL-A', 'MBA-A', 'MCA-A'
    ];

    let updatedCount = 0;
    for (const cls of classes) {
      // Only update if name is missing or undefined
      if (!cls.name) {
        // Generate a name based on department if available
        let name = '';
        if (cls.department) {
          // Use first 3 letters of department + random letter
          const deptPrefix = cls.department.substring(0, 3).toUpperCase();
          const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 3)); // A, B, or C
          name = `${deptPrefix}-${randomLetter}`;
        } else {
          // Use a random name from our list
          name = classNames[Math.floor(Math.random() * classNames.length)];
        }
        
        cls.name = name;
        await cls.save();
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} classes with proper names`);
  } catch (error) {
    console.error('Error fixing classes:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the fix function
fixClasses(); 