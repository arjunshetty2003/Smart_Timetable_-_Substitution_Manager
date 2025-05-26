# API Services Structure

This directory contains role-based API service files that organize database operations by user roles for better maintainability and understanding.

## File Structure

```
services/
├── commonAPI.js     # Shared operations for all roles (auth, health, basic reads)
├── adminAPI.js      # Admin-only database operations  
├── facultyAPI.js    # Faculty-only database operations
├── studentAPI.js    # Student-only database operations
├── authService.js   # Legacy auth service (can be replaced by commonAPI)
└── api.js          # Legacy combined API (being phased out)
```

## Role-Based API Guide

### 🔧 Admin Operations (`adminAPI.js`)
**What admins can do:**
- **User Management**: Create, update, delete all users
- **Subject Management**: Manage all subjects in the system
- **Class Management**: Create and manage all classes
- **Timetable Management**: Create, update, delete all timetables
- **Substitution Management**: Approve/reject substitution requests
- **Special Classes**: Oversee all special classes
- **Notifications**: Send system-wide notifications
- **Analytics**: View system-wide reports and statistics

**Usage Example:**
```javascript
import { adminUsersAPI, adminTimetablesAPI } from '../services/adminAPI';

// Get all users
const users = await adminUsersAPI.getAllUsers();

// Create a new timetable
const timetable = await adminTimetablesAPI.createTimetable(timetableData);
```

### 👨‍🏫 Faculty Operations (`facultyAPI.js`)
**What faculty can do:**
- **Timetable Viewing**: View their assigned timetables only
- **Substitution Requests**: Create requests for substitutions/unavailability
- **Special Classes**: Create and manage their special classes
- **Class Cancellation**: Cancel their scheduled classes
- **Profile Management**: Update their own profile and availability
- **Notifications**: View faculty-specific notifications

**Usage Example:**
```javascript
import { facultyTimetablesAPI, facultySubstitutionsAPI } from '../services/facultyAPI';

// Get faculty's own timetables
const myTimetables = await facultyTimetablesAPI.getMyTimetables(facultyId);

// Mark unavailability
await facultySubstitutionsAPI.markUnavailable(unavailabilityData);
```

### 👨‍🎓 Student Operations (`studentAPI.js`)
**What students can do:**
- **Timetable Viewing**: View their class timetables
- **Special Classes**: Register for available special classes
- **Notifications**: View student announcements
- **Academic Resources**: Access grades, attendance, assignments
- **Profile Management**: Update their academic information
- **Substitution Notifications**: View class changes/cancellations

**Usage Example:**
```javascript
import { studentTimetablesAPI, studentSpecialClassesAPI } from '../services/studentAPI';

// Get student's class timetable
const classTimetable = await studentTimetablesAPI.getTimetableByClass(classId);

// Register for special class
await studentSpecialClassesAPI.registerForSpecialClass(specialClassId);
```

### 🌐 Common Operations (`commonAPI.js`)
**What all users can do:**
- **Authentication**: Login, logout, register
- **Profile**: Get and update basic profile
- **Health Check**: System status monitoring
- **Basic Reading**: View basic subject/class information

**Usage Example:**
```javascript
import { authAPI, commonReadAPI } from '../services/commonAPI';

// Login (all roles)
const response = await authAPI.login(credentials);

// Get basic subjects list (all roles)
const subjects = await commonReadAPI.getAllSubjects();
```

## Benefits of This Structure

### ✅ **Easier to Understand**
- Each file contains only operations relevant to that role
- Clear separation of permissions and capabilities
- Reduces cognitive load when working on specific features

### ✅ **Better Maintainability**
- Changes to admin features only affect `adminAPI.js`
- Faculty-specific bugs are isolated to `facultyAPI.js`
- Easier to add new role-specific features

### ✅ **Enhanced Security**
- Clear visibility of what each role can access
- Easier to audit permissions and access controls
- Prevents accidental cross-role API usage

### ✅ **Improved Development**
- Developers can focus on one role at a time
- Faster development with role-specific imports
- Better IntelliSense and auto-completion

## Migration Guide

### From Old API (`api.js`) to New Structure:

**Before:**
```javascript
import { timetablesAPI, substitutionsAPI } from '../services/api';
```

**After (for Faculty):**
```javascript
import { facultyTimetablesAPI, facultySubstitutionsAPI } from '../services/facultyAPI';
```

**After (for Admin):**
```javascript
import { adminTimetablesAPI, adminSubstitutionsAPI } from '../services/adminAPI';
```

## Best Practices

1. **Use Role-Specific APIs**: Always import from the appropriate role file
2. **Common Operations**: Use `commonAPI.js` for shared functionality
3. **Naming Convention**: APIs are prefixed with role name (e.g., `facultyTimetablesAPI`)
4. **Error Handling**: All APIs include consistent error handling and token management
5. **Documentation**: Each API function includes clear parameter descriptions

## Quick Reference

| Role | File | Primary Use Cases |
|------|------|-------------------|
| Admin | `adminAPI.js` | System management, user control, approvals |
| Faculty | `facultyAPI.js` | Teaching schedule, substitutions, special classes |
| Student | `studentAPI.js` | Class schedules, registrations, academic data |
| All | `commonAPI.js` | Authentication, basic reading, health checks |

This structure makes the codebase more organized, secure, and easier to work with for developers focusing on specific user roles. 