const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');
const developerRepository = require('../repositories/master/DeveloperRepository');
const shopRepository = require('../repositories/master/ShopRepository');
const { getShopConnection } = require('../services/databaseConnectionService');
const User = require('../models/User');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    // Try to get token from HTTP-only cookie first, then fall back to Authorization header
    let token = req.cookies?.token;
    
    if (!token) {
      // Fallback to Authorization header for backward compatibility
      token = req.header('Authorization')?.replace('Bearer ', '');
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check user type from token
    if (decoded.type === 'developer') {
      // Developer authentication (Master Database)
      const developer = await developerRepository.findById(decoded.userId);
      
      if (!developer) {
        return res.status(401).json({ message: 'Token is not valid' });
      }
      
      if (developer.status !== 'active') {
        return res.status(401).json({ message: 'Developer account is not active' });
      }
      
      req.user = developer;
      req.userType = 'developer';
      req.role = 'DEVELOPER';
      return next();
    } else if (decoded.type === 'admin' && decoded.shopId) {
      // Admin authentication (Shop Database)
      // Step 1: Verify shop exists and is active in Master DB
      const shop = await shopRepository.findByShopId(decoded.shopId);
      
      if (!shop) {
        return res.status(401).json({ message: 'Shop not found' });
      }
      
      if (shop.status !== 'active') {
        return res.status(401).json({ message: 'Shop is suspended' });
      }
      
      // Step 2: Connect to shop database
      const databaseUrl = shop.getDecryptedDatabaseUrl();
      let shopConnection;
      try {
        shopConnection = await getShopConnection(databaseUrl, shop.shopId);
      } catch (error) {
        logger.error(`Failed to connect to shop database: ${shop.shopId}`, error);
        return res.status(503).json({ message: 'Failed to connect to shop database' });
      }
      
      // Step 3: Verify user in shop database
      const ShopUser = shopConnection.model('User', User.schema);
      const user = await ShopUser.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid' });
      }
      
      if (user.status !== 'active') {
        return res.status(401).json({ message: 'User account is not active' });
      }
      
      // Attach user, shop, and connection to request
      req.user = user;
      req.userType = 'admin';
      req.shop = shop;
      req.shopId = shop.shopId;
      req.shopConnection = shopConnection;
      req.role = decoded.role;
      
      return next();
    } else {
      // Legacy user authentication (for backward compatibility)
      // This assumes single database setup
      const user = await userRepository.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid' });
      }
      
      if (user.status !== 'active') {
        return res.status(401).json({ message: 'User account is not active' });
      }
      
      req.user = user;
      req.userType = 'user';
      req.role = user.role;
      return next();
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    // Developers have all permissions
    if (req.userType === 'developer') {
      return next();
    }
    
    // Check permission for admin/user
    if (!req.user || !req.user.hasPermission) {
      return res.status(403).json({ 
        message: 'Access denied. User model does not support permissions.' 
      });
    }
    
    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

// Accepts one or more permission names; passes if the user has ANY of them
const requireAnyPermission = (permissions) => {
  const list = Array.isArray(permissions) ? permissions : [permissions];
  return (req, res, next) => {
    const allowed = list.some((p) => req.user.hasPermission(p));
    if (!allowed) {
      return res.status(403).json({
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

const requireRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    // Developers bypass role checks
    if (req.userType === 'developer') {
      return next();
    }
    
    const userRole = req.user?.role?.toUpperCase() || req.role;
    if (!roleArray.map(r => r.toUpperCase()).includes(userRole)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient role privileges.' 
      });
    }
    next();
  };
};

// Middleware to require developer role
const requireDeveloper = (req, res, next) => {
  if (req.userType !== 'developer') {
    return res.status(403).json({ 
      message: 'Access denied. Developer access required.' 
    });
  }
  next();
};

// Middleware to require admin role (shop-specific)
const requireAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin access required.' 
    });
  }
  next();
};

module.exports = {
  auth,
  requirePermission,
  requireAnyPermission,
  requireRole,
  requireDeveloper,
  requireAdmin
};
