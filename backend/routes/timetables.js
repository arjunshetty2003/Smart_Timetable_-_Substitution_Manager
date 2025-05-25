const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const { protect } = require('../middleware/auth');

// @desc    Get all timetables
// @route   GET /api/timetables
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { classId, day, facultyId, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (classId) query.classId = classId;
    if (day) query.day = day;
    if (facultyId) query['timeSlots.facultyId'] = facultyId;

    const timetables = await Timetable.find(query)
      .populate('classId', 'className courseCode department semester')
      .populate('timeSlots.facultyId', 'name email department')
      .populate('timeSlots.subjectId', 'subjectName subjectCode credits')
      .sort({ day: 1, 'timeSlots.startTime': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Timetable.countDocuments(query);

    res.status(200).json({
      success: true,
      count: timetables.length,
      total,
      data: timetables
    });
  } catch (error) {
    console.error('Get timetables error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetables',
      error: error.message
    });
  }
});

// @desc    Get single timetable
// @route   GET /api/timetables/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('classId', 'className courseCode department semester')
      .populate('timeSlots.facultyId', 'name email department')
      .populate('timeSlots.subjectId', 'subjectName subjectCode credits');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    res.status(200).json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Get timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch timetable',
      error: error.message
    });
  }
});

// @desc    Create new timetable
// @route   POST /api/timetables
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

    const timetable = await Timetable.create(req.body);
    const populatedTimetable = await Timetable.findById(timetable._id)
      .populate('classId', 'className courseCode department semester')
      .populate('timeSlots.facultyId', 'name email department')
      .populate('timeSlots.subjectId', 'subjectName subjectCode credits');

    res.status(201).json({
      success: true,
      data: populatedTimetable
    });
  } catch (error) {
    console.error('Create timetable error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create timetable',
      error: error.message
    });
  }
});

// @desc    Update timetable
// @route   PUT /api/timetables/:id
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

    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('classId', 'className courseCode department semester')
    .populate('timeSlots.facultyId', 'name email department')
    .populate('timeSlots.subjectId', 'subjectName subjectCode credits');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    res.status(200).json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update timetable',
      error: error.message
    });
  }
});

// @desc    Delete timetable
// @route   DELETE /api/timetables/:id
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

    const timetable = await Timetable.findByIdAndDelete(req.params.id);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Timetable deleted successfully'
    });
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete timetable',
      error: error.message
    });
  }
});

// @desc    Add time slot to timetable
// @route   POST /api/timetables/:id/timeslots
// @access  Private (Admin only)
router.post('/:id/timeslots', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { $push: { timeSlots: req.body } },
      { new: true, runValidators: true }
    )
    .populate('classId', 'className courseCode department semester')
    .populate('timeSlots.facultyId', 'name email department')
    .populate('timeSlots.subjectId', 'subjectName subjectCode credits');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    res.status(200).json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Add timeslot error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add time slot',
      error: error.message
    });
  }
});

// @desc    Remove time slot from timetable
// @route   DELETE /api/timetables/:id/timeslots/:slotId
// @access  Private (Admin only)
router.delete('/:id/timeslots/:slotId', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { $pull: { timeSlots: { _id: req.params.slotId } } },
      { new: true }
    )
    .populate('classId', 'className courseCode department semester')
    .populate('timeSlots.facultyId', 'name email department')
    .populate('timeSlots.subjectId', 'subjectName subjectCode credits');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }

    res.status(200).json({
      success: true,
      data: timetable
    });
  } catch (error) {
    console.error('Remove timeslot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove time slot',
      error: error.message
    });
  }
});

module.exports = router; 