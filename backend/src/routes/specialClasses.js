const express = require('express');
const router = express.Router();
const SpecialClass = require('../models/SpecialClass');
const { protect } = require('../middleware/auth');

// @desc    Get all special classes
// @route   GET /api/special-classes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { date, facultyId, status, type, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (date) query.date = date;
    if (facultyId) query.facultyId = facultyId;
    if (status) query.status = status;
    if (type) query.type = type;

    // Role-based filtering
    if (req.user.role === 'faculty') {
      query.facultyId = req.user._id;
    }

    const specialClasses = await SpecialClass.find(query)
      .populate('facultyId', 'name email department')
      .populate('createdBy', 'name email')
      .populate('registeredStudents', 'name email')
      .sort({ date: 1, startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SpecialClass.countDocuments(query);

    res.status(200).json({
      success: true,
      count: specialClasses.length,
      total,
      data: specialClasses
    });
  } catch (error) {
    console.error('Get special classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch special classes',
      error: error.message
    });
  }
});

// @desc    Get single special class
// @route   GET /api/special-classes/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const specialClass = await SpecialClass.findById(req.params.id)
      .populate('facultyId', 'name email department')
      .populate('createdBy', 'name email')
      .populate('registeredStudents', 'name email');

    if (!specialClass) {
      return res.status(404).json({
        success: false,
        message: 'Special class not found'
      });
    }

    res.status(200).json({
      success: true,
      data: specialClass
    });
  } catch (error) {
    console.error('Get special class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch special class',
      error: error.message
    });
  }
});

// @desc    Create new special class
// @route   POST /api/special-classes
// @access  Private (Faculty and Admin)
router.post('/', protect, async (req, res) => {
  try {
    // Check if user is faculty or admin
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Faculty or Admin only.'
      });
    }

    // Add creator ID to the request body
    const specialClassData = {
      ...req.body,
      createdBy: req.user._id
    };

    // If faculty is creating, set themselves as the faculty
    if (req.user.role === 'faculty' && !specialClassData.facultyId) {
      specialClassData.facultyId = req.user._id;
    }

    const specialClass = await SpecialClass.create(specialClassData);
    const populatedSpecialClass = await SpecialClass.findById(specialClass._id)
      .populate('facultyId', 'name email department')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedSpecialClass
    });
  } catch (error) {
    console.error('Create special class error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create special class',
      error: error.message
    });
  }
});

// @desc    Update special class
// @route   PUT /api/special-classes/:id
// @access  Private (Creator, Faculty assigned, or Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const specialClass = await SpecialClass.findById(req.params.id);

    if (!specialClass) {
      return res.status(404).json({
        success: false,
        message: 'Special class not found'
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isCreator = specialClass.createdBy.toString() === req.user._id.toString();
    const isFaculty = specialClass.facultyId.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator && !isFaculty) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedSpecialClass = await SpecialClass.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('facultyId', 'name email department')
    .populate('createdBy', 'name email')
    .populate('registeredStudents', 'name email');

    res.status(200).json({
      success: true,
      data: updatedSpecialClass
    });
  } catch (error) {
    console.error('Update special class error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update special class',
      error: error.message
    });
  }
});

// @desc    Delete special class
// @route   DELETE /api/special-classes/:id
// @access  Private (Creator or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const specialClass = await SpecialClass.findById(req.params.id);

    if (!specialClass) {
      return res.status(404).json({
        success: false,
        message: 'Special class not found'
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isCreator = specialClass.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await SpecialClass.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Special class deleted successfully'
    });
  } catch (error) {
    console.error('Delete special class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete special class',
      error: error.message
    });
  }
});

// @desc    Register student for special class
// @route   POST /api/special-classes/:id/register
// @access  Private (Students)
router.post('/:id/register', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can register for special classes'
      });
    }

    const specialClass = await SpecialClass.findById(req.params.id);

    if (!specialClass) {
      return res.status(404).json({
        success: false,
        message: 'Special class not found'
      });
    }

    if (specialClass.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for this class'
      });
    }

    await specialClass.registerStudent(req.user._id);

    const updatedSpecialClass = await SpecialClass.findById(req.params.id)
      .populate('facultyId', 'name email department')
      .populate('registeredStudents', 'name email');

    res.status(200).json({
      success: true,
      message: 'Successfully registered for special class',
      data: updatedSpecialClass
    });
  } catch (error) {
    console.error('Register for special class error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to register for special class'
    });
  }
});

// @desc    Unregister student from special class
// @route   DELETE /api/special-classes/:id/register
// @access  Private (Students)
router.delete('/:id/register', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can unregister from special classes'
      });
    }

    const specialClass = await SpecialClass.findById(req.params.id);

    if (!specialClass) {
      return res.status(404).json({
        success: false,
        message: 'Special class not found'
      });
    }

    await specialClass.unregisterStudent(req.user._id);

    const updatedSpecialClass = await SpecialClass.findById(req.params.id)
      .populate('facultyId', 'name email department')
      .populate('registeredStudents', 'name email');

    res.status(200).json({
      success: true,
      message: 'Successfully unregistered from special class',
      data: updatedSpecialClass
    });
  } catch (error) {
    console.error('Unregister from special class error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to unregister from special class'
    });
  }
});

// @desc    Get upcoming special classes
// @route   GET /api/special-classes/upcoming
// @access  Private
router.get('/upcoming', protect, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const specialClasses = await SpecialClass.findUpcoming(parseInt(limit));

    res.status(200).json({
      success: true,
      count: specialClasses.length,
      data: specialClasses
    });
  } catch (error) {
    console.error('Get upcoming special classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming special classes',
      error: error.message
    });
  }
});

module.exports = router; 