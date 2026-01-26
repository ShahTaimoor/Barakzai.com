const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireDeveloper } = require('../middleware/auth');
const planService = require('../services/planService');

const router = express.Router();

// All routes require developer authentication
router.use(auth, requireDeveloper);

// @route   GET /api/plans
// @desc    Get all plans
// @access  Private (Developer only)
router.get('/', async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const plans = await planService.getAllPlans({ activeOnly: activeOnly === 'true' });
    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/plans/:planId
// @desc    Get plan by ID
// @access  Private (Developer only)
router.get('/:planId', async (req, res) => {
  try {
    const plan = await planService.getPlanById(req.params.planId);
    res.json({ plan });
  } catch (error) {
    if (error.message === 'Plan not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Get plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/plans
// @desc    Create a new plan
// @access  Private (Developer only)
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Plan name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').isIn(['1 month', '3 months', '6 months', '12 months']).withMessage('Invalid duration'),
  body('features').optional().isArray().withMessage('Features must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await planService.createPlan(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('not found')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Create plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/plans/:planId
// @desc    Update plan
// @access  Private (Developer only)
router.put('/:planId', [
  body('name').optional().trim().isLength({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('duration').optional().isIn(['1 month', '3 months', '6 months', '12 months']),
  body('features').optional().isArray(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await planService.updatePlan(req.params.planId, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'Plan not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Update plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/plans/:planId
// @desc    Delete plan (soft delete)
// @access  Private (Developer only)
router.delete('/:planId', async (req, res) => {
  try {
    const result = await planService.deletePlan(req.params.planId);
    res.json(result);
  } catch (error) {
    if (error.message === 'Plan not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Delete plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
