const shopRepository = require('../repositories/master/ShopRepository');
const planRepository = require('../repositories/master/PlanRepository');
const { getShopConnection } = require('./databaseConnectionService');
const User = require('../models/User');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class ShopService {
  /**
   * Create a new shop
   * @param {object} shopData - Shop data
   * @param {string} createdBy - Developer ID
   * @returns {Promise<{shop: Shop, message: string}>}
   */
  async createShop(shopData, createdBy) {
    const { shopName, adminEmail, adminPassword, databaseUrl, firstName, lastName, planId } = shopData;

    // Validate required fields
    if (!shopName || !adminEmail || !adminPassword || !databaseUrl) {
      throw new Error('Missing required fields: shopName, adminEmail, adminPassword, databaseUrl');
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = adminEmail.toLowerCase().trim();

    // Check if shopId already exists
    const shopId = `shop_${Date.now()}_${uuidv4().substring(0, 8)}`;
    
    if (await shopRepository.shopIdExists(shopId)) {
      throw new Error('Shop ID already exists');
    }

    // Check if admin email already exists
    if (await shopRepository.adminEmailExists(normalizedEmail)) {
      throw new Error('Admin email already exists');
    }

    // Test database connection
    try {
      await getShopConnection(databaseUrl, shopId);
    } catch (error) {
      throw new Error(`Invalid database URL: ${error.message}`);
    }

    // Handle subscription if planId is provided
    let subscriptionStart = null;
    let subscriptionEnd = null;
    let paymentStatus = 'UNPAID';

    if (planId) {
      const plan = await planRepository.findByPlanId(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      subscriptionStart = new Date();
      subscriptionEnd = new Date(subscriptionStart);
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + plan.durationInMonths);
      paymentStatus = 'PAID'; // Assume paid when plan is assigned during creation
    }

    // Create shop in Master Database
    const shop = await shopRepository.create({
      shopId,
      shopName,
      adminEmail: normalizedEmail, // Use normalized email
      databaseUrl, // Will be encrypted by pre-save hook
      status: 'active',
      planId: planId || null,
      subscriptionStart,
      subscriptionEnd,
      paymentStatus,
      createdBy
    });

    // Create admin user in shop's database
    try {
      const shopConnection = await getShopConnection(databaseUrl, shopId);
      const ShopUser = shopConnection.model('User', User.schema);

      const adminUser = new ShopUser({
        firstName: firstName || 'Admin',
        lastName: lastName || 'User',
        email: normalizedEmail, // Use normalized email to ensure consistency
        password: adminPassword,
        role: 'admin',
        status: 'active',
        isActive: true
      });

      await adminUser.save();
      logger.info(`Admin user created in shop database: ${shopId}`);
    } catch (error) {
      // Rollback: delete shop from Master DB if user creation fails
      await shopRepository.hardDelete(shop._id);
      throw new Error(`Failed to create admin user in shop database: ${error.message}`);
    }

    return {
      shop: shop.toSafeObject(),
      message: 'Shop created successfully'
    };
  }

  /**
   * Get all shops
   * @param {object} filters - Filter options
   * @returns {Promise<Array>}
   */
  async getAllShops(filters = {}) {
    const shops = await shopRepository.findAll(filters);
    return shops.map(shop => shop.toSafeObject());
  }

  /**
   * Get shop by ID
   * @param {string} shopId - Shop ID
   * @returns {Promise<Shop>}
   */
  async getShopById(shopId) {
    const shop = await shopRepository.findByShopId(shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }
    return shop.toSafeObject();
  }

  /**
   * Update shop information
   * @param {string} shopId - Shop ID
   * @param {object} updateData - Update data
   * @returns {Promise<{shop: Shop, message: string}>}
   */
  async updateShop(shopId, updateData) {
    const shop = await shopRepository.findByShopId(shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    // Normalize email if provided
    if (updateData.adminEmail) {
      updateData.adminEmail = updateData.adminEmail.toLowerCase().trim();
    }

    // Handle plan update if provided
    if (updateData.planId !== undefined) {
      if (updateData.planId) {
        const plan = await planRepository.findByPlanId(updateData.planId);
        if (!plan) {
          throw new Error('Plan not found');
        }

        const subscriptionStart = new Date();
        const subscriptionEnd = new Date(subscriptionStart);
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + plan.durationInMonths);

        updateData.subscriptionStart = subscriptionStart;
        updateData.subscriptionEnd = subscriptionEnd;
        updateData.paymentStatus = 'PAID';
      } else {
        // Remove plan
        updateData.planId = null;
        updateData.subscriptionStart = null;
        updateData.subscriptionEnd = null;
        updateData.paymentStatus = 'UNPAID';
      }
    }

    await shopRepository.updateById(shop._id, {
      ...updateData,
      updatedAt: new Date()
    });

    const updatedShop = await shopRepository.findByShopId(shopId);
    logger.info(`Shop updated: ${shopId}`);

    return {
      shop: updatedShop.toSafeObject(),
      message: 'Shop updated successfully'
    };
  }

  /**
   * Update shop status
   * @param {string} shopId - Shop ID
   * @param {string} status - New status (active/suspended)
   * @returns {Promise<{shop: Shop, message: string}>}
   */
  async updateShopStatus(shopId, status) {
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      throw new Error('Invalid status. Must be "active", "inactive", or "suspended"');
    }

    const shop = await shopRepository.findByShopId(shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    await shopRepository.updateStatus(shopId, status);

    const updatedShop = await shopRepository.findByShopId(shopId);
    return {
      shop: updatedShop.toSafeObject(),
      message: `Shop status updated to ${status}`
    };
  }

  /**
   * Update shop subscription plan
   * @param {string} shopId - Shop ID
   * @param {string} planId - Plan ID
   * @returns {Promise<{shop: Shop, message: string}>}
   */
  async updateShopPlan(shopId, planId) {
    const shop = await shopRepository.findByShopId(shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    const plan = await planRepository.findByPlanId(planId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    // Calculate new subscription dates
    const subscriptionStart = new Date();
    const subscriptionEnd = new Date(subscriptionStart);
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + plan.durationInMonths);

    // Use plan._id (MongoDB ObjectId) for planId field in shop
    await shopRepository.updateById(shop._id, {
      planId: plan._id, // Store MongoDB ObjectId reference
      subscriptionStart,
      subscriptionEnd,
      paymentStatus: 'PAID',
      updatedAt: new Date()
    });

    const updatedShop = await shopRepository.findByShopId(shopId);
    logger.info(`Shop ${shopId} plan updated to ${planId}`);

    return {
      shop: updatedShop.toSafeObject(),
      message: 'Shop subscription plan updated successfully'
    };
  }

  /**
   * Get shop by admin email
   * @param {string} email - Admin email
   * @returns {Promise<Shop>}
   */
  async getShopByAdminEmail(email) {
    const shop = await shopRepository.findByAdminEmail(email);
    if (!shop) {
      throw new Error('Shop not found for this admin email');
    }
    return shop;
  }

  /**
   * Get all admin accounts from all shops
   * @returns {Promise<Array>} Array of admin objects with shop info
   */
  async getAllAdmins() {
    const shops = await shopRepository.findAll({ status: 'active' });
    const allAdmins = [];

    for (const shop of shops) {
      try {
        // Get decrypted database URL
        const databaseUrl = shop.getDecryptedDatabaseUrl();
        
        // Connect to shop database
        const shopConnection = await getShopConnection(databaseUrl, shop.shopId);
        const ShopUser = shopConnection.model('User', User.schema);

        // Find all admin users in this shop
        const admins = await ShopUser.find({
          role: 'admin',
          isDeleted: { $ne: true }
        }).select('-password -loginAttempts -lockUntil').lean();

        // Add shop info to each admin
        const adminsWithShop = admins.map(admin => ({
          ...admin,
          shopId: shop.shopId,
          shopName: shop.shopName,
          shopStatus: shop.status
        }));

        allAdmins.push(...adminsWithShop);
      } catch (error) {
        logger.error(`Failed to get admins from shop ${shop.shopId}: ${error.message}`);
        // Continue with other shops even if one fails
      }
    }

    return allAdmins;
  }

  /**
   * Create admin account for a shop
   * @param {string} shopId - Shop ID
   * @param {object} adminData - Admin data (email, password, firstName, lastName)
   * @returns {Promise<{admin: object, message: string}>}
   */
  async createAdmin(shopId, adminData) {
    const { email, password, firstName, lastName } = adminData;

    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Get shop
    const shop = await shopRepository.findByShopId(shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    if (shop.status !== 'active') {
      throw new Error('Cannot create admin for inactive shop');
    }

    // Get decrypted database URL
    const databaseUrl = shop.getDecryptedDatabaseUrl();

    // Connect to shop database
    const shopConnection = await getShopConnection(databaseUrl, shopId);
    const ShopUser = shopConnection.model('User', User.schema);

    // Check if admin already exists
    const existingAdmin = await ShopUser.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      throw new Error('Admin with this email already exists in this shop');
    }

    // Create admin user
    const adminUser = new ShopUser({
      firstName: firstName || 'Admin',
      lastName: lastName || 'User',
      email: normalizedEmail, // Use normalized email
      password: password,
      role: 'admin',
      status: 'active',
      isActive: true
    });

    await adminUser.save();

    return {
      admin: {
        _id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        shopId: shop.shopId,
        shopName: shop.shopName
      },
      message: 'Admin account created successfully'
    };
  }


  /**
   * Get suppliers from a specific shop
   * @param {string} shopId - Shop ID
   * @returns {Promise<Array>} Array of suppliers
   */
  async getShopSuppliers(shopId) {
    const shop = await shopRepository.findByShopId(shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    const databaseUrl = shop.getDecryptedDatabaseUrl();
    const shopConnection = await getShopConnection(databaseUrl, shopId);
    const Supplier = shopConnection.model('Supplier', require('../models/Supplier').schema);
    
    const suppliers = await Supplier.find({ isDeleted: { $ne: true } })
      .select('name email phone companyName address')
      .sort({ name: 1 })
      .lean();

    return suppliers;
  }

  /**
   * Get products from a specific shop
   * @param {string} shopId - Shop ID
   * @returns {Promise<Array>} Array of products
   */
  async getShopProducts(shopId) {
    const shop = await shopRepository.findByShopId(shopId);
    if (!shop) {
      throw new Error('Shop not found');
    }

    const databaseUrl = shop.getDecryptedDatabaseUrl();
    const shopConnection = await getShopConnection(databaseUrl, shopId);
    const Product = shopConnection.model('Product', require('../models/Product').schema);
    
    const products = await Product.find({ isDeleted: { $ne: true } })
      .select('name pricing.cost barcode sku')
      .sort({ name: 1 })
      .lean();

    return products;
  }

}

module.exports = new ShopService();
