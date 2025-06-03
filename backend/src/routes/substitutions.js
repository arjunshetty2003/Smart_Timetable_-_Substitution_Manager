const express = require('express');
const router = express.Router();
const Substitution = require('../models/Substitution');
const { protect } = require('../middleware/auth');

// @desc    Get all substitutions
// @route   GET /api/substitutions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, originalFacultyId, substituteFacultyId, date, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (originalFacultyId) query.originalFacultyId = originalFacultyId;
    if (substituteFacultyId) query.substituteFacultyId = substituteFacultyId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const substitutions = await Substitution.find(query)
      .populate('originalFacultyId', 'name email department')
      .populate('substituteFacultyId', 'name email department')
      .populate('subjectId', 'subjectName subjectCode')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Substitution.countDocuments(query);

    res.status(200).json({
      success: true,
      count: substitutions.length,
      total,
      data: substitutions
    });
  } catch (error) {
    console.error('Get substitutions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch substitutions',
      error: error.message
    });
  }
});

// @desc    Get single substitution
// @route   GET /api/substitutions/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const substitution = await Substitution.findById(req.params.id)
      .populate('originalFacultyId', 'name email department')
      .populate('substituteFacultyId', 'name email department')
      .populate('subjectId', 'subjectName subjectCode');

    if (!substitution) {
      return res.status(404).json({
        success: false,
        message: 'Substitution not found'
      });
    }

    res.status(200).json({
      success: true,
      data: substitution
    });
  } catch (error) {
    console.error('Get substitution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch substitution',
      error: error.message
    });
  }
});

// @desc    Create new substitution request
// @route   POST /api/substitutions
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    // If not admin or faculty, set originalFacultyId to current user
    if (req.user.role === 'faculty') {
      req.body.originalFacultyId = req.user._id;
    }

    const substitution = await Substitution.create(req.body);
    const populatedSubstitution = await Substitution.findById(substitution._id)
      .populate('originalFacultyId', 'name email department')
      .populate('substituteFacultyId', 'name email department')
      .populate('subjectId', 'subjectName subjectCode');

    // Create notification for substitute faculty if assigned
    if (substitution.substituteFacultyId && substitution.status !== 'cancelled') {
      const Notification = require('../models/Notification');
      
      await Notification.create({
        userId: substitution.substituteFacultyId,
        title: 'New Substitution Assignment',
        message: `You have been assigned as a substitute for ${substitution.originalFacultyId.name} on ${new Date(substitution.date).toLocaleDateString()}`,
        type: 'substitution',
        relatedId: substitution._id,
        relatedModel: 'Substitution',
        priority: 'high'
      });
    }

    // Create notification for admin
    const Notification = require('../models/Notification');
    const adminUsers = await require('../models/User').find({ role: 'admin' });
    
    for (const admin of adminUsers) {
      await Notification.create({
        userId: admin._id,
        title: 'New Substitution Request',
        message: `${substitution.originalFacultyId.name} has requested a substitution for ${new Date(substitution.date).toLocaleDateString()}. Reason: ${substitution.reason}`,
        type: 'substitution',
        relatedId: substitution._id,
        relatedModel: 'Substitution',
        priority: 'medium'
      });
    }

    res.status(201).json({
      success: true,
      data: populatedSubstitution
    });
  } catch (error) {
    console.error('Create substitution error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create substitution request',
      error: error.message
    });
  }
});

// @desc    Update substitution
// @route   PUT /api/substitutions/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const substitution = await Substitution.findById(req.params.id);

    if (!substitution) {
      return res.status(404).json({
        success: false,
        message: 'Substitution not found'
      });
    }

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isOriginalFaculty = substitution.originalFacultyId.toString() === req.user._id.toString();
    const isSubstituteFaculty = substitution.substituteFacultyId && substitution.substituteFacultyId.toString() === req.user._id.toString();

    if (!isAdmin && !isOriginalFaculty && !isSubstituteFaculty) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedSubstitution = await Substitution.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('originalFacultyId', 'name email department')
    .populate('substituteFacultyId', 'name email department')
    .populate('subjectId', 'subjectName subjectCode');

    res.status(200).json({
      success: true,
      data: updatedSubstitution
    });
  } catch (error) {
    console.error('Update substitution error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update substitution',
      error: error.message
    });
  }
});

// @desc    Delete substitution
// @route   DELETE /api/substitutions/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const substitution = await Substitution.findById(req.params.id);

    if (!substitution) {
      return res.status(404).json({
        success: false,
        message: 'Substitution not found'
      });
    }

    // Check permissions - only admin or original faculty can delete
    const isAdmin = req.user.role === 'admin';
    const isOriginalFaculty = substitution.originalFacultyId.toString() === req.user._id.toString();

    if (!isAdmin && !isOriginalFaculty) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Substitution.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Substitution deleted successfully'
    });
  } catch (error) {
    console.error('Delete substitution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete substitution',
      error: error.message
    });
  }
});

// @desc    Approve/Reject substitution
// @route   PATCH /api/substitutions/:id/status
// @access  Private (Admin only)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { status } = req.body;
    
    if (!['approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved, rejected, or completed'
      });
    }

    const substitution = await Substitution.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
    .populate('originalFacultyId', 'name email department')
    .populate('substituteFacultyId', 'name email department')
    .populate('subjectId', 'subjectName subjectCode');

    if (!substitution) {
      return res.status(404).json({
        success: false,
        message: 'Substitution not found'
      });
    }

    res.status(200).json({
      success: true,
      data: substitution
    });
  } catch (error) {
    console.error('Update substitution status error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update substitution status',
      error: error.message
    });
  }
});

module.exports = router; 