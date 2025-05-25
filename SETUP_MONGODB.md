# MongoDB Atlas Setup Guide

## 📋 Environment Configuration

Create a `.env` file in the `backend` directory with the following content:

```env
NODE_ENV=development
PORT=3001

# MongoDB Atlas Configuration
MONGODB_USERNAME=new_user_31
MONGODB_PASSWORD=us7WCnGiy20HS0wW
MONGODB_CLUSTER=cluster0.ymz2b.mongodb.net
MONGODB_DATABASE=smart_timetable

# Complete MongoDB URI
MONGO_URI=mongodb+srv://new_user_31:us7WCnGiy20HS0wW@cluster0.ymz2b.mongodb.net/smart_timetable?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=smart_timetable_jwt_secret_key_2024_secure_token
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Security
BCRYPT_ROUNDS=12
```

## 🧪 Testing the Database Connection

### Step 1: Test MongoDB Atlas Connection
```bash
cd backend
npm run test-db
```

This will run a comprehensive test to verify:
- ✅ Environment variables are loaded correctly
- ✅ MongoDB Atlas connection is successful
- ✅ Database operations work properly
- ✅ Connection can be established and closed gracefully

### Step 2: Start the Backend Server
```bash
npm run dev
```

You should see output like:
```
🚀 Server Information:
   📡 Server running in development mode
   🌐 Port: 3001
   🔗 URL: http://localhost:3001
   🏥 Health Check: http://localhost:3001/api/health

✅ MongoDB Connected Successfully!
📍 Host: cluster0-shard-00-01.ymz2b.mongodb.net
🗃️  Database: smart_timetable
🌐 Connection State: Connected
```

### Step 3: Test Health Endpoint
Visit: `http://localhost:3001/api/health`

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-XX...",
  "env": "development",
  "port": "3001",
  "database": "Connected"
}
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. **Connection Timeout**
```
MongoServerSelectionError: connection timed out
```
**Solutions:**
- Check your internet connection
- Verify MongoDB Atlas cluster is running
- Ensure your IP address is whitelisted in MongoDB Atlas Network Access

#### 2. **Authentication Failed**
```
MongoServerSelectionError: bad auth : authentication failed
```
**Solutions:**
- Double-check username and password
- Verify database user has proper permissions
- Ensure the database name matches in both the URI and Atlas

#### 3. **IP Not Whitelisted**
```
MongoServerSelectionError: connection refused
```
**Solutions:**
- Add your current IP to MongoDB Atlas Network Access
- Or add `0.0.0.0/0` for allow all (not recommended for production)

#### 4. **Environment Variables Not Loading**
```
❌ Missing required environment variables: MONGO_URI
```
**Solutions:**
- Ensure `.env` file is in the `backend` directory
- Check that all required variables are present
- Restart the server after adding variables

## 🛡️ MongoDB Atlas Security Checklist

### Network Security
- [ ] IP whitelist configured (avoid 0.0.0.0/0 in production)
- [ ] Use VPC peering for production environments

### Database Security
- [ ] Strong database password
- [ ] Principle of least privilege for database users
- [ ] Enable database audit logs

### Connection Security
- [ ] Use SSL/TLS encryption (enabled by default in Atlas)
- [ ] Rotate JWT secrets regularly
- [ ] Use environment variables for all secrets

## 📊 Database Collections

The application will automatically create these collections:

1. **users** - User accounts (students, faculty, admin)
2. **schedules** - Class timetables and schedules
3. **substitutions** - Faculty substitution records
4. **specialclasses** - Special classes and events

## 🚀 Production Deployment

For production deployment:

1. **Update Environment Variables:**
   ```env
   NODE_ENV=production
   MONGO_URI=your_production_mongodb_uri
   JWT_SECRET=your_secure_production_jwt_secret
   ```

2. **Security Hardening:**
   - Use specific IP whitelisting instead of 0.0.0.0/0
   - Enable MongoDB Atlas advanced security features
   - Use MongoDB Atlas private endpoints for enhanced security
   - Implement proper backup and monitoring strategies

3. **Performance Optimization:**
   - Configure appropriate connection pool settings
   - Set up MongoDB Atlas performance monitoring
   - Implement database indexing strategies
   - Configure read preferences for better performance 