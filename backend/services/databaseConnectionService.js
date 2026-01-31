const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Database Connection Service
 * Manages dynamic connections to multiple shop databases
 */

// Store active connections
const shopConnections = new Map();

/**
 * Get or create connection to Master Database
 * @returns {Promise<mongoose.Connection>}
 */
async function getMasterConnection() {
  // Use default mongoose connection as Master DB
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  
  throw new Error('Master database is not connected');
}

/**
 * Get or create connection to a shop database
 * @param {string} databaseUrl - MongoDB connection string
 * @param {string} shopId - Shop ID for connection caching
 * @returns {Promise<mongoose.Connection>}
 */
async function getShopConnection(databaseUrl, shopId) {
  if (!databaseUrl) {
    throw new Error('Database URL is required');
  }

  if (!shopId) {
    throw new Error('Shop ID is required');
  }

  // Check if connection already exists
  if (shopConnections.has(shopId)) {
    const connection = shopConnections.get(shopId);
    if (connection.readyState === 1) {
      return connection;
    }
    // Connection is dead, remove it
    shopConnections.delete(shopId);
  }

  try {
    // Create new connection
    const connection = mongoose.createConnection(databaseUrl, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2
    });

    // Wait for connection
    await connection.asPromise();

    // Store connection
    shopConnections.set(shopId, connection);

    logger.info(`Connected to shop database: ${shopId}`);

    // Handle connection events
    connection.on('error', (err) => {
      logger.error(`Shop database connection error (${shopId}):`, err);
    });

    connection.on('disconnected', () => {
      logger.warn(`Shop database disconnected (${shopId})`);
      shopConnections.delete(shopId);
    });

    return connection;
  } catch (error) {
    logger.error(`Failed to connect to shop database (${shopId}):`, error);
    throw new Error(`Failed to connect to shop database: ${error.message}`);
  }
}

/**
 * Close a shop database connection
 * @param {string} shopId - Shop ID
 */
async function closeShopConnection(shopId) {
  if (shopConnections.has(shopId)) {
    const connection = shopConnections.get(shopId);
    await connection.close();
    shopConnections.delete(shopId);
    logger.info(`Closed shop database connection: ${shopId}`);
  }
}

/**
 * Close all shop database connections
 */
async function closeAllShopConnections() {
  const promises = [];
  for (const [shopId, connection] of shopConnections.entries()) {
    promises.push(connection.close());
  }
  await Promise.all(promises);
  shopConnections.clear();
  logger.info('Closed all shop database connections');
}

/**
 * Get model from shop database
 * @param {string} shopId - Shop ID
 * @param {string} modelName - Model name
 * @param {mongoose.Schema} schema - Mongoose schema
 * @returns {mongoose.Model}
 */
function getShopModel(shopId, modelName, schema) {
  if (!shopConnections.has(shopId)) {
    throw new Error(`No connection found for shop: ${shopId}`);
  }

  const connection = shopConnections.get(shopId);
  
  // Check if model already exists
  if (connection.models[modelName]) {
    return connection.models[modelName];
  }

  // Create and return model
  return connection.model(modelName, schema);
}

/**
 * Get model from Master database
 * @param {string} modelName - Model name
 * @param {mongoose.Schema} schema - Mongoose schema
 * @returns {mongoose.Model}
 */
function getMasterModel(modelName, schema) {
  // Check if model already exists
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }

  // Create and return model
  return mongoose.model(modelName, schema);
}

module.exports = {
  getMasterConnection,
  getShopConnection,
  closeShopConnection,
  closeAllShopConnections,
  getShopModel,
  getMasterModel
};
