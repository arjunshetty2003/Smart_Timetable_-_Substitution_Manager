const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const { protect, authorize } = require('../middleware/auth');
const Class = require('../models/Class');
const Substitution = require('../models/Substitution');

// @desc    Get all timetables
// @route   GET /api/timetables
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { classId, day, facultyId, page = 1, limit = 10 } = req.query;
    
    console.log('=== GET TIMETABLES REQUEST ===');
    console.log('Query params:', { classId, day, facultyId, page, limit });
    
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

    console.log('Found timetables:', timetables.length);
    
    // Flatten the timetables for frontend compatibility
    const flattenedTimetables = [];
    timetables.forEach(timetable => {
      if (timetable.timeSlots && timetable.timeSlots.length > 0) {
        timetable.timeSlots.forEach(slot => {
          flattenedTimetables.push({
            _id: `${timetable._id}_${slot._id}`,
            timetableId: timetable._id,
            slotId: slot._id,
            classId: timetable.classId,
            day: timetable.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            subjectId: slot.subjectId,
            facultyId: slot.facultyId,
            room: slot.classroom,
            isActive: true,
            semester: timetable.classId?.semester || 1,
            academicYear: new Date().getFullYear()
          });
        });
      }
    });

    console.log('Flattened timetables:', flattenedTimetables.length);

    const total = flattenedTimetables.length;

    res.status(200).json({
      success: true,
      count: flattenedTimetables.length,
      total,
      data: flattenedTimetables
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
    console.log('=== CREATE TIMETABLE REQUEST ===');
    console.log('User:', req.user);
    console.log('Request body:', req.body);
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Transform flat structure to nested structure
    const { classId, subjectId, facultyId, day, startTime, endTime, room, ...otherFields } = req.body;
    
    // Check if this is a flat structure (single timetable entry)
    if (subjectId && facultyId && startTime && endTime && room) {
      console.log('Detected flat structure, transforming to nested...');
      
      // First, check if timetable for this class and day already exists
      let existingTimetable = await Timetable.findOne({ classId, day });
      
      if (existingTimetable) {
        console.log('Adding to existing timetable:', existingTimetable._id);
        // Add new time slot to existing timetable
        existingTimetable.timeSlots.push({
          startTime,
          endTime,
          subjectId,
          facultyId,
          classroom: room
        });
        await existingTimetable.save();
        
        const populatedTimetable = await Timetable.findById(existingTimetable._id)
          .populate('classId', 'className courseCode department semester')
          .populate('timeSlots.facultyId', 'name email department')
          .populate('timeSlots.subjectId', 'subjectName subjectCode credits');
          
        return res.status(201).json({
          success: true,
          data: populatedTimetable
        });
      } else {
        console.log('Creating new timetable with time slot...');
        // Create new timetable with time slot
        const timetableData = {
          classId,
          day,
          timeSlots: [{
            startTime,
            endTime,
            subjectId,
            facultyId,
            classroom: room
          }]
        };
        
        console.log('Timetable data to create:', timetableData);
        const timetable = await Timetable.create(timetableData);
        
        const populatedTimetable = await Timetable.findById(timetable._id)
          .populate('classId', 'className courseCode department semester')
          .populate('timeSlots.facultyId', 'name email department')
          .populate('timeSlots.subjectId', 'subjectName subjectCode credits');

        return res.status(201).json({
          success: true,
          data: populatedTimetable
        });
      }
    } else {
      console.log('Using request body as-is (nested structure)');
      // Use the request body as-is (nested structure)
      const timetable = await Timetable.create(req.body);
      const populatedTimetable = await Timetable.findById(timetable._id)
        .populate('classId', 'className courseCode department semester')
        .populate('timeSlots.facultyId', 'name email department')
        .populate('timeSlots.subjectId', 'subjectName subjectCode credits');

      return res.status(201).json({
        success: true,
        data: populatedTimetable
      });
    }
  } catch (error) {
    console.error('Create timetable error:', error);
    console.error('Error stack:', error.stack);
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
    console.log('=== UPDATE TIMETABLE REQUEST ===');
    console.log('ID to update:', req.params.id);
    console.log('Request body:', req.body);
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Check if this is a composite ID (timetableId_slotId)
    if (req.params.id.includes('_')) {
      console.log('Detected composite ID, updating time slot...');
      const [timetableId, slotId] = req.params.id.split('_');
      
      // Extract the time slot data from the request body
      const timeSlotUpdate = {
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        subjectId: req.body.subjectId,
        facultyId: req.body.facultyId,
        classroom: req.body.room
      };

      console.log('Updating time slot:', slotId, 'with data:', timeSlotUpdate);

      // Update the specific time slot within the timetable
      const timetable = await Timetable.findOneAndUpdate(
        { _id: timetableId, 'timeSlots._id': slotId },
        { 
          $set: { 
            'timeSlots.$.startTime': timeSlotUpdate.startTime,
            'timeSlots.$.endTime': timeSlotUpdate.endTime,
            'timeSlots.$.subjectId': timeSlotUpdate.subjectId,
            'timeSlots.$.facultyId': timeSlotUpdate.facultyId,
            'timeSlots.$.classroom': timeSlotUpdate.classroom,
            day: req.body.day,
            classId: req.body.classId
          }
        },
        { new: true, runValidators: true }
      )
      .populate('classId', 'className courseCode department semester')
      .populate('timeSlots.facultyId', 'name email department')
      .populate('timeSlots.subjectId', 'subjectName subjectCode credits');

      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: 'Timetable or time slot not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: timetable
      });
    } else {
      console.log('Regular timetable ID, updating entire timetable...');
      // Regular timetable update
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

      return res.status(200).json({
        success: true,
        data: timetable
      });
    }
  } catch (error) {
    console.error('Update timetable error:', error);
    console.error('Error stack:', error.stack);
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
    console.log('=== DELETE TIMETABLE REQUEST ===');
    console.log('ID to delete:', req.params.id);
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    // Check if this is a composite ID (timetableId_slotId)
    if (req.params.id.includes('_')) {
      console.log('Detected composite ID, removing time slot...');
      const [timetableId, slotId] = req.params.id.split('_');
      
      const timetable = await Timetable.findByIdAndUpdate(
        timetableId,
        { $pull: { timeSlots: { _id: slotId } } },
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

      // If no time slots left, delete the entire timetable
      if (timetable.timeSlots.length === 0) {
        console.log('No time slots left, deleting entire timetable...');
        await Timetable.findByIdAndDelete(timetableId);
      }

      return res.status(200).json({
        success: true,
        message: 'Time slot deleted successfully'
      });
    } else {
      console.log('Regular timetable ID, deleting entire timetable...');
      // Regular timetable deletion
      const timetable = await Timetable.findByIdAndDelete(req.params.id);

      if (!timetable) {
        return res.status(404).json({
          success: false,
          message: 'Timetable not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Timetable deleted successfully'
      });
    }
  } catch (error) {
    console.error('Delete timetable error:', error);
    console.error('Error stack:', error.stack);
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

// @route   GET /api/timetables/student
// @desc    Get student's timetable
// @access  Private (Student)
router.get('/student', protect, authorize('student'), async (req, res) => {
  try {
    // TODO: Implement timetable retrieval logic
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

// @route   GET /api/timetables/class-details/:slotId
// @desc    Get class details
// @access  Private (Student)
router.get('/class-details/:slotId', protect, authorize('student'), async (req, res) => {
  try {
    // TODO: Implement class details retrieval logic
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
});

module.exports = router; 