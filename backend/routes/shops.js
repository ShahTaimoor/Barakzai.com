const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireDeveloper } = require('../middleware/auth');
const shopService = require('../services/shopService');

const router = express.Router();

// Decode HTML entities (frontend may encode them)
const decodeHtmlEntities = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/&#x2F;/gi, '/')
    .replace(/&#x2f;/gi, '/')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

// Custom validator for MongoDB connection string
const isMongoDBUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return false;
  }
  // Decode HTML entities first
  const decoded = decodeHtmlEntities(value);
  // Check if it's a valid MongoDB connection string
  const mongoUrlPattern = /^mongodb(\+srv)?:\/\/([^:]+:[^@]+@)?([^\/]+)(\/[^?]*)?(\?.*)?$/;
  return mongoUrlPattern.test(decoded);
};

// All routes require developer authentication
router.use(auth, requireDeveloper);

// @route   POST /api/shops
// @desc    Create a new shop
// @access  Private (Developer only)
router.post('/', [
  body('shopName').trim().isLength({ min: 1 }).withMessage('Shop name is required'),
  body('adminEmail').isEmail().normalizeEmail().withMessage('Valid admin email is required'),
  body('adminPassword').isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters'),
  body('databaseUrl')
    .custom(isMongoDBUrl)
    .withMessage('Valid MongoDB connection string is required (must start with mongodb:// or mongodb+srv://)'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('planId').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Decode HTML entities in databaseUrl if present (frontend may encode it)
    const shopData = { ...req.body };
    if (shopData.databaseUrl) {
      shopData.databaseUrl = decodeHtmlEntities(shopData.databaseUrl);
    }
    
    const result = await shopService.createShop(shopData, req.user._id);
    
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('Invalid database URL')) {
      return res.status(400).json({ message: error.message });
    }
    
    console.error('Create shop error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/shops
// @desc    Get all shops
// @access  Private (Developer only)
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    const shops = await shopService.getAllShops(filters);
    res.json({ shops });
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/shops/:shopId
// @desc    Get shop by ID
// @access  Private (Developer only)
router.get('/:shopId', async (req, res) => {
  try {
    const shop = await shopService.getShopById(req.params.shopId);
    res.json({ shop });
  } catch (error) {
    if (error.message === 'Shop not found') {
      return res.status(404).json({ message: 'Shop not found' });
    }
    console.error('Get shop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/shops/:shopId
// @desc    Update shop information
// @access  Private (Developer only)
router.put('/:shopId', [
  body('shopName').optional().trim().isLength({ min: 1 }),
  body('adminEmail').optional().isEmail().normalizeEmail(),
  body('status').optional().isIn(['active', 'inactive', 'suspended']),
  body('planId').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await shopService.updateShop(req.params.shopId, req.body);
    res.json(result);
  } catch (error) {
    if (error.message === 'Shop not found' || error.message === 'Plan not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Update shop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/shops/:shopId/status
// @desc    Update shop status (activate/suspend)
// @access  Private (Developer only)
router.patch('/:shopId/status', [
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Status must be "active", "inactive", or "suspended"')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { status } = req.body;
    const result = await shopService.updateShopStatus(req.params.shopId, status);
    
    res.json(result);
  } catch (error) {
    if (error.message === 'Shop not found' || error.message.includes('Invalid status')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Update shop status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/shops/admins/all
// @desc    Get all admin accounts from all shops
// @access  Private (Developer only)
router.get('/admins/all', async (req, res) => {
  try {
    const admins = await shopService.getAllAdmins();
    res.json({ admins });
  } catch (error) {
    console.error('Get all admins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/shops/:shopId/admins
// @desc    Create admin account for a shop
// @access  Private (Developer only)
router.post('/:shopId/admins', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const result = await shopService.createAdmin(req.params.shopId, req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('already exists') || error.message.includes('inactive')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/shops/:shopId/plan
// @desc    Update shop subscription plan
// @access  Private (Developer only)
router.patch('/:shopId/plan', [
  body('planId').trim().isLength({ min: 1 }).withMessage('Plan ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await shopService.updateShopPlan(req.params.shopId, req.body.planId);
    res.json(result);
  } catch (error) {
    if (error.message === 'Shop not found' || error.message === 'Plan not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Update shop plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/shops/:shopId/suppliers
// @desc    Get suppliers from a specific shop
// @access  Private (Developer only)
router.get('/:shopId/suppliers', async (req, res) => {
  try {
    const suppliers = await shopService.getShopSuppliers(req.params.shopId);
    res.json({ suppliers });
  } catch (error) {
    if (error.message === 'Shop not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Get suppliers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/shops/:shopId/products
// @desc    Get products from a specific shop
// @access  Private (Developer only)
router.get('/:shopId/products', async (req, res) => {
  try {
    const products = await shopService.getShopProducts(req.params.shopId);
    res.json({ products });
  } catch (error) {
    if (error.message === 'Shop not found') {
      return res.status(404).json({ message: error.message });
    }
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
