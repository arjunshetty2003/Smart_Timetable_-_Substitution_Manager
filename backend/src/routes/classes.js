const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const { protect } = require('../middleware/auth');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { department, semester, facultyId, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (facultyId) query.facultyId = facultyId;

    const classes = await Class.find(query)
      .populate('facultyId', 'name email department')
      .populate('scheduleId')
      .sort({ department: 1, semester: 1, className: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Class.countDocuments(query);

    res.status(200).json({
      success: true,
      count: classes.length,
      total,
      data: classes
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes',
      error: error.message
    });
  }
});

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('facultyId', 'name email department')
      .populate('scheduleId');

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      data: classData
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class',
      error: error.message
    });
  }
});

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    console.log('=== CREATE CLASS REQUEST ===');
    console.log('User:', req.user);
    console.log('Request body:', req.body);
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('Access denied - user role:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Clean up the request body - remove empty facultyId
    const cleanedData = { ...req.body };
    if (!cleanedData.facultyId || cleanedData.facultyId === '' || cleanedData.facultyId === null || cleanedData.facultyId === undefined) {
      delete cleanedData.facultyId;
    }

    console.log('Cleaned data:', cleanedData);

    const classData = await Class.create(cleanedData);
    console.log('Class created successfully:', classData);
    
    const populatedClass = await Class.findById(classData._id)
      .populate('facultyId', 'name email department')
      .populate('scheduleId');

    console.log('Populated class:', populatedClass);

    res.status(201).json({
      success: true,
      data: populatedClass
    });
  } catch (error) {
    console.error('Create class error:', error);
    console.error('Error stack:', error.stack);
    res.status(400).json({
      success: false,
      message: 'Failed to create class',
      error: error.message
    });
  }
});

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Clean up the request body - remove empty facultyId
    const cleanedData = { ...req.body };
    if (!cleanedData.facultyId || cleanedData.facultyId === '' || cleanedData.facultyId === null || cleanedData.facultyId === undefined) {
      delete cleanedData.facultyId;
    }

    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      cleanedData,
      { new: true, runValidators: true }
    )
    .populate('facultyId', 'name email department')
    .populate('scheduleId');

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      data: classData
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update class',
      error: error.message
    });
  }
});

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const classData = await Class.findByIdAndDelete(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete class',
      error: error.message
    });
  }
});

module.exports = router; 