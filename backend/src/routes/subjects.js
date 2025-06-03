const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const { protect } = require('../middleware/auth');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { department, semester, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);

    const subjects = await Subject.find(query)
      .sort({ department: 1, semester: 1, subjectName: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Subject.countDocuments(query);

    res.status(200).json({
      success: true,
      count: subjects.length,
      total,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
});

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subject',
      error: error.message
    });
  }
});

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const subject = await Subject.create(req.body);

    res.status(201).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create subject',
      error: error.message
    });
  }
});

// @desc    Update subject
// @route   PUT /api/subjects/:id
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

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update subject',
      error: error.message
    });
  }
});

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
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

    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subject',
      error: error.message
    });
  }
});

module.exports = router; 