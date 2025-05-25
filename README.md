# Smart Timetable & Substitution Manager

A comprehensive web application for managing academic timetables, faculty substitutions, and special classes in educational institutions.

## Features

### 🎯 Core Functionality
- **Role-based Authentication** - Separate dashboards for Students, Faculty, and Administrators
- **Smart Timetable Management** - Automated scheduling with conflict detection
- **Substitution Management** - Easy faculty substitution requests and approvals
- **Special Classes** - Schedule and manage extra-curricular sessions
- **Real-time Updates** - Live notifications for schedule changes

### 👥 User Roles

#### Students
- View personal timetable
- Browse and register for special classes
- Receive notifications for schedule changes
- Access academic resources

#### Faculty
- Manage teaching schedule
- Request substitutions
- Set availability preferences
- Create special classes

#### Administrators
- Manage all users and permissions
- Approve substitution requests
- Generate timetables
- System analytics and reports

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Express Validator** for input validation

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for form management
- **React Query** for data fetching
- **Lucide React** for icons

## Database Schema

### Collections

#### 1. Users Collection
```javascript
{
  "_id": ObjectId("..."),
  "name": "Dr. Alice Smith",
  "email": "alice@college.edu",
  "passwordHash": "hashedpassword123",
  "role": "faculty", // "student", "faculty", "admin"
  "department": "Computer Science",
  "availability": [
    {
      "day": "Monday",
      "slots": ["09:00", "11:00", "14:00"]
    }
  ],
  "createdAt": ISODate("2025-05-23T10:00:00Z")
}
```

#### 2. Schedules Collection
```javascript
{
  "_id": ObjectId("..."),
  "date": "2025-05-25",
  "classCode": "CS301",
  "subject": "Data Structures",
  "facultyId": ObjectId("..."),
  "room": "B201",
  "startTime": "10:00",
  "endTime": "11:00",
  "status": "active", // "active", "cancelled", "substituted", "special"
  "substituteFacultyId": ObjectId("..."),
  "notes": "Special session on graphs",
  "updatedBy": ObjectId("..."),
  "lastUpdated": ISODate("2025-05-24T15:30:00Z")
}
```

#### 3. Substitutions Collection
```javascript
{
  "_id": ObjectId("..."),
  "originalScheduleId": ObjectId("..."),
  "replacedFacultyId": ObjectId("..."),
  "substituteFacultyId": ObjectId("..."),
  "reason": "Medical Leave",
  "approvedBy": ObjectId("..."),
  "timestamp": ISODate("2025-05-24T12:00:00Z")
}
```

#### 4. Special Classes Collection
```javascript
{
  "_id": ObjectId("..."),
  "classCode": "CS301",
  "subject": "Advanced Sorting",
  "facultyId": ObjectId("..."),
  "date": "2025-06-01",
  "startTime": "15:00",
  "endTime": "17:00",
  "room": "Lab1",
  "description": "Extra session before mid-terms",
  "createdBy": ObjectId("..."),
  "createdAt": ISODate("2025-05-22T09:15:00Z")
}
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Smart_Timetable_&_Substitution_Manager
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/timetable_db
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   BCRYPT_ROUNDS=12
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the backend server**
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `POST /api/auth/logout` - User logout

### Health Check
- `GET /api/health` - Server health status

## Usage

### Demo Accounts
For testing purposes, you can create demo accounts with the following credentials:

**Admin Account:**
- Email: admin@college.edu
- Password: password
- Role: Administrator

**Faculty Account:**
- Email: faculty@college.edu
- Password: password
- Role: Faculty

**Student Account:**
- Email: student@college.edu
- Password: password
- Role: Student

### Getting Started

1. **Register/Login**: Create an account or use demo credentials
2. **Set Profile**: Complete your profile information
3. **Faculty**: Set your availability schedule
4. **Admin**: Start creating timetables and managing users
5. **Students**: View your timetable and browse special classes

## Development

### Project Structure
```
Smart_Timetable_&_Substitution_Manager/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

### Available Scripts

**Backend:**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet.js security headers

## Future Enhancements

- [ ] Email notifications
- [ ] Mobile app support
- [ ] Advanced analytics dashboard
- [ ] Integration with external calendar systems
- [ ] Automated conflict resolution
- [ ] Multi-language support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository. 