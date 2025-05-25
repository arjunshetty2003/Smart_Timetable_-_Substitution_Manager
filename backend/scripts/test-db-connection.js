const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  console.log('🔧 Testing MongoDB Atlas Connection...\n');
  
  // Display connection details (without password)
  const uri = process.env.MONGO_URI;
  if (uri) {
    const maskedUri = uri.replace(/:([^:@]*@)/, ':****@');
    console.log('📍 Connection URI:', maskedUri);
  } else {
    console.log('❌ MONGO_URI not found in environment variables');
    return;
  }
  
  try {
    console.log('⏳ Attempting to connect...');
    
    const options = {
      serverSelectionTimeoutMS: 10000, // Increase timeout for testing
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log('\n✅ Connection Successful!');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`🗃️  Database: ${conn.connection.name}`);
    console.log(`🔌 Ready State: ${conn.connection.readyState}`);
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Try to get database stats
    const admin = conn.connection.db.admin();
    const stats = await conn.connection.db.stats();
    console.log(`📊 Database Stats: ${stats.collections} collections, ${stats.objects} objects`);
    
    console.log('\n✅ All tests passed! MongoDB Atlas is ready to use.');
    
  } catch (error) {
    console.error('\n❌ Connection Failed!');
    console.error('Error Details:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n💡 Troubleshooting Tips:');
      console.error('1. Check your internet connection');
      console.error('2. Verify MongoDB Atlas credentials are correct');
      console.error('3. Ensure your IP address is whitelisted in MongoDB Atlas');
      console.error('4. Check if the cluster is running and accessible');
      console.error('5. Verify the database name in the connection string');
    }
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔒 Connection closed');
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

testConnection(); 