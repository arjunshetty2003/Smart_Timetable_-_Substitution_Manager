const express = require('express');
const { body, validationResult } = require('express-validator');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();
const Substitution = require('../models/Substitution');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Timetable = require('../models/Timetable');

// @route   GET /api/schedules
// @desc    Get schedules based on query parameters
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      date, 
      classCode, 
      facultyId, 
      status, 
      startDate, 
      endDate,
      department,
      page = 1,
      limit = 20 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (date) filter.date = new Date(date);
    if (classCode) filter.classCode = { $regex: classCode, $options: 'i' };
    if (facultyId) filter.facultyId = facultyId;
    if (status && status !== 'all') filter.status = status;
    if (department) filter.department = department;
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Role-based filtering
    if (req.user.role === 'faculty') {
      filter.facultyId = req.user.id;
    } else if (req.user.role === 'student') {
      // For students, we need to get schedules for their department
      // Find classes in the student's department
      const studentDepartment = req.user.department;
      const classes = await Class.find({ department: studentDepartment });
      if (classes && classes.length > 0) {
        const classIds = classes.map(cls => cls._id);
        filter.classId = { $in: classIds };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    try {
      const schedules = await Schedule.find(filter)
        .populate('facultyId', 'name email department')
        .populate('substituteFacultyId', 'name email department')
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Schedule.countDocuments(filter);

      res.json({
        success: true,
        schedules,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      });
    } catch (scheduleError) {
      // If Schedule model doesn't exist or has issues, return empty data
      console.log('Schedule model not ready, returning empty data');
      res.json({
        success: true,
        schedules: [],
        pagination: {
          current: 1,
          pages: 0,
          total: 0
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/schedules/dashboard
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    // Get total counts
    const [
      totalSchedules,
      totalSubstitutions,
      totalSubjects,
      totalClasses,
      activeUsers,
      todaySubstitutions
    ] = await Promise.all([
      Schedule.countDocuments(),
      Substitution.countDocuments(),
      Subject.countDocuments(),
      Class.countDocuments(),
      User.countDocuments({ isActive: true }),
      Substitution.countDocuments({
        date: {
          $gte: new Date().setHours(0, 0, 0, 0),
          $lt: new Date().setHours(23, 59, 59, 999)
        }
      })
    ]);

    // Get recent substitutions with populated data
    const recentSubstitutions = await Substitution.find()
      .populate('originalFacultyId', 'name email')
      .populate('substituteFacultyId', 'name email')
      .populate('subjectId', 'subjectName subjectCode')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get today's schedules
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const todaySchedules = await Schedule.find({ day: today })
      .populate('facultyId', 'name email')
      .populate('subjectId', 'subjectName subjectCode')
      .sort({ startTime: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalSchedules,
          totalSubstitutions,
          totalSubjects,
          totalClasses,
          activeUsers,
          todaySubstitutions
        },
        recentSubstitutions,
        todaySchedules
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// @route   GET /api/schedules/faculty/dashboard
// @desc    Get faculty dashboard statistics and today's schedule
// @access  Private/Faculty
router.get('/faculty/dashboard', protect, async (req, res) => {
  try {
    const facultyId = req.user._id;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get today's classes for faculty
    const todayClasses = await Schedule.find({ 
      facultyId,
      day: today 
    })
    .populate('subjectId', 'subjectName subjectCode')
    .sort({ startTime: 1 });

    // Get this week's classes count
    const weekClasses = await Schedule.countDocuments({ facultyId });

    // Get pending substitutions for this faculty
    const pendingSubstitutions = await Substitution.countDocuments({
      originalFacultyId: facultyId,
      status: 'pending'
    });

    // Get substitution requests (both as requester and substitute)
    const substitutionRequests = await Substitution.find({
      $or: [
        { originalFacultyId: facultyId },
        { substituteFacultyId: facultyId }
      ]
    })
    .populate('originalFacultyId', 'name email')
    .populate('substituteFacultyId', 'name email')
    .populate('subjectId', 'subjectName subjectCode')
    .sort({ createdAt: -1 })
    .limit(5);

    // Find next class
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const nextClass = todayClasses.find(cls => cls.startTime > currentTime);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          todayClasses: todayClasses.length,
          weekClasses,
          pendingSubstitutions,
          nextClass: nextClass ? `${nextClass.startTime} - ${nextClass.subjectId?.subjectName}` : 'None today'
        },
        todayClasses: todayClasses.map(cls => ({
          _id: cls._id,
          subject: cls.subjectId?.subjectName || 'Unknown Subject',
          subjectCode: cls.subjectId?.subjectCode || 'N/A',
          startTime: cls.startTime,
          endTime: cls.endTime,
          classroom: cls.classroom,
          status: 'active'
        })),
        substitutionRequests: substitutionRequests.map(sub => ({
          _id: sub._id,
          subject: sub.subjectId?.subjectName || 'Unknown Subject',
          date: sub.date,
          startTime: sub.timeSlot.split('-')[0]?.trim() || 'N/A',
          endTime: sub.timeSlot.split('-')[1]?.trim() || 'N/A',
          facultyId: sub.substituteFacultyId,
          status: sub.status
        }))
      }
    });
  } catch (error) {
    console.error('Faculty dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch faculty dashboard data',
      error: error.message
    });
  }
});

// @route   GET /api/schedules/:id
// @desc    Get schedule by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('facultyId', 'name email department')
      .populate('substituteFacultyId', 'name email department')
      .populate('updatedBy', 'name email');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/schedules
// @desc    Create new schedule
// @access  Private/Admin
router.post('/', [
  protect,
  body('date', 'Date is required').isISO8601(),
  body('classCode', 'Class code is required').notEmpty(),
  body('subject', 'Subject is required').notEmpty(),
  body('facultyId', 'Faculty ID is required').isMongoId(),
  body('room', 'Room is required').notEmpty(),
  body('startTime', 'Start time is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime', 'End time is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      date,
      classCode,
      subject,
      facultyId,
      room,
      startTime,
      endTime,
      notes
    } = req.body;

    // Check if faculty exists
    const faculty = await User.findById(facultyId);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'Invalid faculty member'
      });
    }

    // Check for scheduling conflicts
    const conflictingSchedule = await Schedule.findOne({
      date: new Date(date),
      facultyId,
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime }
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime }
        },
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime }
        }
      ],
      status: { $ne: 'cancelled' }
    });

    if (conflictingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Faculty member has a conflicting schedule at this time'
      });
    }

    const schedule = new Schedule({
      date: new Date(date),
      classCode,
      subject,
      facultyId,
      room,
      startTime,
      endTime,
      notes,
      updatedBy: req.user.id
    });

    await schedule.save();
    await schedule.populate('facultyId', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      schedule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/schedules/:id
// @desc    Update schedule
// @access  Private
router.put('/:id', [
  protect,
  body('date', 'Date must be valid').optional().isISO8601(),
  body('facultyId', 'Faculty ID must be valid').optional().isMongoId(),
  body('startTime', 'Start time format invalid').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime', 'End time format invalid').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== schedule.facultyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const {
      date,
      classCode,
      subject,
      facultyId,
      room,
      startTime,
      endTime,
      status,
      notes
    } = req.body;

    // Update fields
    if (date) schedule.date = new Date(date);
    if (classCode) schedule.classCode = classCode;
    if (subject) schedule.subject = subject;
    if (facultyId) schedule.facultyId = facultyId;
    if (room) schedule.room = room;
    if (startTime) schedule.startTime = startTime;
    if (endTime) schedule.endTime = endTime;
    if (status) schedule.status = status;
    if (notes !== undefined) schedule.notes = notes;

    schedule.updatedBy = req.user.id;
    schedule.lastUpdated = new Date();

    await schedule.save();
    await schedule.populate('facultyId', 'name email department');

    res.json({
      success: true,
      message: 'Schedule updated successfully',
      schedule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/schedules/:id
// @desc    Delete schedule
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    await Schedule.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/schedules/:id/substitute
// @desc    Request substitution for a schedule
// @access  Private
router.post('/:id/substitute', [
  protect,
  body('reason', 'Reason is required').notEmpty(),
  body('substituteFacultyId', 'Substitute faculty ID is required').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    // Only the assigned faculty or admin can request substitution
    if (req.user.role !== 'admin' && req.user.id !== schedule.facultyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { reason, substituteFacultyId } = req.body;

    // Update schedule status
    schedule.status = 'substituted';
    if (substituteFacultyId) {
      schedule.substituteFacultyId = substituteFacultyId;
    }
    schedule.notes = `Substitution requested: ${reason}`;
    schedule.updatedBy = req.user.id;
    schedule.lastUpdated = new Date();

    await schedule.save();

    res.json({
      success: true,
      message: 'Substitution request submitted successfully',
      schedule
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/schedules/student/dashboard
// @desc    Get student dashboard with today's classes
// @access  Private/Student
router.get('/student/dashboard', protect, async (req, res) => {
  try {
    // Verify user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Student only.'
      });
    }

    const studentId = req.user._id;
    const studentDepartment = req.user.department;
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find classes for this student's department
    const classes = await Class.find({ department: studentDepartment });
    
    if (!classes || classes.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          todayClasses: [],
          upcomingClass: null,
          stats: {
            totalClassesToday: 0,
            completedClasses: 0,
            upcomingClasses: 0
          }
        }
      });
    }
    
    const classIds = classes.map(cls => cls._id);
    
    // Get today's timetable for these classes
    const timetables = await Timetable.find({ 
      classId: { $in: classIds },
      day: today
    })
    .populate('classId', 'className courseCode department semester')
    .populate('timeSlots.facultyId', 'name email department')
    .populate('timeSlots.subjectId', 'subjectName subjectCode credits')
    .sort({ 'timeSlots.startTime': 1 });
    
    // Flatten the timetables to get all classes
    let todayClasses = [];
    timetables.forEach(timetable => {
      timetable.timeSlots.forEach(slot => {
        todayClasses.push({
          id: slot._id,
          subject: slot.subjectId.subjectName,
          subjectCode: slot.subjectId.subjectCode,
          faculty: slot.facultyId.name,
          startTime: slot.startTime,
          endTime: slot.endTime,
          classroom: slot.classroom,
          className: timetable.classId.className
        });
      });
    });
    
    // Sort by start time
    todayClasses.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
    
    // Check for substitutions
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const substitutions = await Substitution.find({
      date: { $gte: todayDate, $lte: endDate },
      status: { $in: ['approved', 'pending'] }
    })
    .populate('originalFacultyId', 'name email')
    .populate('substituteFacultyId', 'name email')
    .populate('subjectId', 'subjectName subjectCode');
    
    // Update classes with substitution information
    todayClasses = todayClasses.map(cls => {
      const matchingSubstitution = substitutions.find(sub => 
        sub.subjectId.subjectCode === cls.subjectCode &&
        sub.originalFacultyId.name === cls.faculty
      );
      
      if (matchingSubstitution) {
        return {
          ...cls,
          hasSubstitution: true,
          substituteFaculty: matchingSubstitution.substituteFacultyId?.name || 'Pending',
          substitutionStatus: matchingSubstitution.status
        };
      }
      
      return {
        ...cls,
        hasSubstitution: false
      };
    });
    
    // Calculate current and upcoming classes
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const completedClasses = todayClasses.filter(cls => cls.endTime < currentTime);
    const upcomingClasses = todayClasses.filter(cls => cls.startTime > currentTime);
    const currentClasses = todayClasses.filter(cls => 
      cls.startTime <= currentTime && cls.endTime >= currentTime
    );
    
    // Find the next upcoming class
    const nextClass = upcomingClasses.length > 0 ? upcomingClasses[0] : null;
    
    res.status(200).json({
      success: true,
      data: {
        todayClasses,
        currentClass: currentClasses.length > 0 ? currentClasses[0] : null,
        upcomingClass: nextClass,
        stats: {
          totalClassesToday: todayClasses.length,
          completedClasses: completedClasses.length,
          currentClasses: currentClasses.length,
          upcomingClasses: upcomingClasses.length
        }
      }
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student dashboard data',
      error: error.message
    });
  }
});

module.exports = router; 