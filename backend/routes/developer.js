const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireDeveloper } = require('../middleware/auth');
const authService = require('../services/authService');

const router = express.Router();

// @route   POST /api/developer/login
// @desc    Developer login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password } = req.body;
    
    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.get('User-Agent');
    
    // Call service to login developer
    const result = await authService.developerLogin(email, password, ipAddress, userAgent);
    
    // Set HTTP-only cookie for secure token storage
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      path: '/'
    });
    
    res.json({
      message: result.message,
      token: result.token,
      developer: result.developer
    });
  } catch (error) {
    if (error.message === 'Invalid credentials') {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (error.message.includes('locked')) {
      return res.status(423).json({ 
        message: 'Account is temporarily locked due to too many failed login attempts' 
      });
    }
    
    console.error('Developer login error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/developer/me
// @desc    Get current developer
// @access  Private (Developer only)
router.get('/me', auth, requireDeveloper, async (req, res) => {
  try {
    res.json({ developer: req.user.toSafeObject() });
  } catch (error) {
    console.error('Get developer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/developer/verify-password
// @desc    Verify developer current password
// @access  Private (Developer only)
router.post('/verify-password', [
  auth,
  requireDeveloper,
  body('currentPassword').exists().withMessage('Current password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { currentPassword } = req.body;
    
    // Call service to verify password
    const isValid = await authService.verifyDeveloperPassword(req.user._id, currentPassword);
    
    if (isValid) {
      res.json({ valid: true, message: 'Password verified' });
    } else {
      res.status(400).json({ valid: false, message: 'Current password is incorrect' });
    }
  } catch (error) {
    if (error.message === 'Developer not found') {
      return res.status(404).json({ message: 'Developer not found' });
    }
    console.error('Verify password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/developer/change-password
// @desc    Change developer password (current password required)
// @access  Private (Developer only)
router.post('/change-password', [
  auth,
  requireDeveloper,
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Call service to change developer password with current password verification
    const result = await authService.changeDeveloperPassword(req.user._id, currentPassword, newPassword);
    
    res.json(result);
  } catch (error) {
    if (error.message === 'Developer not found') {
      return res.status(404).json({ message: 'Developer not found' });
    }
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    console.error('Developer password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
