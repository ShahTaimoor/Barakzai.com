const userRepository = require('../repositories/UserRepository');
const developerRepository = require('../repositories/master/DeveloperRepository');
const shopService = require('./shopService');
const { getShopConnection } = require('./databaseConnectionService');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Register a new user
   * @param {object} userData - User data
   * @param {User} createdBy - User creating the account
   * @returns {Promise<{user: User, message: string}>}
   */
  async register(userData, createdBy) {
    const { firstName, lastName, email, password, role, phone, department, permissions, status } = userData;

    // Check if email already exists
    const emailExists = await userRepository.emailExists(email);
    if (emailExists) {
      throw new Error('User already exists');
    }

    // Create user
    const user = await userRepository.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      department,
      permissions: permissions || [],
      status: status || 'active'
    });

    // Track permission change
    if (createdBy) {
      await userRepository.trackPermissionChange(
        user._id,
        createdBy,
        'created',
        {},
        { role: user.role, permissions: user.permissions },
        'User account created'
      );
    }

    return {
      user: user.toSafeObject(),
      message: 'User created successfully'
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} ipAddress - IP address
   * @param {string} userAgent - User agent
   * @returns {Promise<{user: User, token: string, message: string}>}
   */
  async login(email, password, ipAddress, userAgent) {
    // Find user with password
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await userRepository.incrementLoginAttempts(user._id);
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await userRepository.resetLoginAttempts(user._id);
    }

    // Track login activity
    await userRepository.trackLogin(user._id, ipAddress, userAgent);

    // Create JWT token
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
      throw new Error('Server configuration error: JWT_SECRET is missing');
    }

    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '8h'
    });

    return {
      user: user.toSafeObject(),
      token,
      message: 'Login successful'
    };
  }

  /**
   * Get current user
   * @param {string} userId - User ID
   * @returns {Promise<User>}
   */
  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.toSafeObject();
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {object} updateData - Data to update
   * @returns {Promise<{user: User, message: string}>}
   */
  async updateProfile(userId, updateData) {
    const { firstName, lastName, phone, department, preferences } = updateData;
    
    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone !== undefined) updateFields.phone = phone;
    if (department !== undefined) updateFields.department = department;
    if (preferences) {
      const currentUser = await userRepository.findById(userId);
      updateFields.preferences = { ...(currentUser?.preferences || {}), ...preferences };
    }

    const user = await userRepository.updateProfile(userId, updateFields);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: user.toSafeObject(),
      message: 'Profile updated successfully'
    };
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<{message: string}>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Get user with password
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    await userRepository.updatePassword(userId, newPassword);

    return {
      message: 'Password changed successfully'
    };
  }

  /**
   * Verify developer password
   * @param {string} developerId - Developer ID
   * @param {string} currentPassword - Current password
   * @returns {Promise<boolean>}
   */
  async verifyDeveloperPassword(developerId, currentPassword) {
    const developerRepository = require('../repositories/master/DeveloperRepository');
    
    // Get developer with password
    const developer = await developerRepository.findByIdWithPassword(developerId);
    if (!developer) {
      throw new Error('Developer not found');
    }

    // Verify current password
    const isMatch = await developer.comparePassword(currentPassword);
    return isMatch;
  }

  /**
   * Change developer password (current password required)
   * @param {string} developerId - Developer ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<{message: string}>}
   */
  async changeDeveloperPassword(developerId, currentPassword, newPassword) {
    const developerRepository = require('../repositories/master/DeveloperRepository');
    
    // Get developer with password
    const developer = await developerRepository.findByIdWithPassword(developerId);
    if (!developer) {
      throw new Error('Developer not found');
    }

    // Verify current password
    const isMatch = await developer.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    await developerRepository.updatePassword(developerId, newPassword);

    return {
      message: 'Password changed successfully'
    };
  }

  /**
   * Developer login
   * @param {string} email - Developer email
   * @param {string} password - Developer password
   * @param {string} ipAddress - IP address
   * @param {string} userAgent - User agent
   * @returns {Promise<{developer: Developer, token: string, message: string}>}
   */
  async developerLogin(email, password, ipAddress, userAgent) {
    // Find developer with password
    const developer = await developerRepository.findByEmailWithPassword(email);
    if (!developer) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (developer.isLocked) {
      throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    // Check password
    const isMatch = await developer.comparePassword(password);
    if (!isMatch) {
      await developer.incLoginAttempts();
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (developer.loginAttempts > 0) {
      await developer.resetLoginAttempts();
    }

    // Update last login
    await developerRepository.updateById(developer._id, { lastLogin: new Date() });

    // Create JWT token
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
      throw new Error('Server configuration error: JWT_SECRET is missing');
    }

    const payload = {
      userId: developer._id,
      email: developer.email,
      role: 'DEVELOPER',
      type: 'developer'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '8h'
    });

    return {
      developer: developer.toSafeObject(),
      token,
      message: 'Developer login successful'
    };
  }

  /**
   * Admin login (shop-specific)
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @param {string} ipAddress - IP address
   * @param {string} userAgent - User agent
   * @returns {Promise<{user: User, token: string, shop: Shop, message: string}>}
   */
  async adminLogin(email, password, ipAddress, userAgent) {
    // Normalize email (lowercase and trim) - ensure consistency
    const normalizedEmail = email.toLowerCase().trim();
    
    // Step 1: Check Master Database to find shop
    const shop = await shopService.getShopByAdminEmail(normalizedEmail);
    
    if (!shop) {
      throw new Error('Invalid credentials');
    }

    // Step 2: Verify shop is active
    if (shop.status !== 'active') {
      throw new Error('Shop is suspended. Please contact support.');
    }

    // Step 3: Connect to shop's database
    const databaseUrl = shop.getDecryptedDatabaseUrl();
    let shopConnection;
    try {
      shopConnection = await getShopConnection(databaseUrl, shop.shopId);
    } catch (error) {
      logger.error(`Failed to connect to shop database: ${shop.shopId}`, error);
      throw new Error('Failed to connect to shop database. Please contact support.');
    }

    // Step 4: Verify admin credentials in shop database
    const ShopUser = shopConnection.model('User', User.schema);
    const user = await ShopUser.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Track login activity
    await user.trackLogin(ipAddress, userAgent);

    // Create JWT token with shopId
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
      throw new Error('Server configuration error: JWT_SECRET is missing');
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role.toUpperCase(),
      shopId: shop.shopId,
      type: 'admin'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '8h'
    });

    return {
      user: user.toSafeObject(),
      shop: shop.toSafeObject(),
      token,
      message: 'Admin login successful'
    };
  }
}

module.exports = new AuthService();

